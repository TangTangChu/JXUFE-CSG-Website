export interface JwtPartJson {
    raw: string;
    json: unknown | null;
    parseError: "invalid_base64url" | "not_json" | null;
}

export type JwtTimeStatus = "past" | "future" | "ok";

export interface JwtTimeClaim {
    key: "exp" | "nbf" | "iat";
    unix: number;
    iso: string;
    status: JwtTimeStatus;
    /** seconds relative to now: negative = past, positive = future */
    deltaSeconds: number;
}

export interface JwtClaimRow {
    key: string;
    value: unknown;
    display: string;
    isTime: boolean;
    unix?: number;
}

export interface JwtInspectResult {
    validFormat: boolean;
    header: JwtPartJson;
    payload: JwtPartJson;
    signature: string;
    rawParts: {
        header: string;
        payload: string;
        signature: string;
    };
    alg: string | null;
    typ: string | null;
    kid: string | null;
    claims: JwtClaimRow[];
    timeClaims: JwtTimeClaim[];
    flags: Array<"alg_none" | "invalid_parts">;
}

const TIME_CLAIM_KEYS = ["exp", "nbf", "iat"] as const;

function base64UrlToBytes(input: string): Uint8Array {
    const padded = input.replace(/-/g, "+").replace(/_/g, "/");
    const padLen = (4 - (padded.length % 4)) % 4;
    const base64 = padded + "=".repeat(padLen);
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

export function encodeBase64Url(text: string): string {
    const bytes = new TextEncoder().encode(text);
    let binary = "";
    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }
    return btoa(binary)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
}

function decodePart(part: string): JwtPartJson {
    try {
        const text = new TextDecoder().decode(base64UrlToBytes(part));
        try {
            return {
                raw: text,
                json: JSON.parse(text) as unknown,
                parseError: null,
            };
        } catch {
            return { raw: text, json: null, parseError: "not_json" };
        }
    } catch {
        return { raw: "", json: null, parseError: "invalid_base64url" };
    }
}

function asRecord(value: unknown): Record<string, unknown> | null {
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
        return value as Record<string, unknown>;
    }
    return null;
}

function formatUnix(seconds: number): string {
    try {
        return new Date(seconds * 1000).toISOString();
    } catch {
        return String(seconds);
    }
}

function displayValue(value: unknown): string {
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") {
        return String(value);
    }
    try {
        return JSON.stringify(value);
    } catch {
        return String(value);
    }
}

function timeStatus(
    key: "exp" | "nbf" | "iat",
    unix: number,
    now: number,
): JwtTimeStatus {
    if (key === "exp") return unix < now ? "past" : "ok";
    if (key === "nbf") return unix > now ? "future" : "ok";
    return "ok";
}

function emptyPart(): JwtPartJson {
    return { raw: "", json: null, parseError: null };
}

export function inspectJwt(token: string): JwtInspectResult {
    const trimmed = token.trim();
    const blank: JwtInspectResult = {
        validFormat: false,
        header: emptyPart(),
        payload: emptyPart(),
        signature: "",
        rawParts: { header: "", payload: "", signature: "" },
        alg: null,
        typ: null,
        kid: null,
        claims: [],
        timeClaims: [],
        flags: [],
    };

    if (!trimmed) return blank;

    const parts = trimmed.split(".");
    const [headerPart, payloadPart, signaturePart] = parts;
    if (
        parts.length !== 3 ||
        headerPart === undefined ||
        payloadPart === undefined ||
        signaturePart === undefined ||
        headerPart === "" ||
        payloadPart === ""
    ) {
        return { ...blank, flags: ["invalid_parts"] };
    }
    const header = decodePart(headerPart);
    const payload = decodePart(payloadPart);
    const headerObj = asRecord(header.json);
    const payloadObj = asRecord(payload.json);
    const now = Math.floor(Date.now() / 1000);
    const flags: JwtInspectResult["flags"] = [];

    const alg =
        headerObj && typeof headerObj.alg === "string" ? headerObj.alg : null;
    const typ =
        headerObj && typeof headerObj.typ === "string" ? headerObj.typ : null;
    const kid =
        headerObj && typeof headerObj.kid === "string" ? headerObj.kid : null;

    if (alg === "none") flags.push("alg_none");

    const claims: JwtClaimRow[] = [];
    const timeClaims: JwtTimeClaim[] = [];

    if (payloadObj) {
        for (const [key, value] of Object.entries(payloadObj)) {
            const isTime =
                (TIME_CLAIM_KEYS as readonly string[]).includes(key) &&
                typeof value === "number";
            claims.push({
                key,
                value,
                display: isTime
                    ? formatUnix(value as number)
                    : displayValue(value),
                isTime,
                unix: isTime ? (value as number) : undefined,
            });
            if (isTime) {
                const claimKey = key as "exp" | "nbf" | "iat";
                const unix = value as number;
                timeClaims.push({
                    key: claimKey,
                    unix,
                    iso: formatUnix(unix),
                    status: timeStatus(claimKey, unix, now),
                    deltaSeconds: unix - now,
                });
            }
        }
    }

    return {
        validFormat: true,
        header,
        payload,
        signature: signaturePart,
        rawParts: {
            header: headerPart,
            payload: payloadPart,
            signature: signaturePart,
        },
        alg,
        typ,
        kid,
        claims,
        timeClaims,
        flags,
    };
}

export function buildJwt(
    header: unknown,
    payload: unknown,
    signature = "",
): string {
    const headerPart = encodeBase64Url(JSON.stringify(header));
    const payloadPart = encodeBase64Url(JSON.stringify(payload));
    return `${headerPart}.${payloadPart}.${signature}`;
}

/** CTF helper: set alg to none and drop signature. */
export function buildAlgNoneToken(header: unknown, payload: unknown): string {
    const headerObj = asRecord(header) ?? {};
    return buildJwt({ ...headerObj, alg: "none" }, payload, "");
}

export function formatRelativeDelta(seconds: number): string {
    const abs = Math.abs(seconds);
    const sign = seconds < 0 ? "-" : "+";
    const days = Math.floor(abs / 86400);
    const hours = Math.floor((abs % 86400) / 3600);
    const minutes = Math.floor((abs % 3600) / 60);
    const secs = abs % 60;
    const parts: string[] = [];
    if (days) parts.push(`${days}d`);
    if (hours) parts.push(`${hours}h`);
    if (minutes) parts.push(`${minutes}m`);
    if (!parts.length || secs) parts.push(`${secs}s`);
    return `${sign}${parts.join(" ")}`;
}

export function formatJwtPart(
    part: JwtPartJson,
    labels: { invalidBase64: string; notJson: string },
): string {
    if (part.parseError === "invalid_base64url") return labels.invalidBase64;
    if (part.json !== null) return JSON.stringify(part.json, null, 2);
    return part.raw || labels.notJson;
}
