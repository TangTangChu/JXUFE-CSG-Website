<template>
    <ToolsPageShell>
        <TimestampConverter />
    </ToolsPageShell>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import ToolsPageShell from "~/components/tools/ToolsPageShell.vue";
import TimestampConverter from "~/components/tools/TimestampConverter.vue";

const { t } = useI18n();

usePageMeta({
    titleKey: "pages.tools.timestamp.title",
    descriptionKey: "pages.tools.timestamp.description",
    canonicalPath: "/tools/timestamp",
    schema: {
        "@type": "WebApplication",
        name: t("pages.tools.timestamp.title"),
        applicationCategory: "UtilityApplication",
        operatingSystem: "All",
        offers: { "@type": "Offer", price: "0", priceCurrency: "CNY" },
    },
});
</script>
