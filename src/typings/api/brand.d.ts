declare namespace Api {
  /** 品牌探寻 */
  namespace Brand {
    type BrandInfo = {
      id: number;
      title: string;
      pic: string;
      desc: string;
      sort: number;
      createTime: string;
    };
    /** 品牌列表 */
    type BrandList = Api.Common.PaginatingQueryRecord<BrandInfo>;
    /** 品牌搜索参数 */
    type BrandSearchParams = CommonType.RecordNullable<
      Pick<BrandInfo, 'title' | 'desc'> & Api.Common.CommonSearchParams
    >;
  }
}
