<template>
    <div class="space-y-2">
        <h3
            class="text-sm font-semibold text-(--md-sys-color-on-surface-variant)"
        >
            {{ t("pages.tools.jwt.claims") }}
        </h3>
        <div class="overflow-x-auto">
            <table class="min-w-full table-fixed border-collapse">
                <thead>
                    <tr
                        class="border-b border-(--md-sys-color-outline-variant)/60 text-left"
                    >
                        <th
                            class="w-[28%] px-2 py-2 text-xs font-medium text-(--md-sys-color-on-surface-variant)"
                        >
                            {{ t("pages.tools.jwt.claimKey") }}
                        </th>
                        <th
                            class="px-2 py-2 text-xs font-medium text-(--md-sys-color-on-surface-variant)"
                        >
                            {{ t("pages.tools.jwt.claimValue") }}
                        </th>
                        <th class="w-12 px-2 py-2" />
                    </tr>
                </thead>
                <tbody
                    class="divide-y divide-(--md-sys-color-outline-variant)/40"
                >
                    <tr
                        v-for="claim in claims"
                        :key="claim.key"
                    >
                        <td
                            class="px-2 py-2 align-top font-mono text-sm font-medium text-(--md-sys-color-primary)"
                        >
                            {{ claim.key }}
                        </td>
                        <td class="px-2 py-2 align-top">
                            <code
                                class="break-all font-mono text-sm text-(--md-sys-color-on-surface)"
                            >
                                {{ claim.display }}
                            </code>
                            <p
                                v-if="claim.isTime && claim.unix != null"
                                class="mt-0.5 text-xs text-(--md-sys-color-on-surface-variant)"
                            >
                                unix: {{ claim.unix }}
                            </p>
                        </td>
                        <td class="px-2 py-2 align-top">
                            <AnzuButton
                                variant="text"
                                size="sm"
                                class="shrink-0"
                                @click="copy(String(claim.display))"
                            >
                                <template #icon>
                                    <ClipboardIcon class="h-4 w-4" />
                                </template>
                            </AnzuButton>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ClipboardIcon } from "@heroicons/vue/24/outline";
import type { JwtClaimRow } from "~/utils/tools/jwt";

defineProps<{
    claims: JwtClaimRow[];
}>();

const { t } = useI18n();
const { copy } = useClipboardCopy();
</script>
