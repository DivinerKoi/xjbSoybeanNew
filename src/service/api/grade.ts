import { request } from '@/service/request';

/** 获取等级权益列表 */
export function fetchGetGradeList(params?: Api.Grade.GradeSearchParams) {
  return request<Api.Grade.GradeList>({
    url: '/service/grade/list',
    method: 'get',
    params
  });
}

/** 获取等级权益详情 */
export function fetchGetGrade(id: number) {
  return request<Api.Grade.GradeInfo>({
    url: `/service/grade/${id}`,
    method: 'get'
  });
}

/** 新增等级权益 */
export function fetchAddGrade(data: any) {
  return request({
    url: '/service/grade',
    method: 'post',
    data
  });
}

/** 修改等级权益 */
export function fetchEditGrade(data: any) {
  return request({
    url: '/service/grade',
    method: 'put',
    data
  });
}

/** 删除等级权益 */
export function fetchDeleteGrade(ids: string[]) {
  return request({
    url: `/service/grade/${ids}`,
    method: 'delete'
  });
}
