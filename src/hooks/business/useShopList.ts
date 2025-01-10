import { computed, ref } from 'vue';
import { fetchGetShopList } from '@/service/api/shop';
import { localStg } from '@/utils/storage';

/**
 * @returns {Object} { shopOptions: 门店选项列表 loading: 加载状态 getShopList: 获取门店列表 getFirstShopId: 获取第一个门店ID getShopNameById:
 *   根据ID获取门店名称
 * @description: 门店列表 hooks
 */
export function useShopList() {
  const shopOptions = ref<CommonType.Option[]>([]);
  const currentShopId = ref<string>();

  /** 获取门店列表 */
  async function getShopList() {
    const { data: shopList, error } = await fetchGetShopList();
    const list = shopList?.data || [];
    if (!error && list.length > 0) {
      shopOptions.value = list.map((item: Api.Shop.Shop) => ({
        label: item.name,
        value: Number(item.shopId)
      }));
      setCurrentShopId(String(list[0].shopId));
      return shopOptions.value;
    }
    return [];
  }

  /** 获取第一个门店ID */
  function getFirstShopId(): number | undefined {
    const firstOption = shopOptions.value[0];
    return firstOption ? Number(firstOption.value) : undefined;
  }

  /** 根据ID获取门店名称 */
  function getShopNameById(id: number): string {
    return shopOptions.value.find(item => Number(item.value) === id)?.label || '';
  }

  /** 设置当前门店ID */
  function setCurrentShopId(shopId: string) {
    currentShopId.value = shopId;
    localStg.set('shopId', shopId);
  }

  /** 获取缓存的门店ID */
  const getCachedShopId = computed(() => {
    const cachedShopId = localStg.get('shopId');
    return cachedShopId;
  });

  return {
    shopOptions,
    getShopList,
    getFirstShopId,
    getShopNameById,
    getCachedShopId,
    setCurrentShopId
  };
}
