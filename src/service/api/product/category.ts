import { request } from '@/service/request';
// 获取商品分类列表
export function fetchGetProdCategoryList(params?: Api.Product.CategorySearchParams) {
  return request<Api.Product.CategoryList>({
    url: '/service/prodCategory/list',
    method: 'get',
    params
  });
}
// 获取商品分类详情
export function fetchGetProdCategory(id: number) {
  return request<Api.Product.Category>({
    url: `/service/prodCategory/${id}`,
    method: 'get'
  });
}
// 新增商品分类
export function fetchAddProdCategory(data: Api.Product.Category) {
  return request({
    url: '/service/prodCategory',
    method: 'post',
    data
  });
}
// 修改商品分类
export function fetchEditProdCategory(data: Api.Product.Category) {
  return request({
    url: '/service/prodCategory',
    method: 'put',
    data
  });
}
// 删除商品分类
export function fetchDeleteProdCategory(ids: string[]) {
  return request({
    url: `/service/prodCategory/${ids}`,
    method: 'delete'
  });
}
