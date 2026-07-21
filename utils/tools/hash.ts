export type HashAlgorithm = "md5" | "sha1" | "sha256" | "sha384" | "sha512";

function toHex(bytes: ArrayBuffer | Uint8Array): string {
    const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    return Array.from(view, (b) => b.toString(16).padStart(2, "0")).join("");
}

const MD5_S = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5,
    9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11,
    16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10,
    15, 21,
] as const;

/** Compact MD5 (RFC 1321). Web Crypto does not expose MD5. */
export function md5FromBytes(bytes: Uint8Array): string {
    const bitLen = bytes.length * 8;
    const withOne = new Uint8Array((bytes.length + 9 + 63) & ~63);
    withOne.set(bytes);
    withOne[bytes.length] = 0x80;
    const view = new DataView(withOne.buffer);
    view.setUint32(withOne.length - 8, bitLen >>> 0, true);
    view.setUint32(withOne.length - 4, Math.floor(bitLen / 0x100000000), true);

    let a0 = 0x67452301;
    let b0 = 0xefcdab89;
    let c0 = 0x98badcfe;
    let d0 = 0x10325476;

    const K = new Uint32Array(64);
    for (let i = 0; i < 64; i++) {
        K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000);
    }
    const rotateLeft = (x: number, n: number) => (x << n) | (x >>> (32 - n));

    for (let offset = 0; offset < withOne.length; offset += 64) {
        const M = new Uint32Array(16);
        for (let i = 0; i < 16; i++) {
            M[i] = view.getUint32(offset + i * 4, true);
        }
        let A = a0;
        let B = b0;
        let C = c0;
        let D = d0;
        for (let i = 0; i < 64; i++) {
            let F: number;
            let g: number;
            if (i < 16) {
                F = (B & C) | (~B & D);
                g = i;
            } else if (i < 32) {
                F = (D & B) | (~D & C);
                g = (5 * i + 1) % 16;
            } else if (i < 48) {
                F = B ^ C ^ D;
                g = (3 * i + 5) % 16;
            } else {
                F = C ^ (B | ~D);
                g = (7 * i) % 16;
            }
            const s = MD5_S[i]!;
            const k = K[i]!;
            const m = M[g]!;
            F = (F + A + k + m) >>> 0;
            A = D;
            D = C;
            C = B;
            B = (B + rotateLeft(F, s)) >>> 0;
        }
        a0 = (a0 + A) >>> 0;
        b0 = (b0 + B) >>> 0;
        c0 = (c0 + C) >>> 0;
        d0 = (d0 + D) >>> 0;
    }

    const out = new Uint8Array(16);
    const outView = new DataView(out.buffer);
    outView.setUint32(0, a0, true);
    outView.setUint32(4, b0, true);
    outView.setUint32(8, c0, true);
    outView.setUint32(12, d0, true);
    return toHex(out);
}

export function md5(text: string): string {
    return md5FromBytes(new TextEncoder().encode(text));
}

const WEB_CRYPTO_ALGS: Record<
    Exclude<HashAlgorithm, "md5">,
    AlgorithmIdentifier
> = {
    sha1: "SHA-1",
    sha256: "SHA-256",
    sha384: "SHA-384",
    sha512: "SHA-512",
};

export async function digestText(
    text: string,
    algorithm: HashAlgorithm,
): Promise<string> {
    if (algorithm === "md5") {
        return md5(text);
    }
    const data = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest(WEB_CRYPTO_ALGS[algorithm], data);
    return toHex(digest);
}

export async function digestFile(
    file: File,
    algorithm: HashAlgorithm,
): Promise<string> {
    const buffer = await file.arrayBuffer();
    if (algorithm === "md5") {
        return md5FromBytes(new Uint8Array(buffer));
    }
    const digest = await crypto.subtle.digest(
        WEB_CRYPTO_ALGS[algorithm],
        buffer,
    );
    return toHex(digest);
}
