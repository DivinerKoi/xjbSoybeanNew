/**
 * Namespace Api
 *
 * All backend api type
 */
declare namespace Api {
  namespace Common {
    /** common params of paginating */
    interface PaginatingCommonParams {
      total: number;
      pageNum: number;
      pageSize: number;
    }

    /** common params of paginating query list data */
    // interface PaginatingQueryRecord<T = any> extends PaginatingCommonParams {
    //   records: T[];
    // }

    interface PaginatingQueryRecord<T = any> {
      total: number; // 总条数
      data: T[]; // 数据列表
    }

    /** common search params of table */
    type CommonSearchParams = Pick<Common.PaginatingCommonParams, 'pageNum' | 'pageSize'>;

    /**
     * enable status
     *
     * - "1": enabled
     * - "2": disabled
     */
    type EnableStatus = 0 | 1;

    /**
     * 特殊的 启用状态，主要是迁移若依的后端奇葩的启用状态
     *
     * - "0": 启用
     * - "1": 禁用
     */
    type SpecialEnableStatus = '0' | '1';

    /** common record */
    type CommonRecord<T = any> = {
      /** record id */
      // id: number;
      [key: string]: any; // 添加索引签名
      /** record creator */
      createBy?: string;
      /** record create time */
      createTime?: string;
      /** record updater */
      updateBy?: string;
      /** record update time */
      updateTime?: string;
      /** record status */
      status?: EnableStatus | SpecialEnableStatus;
    } & T;
  }

  /**
   * namespace Auth
   *
   * backend api module: "auth"
   */
  namespace Auth {
    interface LoginToken {
      token: string;
      refreshToken: string;
    }

    interface UserInfo {
      user: Partial<UserInfoObj>; // 使用 Partial 将 UserInfoObj 中的字段全部变为可选
      roles: string[];
      permissions: string[];
    }

    interface UserInfoObj {
      admin?: boolean;
      userId: number;
      userName: string;
      nickName: string;
      email?: string;
      phonenumber?: string;
      sex?: string;
      status?: string;
      avatar?: string;
      loginDate?: string;
      dept?: DeptInfo;
      roles?: RoleInfo[];
      remark?: string;
      [key: string]: any; // 允许额外的字段
    }

    interface DeptInfo {
      deptId: string;
      roleId: number;
      deptName?: string;
      [key: string]: any;
    }

    interface RoleInfo {
      roleId: number;
      roleKey: string;
      roleName: string;
      admin?: boolean;
      [key: string]: any;
    }

    interface Captcha {
      img: string;
      uuid: string;
    }
  }

  /**
   * namespace Route
   *
   * backend api module: "route"
   */
  namespace Route {
    type ElegantConstRoute = import('@elegant-router/types').ElegantConstRoute;

    interface MenuRoute extends ElegantConstRoute {
      id: string;
    }

    interface UserRoute {
      routes: MenuRoute[];
      home?: import('@elegant-router/types').LastLevelRouteKey;
    }
  }
  /**
   * namespace RouYiRoute
   *
   * 后端若依的路由
   */
  namespace RouYiRoute {
    // 定义 Meta 信息
    interface RouteMeta {
      title: string; // 菜单标题
      icon?: string; // 图标，可选
      noCache?: boolean; // 是否缓存，可选
      link?: string | null; // 外链地址，可选
    }

    // 定义子路由
    interface ChildRoute {
      name: string; // 路由名称
      path: string; // 路由路径
      hidden?: boolean; // 是否隐藏
      component?: string; // 组件路径，可选（动态加载时的字符串形式）
      meta: RouteMeta; // 路由的元信息
      children?: ChildRoute[]; // 子路由列表，可递归
    }

    // 主路由
    interface RYRoute extends ChildRoute {
      redirect?: string; // 重定向地址，可选
      alwaysShow?: boolean; // 是否总是显示子菜单
    }
  }

  /**
   * namespace SystemManage
   *
   * backend api module: "systemManage"
   */
  namespace SystemManage {
    type CommonSearchParams = Pick<Common.PaginatingCommonParams, 'pageNum' | 'pageSize'>;

    type TreeKey = string | number;

    /** role */
    type Role = Common.CommonRecord<{
      /** 是否是超级管理员 */
      admin?: boolean;
      /** role name */
      roleName: string;
      /** 权限字符 */
      roleKey: string;

      roleId: string;
      createTime?: string;
      flag?: boolean;
      dataScope?: number;
      status: Common.SpecialEnableStatus;
      roleSort?: number;
      menuIds?: TreeKey[];
      deptIds?: TreeKey[];
      menuCheckStrictly?: boolean;
      deptCheckStrictly?: boolean;
      remark?: string;
    }>;

    /** role search params */
    type RoleSearchParams = CommonType.RecordNullable<
      Pick<Api.SystemManage.Role, 'roleName' | 'roleKey' | 'status'> & CommonSearchParams
    >;

    /** role list */
    type RoleList = Common.PaginatingQueryRecord<Role>;

    /** all role */
    type AllRole = Pick<Role, 'roleId' | 'roleName' | 'roleKey'>;

