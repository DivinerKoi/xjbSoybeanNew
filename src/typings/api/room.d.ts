declare namespace Api {
  namespace Room {
    /** 包厢基础类型 */
    type Room = Api.Common.CommonRecord<{
      /** 房间id */
      roomId: number;
      /** 门店id */
      shopId: number | null;
      /** 包厢名称 */
      roomName: string;
      /** 包厢门牌号 */
      houseNum: string;
      /** 包厢图片 */
      houseImg: string;
      /** 包厢描述 */
      houseContext: string;
      /** 容纳人数 */
      peopleNum: string;
      /** 范围查询：容纳人数的最小值 */
      peopleNumMin?: number;
      /** 范围查询：容纳人数的最大值 */
      peopleNumMax?: number;
      /** 范围查询：最低消费 */
      minPrice: number;
      /** 范围查询：最高消费 */
      maxPrice?: number;
    }>;

    /** 包厢列表查询返回类型 */
    type RoomList = Api.Common.PaginatingQueryRecord<Room>;

    /** 包厢搜索参数类型 */
    type RoomSearchParams = CommonType.RecordNullable<
      Pick<Room, 'shopId' | 'roomName' | 'peopleNumMin' | 'peopleNumMax' | 'minPrice' | 'maxPrice'> &
        Api.Common.CommonSearchParams
    >;
    type RoomQurCode = {
      base64: string;
    };

    /** 新增包厢参数类型 */
    interface RoomAdd {
      /** 门店id */
      shopId: number | null;
      /** 包厢名称 */
      roomName: string;
      /** 包厢门牌号 */
      houseNum: string;
      /** 包厢图片 */
      houseImg: string;
      /** 包厢描述 */
      houseContext: string;
      /** 容纳人数 */
      peopleNum: string;
      /** 最低消费 */
      minPrice: number;
      /** 最高消费 */
      maxPrice: number;
    }

    /** 编辑包厢参数类型 */
    interface RoomEdit extends RoomAdd {
      /** 房间ID */
      roomId: number;
    }
  }
}
