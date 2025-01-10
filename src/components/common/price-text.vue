<script setup lang="ts">
defineOptions({ name: 'PriceText' });
interface Props {
  value: number | string;
  size?: 'small' | 'default';
  bold?: boolean;
  type?: 'primary' | 'info';
}
const { value, size = 'default', bold = false, type = 'primary' } = defineProps<Props>();
</script>

<template>
  <span class="position-relative">
    <span
      v-if="type === 'primary'"
      class="text-16px text-primary before:right-0 before:top-0 before:p-2px before:text-align-center before:text-12px before:content-['¥']"
      :class="[size === 'small' ? 'text-16px before:text-10px' : 'text-18px before:text-14px', bold ? 'font-700' : '']"
    >
      {{ value }}
    </span>
    <span
      v-else
      class="color-[#999999] line-through before:right-0 before:top-0 before:p-2px before:text-align-center before:content-['¥']"
      :class="[size === 'small' ? 'text-14px before:text-12px' : 'text-20px before:text-14px']"
    >
      {{ value }}
    </span>
  </span>
</template>
