<template>
    <ToolsPageShell>
        <HashCalculator />
    </ToolsPageShell>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import ToolsPageShell from "~/components/tools/ToolsPageShell.vue";
import HashCalculator from "~/components/tools/HashCalculator.vue";

const { t } = useI18n();

usePageMeta({
    titleKey: "pages.tools.hash.title",
    descriptionKey: "pages.tools.hash.description",
    canonicalPath: "/tools/hash",
    schema: {
        "@type": "WebApplication",
        name: t("pages.tools.hash.title"),
        applicationCategory: "UtilityApplication",
        operatingSystem: "All",
        offers: { "@type": "Offer", price: "0", priceCurrency: "CNY" },
    },
});
</script>
