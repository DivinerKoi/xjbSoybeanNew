import { request } from '@/service/request';

// 获取用户列表
/** get user list */
export function fetchGetUserList(params?: Api.SystemManage.UserSearchParams) {
  return request<Api.SystemManage.UserList>({
    url: '/system/user/list',
    method: 'get',
    params
  });
}
// 获取用户详情
export function fetchGetUser(userId: string | number) {
  return request<Api.SystemManage.User>({
    url: `/system/user/${userId}`,
    method: 'get'
  });
}
// 新增用户
export function fetchAddUser(data: Api.SystemManage.User) {
  return request({
    url: '/system/user',
    method: 'post',
    data
  });
}
// 修改用户
export function fetchEditUser(data: Api.SystemManage.User) {
  return request({
    url: '/system/user',
    method: 'put',
    data
  });
}
// 删除用户
export function fetchDeleteUser(userIds: string[]) {
  return request({
    url: `/system/user/${userIds}`,
    method: 'delete'
  });
}
// 查询部门下拉树结构
export function fetchGetDeptTree() {
  return request<Api.SystemManage.Dept[]>({
    url: '/system/user/deptTree',
    method: 'get'
  });
}
// 查询岗位和角色列表
export function fetchGetPostAndRoleList() {
  return request<{ posts: Api.SystemManage.Post[]; roles: Api.SystemManage.Role[] }>({
    url: '/system/user/',
    method: 'get'
  });
}
