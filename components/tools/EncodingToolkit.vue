<template>
    <section class="space-y-6">
        <div class="flex flex-wrap items-center gap-2 sm:gap-4">
            <AnzuSelector
                v-model="kind"
                :options="kindOptions"
            />
            <div class="h-4 w-px bg-(--md-sys-color-outline-variant)/40" />
            <AnzuSelector
                v-model="direction"
                :options="directionOptions"
            />
        </div>

        <ToolTextarea
            v-model="input"
            :label="t('pages.tools.encoding.input')"
            :placeholder="t('pages.tools.encoding.inputPlaceholder')"
            :rows="8"
        />

        <div class="flex flex-wrap gap-2">
            <AnzuButton
                variant="outlined"
                size="sm"
                @click="swap"
            >
                {{ t("pages.tools.encoding.actions.swap") }}
            </AnzuButton>
            <AnzuButton
                variant="text"
                size="sm"
                @click="clearAll"
            >
                {{ t("pages.tools.common.clear") }}
            </AnzuButton>
            <AnzuButton
                v-if="output"
                variant="tonal"
                size="sm"
                @click="copy(output)"
            >
                <template #icon>
                    <CheckIcon
                        v-if="copied"
                        class="h-4 w-4"
                    />
                    <ClipboardIcon
                        v-else
                        class="h-4 w-4"
                    />
                </template>
                {{
                    copied
                        ? t("pages.tools.common.copied")
                        : t("pages.tools.common.copy")
                }}
            </AnzuButton>
        </div>

        <p
            v-if="error"
            class="text-sm text-(--md-sys-color-error)"
        >
            {{ error }}
        </p>

        <ToolTextarea
            v-model="output"
            :label="t('pages.tools.encoding.output')"
            :placeholder="t('pages.tools.encoding.outputPlaceholder')"
            :rows="8"
            readonly
        />
    </section>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { CheckIcon, ClipboardIcon } from "@heroicons/vue/24/outline";
import {
    transformEncoding,
    type EncodingDirection,
    type EncodingKind,
} from "~/utils/tools/encoding";
import ToolTextarea from "~/components/tools/ToolTextarea.vue";

const { t } = useI18n();
const { copied, copy } = useClipboardCopy();

const kind = ref<EncodingKind>("base64");
const direction = ref<EncodingDirection>("encode");
const input = ref("");
const output = ref("");
const error = ref("");

const kindOptions = computed(() => [
    { label: "Base64", value: "base64" },
    { label: "URL", value: "url" },
    { label: "Hex", value: "hex" },
    { label: "Unicode", value: "unicode" },
    { label: "HTML", value: "html" },
]);

const directionOptions = computed(() => [
    {
        label: t("pages.tools.encoding.actions.encode"),
        value: "encode",
    },
    {
        label: t("pages.tools.encoding.actions.decode"),
        value: "decode",
    },
]);

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function compute() {
    error.value = "";
    try {
        output.value = transformEncoding(
            input.value,
            kind.value,
            direction.value,
        );
    } catch {
        error.value = t("pages.tools.encoding.errors.failed");
        output.value = "";
    }
}

function scheduleCompute() {
    if (debounceTimer) clearTimeout(debounceTimer);
    if (!input.value) {
        output.value = "";
        error.value = "";
        return;
    }
    debounceTimer = setTimeout(compute, 300);
}

onUnmounted(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
});

function swap() {
    const next = output.value;
    output.value = input.value;
    input.value = next;
    direction.value = direction.value === "encode" ? "decode" : "encode";
}

function clearAll() {
    input.value = "";
    output.value = "";
    error.value = "";
}

watch([input, kind, direction], () => {
    scheduleCompute();
});
</script>
