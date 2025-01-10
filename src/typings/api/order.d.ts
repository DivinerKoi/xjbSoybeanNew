declare namespace Api {
  /** 订单管理 */
  namespace Order {
    /** 订单信息 */
    type OrderInfo = {
      orderId: number;
      orderNum: string;
      shopId: number;
      shopName: string;
      roomId: number;
      roomName: string;
      previewId: number;
      memberId: number;
      openId: string;
      price: number;
      unPrice: number;
      status: Api.Common.EnableStatus;
      noticeCount: number;
      compTime: string;
    };

    /** 订单列表 */
    type OrderList = Api.Common.PaginatingQueryRecord<OrderInfo>;

    /** 订单搜索参数 */
    type OrderSearchParams = CommonType.RecordNullable<
      Pick<OrderInfo, 'shopId' | 'orderNum' | 'shopName' | 'status'> & Api.Common.CommonSearchParams
    >;
    /** 订单商品配送状态 （0待配送 1已送达 2已取消） */
    type OrderDeliveryStatus = 0 | 1 | 2;
  }
}
