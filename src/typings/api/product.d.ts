declare namespace Api {
  /** 商品分类 */
  namespace Product {
    type Category = {
      categoryId: number;
      shopId: number;
      categoryName: string;
      icon: string;
      pic: string;
    };
    /** 商品分类列表 */
    type CategoryList = Api.Common.PaginatingQueryRecord<Category>;
    /** 商品分类搜索参数 */
    type CategorySearchParams = CommonType.RecordNullable<
      Pick<Category, 'categoryName' | 'shopId'> & Api.Common.CommonSearchParams
    >;

    /** 商品信息 */
    type ProductInfo = {
      /** 商品 ID */
      prodId: number;
      /** 门店 ID（可选） */
      shopId?: number | null;
      /** 分类 ID */
      categoryId: number;
      /** 商品名称 */
      prodName: string;
      /** 商品图片 */
      images: string;
      /** 价格 */
      price: number | null;
      /** 划线价格 */
      unPrice: number | null;
      /** 简单描述 */
      brief: string;
      /** 商品规格参数 */
      specList: string;
      /** 商品简介 */
      context: string;
      /** 排序（可选） */
      sort?: number;
      /** 状态（0下架 1上架） */
      status: Api.Common.EnableStatus;
      /** 商品 SKU 列表（可选） */
      prodSkus?: ProdSku[];
    };

    /** 商品 SKU 信息 */
    type ProdSku = {
      /** SKU ID */
      skuId: number;
      prodId: number;
      prodName: string;
      /** SKU 名称 */
      skuName: string;
      /** 价格 */
      price: number;
      /** 划线价格 */
      unPrice: number;
      /** 库存 */
      stock: number;
      /** 总库存 */
      totalStock: number;
      /** 商品图片 */
      skuImg?: string;
      /** 商品规格参数 */
      properties: string;
      /** 状态 */
      status: Api.Common.EnableStatus;
    };

    /** 商品分类列表 */
    type ProdInfoList = Api.Common.PaginatingQueryRecord<ProductInfo>;
    /** 商品分类搜索参数 */
    type ProdInfoSearchParams = CommonType.RecordNullable<
      Pick<ProductInfo, 'shopId' | 'prodName' | 'price' | 'brief' | 'categoryId'> & Api.Common.CommonSearchParams
    >;
  }
}
