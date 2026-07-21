<template>
    <div class="w-full">
        <label
            v-if="label"
            class="mb-1 block text-sm font-medium text-(--md-sys-color-on-surface-variant)"
        >
            {{ label }}
        </label>
        <textarea
            :value="modelValue"
            :placeholder="placeholder"
            :rows="rows"
            :readonly="readonly"
            :spellcheck="false"
            class="w-full resize-y rounded-lg bg-black/5 px-3 py-2 font-mono text-sm text-(--md-sys-color-on-surface) outline-none transition-[background-color,box-shadow] duration-200 ease-out placeholder:text-(--md-sys-color-on-surface-variant)/50 hover:bg-black/8 focus:bg-black/8 focus:ring-2 focus:ring-(--md-sys-color-on-surface)/15 dark:bg-white/5 dark:hover:bg-white/10 dark:focus:bg-white/10"
            :class="readonly ? 'cursor-default' : ''"
            @input="
                $emit(
                    'update:modelValue',
                    ($event.target as HTMLTextAreaElement).value,
                )
            "
        />
    </div>
</template>

<script setup lang="ts">
withDefaults(
    defineProps<{
        modelValue?: string;
        label?: string;
        placeholder?: string;
        rows?: number;
        readonly?: boolean;
    }>(),
    {
        modelValue: "",
        rows: 6,
        readonly: false,
    },
);

defineEmits<{
    (e: "update:modelValue", value: string): void;
}>();
</script>
