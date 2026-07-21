export type EncodingKind =
    | "base64"
    | "url"
    | "hex"
    | "unicode"
    | "html";

export type EncodingDirection = "encode" | "decode";

function utf8ToBytes(text: string): Uint8Array {
    return new TextEncoder().encode(text);
}

function bytesToUtf8(bytes: Uint8Array): string {
    return new TextDecoder().decode(bytes);
}

function bytesToBase64(bytes: Uint8Array): string {
    let binary = "";
    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }
    return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
    const normalized = base64.replace(/[\s\n\r]/g, "");
    const binary = atob(normalized);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(hex: string): Uint8Array {
    const cleaned = hex.replace(/[\s:]/g, "").replace(/^0x/i, "");
    if (cleaned.length % 2 !== 0) {
        throw new Error("invalid_hex_length");
    }
    if (cleaned.length > 0 && !/^[0-9a-fA-F]+$/.test(cleaned)) {
        throw new Error("invalid_hex");
    }
    const bytes = new Uint8Array(cleaned.length / 2);
    for (let i = 0; i < cleaned.length; i += 2) {
        bytes[i / 2] = Number.parseInt(cleaned.slice(i, i + 2), 16);
    }
    return bytes;
}

const HTML_ESCAPE_MAP: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
};

function encodeHtml(text: string): string {
    return text.replace(/[&<>"']/g, (ch) => HTML_ESCAPE_MAP[ch] ?? ch);
}

function decodeHtml(text: string): string {
    if (typeof document !== "undefined") {
        const el = document.createElement("textarea");
        el.innerHTML = text;
        return el.value;
    }
    return text
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, "&");
}

function encodeUnicode(text: string): string {
    return Array.from(text, (ch) => {
        const code = ch.codePointAt(0) ?? 0;
        if (code <= 0xffff) {
            return `\\u${code.toString(16).padStart(4, "0")}`;
        }
        const high = Math.floor((code - 0x10000) / 0x400) + 0xd800;
        const low = ((code - 0x10000) % 0x400) + 0xdc00;
        return `\\u${high.toString(16).padStart(4, "0")}\\u${low.toString(16).padStart(4, "0")}`;
    }).join("");
}

function decodeUnicode(text: string): string {
    return text.replace(
        /\\u([0-9a-fA-F]{4})|\\u\{([0-9a-fA-F]+)\}|\\x([0-9a-fA-F]{2})/g,
        (_, u4: string | undefined, ub: string | undefined, x2: string | undefined) => {
            const hex = u4 ?? ub ?? x2;
            if (!hex) return "";
            return String.fromCodePoint(Number.parseInt(hex, 16));
        },
    );
}

export function transformEncoding(
    input: string,
    kind: EncodingKind,
    direction: EncodingDirection,
): string {
    if (input === "") return "";

    switch (kind) {
        case "base64":
            return direction === "encode"
                ? bytesToBase64(utf8ToBytes(input))
                : bytesToUtf8(base64ToBytes(input));
        case "url":
            return direction === "encode"
                ? encodeURIComponent(input)
                : decodeURIComponent(input);
        case "hex":
            return direction === "encode"
                ? bytesToHex(utf8ToBytes(input))
                : bytesToUtf8(hexToBytes(input));
        case "unicode":
            return direction === "encode"
                ? encodeUnicode(input)
                : decodeUnicode(input);
        case "html":
            return direction === "encode"
                ? encodeHtml(input)
                : decodeHtml(input);
        default: {
            const _exhaustive: never = kind;
            return _exhaustive;
        }
    }
}
