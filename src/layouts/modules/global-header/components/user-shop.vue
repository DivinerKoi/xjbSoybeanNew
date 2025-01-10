<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useShopList } from '@/hooks/business/useShopList';
import { useShopStore } from '@/store/modules/shop';

defineOptions({
  name: 'UserShop'
});

const { shopOptions, getShopList } = useShopList();
const shopStore = useShopStore();

// 当前选中的门店ID(20支只有一个门店，不做多店铺处理)
const dropdownOptions = computed(() => {
  // return shopOptions.value.map(shop => ({
  //   key: shop.value,
  //   label: shop.label
  // }));
  return [];
});

const currentShopName = computed(() => {
  return shopStore.currentShopName || '暂无门店';
});

onMounted(() => {
  getShopList().then(() => {
    if (shopOptions.value.length > 0) {
      const firstShop = shopOptions.value[0];
      shopStore.setShopId(String(firstShop.value), firstShop.label);
    }
  });
});

// 处理门店选择
function handleShopSelect(key: string | number) {
  const selectedShop = shopOptions.value.find(shop => shop.value === key);
  if (selectedShop) {
    shopStore.setShopId(String(key), selectedShop.label);
  }
}
</script>

<template>
  <NDropdown placement="bottom" trigger="click" :options="dropdownOptions" @select="handleShopSelect">
    <div class="cursor-pointer">
      <div class="flex items-center gap-2 rounded-md bg-primary-500 px-2 py-1 text-white">
        <SvgIcon icon="fluent-color:home-16" class="text-icon" />
        <span class="text-16px font-medium">{{ currentShopName }}</span>
        <!--        <SvgIcon icon="ant-design:caret-down-filled" class="text-icon"></SvgIcon>-->
      </div>
    </div>
  </NDropdown>
</template>

<style scoped></style>
