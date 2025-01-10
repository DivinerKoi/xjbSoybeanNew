<script setup lang="ts">
import { ref, watch } from 'vue';

defineOptions({
  name: 'BarTitle'
});

interface Props {
  title: string;
  // shopOptions: CommonType.Option[];
  // showSelect?: boolean;
  // defaultShopId?: number | string;
}
const props = defineProps<Props>();

interface Emits {
  (e: 'shopIdChange', value: string | number): void;
}
const emit = defineEmits<Emits>();

// const { shopOptions, getShopList, getFirstShopId } = useShopList();
const shopId = ref<number | string>('');

if (props.defaultShopId) {
  shopId.value = props.defaultShopId;
  emit('shopIdChange', props.defaultShopId);
}
// 监听 defaultShopId 的变化
watch(
  () => props.defaultShopId,
  newVal => {
    if (newVal) {
      shopId.value = newVal;
      emit('shopIdChange', newVal);
    }
  },
  { immediate: true }
);
function changeShopId() {
  emit('shopIdChange', shopId.value);
}

</script>

<template>
  <div class="mb-4 flex items-center justify-between">
    <div class="flex items-center gap-5px whitespace-nowrap">
      <div class="h-[16px] w-[4px] bg-[#3F8CFF]"></div>
      <h3 class="text-16px font-medium">{{ title }}</h3>
    </div>
<!--    <div v-if="showSelect" class="w-[160px]">-->
<!--      <NSelect v-model:value="shopId" class="w-[160px]" :options="shopOptions" @update-value="changeShopId" />-->
<!--    </div>-->
    <slot></slot>
  </div>
</template>

<style scoped></style>
