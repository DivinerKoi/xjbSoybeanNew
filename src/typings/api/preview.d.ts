declare namespace Api {
  /** 预约记录管理 */
  namespace Preview {
    /** 预约记录信息 */
    type PreviewInfo = {
      previewId: number;
      previewNum: string;
      shopId: number;
      shopName: string;
      roomId: number;
      roomName: string;
      previewStartTime: string;
      previewEndTime: string;
      nickName: string;
      memberId: number;
      openId: string;
      phone: string;
      peopleNum: number;
      remarks: string;
      statusList: string[];
      revoke: string;
      commentJson: string;
      status: PreviewStatus;
      // 查询详情
      orderItemVoList?: any[];
      orderVo?: any;
      roomVo?: any;
      userMemberVo?: any;
    };

    type PreviewStatus = 1 | 2 | 3 | 4;
    /** 预约记录列表 */
    type PreviewList = Api.Common.PaginatingQueryRecord<PreviewInfo>;

    /** 预约记录搜索参数 */
    type PreviewSearchParams = CommonType.RecordNullable<
      Pick<PreviewInfo, 'shopId' | 'previewNum' | 'shopName' | 'nickName' | 'phone'> &
        Api.Common.CommonSearchParams & {
          /** 预约时间 */
          previewDate?: string;
          /** 预约状态（多选） */
          statusList?: string;
        }
    >;
    type PreviewEditParams = Pick<
      PreviewInfo,
      'previewId' | 'roomId' | 'previewStartTime' | 'previewEndTime' | 'phone'
    >;
    type PreviewWriteOffParams = {
      previewIdList: string[];
    };
  }
}
