import { request } from '@/service/request';
// 获取商品列表
export function fetchGetProdInfoList(params?: Api.Product.ProdInfoSearchParams) {
  return request<Api.Product.ProdInfoList>({
    url: '/service/prod/list',
    method: 'get',
    params
  });
}
// 获取商品详情
export function fetchGetProdInfo(id: number) {
  return request<Api.Product.ProductInfo>({
    url: `/service/prod/${id}`,
    method: 'get'
  });
}
// 新增商品
export function fetchAddProdInfo(data: Api.Product.ProductInfo) {
  return request({
    url: '/service/prod',
    method: 'post',
    data
  });
}
// 修改商品
export function fetchEditProdInfo(data: Api.Product.ProductInfo) {
  return request({
    url: '/service/prod',
    method: 'put',
    data
  });
}
// 删除商品
export function fetchDeleteProdInfo(ids: string[]) {
  return request({
    url: `/service/prod/${ids}`,
    method: 'delete'
  });
}
