import { request } from '@/service/request';

export type MenuObj = {
  menuId: string;
  parentId?: number;
  menuName?: string;
  routeName?: string;
  icon?: string;
  menuType?: string;
  orderNum?: any;
  isFrame?: string;
  isCache?: string;
  visible?: string;
  status: Api.Common.SpecialEnableStatus;
  perms?: string;
  component?: string;
  path?: string;
  createTime?: string;
  children?: MenuObj[];
  // "1": iconify icon, "2": local icon
  iconType?: Api.SystemManage.IconType;
  constant?: boolean | null;
  hideInMenu?: boolean;
  keepAlive?: boolean;
  // 新增字段
  href?: string;
  activeMenu?: string; // 高亮的菜单
};
export type TreeMenuObj = {
  id: number;
  label: string;
  children?: TreeMenuObj[];
};

/** 获取菜单列表 */
export function fetchGetMenuList(params: Api.SystemManage.MenuSearchParams) {
  return request<Api.SystemManage.MenuList>({
    url: '/system/menu/list',
    method: 'get',
    params
  });
}
// 修改菜单
export function fetchUpdateMenu(data: Api.SystemManage.Menu) {
  return request({
    url: '/system/menu',
    method: 'put',
    data
  });
}
// 新增菜单
export function fetchAddMenu(data: Api.SystemManage.Menu) {
  return request({
    url: '/system/menu',
    method: 'post',
    data
  });
}
// 删除菜单
export function fetchDeleteMenu(menuId: number) {
  return request({
    url: `/system/menu/${menuId}`,
    method: 'delete'
  });
}
// 更具角色ID获取菜单树
export function fetchRoleMenuTree(roleId: string) {
  return request<{ menus: TreeMenuObj[]; checkedKeys: number[] }>({
    url: `/system/menu/roleMenuTreeselect/${roleId}`,
    method: 'get'
  });
}
// 获取菜单树
// 查询菜单下拉树结构
export function fetchMenuTree() {
  return request<TreeMenuObj[]>({
    url: '/system/menu/treeselect',
    method: 'get'
  });
}
