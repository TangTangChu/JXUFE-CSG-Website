<template>
    <div class="space-y-2">
        <div class="flex items-center justify-between gap-2">
            <h3
                class="text-sm font-semibold text-(--md-sys-color-on-surface-variant)"
            >
                {{ title }}
            </h3>
            <AnzuButton
                v-if="showCopy"
                variant="text"
                size="sm"
                @click="$emit('copy')"
            >
                <template #icon>
                    <ClipboardIcon class="h-4 w-4" />
                </template>
                {{ t("pages.tools.common.copy") }}
            </AnzuButton>
        </div>
        <pre
            class="overflow-x-auto break-all rounded-lg bg-black/5 p-3 font-mono text-sm text-(--md-sys-color-on-surface) dark:bg-white/5"
        >{{ content }}</pre>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ClipboardIcon } from "@heroicons/vue/24/outline";

withDefaults(
    defineProps<{
        title: string;
        content: string;
        showCopy?: boolean;
    }>(),
    {
        showCopy: true,
    },
);

defineEmits<{
    copy: [];
}>();

const { t } = useI18n();
</script>
