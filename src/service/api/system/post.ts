import { request } from '@/service/request';

// 获取部门列表
export function fetchGetPostList(params?: Api.SystemManage.PostSearchParams) {
  return request<Api.SystemManage.PostList>({
    url: '/system/post/list',
    method: 'get',
    params
  });
}
// 获取部门详情
export function fetchGetPost(postId: string | number) {
  return request<Api.SystemManage.Post>({
    url: `/system/post/${postId}`,
    method: 'get'
  });
}
// 新增部门
export function fetchAddPost(data: Api.SystemManage.Post) {
  return request({
    url: '/system/post',
    method: 'post',
    data
  });
}
// 修改部门
export function fetchEditPost(data: Api.SystemManage.Post) {
  return request({
    url: '/system/post',
    method: 'put',
    data
  });
}
// 删除部门
export function fetchDeletePost(postIds: string[]) {
  return request({
    url: `/system/post/${postIds}`,
    method: 'delete'
  });
}
