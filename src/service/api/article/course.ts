import { request } from '@/service/request';
// 获取课程列表
export function fetchGetCourseList(params?: Api.Course.CourseSearchParams) {
  return request<Api.Course.CourseList>({
    url: '/service/course/list',
    method: 'get',
    params
  });
}
// 删除课程
export function fetchDeleteCourse(ids: string[]) {
  return request({
    url: `/service/course/${ids}`,
    method: 'delete'
  });
}
// 新增
export function fetchAddCourse(data: Api.Course.CourseAdd) {
  return request({
    url: `/service/course`,
    method: 'post',
    data
  });
}
// 编辑
export function fetchEditCourse(data: Api.Course.CourseEdit) {
  return request({
    url: `/service/course/`,
    method: 'put',
    data
  });
}
