import { request } from '@/service/request';

/** 获取会员列表 */
export function fetchGetMemberList(params?: Api.Member.MemberSearchParams) {
  return request<Api.Member.MemberList>({
    url: '/service/userMember/list',
    method: 'get',
    params
  });
}

/** 添加会员 */
export function fetchAddMember(data: Api.Member.MemberInfo) {
  return request({
    url: '/service/userMember',
    method: 'post',
    data
  });
}

/** 编辑会员 */
export function fetchEditMember(data: Api.Member.MemberInfo) {
  return request({
    url: '/service/userMember',
    method: 'put',
    data
  });
}

/** 删除会员 */
export function fetchDeleteMember(memberIds: number[]) {
  return request({
    url: `/service/userMember/${memberIds}`,
    method: 'delete'
  });
}
