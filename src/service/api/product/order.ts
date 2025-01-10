import { request } from '@/service/request';

/** 获取订单列表 */
export function fetchGetOrderList(params?: Api.Order.OrderSearchParams) {
  return request<Api.Order.OrderList>({
    url: '/service/order/list',
    method: 'get',
    params
  });
}

/** 获取订单详情 */
export function fetchGetOrder(id: number) {
  return request<Api.Order.OrderInfo>({
    url: `/service/order/${id}`,
    method: 'get'
  });
}

/** 新增订单 */
export function fetchAddOrder(data: Api.Order.OrderInfo) {
  return request({
    url: '/service/order',
    method: 'post',
    data
  });
}

/** 修改订单 */
export function fetchEditOrder(data: Api.Order.OrderInfo) {
  return request({
    url: '/service/order',
    method: 'put',
    data
  });
}

/** 删除订单 */
export function fetchDeleteOrder(ids: string[]) {
  return request({
    url: `/service/order/${ids}`,
    method: 'delete'
  });
}
