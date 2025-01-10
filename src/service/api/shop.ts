import { request } from '@/service/request';

/** 获取门店列表 */
export function fetchGetShopList(params?: Api.Shop.ShopSearchParams) {
  return request<Api.Shop.ShopList>({
    url: '/service/shop/list',
    method: 'get',
    params
  });
}

/** 获取门店详情 */
export function fetchGetShopDetail(shopId: number) {
  return request<Api.Shop.Shop>({
    url: `/service/shop/${shopId}`,
    method: 'get'
  });
}

/** 删除门店 */
export function fetchDeleteShop(shopIds: string[]) {
  return request({
    url: `/service/shop/${shopIds}`,
    method: 'delete'
  });
}

/** 新增门店 */
export function fetchAddShop(data: Api.Shop.ShopAdd) {
  return request({
    url: '/service/shop',
    method: 'post',
    data
  });
}

/** 编辑门店 */
export function fetchEditShop(data: Api.Shop.ShopEdit) {
  return request({
    url: '/service/shop',
    method: 'put',
    data
  });
}
