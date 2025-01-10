import { request } from '@/service/request';

// 获取字典列表
export function fetchGetDictList(params?: Api.SystemManage.DictSearchParams) {
  return request<Api.SystemManage.DictList>({
    url: '/system/dict/type/list',
    method: 'get',
    params
  });
}
// 获取字典详情
export function fetchGetDict(dictId: string | number) {
  return request<Api.SystemManage.Dict>({
    url: `/system/dict/type/${dictId}`,
    method: 'get'
  });
}
// 新增字典
export function fetchAddDict(data: Api.SystemManage.Dict) {
  return request({
    url: '/system/dict/type',
    method: 'post',
    data
  });
}
// 修改字典
export function fetchEditDict(data: Api.SystemManage.Dict) {
  return request({
    url: '/system/dict/type',
    method: 'put',
    data
  });
}
// 删除字典
export function fetchDeleteDict(dictIds: string[]) {
  return request({
    url: `/system/dict/type/${dictIds}`,
    method: 'delete'
  });
}

// 查询字典数据列表
export function fetchGetDictDataList(params?: Api.SystemManage.DictInfoSearchParams) {
  return request<Api.SystemManage.DictInfoList>({
    url: '/system/dict/data/list',
    method: 'get',
    params
  });
}
// 删除字典数据
export function fetchDeleteDictData(dictCodes: string[]) {
  return request({
    url: `/system/dict/data/${dictCodes}`,
    method: 'delete'
  });
}
