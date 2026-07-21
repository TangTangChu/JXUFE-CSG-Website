<template>
    <ToolsPageShell>
        <RegexLab />
    </ToolsPageShell>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import ToolsPageShell from "~/components/tools/ToolsPageShell.vue";
import RegexLab from "~/components/tools/RegexLab.vue";

const { t } = useI18n();

usePageMeta({
    titleKey: "pages.tools.regex.title",
    descriptionKey: "pages.tools.regex.description",
    canonicalPath: "/tools/regex",
    schema: {
        "@type": "WebApplication",
        name: t("pages.tools.regex.title"),
        applicationCategory: "UtilityApplication",
        operatingSystem: "All",
        offers: { "@type": "Offer", price: "0", priceCurrency: "CNY" },
    },
});
</script>
