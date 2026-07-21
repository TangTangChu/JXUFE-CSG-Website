export interface RegexMatchSpan {
    start: number;
    end: number;
    text: string;
    groups: string[];
    namedGroups: Record<string, string>;
}

export interface RegexRunResult {
    error: string | null;
    matches: RegexMatchSpan[];
    flags: string;
}

const FLAG_CHARS = new Set(["g", "i", "m", "s", "u", "y", "d", "v"]);

export function normalizeFlags(flags: string): string {
    const unique = new Set<string>();
    for (const ch of flags) {
        if (FLAG_CHARS.has(ch)) unique.add(ch);
    }
    // Always use g for multi-match listing when user wants all matches
    return Array.from(unique).sort().join("");
}

export function runRegex(
    pattern: string,
    flags: string,
    text: string,
    maxMatches = 200,
): RegexRunResult {
    if (!pattern) {
        return { error: null, matches: [], flags: normalizeFlags(flags) };
    }

    const normalized = normalizeFlags(flags);
    // Ensure global so we can walk all matches safely
    const effectiveFlags = normalized.includes("g")
        ? normalized
        : `${normalized}g`;

    let re: RegExp;
    try {
        re = new RegExp(pattern, effectiveFlags);
    } catch (e) {
        return {
            error: e instanceof Error ? e.message : "invalid_regex",
            matches: [],
            flags: effectiveFlags,
        };
    }

    const matches: RegexMatchSpan[] = [];
    let match: RegExpExecArray | null;
    let guard = 0;
    while ((match = re.exec(text)) !== null) {
        guard++;
        if (guard > maxMatches) break;
        if (match[0] === "" && re.lastIndex === match.index) {
            re.lastIndex += 1;
            if (re.lastIndex > text.length) break;
            continue;
        }
        const groups = match.slice(1).map((g) => g ?? "");
        const namedGroups: Record<string, string> = {};
        if (match.groups) {
            for (const [key, value] of Object.entries(match.groups)) {
                if (value !== undefined) namedGroups[key] = value;
            }
        }
        matches.push({
            start: match.index,
            end: match.index + match[0].length,
            text: match[0],
            groups,
            namedGroups,
        });
        if (!effectiveFlags.includes("g")) break;
    }

    return { error: null, matches, flags: effectiveFlags };
}

export interface HighlightSegment {
    text: string;
    matched: boolean;
}

export function buildHighlightSegments(
    text: string,
    matches: RegexMatchSpan[],
): HighlightSegment[] {
    if (!matches.length) {
        return text ? [{ text, matched: false }] : [];
    }
    const segments: HighlightSegment[] = [];
    let cursor = 0;
    const sorted = [...matches].sort((a, b) => a.start - b.start);
    for (const m of sorted) {
        if (m.start < cursor) continue;
        if (m.start > cursor) {
            segments.push({ text: text.slice(cursor, m.start), matched: false });
        }
        segments.push({ text: text.slice(m.start, m.end), matched: true });
        cursor = m.end;
    }
    if (cursor < text.length) {
        segments.push({ text: text.slice(cursor), matched: false });
    }
    return segments;
}
