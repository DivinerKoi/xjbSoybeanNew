declare namespace Api {
  namespace Member {
    /** 会员信息 */
    interface MemberInfo {
      /** 会员ID */
      memberId: number;
      /** 门店ID */
      shopId: number;
      /** 会员手机号 */
      phone: string;
      /** 会员名称 */
      name: string;
      /** 会员头像 */
      avatar: string;
      /** 性别 */
      sex: string;
      /** 生日 */
      birthday: string;
      /** 会员等级 */
      grade: string;
      /** 总消费 */
      usePrice: number;
      /** 注册时间 */
      registartionTime: string;
      /** 上次登录时间 */
      loginTime: string;
      /** 用户类型 1会员 2服务员 */
      type: 1 | 2;
    }

    /** 会员列表 */
    type MemberList = Api.Common.PaginatingQueryRecord<MemberInfo>;

    /** 会员搜索参数 */
    type MemberSearchParams = CommonType.RecordNullable<
      Pick<MemberInfo, 'name' | 'shopId' | 'type'> & Api.Common.CommonSearchParams
    >;
  }
}
