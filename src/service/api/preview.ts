import { request } from '@/service/request';

/** 获取预约记录列表 */
export function fetchGetPreviewList(params?: Api.Preview.PreviewSearchParams) {
  return request<Api.Preview.PreviewList>({
    url: '/service/preview/list',
    method: 'get',
    params
  });
}

/** 获取预约记录详情 */
export function fetchGetPreview(id: number) {
  return request<Api.Preview.PreviewInfo>({
    url: `/service/preview/${id}`,
    method: 'get'
  });
}

/** 修改预约记录 */
export function fetchEditPreview(data: Api.Preview.PreviewEditParams) {
  return request({
    url: '/service/preview',
    method: 'put',
    data
  });
}

/** 删除预约记录 */
export function fetchDeletePreview(ids: string[]) {
  return request({
    url: `/service/preview/${ids}`,
    method: 'delete'
  });
}

/** 获取某个包厢指定日期已被预约的时间段 */
export function fetchConflictTime(params: any) {
  return request<Api.Home.ConflictTime[]>({
    url: `/service/preview/fetchConflictTime`,
    method: 'get',
    params
  });
}
/** 核销预约记录 */
export function fetchWriteOff(data: Api.Preview.PreviewWriteOffParams) {
  return request({
    url: '/service/preview/writeOff',
    method: 'post',
    data
  });
}
