import { request } from '@/service/request';

/** 获取部门列表 */
export function fetchGetDeptList(params?: Api.SystemManage.DeptSearchParams) {
  return request<Api.SystemManage.DeptList>({
    url: '/system/dept/list',
    method: 'get',
    params
  });
}
/** 获取部门详情 */
export function fetchGetDept(roleId: string | number) {
  return request<Api.SystemManage.Dept>({
    url: `/system/dept/${roleId}`,
    method: 'get'
  });
}
/** 新增部门 */
export function fetchAddDept(data: Api.SystemManage.Dept) {
  return request({
    url: '/system/dept',
    method: 'post',
    data
  });
}
/** 修改部门 */
export function fetchEditDept(data: Api.SystemManage.Dept) {
  return request({
    url: '/system/dept',
    method: 'put',
    data
  });
}
/** 删除部门 */
export function fetchDeleteDept(roleIds: string[]) {
  return request({
    url: `/system/dept/${roleIds}`,
    method: 'delete'
  });
}

/** 查询部门列表（排除节点） */
export function fetchDeptExcludeChild(deptId: string) {
  return request<Api.SystemManage.Dept[]>({
    url: `/system/dept/list/exclude/${deptId}`,
    method: 'get'
  });
}
