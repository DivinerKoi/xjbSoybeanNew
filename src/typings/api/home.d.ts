declare namespace Api {
  /** 首页 */
  namespace Home {
    /** 数据汇总 */
    type Summary = {
      /** 总计收入 */
      totalIncome: number;
      /** 今天收入 */
      todayIncome: number;
      /** 总计预约 */
      totalPreview: number;
      /** 会员数量(不包含服务员) */
      totalMember: number;
      /** 暂存雪茄数量 */
      snowballCount: number;
    };
    type FuturePreview = {
      /** 预约时间 */
      exactDate: string;
      previewVoList: ExtendedPreviewInfo[];
    };
    type ExtendedPreviewInfo = Api.Preview.PreviewInfo & {
      /** 小程序会员用户视图对象 */
      userMemberVo?: any;
      roomVo?: Api.Room.Room;
      /** 订单视图对象 */
      orderVo?: Api.Order.OrderInfo;
      /** 订单商品列表 */
      orderItemVoList?: Api.Order.OrderInfo[];
    };
    /** 每周收入 */
    type WeekDayIncome = {
      /** 星期几 (1-7 表示周一到周日) */
      weekDay: number;
      /** 年月日，格式为 date-time */
      exactDate: string;
      /** 收入金额 */
      totalIncome: number;
    };
    /** 销量排行榜 */
    type ProdRank = {
      /** 排名 */
      rank: number;
      /** 数量 */
      count: number;
      /** 商品ID */
      prodId: number;
      /** 商品名称 */
      prodName: string;
      /** SKU ID */
      skuId: number;
      /** 规格名称 */
      skuName: string;
      /** 商品图片 */
      prodPic: string;
      /** 单价 */
      price: number;
      /** 划线价 */
      unPrice: number;
    };
    /** 未配送的包厢 */
    type NoDeliveryRoom = {
      /** 门店视图对象 cigar_shop */
      shopVo: Api.Shop.Shop;
      /** 包厢房间视图对象 cigar_room */
      roomVo: Api.Room.Room;
      /** 小程序会员用户视图对象 cigar_user_member */
      userMemberVo: any;
      /** 预约记录视图对象 cigar_preview */
      previewVo: Api.Preview.PreviewInfo;
      /** 订单视图对象 cigar_order */
      orderVo: Api.Order.OrderInfo;
      /** 订单商品列表 */
      orderItemVoList: OrderItem[];
    };
    /** 订单商品项信息 */
    type OrderItem = {
      /** 订单详情id */
      orderItemId: number;
      /** 订单编号 */
      orderNum: string;
      /** 商品id */
      prodId: number;
      /** 商品名称 */
      prodName: string;
      /** skuid */
      skuId: number;
      /** 会员id */
      memberId: number;
      /** 规格名称 */
      skuName: string;
      properties: string;
      /** 商品图片 */
      prodPic: string;
      /** 单价 */
      price: number;
      /** 划线价 */
      unPrice: number;
      /** 商品数量 */
      prodNum: number;
      /** 总价 */
      totalPrice?: number;
      /** 下单时间 */
      recTime?: string;
      /** 下单备注 */
      recRemark: string;
      /** 状态（0待配送 1已送达 2已取消） */
      status: number;
      /** 取消时间 */
      cancelTime: string;
      /** 取消理由 */
      cancelRemark: string;
    };
    /** 订单商品项列表查询返回类型 */
    type OrderItemList = Api.Common.PaginatingQueryRecord<OrderItem>;
    /** 订单商品项搜索 */
    type OrderItemSearchParams = CommonType.RecordNullable<
      Pick<OrderItem, 'orderNum' | 'prodName' | 'skuName' | 'status'> & Api.Common.CommonSearchParams
    >;

    type ConflictTime = {
      previewStartTime: string;
      previewEndTime: string;
    };
  }
  namespace RoomService {
    /** 购物车数据 */
    type BasketData = {
      totalPrice: number; // 购物车的总金额（已折扣）
      totalUnPrice: number; // 购物车的总金额（未折扣）
      num: number; // 商品总数量
      basketOrderProdItem: CartOrderProdItem[]; // 商品明细列表
    };
    /** 购物车商品明细数据 */
    type CartOrderProdItem = {
      /** 购物车id */
      basketId: number;
      /** 订单id */
      orderId: number;
      /** 商品id */
      prodId: number;
      /** 商品数量 */
      num: number;
      /** 商品名称 */
      prodName: string;
      /** 规格id */
      skuId: number;
      /** 规格名称 */
      skuName: string;
      /** sku图片 */
      skuImg: string;
      /** 商品价格 */
      price: number;
      /** 划线价 */
      unPrice: number;
      /** 规格属性 */
      specList: string;
      /** 规格内容 */
      properties: string;
    };

    /** 直接下单的参数数据 */
    type OrderDirectly = {
      /** 订单ID */
      orderId: number;
      /** 商品ID */
      prodId: number;
      /** SKU ID */
      skuId: number;
      /** 商品个数，必须大于0 */
      count: number;
      /** 下单备注 */
      recRemark?: string;
    };
    /** 直接下单的参数数据 */
    type SubmitOrderParams = {
      /** 订单ID */
      orderId: number;
      /** 商品ID */
      recRemark?: string;
      /** 购物车id列表(不传默认全部) */
      basketIdList?: number[];
    };
    /** 购物车更新参数 */
    type UpdateCartParams = {
      /** 订单ID */
      orderId: number;
      /** 商品ID */
      prodId: number;
      /** SKU ID */
      skuId: number;
      /** 商品个数，，负数表示减少，正数表示增加，不能为0 */
      count: number;
    };
    /** 商品取消 & 完成配送 */
    type ProdCancelParams = {
      /** 订单ID */
      orderNum: string;
      /** 需要删除的商品项列表 */
      orderItemIds: number[];
    };
    /** 批量删除购物车 */
    type DeleteCartParams = {
      /** 订单ID */
      orderId: number;
      /** 需要删除的购物车项id */
      basketIdArr?: string;
    };
  }
}
