import { request } from '../request';

/**
 * Login
 *
 */
// eslint-disable-next-line max-params
export function fetchLogin(data: any) {
  return request<Api.Auth.LoginToken>({
    url: '/login',
    method: 'post',
    data
  });
}
/** 获取验证码 */
export function fetchGetCaptcha() {
  return request<Api.Auth.Captcha>({ url: '/captchaImage' });
}

/** Get user info */
export function fetchGetUserInfo() {
  return request<Api.Auth.UserInfo>({ url: '/system/user/getInfo' });
}

/**
 * Refresh token
 *
 * @param refreshToken Refresh token
 */
export function fetchRefreshToken(refreshToken: string) {
  return request<Api.Auth.LoginToken>({
    url: '/auth/refreshToken',
    method: 'post',
    data: {
      refreshToken
    }
  });
}

/**
 * return custom backend error
 *
 * @param code error code
 * @param msg error message
 */
export function fetchCustomBackendError(code: string, msg: string) {
  return request({ url: '/auth/error', params: { code, msg } });
}
