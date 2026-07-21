<template>
    <section class="space-y-6">
        <div class="flex flex-wrap items-end gap-3">
            <div class="min-w-0 flex-1">
                <AnzuInput
                    v-model="input"
                    :label="t('pages.tools.timestamp.input')"
                    :placeholder="t('pages.tools.timestamp.inputPlaceholder')"
                />
            </div>
            <AnzuSelector
                v-model="unit"
                :options="unitOptions"
            />
        </div>

        <div class="flex flex-wrap gap-2">
            <AnzuButton
                variant="tonal"
                size="sm"
                @click="fillNow"
            >
                {{ t("pages.tools.timestamp.actions.now") }}
            </AnzuButton>
            <AnzuButton
                variant="text"
                size="sm"
                @click="clearAll"
            >
                {{ t("pages.tools.common.clear") }}
            </AnzuButton>
        </div>

        <p
            v-if="parsed.error === 'invalid'"
            class="text-sm text-(--md-sys-color-error)"
        >
            {{ t("pages.tools.timestamp.errors.invalid") }}
        </p>

        <dl
            v-if="views"
            class="grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
            <div
                v-for="row in rows"
                :key="row.key"
                class="space-y-1 rounded-lg bg-black/5 px-3 py-2 dark:bg-white/5"
            >
                <dt
                    class="text-xs font-medium text-(--md-sys-color-on-surface-variant)"
                >
                    {{ row.label }}
                </dt>
                <dd class="flex items-center justify-between gap-2">
                    <code
                        class="min-w-0 flex-1 break-all font-mono text-sm text-(--md-sys-color-on-surface)"
                    >
                        {{ row.value }}
                    </code>
                    <AnzuButton
                        variant="text"
                        size="sm"
                        class="shrink-0"
                        @click="copy(String(row.value))"
                    >
                        <template #icon>
                            <ClipboardIcon class="h-4 w-4" />
                        </template>
                    </AnzuButton>
                </dd>
            </div>
        </dl>
    </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { ClipboardIcon } from "@heroicons/vue/24/outline";
import {
    formatTimestampViews,
    parseTimestampInput,
    type TimestampUnit,
} from "~/utils/tools/timestamp";

const { t } = useI18n();
const { copy } = useClipboardCopy();

const input = ref("");
const unit = ref<TimestampUnit | "auto">("auto");

onMounted(() => {
    input.value = String(Math.floor(Date.now() / 1000));
    unit.value = "s";
});

const unitOptions = computed(() => [
    { label: t("pages.tools.timestamp.units.auto"), value: "auto" },
    { label: t("pages.tools.timestamp.units.s"), value: "s" },
    { label: t("pages.tools.timestamp.units.ms"), value: "ms" },
]);

const parsed = computed(() => parseTimestampInput(input.value, unit.value));

const views = computed(() => {
    if (!parsed.value.date) return null;
    return formatTimestampViews(parsed.value.date);
});

const rows = computed(() => {
    if (!views.value) return [];
    return [
        {
            key: "unixSeconds",
            label: t("pages.tools.timestamp.views.unixSeconds"),
            value: views.value.unixSeconds,
        },
        {
            key: "unixMilliseconds",
            label: t("pages.tools.timestamp.views.unixMilliseconds"),
            value: views.value.unixMilliseconds,
        },
        {
            key: "iso",
            label: t("pages.tools.timestamp.views.iso"),
            value: views.value.iso,
        },
        {
            key: "local",
            label: t("pages.tools.timestamp.views.local"),
            value: views.value.local,
        },
        {
            key: "utc",
            label: t("pages.tools.timestamp.views.utc"),
            value: views.value.utc,
        },
    ];
});

function fillNow() {
    input.value = String(Math.floor(Date.now() / 1000));
    unit.value = "s";
}

function clearAll() {
    input.value = "";
}
</script>
