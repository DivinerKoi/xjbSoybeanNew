/** sku表格字段 */
export type skuType = {
  skuId: number | null;
  prodId: number | null;
  prodName: string | null;
  skuName: string | null;
  skuImg?: string | null;
  properties?: string | null;
  price: number | null;
  unPrice: number | null;
  stock: number | null;
  totalStock: number | null;
  status: number | null;
};

/** 销售属性类型 */
export type skuAttrItemType = {
  /** 是否上传图片 */
  isAddImage: boolean;
  /** 名称 */
  title: string;
  /** 具体数据 */
  values: {
    /** 属性图片 */
    skuImg?: string;
    /** 属性名称 */
    properties?: string;
  }[];
};
