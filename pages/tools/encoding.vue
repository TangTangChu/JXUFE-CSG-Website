<template>
    <ToolsPageShell>
        <EncodingToolkit />
    </ToolsPageShell>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import ToolsPageShell from "~/components/tools/ToolsPageShell.vue";
import EncodingToolkit from "~/components/tools/EncodingToolkit.vue";

const { t } = useI18n();

usePageMeta({
    titleKey: "pages.tools.encoding.title",
    descriptionKey: "pages.tools.encoding.description",
    canonicalPath: "/tools/encoding",
    schema: {
        "@type": "WebApplication",
        name: t("pages.tools.encoding.title"),
        applicationCategory: "UtilityApplication",
        operatingSystem: "All",
        offers: { "@type": "Offer", price: "0", priceCurrency: "CNY" },
    },
});
</script>
