<template>
    <section class="space-y-6">
        <div class="flex flex-wrap items-center gap-2 sm:gap-4">
            <AnzuSelector
                v-model="algorithm"
                :options="algorithmOptions"
            />
            <div class="h-4 w-px bg-(--md-sys-color-outline-variant)/40" />
            <AnzuSelector
                v-model="source"
                :options="sourceOptions"
            />
        </div>

        <ToolTextarea
            v-if="source === 'text'"
            v-model="text"
            :label="t('pages.tools.hash.input')"
            :placeholder="t('pages.tools.hash.inputPlaceholder')"
            :rows="8"
        />

        <div
            v-else
            class="space-y-2"
        >
            <label
                class="block text-sm font-medium text-(--md-sys-color-on-surface-variant)"
            >
                {{ t("pages.tools.hash.file") }}
            </label>
            <input
                type="file"
                class="block w-full text-sm text-(--md-sys-color-on-surface-variant) file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-(--md-sys-color-primary)/8 file:px-3 file:py-2 file:text-sm file:font-medium file:text-(--md-sys-color-primary)"
                @change="onFileChange"
            />
            <p
                v-if="fileName"
                class="text-xs text-(--md-sys-color-on-surface-variant)"
            >
                {{ fileName }}
            </p>
        </div>

        <div class="flex flex-wrap gap-2">
            <AnzuButton
                variant="text"
                size="sm"
                @click="clearAll"
            >
                {{ t("pages.tools.common.clear") }}
            </AnzuButton>
            <AnzuButton
                v-if="digest"
                variant="tonal"
                size="sm"
                @click="copy(digest)"
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
            :model-value="digest"
            :label="t('pages.tools.hash.output')"
            :placeholder="t('pages.tools.hash.outputPlaceholder')"
            :rows="3"
            readonly
        />
    </section>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { CheckIcon, ClipboardIcon } from "@heroicons/vue/24/outline";
import {
    digestFile,
    digestText,
    type HashAlgorithm,
} from "~/utils/tools/hash";
import ToolTextarea from "~/components/tools/ToolTextarea.vue";

const { t } = useI18n();
const { copied, copy } = useClipboardCopy();

const algorithm = ref<HashAlgorithm>("sha256");
const source = ref<"text" | "file">("text");
const text = ref("");
const file = ref<File | null>(null);
const fileName = ref("");
const digest = ref("");
const error = ref("");
const busy = ref(false);

const algorithmOptions = computed(() => [
    { label: "MD5", value: "md5" },
    { label: "SHA-1", value: "sha1" },
    { label: "SHA-256", value: "sha256" },
    { label: "SHA-384", value: "sha384" },
    { label: "SHA-512", value: "sha512" },
]);

const sourceOptions = computed(() => [
    { label: t("pages.tools.hash.sources.text"), value: "text" },
    { label: t("pages.tools.hash.sources.file"), value: "file" },
]);

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

async function compute() {
    error.value = "";
    digest.value = "";
    busy.value = true;
    try {
        if (source.value === "text") {
            if (!text.value) return;
            digest.value = await digestText(text.value, algorithm.value);
        } else if (file.value) {
            digest.value = await digestFile(file.value, algorithm.value);
        } else {
            error.value = t("pages.tools.hash.errors.noFile");
        }
    } catch {
        error.value = t("pages.tools.hash.errors.failed");
    } finally {
        busy.value = false;
    }
}

function scheduleCompute() {
    if (debounceTimer) clearTimeout(debounceTimer);
    if (source.value !== "text" || !text.value) {
        digest.value = "";
        error.value = "";
        return;
    }
    debounceTimer = setTimeout(compute, 300);
}

onUnmounted(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
});

function onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const next = input.files?.[0] ?? null;
    file.value = next;
    fileName.value = next?.name ?? "";
    if (next) compute();
}

function clearAll() {
    text.value = "";
    file.value = null;
    fileName.value = "";
    digest.value = "";
    error.value = "";
}

watch([algorithm, source], () => {
    digest.value = "";
    error.value = "";
    if (source.value === "text") scheduleCompute();
});

watch(text, () => {
    if (source.value === "text") scheduleCompute();
});
</script>
