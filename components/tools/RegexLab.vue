<template>
    <section class="space-y-6">
        <div class="space-y-2">
            <AnzuInput
                v-model="pattern"
                :label="t('pages.tools.regex.pattern')"
                :placeholder="t('pages.tools.regex.patternPlaceholder')"
            />
            <div class="flex flex-wrap items-center gap-2">
                <span
                    class="text-sm text-(--md-sys-color-on-surface-variant)"
                >
                    {{ t("pages.tools.regex.flags") }}
                </span>
                <AnzuButton
                    v-for="flag in flagOptions"
                    :key="flag.value"
                    :variant="flags.includes(flag.value) ? 'tonal' : 'text'"
                    size="sm"
                    @click="toggleFlag(flag.value)"
                >
                    {{ flag.label }}
                </AnzuButton>
            </div>
        </div>

        <ToolTextarea
            v-model="text"
            :label="t('pages.tools.regex.testText')"
            :placeholder="t('pages.tools.regex.testTextPlaceholder')"
            :rows="8"
        />

        <p
            v-if="result.error"
            class="text-sm text-(--md-sys-color-error)"
        >
            {{ result.error }}
        </p>

        <div class="space-y-2">
            <div
                class="flex items-center justify-between text-sm text-(--md-sys-color-on-surface-variant)"
            >
                <span>{{ t("pages.tools.regex.preview") }}</span>
                <span>
                    {{
                        t("pages.tools.regex.matchCount", {
                            count: result.matches.length,
                        })
                    }}
                </span>
            </div>
            <pre
                class="min-h-24 whitespace-pre-wrap break-all rounded-lg bg-black/5 p-3 font-mono text-sm text-(--md-sys-color-on-surface) dark:bg-white/5"
            ><template v-for="(seg, i) in segments" :key="i"><mark
                        v-if="seg.matched"
                        class="rounded-sm bg-(--md-sys-color-primary)/20 text-(--md-sys-color-primary) not-italic"
                    >{{ seg.text }}</mark><template v-else>{{ seg.text }}</template></template><span
                    v-if="!text"
                    class="text-(--md-sys-color-on-surface-variant)/50"
                >{{ t("pages.tools.regex.previewEmpty") }}</span></pre>
        </div>

        <ul
            v-if="result.matches.length"
            class="space-y-2"
        >
            <li
                v-for="(m, index) in result.matches"
                :key="`${m.start}-${m.end}-${index}`"
                class="rounded-lg bg-black/5 px-3 py-2 text-sm dark:bg-white/5"
            >
                <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span class="font-medium text-(--md-sys-color-primary)">
                        #{{ index + 1 }}
                    </span>
                    <code class="font-mono text-(--md-sys-color-on-surface)">
                        {{ m.text }}
                    </code>
                    <span class="text-xs text-(--md-sys-color-on-surface-variant)">
                        [{{ m.start }}, {{ m.end }})
                    </span>
                </div>
                <div
                    v-if="m.groups.length"
                    class="mt-1 text-xs text-(--md-sys-color-on-surface-variant)"
                >
                    {{ t("pages.tools.regex.groups") }}:
                    {{ m.groups.map((g, gi) => `$${gi + 1}=${g}`).join(", ") }}
                </div>
            </li>
        </ul>
    </section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import {
    buildHighlightSegments,
    runRegex,
} from "~/utils/tools/regex";
import ToolTextarea from "~/components/tools/ToolTextarea.vue";

const { t } = useI18n();

const pattern = ref("");
const flags = ref("gi");
const text = ref("");

const flagOptions = [
    { label: "g", value: "g" },
    { label: "i", value: "i" },
    { label: "m", value: "m" },
    { label: "s", value: "s" },
    { label: "u", value: "u" },
] as const;

function toggleFlag(flag: string) {
    if (flags.value.includes(flag)) {
        flags.value = flags.value.replace(flag, "");
    } else {
        flags.value = `${flags.value}${flag}`;
    }
}

const result = computed(() => runRegex(pattern.value, flags.value, text.value));

const segments = computed(() =>
    buildHighlightSegments(text.value, result.value.matches),
);
</script>
