import { request } from '@/service/request';

// 查询用户个人信息
export function fetchGetUserProfile() {
  return request({
    url: '/system/user/profile',
    method: 'get'
  });
}

// 修改用户个人信息
export function fetchUpdateUserProfile(data: any) {
  return request({
    url: '/system/user/profile',
    method: 'put',
    data
  });
}

// 用户密码重置
export function fetchUpdateUserPwd(oldPassword: string, newPassword: string) {
  const data = {
    oldPassword,
    newPassword
  };
  return request({
    url: '/system/user/profile/updatePwd',
    method: 'put',
    params: data
  });
}

// 用户头像上传
export function fetchUploadAvatar(data: any) {
  return request({
    url: '/system/user/profile/avatar',
    method: 'post',
    data
  });
}
