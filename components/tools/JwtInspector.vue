<template>
    <section class="space-y-6">
        <ToolTextarea
            v-model="token"
            :label="t('pages.tools.jwt.input')"
            :placeholder="t('pages.tools.jwt.inputPlaceholder')"
            :rows="5"
        />

        <div class="flex flex-wrap gap-2">
            <AnzuButton
                variant="text"
                size="sm"
                @click="clearAll"
            >
                {{ t("pages.tools.common.clear") }}
            </AnzuButton>
            <AnzuButton
                v-if="result.validFormat"
                variant="outlined"
                size="sm"
                @click="toggleEdit"
            >
                {{
                    editing
                        ? t("pages.tools.jwt.actions.cancelEdit")
                        : t("pages.tools.jwt.actions.edit")
                }}
            </AnzuButton>
            <AnzuButton
                v-if="result.validFormat"
                variant="tonal"
                size="sm"
                @click="applyAlgNone"
            >
                {{ t("pages.tools.jwt.actions.algNone") }}
            </AnzuButton>
        </div>

        <p
            v-if="token.trim() && !result.validFormat"
            class="text-sm text-(--md-sys-color-error)"
        >
            {{ t("pages.tools.jwt.errors.invalidFormat") }}
        </p>

        <template v-if="result.validFormat">
            <div class="flex flex-wrap items-center gap-2">
                <span
                    v-if="result.alg"
                    class="rounded-full px-2.5 py-1 text-xs font-medium"
                    :class="
                        result.flags.includes('alg_none')
                            ? 'bg-(--md-sys-color-error)/12 text-(--md-sys-color-error)'
                            : 'bg-(--md-sys-color-primary)/12 text-(--md-sys-color-primary)'
                    "
                >
                    alg: {{ result.alg }}
                </span>
                <span
                    v-if="result.typ"
                    class="rounded-full bg-black/5 px-2.5 py-1 text-xs font-medium text-(--md-sys-color-on-surface-variant) dark:bg-white/5"
                >
                    typ: {{ result.typ }}
                </span>
                <span
                    v-if="result.kid"
                    class="rounded-full bg-black/5 px-2.5 py-1 text-xs font-medium text-(--md-sys-color-on-surface-variant) dark:bg-white/5"
                >
                    kid: {{ result.kid }}
                </span>
                <span
                    v-for="badge in timeBadges"
                    :key="badge.key"
                    class="rounded-full px-2.5 py-1 text-xs font-medium"
                    :class="badge.className"
                >
                    {{ badge.label }}
                </span>
            </div>

            <p
                v-if="result.flags.includes('alg_none')"
                class="text-sm text-(--md-sys-color-error)"
            >
                {{ t("pages.tools.jwt.notes.algNone") }}
            </p>

            <div
                v-if="result.timeClaims.length"
                class="grid grid-cols-1 gap-3 sm:grid-cols-3"
            >
                <div
                    v-for="tc in result.timeClaims"
                    :key="tc.key"
                    class="space-y-1 rounded-lg bg-black/5 px-3 py-2 dark:bg-white/5"
                >
                    <div
                        class="flex items-center justify-between gap-2 text-xs font-medium text-(--md-sys-color-on-surface-variant)"
                    >
                        <span>{{ tc.key.toUpperCase() }}</span>
                        <span :class="timeStatusClass(tc.status)">
                            {{ timeStatusLabel(tc) }}
                        </span>
                    </div>
                    <code
                        class="block break-all font-mono text-sm text-(--md-sys-color-on-surface)"
                    >
                        {{ tc.iso }}
                    </code>
                    <p class="text-xs text-(--md-sys-color-on-surface-variant)">
                        {{ tc.unix }} ·
                        {{ formatRelativeDelta(tc.deltaSeconds) }}
                    </p>
                </div>
            </div>

            <JwtClaimsTable
                v-if="result.claims.length"
                :claims="result.claims"
            />

            <template v-if="editing">
                <div class="space-y-2">
                    <h3
                        class="text-sm font-semibold text-(--md-sys-color-on-surface-variant)"
                    >
                        {{ t("pages.tools.jwt.header") }}
                    </h3>
                    <ToolTextarea
                        v-model="editHeader"
                        :rows="6"
                    />
                </div>
                <div class="space-y-2">
                    <h3
                        class="text-sm font-semibold text-(--md-sys-color-on-surface-variant)"
                    >
                        {{ t("pages.tools.jwt.payload") }}
                    </h3>
                    <ToolTextarea
                        v-model="editPayload"
                        :rows="8"
                    />
                </div>
                <div class="space-y-2">
                    <h3
                        class="text-sm font-semibold text-(--md-sys-color-on-surface-variant)"
                    >
                        {{ t("pages.tools.jwt.signature") }}
                    </h3>
                    <ToolTextarea
                        v-model="editSignature"
                        :rows="2"
                    />
                </div>
                <p
                    v-if="editError"
                    class="text-sm text-(--md-sys-color-error)"
                >
                    {{ editError }}
                </p>
                <div class="flex flex-wrap gap-2">
                    <AnzuButton
                        variant="filled"
                        size="sm"
                        @click="rebuild"
                    >
                        {{ t("pages.tools.jwt.actions.rebuild") }}
                    </AnzuButton>
                    <AnzuButton
                        variant="tonal"
                        size="sm"
                        @click="rebuildAlgNone"
                    >
                        {{ t("pages.tools.jwt.actions.rebuildAlgNone") }}
                    </AnzuButton>
                </div>
            </template>

            <template v-else>
                <JwtJsonBlock
                    :title="t('pages.tools.jwt.header')"
                    :content="headerText"
                    @copy="copy(headerText)"
                />
                <JwtJsonBlock
                    :title="t('pages.tools.jwt.payload')"
                    :content="payloadText"
                    @copy="copy(payloadText)"
                />
                <JwtJsonBlock
                    :title="t('pages.tools.jwt.signature')"
                    :content="result.signature || '—'"
                    :show-copy="Boolean(result.signature)"
                    @copy="copy(result.signature)"
                />

                <div class="space-y-2">
                    <div class="flex items-center justify-between gap-2">
                        <h3
                            class="text-sm font-semibold text-(--md-sys-color-on-surface-variant)"
                        >
                            {{ t("pages.tools.jwt.rawParts") }}
                        </h3>
                        <AnzuButton
                            variant="text"
                            size="sm"
                            @click="
                                copy(
                                    `${result.rawParts.header}.${result.rawParts.payload}`,
                                )
                            "
                        >
                            <template #icon>
                                <ClipboardIcon class="h-4 w-4" />
                            </template>
                            {{ t("pages.tools.jwt.actions.copySigningInput") }}
                        </AnzuButton>
                    </div>
                    <div class="space-y-1 text-xs">
                        <p
                            class="break-all font-mono text-(--md-sys-color-on-surface-variant)"
                        >
                            <span class="text-(--md-sys-color-primary)">H</span>
                            {{ result.rawParts.header }}
                        </p>
                        <p
                            class="break-all font-mono text-(--md-sys-color-on-surface-variant)"
                        >
                            <span class="text-(--md-sys-color-primary)">P</span>
                            {{ result.rawParts.payload }}
                        </p>
                        <p
                            class="break-all font-mono text-(--md-sys-color-on-surface-variant)"
                        >
                            <span class="text-(--md-sys-color-primary)">S</span>
                            {{ result.rawParts.signature || "—" }}
                        </p>
                    </div>
                </div>
            </template>
        </template>
    </section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { ClipboardIcon } from "@heroicons/vue/24/outline";
