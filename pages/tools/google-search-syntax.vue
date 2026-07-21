<template>
    <ToolsPageShell>
        <GoogleSearchSyntaxGenerator />
    </ToolsPageShell>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import ToolsPageShell from "~/components/tools/ToolsPageShell.vue";
import GoogleSearchSyntaxGenerator from "~/components/tools/GoogleSearchSyntaxGenerator.vue";

const { t } = useI18n();

usePageMeta({
    titleKey: "pages.tools.googleSearchSyntax.title",
    descriptionKey: "pages.tools.googleSearchSyntax.description",
    canonicalPath: "/tools/google-search-syntax",
    schema: {
        "@type": "WebApplication",
        name: t("pages.tools.googleSearchSyntax.title"),
        applicationCategory: "UtilityApplication",
        operatingSystem: "All",
        offers: { "@type": "Offer", price: "0", priceCurrency: "CNY" },
        author: {
            "@type": "Organization",
            name: t("meta.fullName"),
            url: (useRuntimeConfig().public.siteUrl as string).replace(
                /\/+$/,
                "",
            ),
        },
    },
});
</script>
