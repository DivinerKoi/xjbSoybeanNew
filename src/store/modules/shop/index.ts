import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { localStg } from '@/utils/storage';
import { eventBus } from '@/utils/eventBus';

export const useShopStore = defineStore('shop', () => {
  // state
  const currentShopId = ref<string>(localStg.get('shopId') || '');
  const currentShopName = ref<string>('');

  // actions
  function setShopId(shopId: string, shopName: string) {
    currentShopId.value = shopId;
    currentShopName.value = shopName;
    localStg.set('shopId', shopId);
    // 触发全局事件
    eventBus.emit('shop-change', shopId);
  }
  const localShopId = computed(() => {
    const shopId = currentShopId.value;
    return Number(shopId);
  });

  return {
    currentShopId,
    currentShopName,
    localShopId,
    setShopId
  };
});