import {
    buildAlgNoneToken,
    buildJwt,
    formatJwtPart,
    formatRelativeDelta,
    inspectJwt,
    type JwtTimeClaim,
    type JwtTimeStatus,
} from "~/utils/tools/jwt";
import JwtClaimsTable from "~/components/tools/JwtClaimsTable.vue";
import JwtJsonBlock from "~/components/tools/JwtJsonBlock.vue";
import ToolTextarea from "~/components/tools/ToolTextarea.vue";

const { t } = useI18n();
const { copy } = useClipboardCopy();

const token = ref("");
const editing = ref(false);
const editHeader = ref("");
const editPayload = ref("");
const editSignature = ref("");
const editError = ref("");

const result = computed(() => inspectJwt(token.value));

const partLabels = computed(() => ({
    invalidBase64: t("pages.tools.jwt.errors.invalidBase64"),
    notJson: t("pages.tools.jwt.errors.notJson"),
}));

const headerText = computed(() =>
    formatJwtPart(result.value.header, partLabels.value),
);
const payloadText = computed(() =>
    formatJwtPart(result.value.payload, partLabels.value),
);

function timeStatusClass(status: JwtTimeStatus): string {
    if (status === "past" || status === "future") {
        return "text-(--md-sys-color-error)";
    }
    return "text-(--md-sys-color-primary)";
}

function timeStatusLabel(tc: JwtTimeClaim): string {
    if (tc.key === "exp") {
        return tc.status === "past"
            ? t("pages.tools.jwt.status.expired")
            : t("pages.tools.jwt.status.valid");
    }
    if (tc.key === "nbf") {
        return tc.status === "future"
            ? t("pages.tools.jwt.status.notYet")
            : t("pages.tools.jwt.status.active");
    }
    return t("pages.tools.jwt.status.issued");
}

const timeBadges = computed(() =>
    result.value.timeClaims.map((tc) => ({
        key: tc.key,
        label: `${tc.key}: ${timeStatusLabel(tc)}`,
        className:
            tc.status === "past" || tc.status === "future"
                ? "bg-(--md-sys-color-error)/12 text-(--md-sys-color-error)"
                : "bg-(--md-sys-color-primary)/12 text-(--md-sys-color-primary)",
    })),
);

function clearAll() {
    token.value = "";
    editing.value = false;
    editError.value = "";
}

function toggleEdit() {
    if (editing.value) {
        editing.value = false;
        editError.value = "";
        return;
    }
    editHeader.value = headerText.value;
    editPayload.value = payloadText.value;
    editSignature.value = result.value.signature;
    editError.value = "";
    editing.value = true;
}

function parseJsonField(text: string, field: "header" | "payload"): unknown {
    try {
        return JSON.parse(text) as unknown;
    } catch {
        throw new Error(field);
    }
}

function rebuildFromEditors(mode: "keep" | "none") {
    try {
        const header = parseJsonField(editHeader.value, "header");
        const payload = parseJsonField(editPayload.value, "payload");
        token.value =
            mode === "none"
                ? buildAlgNoneToken(header, payload)
                : buildJwt(header, payload, editSignature.value.trim());
        editing.value = false;
        editError.value = "";
    } catch (err) {
        const field = err instanceof Error ? err.message : "header";
        editError.value =
            field === "payload"
                ? t("pages.tools.jwt.errors.invalidPayloadJson")
                : t("pages.tools.jwt.errors.invalidHeaderJson");
    }
}

function rebuild() {
    rebuildFromEditors("keep");
}

function rebuildAlgNone() {
    rebuildFromEditors("none");
}

function applyAlgNone() {
    if (!result.value.validFormat) return;
    const header = result.value.header.json ?? { alg: "none", typ: "JWT" };
    const payload = result.value.payload.json ?? {};
    token.value = buildAlgNoneToken(header, payload);
    editing.value = false;
}
</script>
