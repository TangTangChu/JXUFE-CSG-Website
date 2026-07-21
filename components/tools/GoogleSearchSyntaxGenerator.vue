<template>
    <section class="space-y-6">
        <div class="space-y-2">
            <h2
                class="text-xl font-bold text-(--md-sys-color-on-surface) sm:text-2xl"
            >
                {{ t("pages.tools.googleSearchSyntax.title") }}
            </h2>
            <p class="text-sm text-(--md-sys-color-on-surface-variant)">
                {{ t("pages.tools.googleSearchSyntax.description") }}
            </p>
        </div>

        <!-- Base Query -->
        <div class="space-y-2">
            <label
                class="text-sm font-medium text-(--md-sys-color-on-surface-variant)"
            >
                {{ t("pages.tools.googleSearchSyntax.baseQuery") }}
            </label>
            <AnzuInput
                v-model="baseQuery"
                :placeholder="t('pages.tools.googleSearchSyntax.baseQueryPlaceholder')"
            />
        </div>

        <!-- Filters -->
        <div class="space-y-4">
            <div class="flex items-center justify-between">
                <h3
                    class="text-sm font-semibold text-(--md-sys-color-on-surface-variant)"
                >
                    {{ t("pages.tools.googleSearchSyntax.filters.title") }}
                </h3>
                <AnzuButton
                    variant="text"
                    size="sm"
                    :disabled="filters.length >= maxFilters"
                    @click="addFilter"
                >
                    <template #icon>
                        <PlusIcon class="h-4 w-4" />
                    </template>
                    {{ t("pages.tools.googleSearchSyntax.actions.addFilter") }}
                </AnzuButton>
            </div>

            <TransitionGroup
                name="filter-list"
                tag="div"
                class="space-y-3"
            >
                <div
                    v-for="(filter, index) in filters"
                    :key="filter.id"
                    class="flex flex-col gap-2 sm:flex-row sm:items-start"
                >
                    <div class="w-full sm:w-44">
                        <AnzuComboBox
                            :model-value="filter.type"
                            :items="filterTypeOptions"
                            :placeholder="t('pages.tools.googleSearchSyntax.filters.site')"
                            :search-placeholder="t('pages.tools.googleSearchSyntax.filters.site')"
                            menu-width-class="w-52"
                            @update:model-value="
                                (val: string | number | null) =>
                                    updateFilterType(index, String(val ?? ''))
                            "
                        />
                    </div>
                    <div class="flex-1">
                        <AnzuComboBox
                            v-if="filter.type === 'filetype'"
                            :model-value="filter.value"
                            :items="filetypeOptions"
                            :placeholder="
                                t(
                                    'pages.tools.googleSearchSyntax.placeholders.filetype',
                                )
                            "
                            :search-placeholder="
                                t(
                                    'pages.tools.googleSearchSyntax.placeholders.filetype',
                                )
                            "
                            menu-width-class="w-full"
                            @update:model-value="
                                (val: string | number | null) =>
                                    updateFilterValue(index, String(val ?? ''))
                            "
                        />
                        <AnzuInput
                            v-else
                            :model-value="filter.value"
                            :placeholder="
                                t(
                                    `pages.tools.googleSearchSyntax.placeholders.${filter.type}`,
                                )
                            "
                            @update:model-value="
                                (val: string | number) =>
                                    updateFilterValue(index, String(val))
                            "
                        />
                    </div>
                    <AnzuButton
                        variant="text"
                        size="sm"
                        class="shrink-0 self-end sm:self-center"
                        @click="removeFilter(index)"
                    >
                        <template #icon>
                            <XMarkIcon class="h-4 w-4" />
                        </template>
                        {{ t("pages.tools.googleSearchSyntax.actions.removeFilter") }}
                    </AnzuButton>
                </div>
            </TransitionGroup>
        </div>

        <!-- Result -->
        <div class="space-y-3">
            <div class="flex items-center justify-between">
                <h3
                    class="text-sm font-semibold text-(--md-sys-color-on-surface-variant)"
                >
                    {{ t("pages.tools.googleSearchSyntax.result.title") }}
                </h3>
                <div
                    v-if="generatedQuery"
                    class="flex items-center gap-2"
                >
                    <AnzuButton
                        variant="outlined"
                        size="sm"
                        @click="clearAll"
                    >
                        <template #icon>
                            <TrashIcon class="h-4 w-4" />
                        </template>
                        {{ t("pages.tools.googleSearchSyntax.actions.clear") }}
                    </AnzuButton>
                    <AnzuButton
                        variant="filled"
                        size="sm"
                        @click="copyToClipboard"
                    >
                        <template #icon>
                            <CheckIcon
                                v-if="copied"
                                class="h-4 w-4"
                            />
                            <ClipboardIcon
                                v-else
                                class="h-4 w-4"
                            />
                        </template>
                        {{
                            copied
                                ? t(
                                      "pages.tools.googleSearchSyntax.actions.copied",
                                  )
                                : t(
                                      "pages.tools.googleSearchSyntax.actions.copy",
                                  )
                        }}
                    </AnzuButton>
                </div>
            </div>
            <div
                class="min-h-20 rounded-xl border border-(--md-sys-color-outline-variant) bg-(--md-sys-color-surface-container-lowest) p-4"
            >
                <pre
                    v-if="generatedQuery"
                    class="whitespace-pre-wrap break-all font-mono text-sm text-(--md-sys-color-on-surface)"
                >{{ generatedQuery }}</pre>
                <p
                    v-else
                    class="text-sm text-(--md-sys-color-on-surface-variant) italic"
                >
                    {{ t("pages.tools.googleSearchSyntax.result.empty") }}
                </p>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import {
    PlusIcon,
    XMarkIcon,
    ClipboardIcon,
    CheckIcon,
    TrashIcon,
} from "@heroicons/vue/24/outline";

