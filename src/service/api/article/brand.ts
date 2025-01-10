import { request } from '@/service/request';
// 获取品牌探索列表
export function fetchGetBrandList(params?: Api.Brand.BrandSearchParams) {
  return request<Api.Brand.BrandList>({
    url: '/service/brand/list',
    method: 'get',
    params
  });
}
// 删除品牌探索
export function fetchDeleteBrand(ids: number[]) {
  return request({
    url: `/service/brand/${ids}`,
    method: 'delete'
  });
}
// 新增
export function fetchAddBrand(data: Api.Brand.BrandInfo) {
  return request({
    url: `/service/brand`,
    method: 'post',
    data
  });
}
// 编辑
export function fetchEditBrand(data: Api.Brand.BrandInfo) {
  return request({
    url: `/service/brand/`,
    method: 'put',
    data
  });
}
