<template>
    <main
        class="box-border bg-(--md-sys-color-surface-container-lowest) px-4 py-6 sm:px-6 sm:py-8"
    >
        <div class="mx-auto max-w-4xl">
            <ul class="grid grid-cols-1 gap-3 sm:gap-4">
                <li
                    v-for="tool in tools"
                    :key="tool.path"
                    class="list-none"
                >
                    <NuxtLink
                        :to="tool.path"
                        class="relative flex cursor-pointer! flex-col rounded-xl px-6 py-5 transition-all duration-200 ease-out before:absolute before:inset-0 before:z-[-1] before:origin-[var(--origin-x)_var(--origin-y)] before:scale-[0.92] before:rounded-2xl before:bg-(--md-sys-color-secondary-container)/40 before:opacity-0 before:backdrop-blur before:transition-all before:duration-200 hover:translate-x-2 hover:before:scale-100 hover:before:opacity-100 focus-visible:shadow-none! dark:before:bg-(--md-sys-color-secondary-container)/70 sm:px-8 sm:py-6"
                        :style="`--origin-x: ${tool.originX}%; --origin-y: ${tool.originY}%`"
                    >
                        <h2
                            class="text-lg font-medium text-(--md-sys-color-on-surface) sm:text-xl"
                        >
                            {{ t(tool.titleKey) }}
                        </h2>
                        <p
                            class="mt-2 text-sm leading-relaxed text-(--md-sys-color-on-surface-variant) sm:text-base"
                        >
                            {{ t(tool.descriptionKey) }}
                        </p>
                    </NuxtLink>
                </li>
            </ul>
        </div>
    </main>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const tools = [
    {
        path: "/tools/google-search-syntax",
        titleKey: "pages.tools.googleSearchSyntax.title",
        descriptionKey: "pages.tools.googleSearchSyntax.description",
        originX: 52,
        originY: 40,
    },
    {
        path: "/tools/encoding",
        titleKey: "pages.tools.encoding.title",
        descriptionKey: "pages.tools.encoding.description",
        originX: 28,
        originY: 42,
    },
    {
        path: "/tools/hash",
        titleKey: "pages.tools.hash.title",
        descriptionKey: "pages.tools.hash.description",
        originX: 64,
        originY: 36,
    },
    {
        path: "/tools/regex",
        titleKey: "pages.tools.regex.title",
        descriptionKey: "pages.tools.regex.description",
        originX: 40,
        originY: 58,
    },
    {
        path: "/tools/jwt",
        titleKey: "pages.tools.jwt.title",
        descriptionKey: "pages.tools.jwt.description",
        originX: 72,
        originY: 48,
    },
    {
        path: "/tools/timestamp",
        titleKey: "pages.tools.timestamp.title",
        descriptionKey: "pages.tools.timestamp.description",
        originX: 34,
        originY: 62,
    },
] as const;

usePageMeta({
    titleKey: "pages.tools.title",
    descriptionKey: "pages.tools.meta.description",
    canonicalPath: "/tools",
    schema: {
        "@type": "CollectionPage",
        name: t("pages.tools.title"),
        description: t("pages.tools.meta.description"),
    },
});
</script>