interface Filter {
    id: number;
    type: FilterType;
    value: string;
}

type FilterType =
    | "site"
    | "intitle"
    | "inurl"
    | "intext"
    | "filetype"
    | "before"
    | "after"
    | "exclude"
    | "exactPhase";

const { t } = useI18n();
const maxFilters = 12;
let nextId = 0;

const baseQuery = ref("");
const filters = ref<Filter[]>([{ id: nextId++, type: "site", value: "" }]);
const copied = ref(false);

const filterTypeOptions = computed(() => [
    { label: t("pages.tools.googleSearchSyntax.filters.site"), value: "site" },
    {
        label: t("pages.tools.googleSearchSyntax.filters.intitle"),
        value: "intitle",
    },
    { label: t("pages.tools.googleSearchSyntax.filters.inurl"), value: "inurl" },
    {
        label: t("pages.tools.googleSearchSyntax.filters.intext"),
        value: "intext",
    },
    {
        label: t("pages.tools.googleSearchSyntax.filters.filetype"),
        value: "filetype",
    },
    {
        label: t("pages.tools.googleSearchSyntax.filters.before"),
        value: "before",
    },
    {
        label: t("pages.tools.googleSearchSyntax.filters.after"),
        value: "after",
    },
    {
        label: t("pages.tools.googleSearchSyntax.filters.exclude"),
        value: "exclude",
    },
    {
        label: t("pages.tools.googleSearchSyntax.filters.exactPhase"),
        value: "exactPhase",
    },
]);

const filetypes = ["pdf", "doc", "xls", "ppt", "txt", "html"] as const;

const filetypeOptions = computed(() =>
    filetypes.map((ft) => ({
        label: t(`pages.tools.googleSearchSyntax.filetypes.${ft}`),
        value: ft,
    })),
);

const generatedQuery = computed(() => {
    const parts: string[] = [];
    const trimmed = baseQuery.value.trim();
    if (trimmed) {
        parts.push(trimmed);
    }
    for (const f of filters.value) {
        const val = f.value.trim();
        if (!val) continue;
        switch (f.type) {
            case "site":
                parts.push(`site:${val}`);
                break;
            case "intitle":
                parts.push(
                    val.includes(" ") ? `intitle:"${val}"` : `intitle:${val}`,
                );
                break;
            case "inurl":
                parts.push(`inurl:${val}`);
                break;
            case "intext":
                parts.push(`intext:${val}`);
                break;
            case "filetype":
                parts.push(`filetype:${val}`);
                break;
            case "before":
                parts.push(`before:${val}`);
                break;
            case "after":
                parts.push(`after:${val}`);
                break;
            case "exclude":
                for (const word of val.split(/\s+/)) {
                    if (word) parts.push(`-${word}`);
                }
                break;
            case "exactPhase":
                parts.push(`"${val}"`);
                break;
        }
    }
    return parts.join(" ");
});

function addFilter() {
    filters.value.push({ id: ++nextId, type: "site", value: "" });
}

function removeFilter(index: number) {
    filters.value.splice(index, 1);
}

function updateFilterType(index: number, type: string) {
    const filter = filters.value[index];
    if (filter && isValidFilterType(type)) {
        filter.type = type;
        filter.value = "";
    }
}

function updateFilterValue(index: number, value: string) {
    const filter = filters.value[index];
    if (filter) {
        filter.value = value;
    }
}

function isValidFilterType(type: string): type is FilterType {
    const valid: FilterType[] = [
        "site",
        "intitle",
        "inurl",
        "intext",
        "filetype",
        "before",
        "after",
        "exclude",
        "exactPhase",
    ];
    return valid.includes(type as FilterType);
}

async function copyToClipboard() {
    if (!generatedQuery.value) return;
    try {
        await navigator.clipboard.writeText(generatedQuery.value);
        copied.value = true;
        setTimeout(() => {
            copied.value = false;
        }, 2000);
    } catch {
        // clipboard API not available
    }
}

function clearAll() {
    baseQuery.value = "";
    filters.value = [{ id: ++nextId, type: "site", value: "" }];
    copied.value = false;
}
</script>

<style scoped>
.filter-list-enter-active,
.filter-list-leave-active {
    transition: all 0.25s ease;
}
.filter-list-enter-from,
.filter-list-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}
.filter-list-move {
    transition: transform 0.25s ease;
}
</style>
