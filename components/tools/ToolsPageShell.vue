<template>
    <main
        class="box-border bg-(--md-sys-color-surface-container-lowest) px-4 py-6 sm:px-6 sm:py-8"
    >
        <div class="mx-auto max-w-4xl space-y-6">
            <nav>
                <NuxtLink
                    to="/tools"
                    class="inline-flex items-center gap-1.5 text-sm text-(--md-sys-color-on-surface-variant) transition-colors duration-150 hover:text-(--md-sys-color-primary) focus-visible:ring-2 focus-visible:ring-(--md-sys-color-primary)/20 focus-visible:outline-none"
                >
                    <ArrowLeftIcon class="h-4 w-4" />
                    {{ t("pages.tools.backToList") }}
                </NuxtLink>
            </nav>
            <slot />
        </div>
    </main>
</template>

<script setup lang="ts">
import { ArrowLeftIcon } from "@heroicons/vue/24/outline";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>
