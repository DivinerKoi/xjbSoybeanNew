declare namespace Api {
  /** 会员等级权益管理 */
  namespace Grade {
    /** 等级权益信息 */
    type GradeInfo = {
      /** 等级ID */
      id: number;
      /** 店铺ID */
      shopId: number | undefined;
      /** 商户名称 */
      shopName: string;
      /** 会员等级名称（如：银卡会员、金卡会员等） */
      gradeName: string;
      /** 积分门槛下限（不含） */
      pointsLowerBound: number;
      /** 积分门槛上限（包含，NULL无上限） */
      pointsUpperBound: number | null;
      /** 现有会员人数 */
      memberCount: number;
      /** 折前价的金额（元） */
      originalPrice: number;
      /** 折前价的时长（小时） */
      originalDuration: number;
      /** 折后价的金额（元） */
      discountedPrice: number;
      /** 折后价的时长（小时） */
      discountedDuration: number;
      /** 其他权益（JSON格式，存储如免费茶水、积分赠送、赠品等信息） */
      benefitJson: string;
      // benefitJson?: BenefitButton[] | null;
    };
    /** 等级权益列表 */
    type GradeList = Api.Common.PaginatingQueryRecord<GradeInfo>;

    /** 等级权益搜索参数 */
    type GradeSearchParams = CommonType.RecordNullable<
      Pick<GradeInfo, 'gradeName' | 'shopId'> & Api.Common.CommonSearchParams
    >;
    type BenefitButton = {
      /** 权益名称 */
      name: string;
      /** 权益描述 */
      desc: string;
    };
  }
}
