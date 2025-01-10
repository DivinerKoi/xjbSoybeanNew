import { request } from '../request';

/** get constant routes */
export function fetchGetConstantRoutes() {
  return request<Api.Route.MenuRoute[]>({ url: '/system/menu/getRouters' });
}

/** get user routes */
export function fetchGetUserRoutes() {
  return request<Api.Route.MenuRoute[]>({ url: '/system/menu/getRouters' });
}

/**
 * whether the route is exist
 *
 * @param routeName route name
 */
export function fetchIsRouteExist(routeName: string) {
  return request<boolean>({ url: '/route/isRouteExist', params: { routeName } });
}
