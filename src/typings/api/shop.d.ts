declare namespace Api {
  namespace Shop {
    /** 门店基础类型 */
    type Shop = Api.Common.CommonRecord<{
      /** 商户id */
      shopId: number;
      /** 商户名称 */
      name: string;
      /** 店铺图片 */
      img: string;
      /** 地址 */
      address: string;
      /** 经纬度 */
      lngLat: string;
      /** 老板名称 */
      bossName: string;
      /** 联系手机号码 */
      phone: string;
      /** 店铺排序 */
      sort: number;
      /** 状态（0开启1关闭） */
      status: number;
      /** 营业时间 */
      businessHours: string;
    }>;

    /** 门店列表查询返回类型 */
    type ShopList = Api.Common.PaginatingQueryRecord<Shop>;

    /** 门店搜索参数类型 */
    type ShopSearchParams = CommonType.RecordNullable<Pick<Shop, 'name' | 'status'> & Api.Common.CommonSearchParams>;

    /** 新增门店参数类型 */
    interface ShopAdd {
      /** 商户名称 */
      name: string;
      /** 店铺图片 */
      img: string;
      /** 地址 */
      address: string;
      /** 经纬度 */
      lngLat: string;
      /** 老板名称 */
      bossName: string;
      /** 联系手机号码 */
      phone: string;
      /** 店铺排序 */
      sort: number;
      /** 状态（0开启1关闭） */
      status: number;
      /** 营业时间 */
      businessHours: string;
    }

    /** 编辑门店参数类型 */
    interface ShopEdit extends ShopAdd {
      /** 商户id */
      shopId: number;
    }
  }
}
