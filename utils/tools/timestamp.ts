export type TimestampUnit = "s" | "ms";

export interface TimestampParseResult {
    date: Date | null;
    error: "empty" | "invalid" | null;
}

export function detectUnit(value: number): TimestampUnit {
    // 1e12 ms ≈ Sep 2001; values above that are almost certainly milliseconds
    return Math.abs(value) >= 1e12 ? "ms" : "s";
}

export function parseTimestampInput(
    input: string,
    unit: TimestampUnit | "auto",
): TimestampParseResult {
    const trimmed = input.trim();
    if (!trimmed) {
        return { date: null, error: "empty" };
    }

    if (/^\d+(\.\d+)?$/.test(trimmed)) {
        const num = Number(trimmed);
        if (!Number.isFinite(num)) {
            return { date: null, error: "invalid" };
        }
        const resolved = unit === "auto" ? detectUnit(num) : unit;
        const ms = resolved === "s" ? num * 1000 : num;
        const date = new Date(ms);
        if (Number.isNaN(date.getTime())) {
            return { date: null, error: "invalid" };
        }
        return { date, error: null };
    }

    const date = new Date(trimmed);
    if (Number.isNaN(date.getTime())) {
        return { date: null, error: "invalid" };
    }
    return { date, error: null };
}

export function formatTimestampViews(date: Date) {
    return {
        unixSeconds: Math.floor(date.getTime() / 1000),
        unixMilliseconds: date.getTime(),
        iso: date.toISOString(),
        local: date.toLocaleString(),
        utc: date.toUTCString(),
    };
}

export function nowTimestampViews() {
    return formatTimestampViews(new Date());
}
