import { request } from '@/service/request';
// 数据汇总
export function fetchDataSummary(params?: any) {
  return request<Api.Home.Summary>({
    url: '/service/index/fetchDataSummary',
    method: 'get',
    params
  });
}

/** 下单待配送商品记录 */
export function fetchOrderProdRecord(params?: any) {
  return request<Api.Home.NoDeliveryRoom[]>({
    url: '/service/index/fetchNoDeliveryRoom',
    method: 'get',
    params
  });
}
/** 还未结算的包厢 */
export function fetchNoFinishRoom(params: any) {
  return request<Api.Home.NoDeliveryRoom[]>({
    url: '/service/index/fetchNoFinishRoom',
    method: 'get',
    params
  });
}
/** 获取今天及以后的预约记录，并按照日期分组 */
export function fetchFuturePreview(params?: any) {
  return request<Api.Home.FuturePreview[]>({
    url: '/service/index/fetchFuturePreview',
    method: 'get',
    params
  });
}

/** 本周收入(星期一到星期日) */
export function fetchWeeklyIncome(params?: any) {
  return request<Api.Home.WeekDayIncome[]>({
    url: '/service/index/fetchWeeklyIncome',
    method: 'get',
    params
  });
}

/** 商品销量排行榜 */
export function fetchProdRank(params?: any) {
  return request<Api.Home.ProdRank[]>({
    url: '/service/index/fetchProdRank',
    method: 'get',
    params
  });
}
