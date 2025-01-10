import { request } from '@/service/request';

// 获取角色列表
export function fetchGetRoleList(params?: Api.SystemManage.RoleSearchParams) {
  return request<Api.SystemManage.RoleList>({
    url: '/system/role/list',
    method: 'get',
    params
  });
}
// 获取角色详情
export function fetchGetRole(roleId: string | number) {
  return request<Api.SystemManage.Role>({
    url: `/system/role/${roleId}`,
    method: 'get'
  });
}
// 新增角色
export function fetchAddRole(data: Api.SystemManage.Role) {
  return request({
    url: '/system/role',
    method: 'post',
    data
  });
}
// 修改角色
export function fetchEditRole(data: Api.SystemManage.Role) {
  return request({
    url: '/system/role',
    method: 'put',
    data
  });
}
// 删除角色
export function fetchDeleteRole(roleIds: string[]) {
  return request({
    url: `/system/role/${roleIds}`,
    method: 'delete'
  });
}
