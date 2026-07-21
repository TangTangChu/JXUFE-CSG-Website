import { ref } from "vue";

export function useClipboardCopy(resetMs = 2000) {
    const copied = ref(false);
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function copy(text: string): Promise<boolean> {
        if (!text) return false;
        try {
            await navigator.clipboard.writeText(text);
            copied.value = true;
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
                copied.value = false;
            }, resetMs);
            return true;
        } catch {
            return false;
        }
    }

    return { copied, copy };
}
