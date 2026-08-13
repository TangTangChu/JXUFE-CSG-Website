/**
 * 服务端取入站请求的 User-Agent。
 * 依赖请求上下文，取不到时返回 undefined。
 */
export const getRequestUserAgent = (): string | undefined => {
    if (import.meta.client) return undefined;
    try {
        const event = useRequestEvent();
        const header = event?.node?.req?.headers["user-agent"];
        return Array.isArray(header) ? header[0] : header;
    } catch {
        return undefined;
    }
};