    /**
     * user gender
     *
     * - "1": "male"
     * - "2": "female"
     */
    type UserGender = '0' | '1' | '2';

    /** user */
    type User = Common.CommonRecord<{
      userId: string;
      avatar?: string;
      deptId?: string;
      nickName?: string;
      userName?: string;
      phonenumber?: string;
      password?: string;
      email?: string;
      sex?: string;
      createTime?: string;
      status: Common.SpecialEnableStatus;
      remark?: string;
      dept?: Dept;
      postIds?: string[];
      roleIds?: string[];
    }>;

    /** user search params */
    type UserSearchParams = CommonType.RecordNullable<
      Pick<Api.SystemManage.User, 'deptId' | 'nickName' | 'phonenumber' | 'status'> & CommonSearchParams
    >;

    /** user list */
    type UserList = Common.PaginatingQueryRecord<User>;

    /**
     * menu type
     *
     * - "M": 目录
     * - "C": 菜单
     * - "F": 按钮
     */
    type MenuType = 'M' | 'C' | 'F';

    type MenuButton = {
      /**
       * button code
       *
       * it can be used to control the button permission
       */
      code: string;
      /** button description */
      desc: string;
    };

    /**
     * icon type
     *
     * - "1": iconify icon
     * - "2": local icon
     */
    type IconType = '1' | '2';

    type MenuPropsOfRoute = Pick<
      import('vue-router').RouteMeta,
      | 'i18nKey'
      | 'keepAlive'
      | 'constant'
      | 'order'
      | 'orderNum'
      | 'href'
      | 'hideInMenu'
      | 'activeMenu'
      | 'multiTab'
      | 'fixedIndexInTab'
      | 'query'
    >;

    type Menu = Common.CommonRecord<{
      menuId: number;
      /** parent menu id */
      parentId: number;
      /** menu type */
      menuType: MenuType;
      /** menu name */
      menuName: string;
      /** route name */
      routeName: string;
      /** route path */
      routePath: string;
      /** component */
      component?: string;
      /** iconify icon name or local icon name */
      icon: string;
      /** icon type */
      iconType?: Api.SystemManage.IconType;
      /** 权限标识 */
      perms: string;
      /** 路由路径 --若依 */
      path: string;
      /** buttons */
      buttons?: MenuButton[] | null;
      /** children menu */
      children?: Menu[] | null;
      status: Common.SpecialEnableStatus;
      constant?: boolean | null;
      hideInMenu?: boolean;
      keepAlive?: boolean;
    }> &
      MenuPropsOfRoute;

    /** menu list */
    type MenuList = Common.PaginatingQueryRecord<Menu>;

    /** 菜单搜索参数 */
    type MenuSearchParams = CommonType.RecordNullable<
      Pick<Api.SystemManage.Menu, 'menuName' | 'status'> & CommonSearchParams
    >;

    type MenuTree = {
      id: number;
      label: string;
      pId: number;
      children?: MenuTree[];
    };

    /** dept */
    type Dept = Common.CommonRecord<{
      deptId: string;
      parentId?: string;
      deptName?: string;
      orderNum?: number;
      leader?: string;
      phone?: string;
      email?: string;
      status: Common.SpecialEnableStatus;
      children?: Dept[];
    }>;

    /** 部门列表 */
    type DeptList = Common.PaginatingQueryRecord<Dept>;
    /** 部门搜索参数 */
    type DeptSearchParams = CommonType.RecordNullable<
      Pick<Api.SystemManage.Dept, 'deptName' | 'status'> & CommonSearchParams
    >;

    /** 岗位 */
    type Post = Common.CommonRecord<{
      postId: string;
      postCode: string;
      postName: string;
      postSort?: number;
      status: Common.SpecialEnableStatus;
      remark?: string;
    }>;
    /** 岗位列表 */
    type PostList = Common.PaginatingQueryRecord<Post>;
    /** 岗位搜索参数 */
    type PostSearchParams = CommonType.RecordNullable<
      Pick<Post, 'postCode' | 'postName' | 'status'> & CommonSearchParams
    >;

    /** 字典 */
    type Dict = Common.CommonRecord<{
      dictId: string;
      dictName?: string;
      dictType?: string;
      status: Common.SpecialEnableStatus;
      remark?: string;
    }>;
    /** 字典列表 */
    type DictList = Common.PaginatingQueryRecord<Dict>;
    /** 字典搜索参数 */
    type DictSearchParams = CommonType.RecordNullable<
      Pick<Dict, 'dictName' | 'dictType' | 'status'> & CommonSearchParams
    >;
    /** 字典详情 */
    type DictInfo = Common.CommonRecord<{
      dictCode: string;
      dictSort?: number;
      dictLabel: string;
      dictValue: string;
      dictType: string;
      status: Common.SpecialEnableStatus;
    }>;
    /** 字典详情列表 */
    type DictInfoList = Common.PaginatingQueryRecord<DictInfo>;
    /** 字典详情搜索参数 */
    type DictInfoSearchParams = CommonType.RecordNullable<
      Pick<DictInfo, 'dictLabel' | 'dictType' | 'status'> & CommonSearchParams
    >;
  }
}
