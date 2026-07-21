<template>
    <ToolsPageShell>
        <JwtInspector />
    </ToolsPageShell>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import ToolsPageShell from "~/components/tools/ToolsPageShell.vue";
import JwtInspector from "~/components/tools/JwtInspector.vue";

const { t } = useI18n();

usePageMeta({
    titleKey: "pages.tools.jwt.title",
    descriptionKey: "pages.tools.jwt.description",
    canonicalPath: "/tools/jwt",
    schema: {
        "@type": "WebApplication",
        name: t("pages.tools.jwt.title"),
        applicationCategory: "UtilityApplication",
        operatingSystem: "All",
        offers: { "@type": "Offer", price: "0", priceCurrency: "CNY" },
    },
});
</script>
