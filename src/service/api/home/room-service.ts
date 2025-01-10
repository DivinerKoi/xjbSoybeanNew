import { request } from '@/service/request';
// 更具订单ID查询购物车
export function fetchBasket(params?: any) {
  return request<Api.RoomService.BasketData>({
    url: '/service/basket/fetchBasket',
    method: 'get',
    params
  });
}

/** 提交商品下单，不经过购物车 */
export function fetchSubmitOrderDirectly(data?: Api.RoomService.OrderDirectly) {
  return request({
    url: '/service/basket/submitOrderDirectly',
    method: 'post',
    data
  });
}

/** 提交商品下单，从购物车提交 */
export function fetchSubmitOrderFromCart(data?: Api.RoomService.SubmitOrderParams) {
  return request({
    url: '/service/basket/submitOrderFromCart',
    method: 'post',
    data
  });
}
/** 修改(添加,删除)购物车 */
export function fetchUpdateBasket(data?: Api.RoomService.UpdateCartParams) {
  return request({
    url: '/service/basket/updateBasket',
    method: 'post',
    data
  });
}
/** 清空购物车（批量删除） */
export function fetchClearBasket(data: Api.RoomService.DeleteCartParams) {
  return request({
    url: '/service/basket/clearBasket',
    method: 'post',
    params: data
  });
}
/** 根据orderNum分页查询订单商品 */
export function fetchPageByOrderNum(params?: Api.Home.OrderItemSearchParams) {
  return request<Api.Home.OrderItemList>({
    url: '/service/orderItem/pageByOrderNum',
    method: 'get',
    params
  });
}
/** 商品取消 */
export function fetchProdCancel(data?: Api.RoomService.ProdCancelParams) {
  return request({
    url: '/service/order/prodCancel',
    method: 'post',
    data
  });
}
/** 商品取完成配送 */
export function fetchProdComplete(data?: Api.RoomService.ProdCancelParams) {
  return request({
    url: '/service/order/prodComplete',
    method: 'post',
    data
  });
}

// 包厢结算（完成订单）
export function fetchOrderFinish(data: any) {
  return request({
    url: '/service/order/orderFinish',
    method: 'post',
    params: data
  });
}
/** 订单商品数量增加或减少 */
export function fetchUpdateOrderProdCount(data: any) {
  return request({
    url: '/service/order/updateOrderProdCount',
    method: 'post',
    data
  });
}
