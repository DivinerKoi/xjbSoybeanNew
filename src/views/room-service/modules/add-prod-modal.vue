<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { fetchGetProdInfoList } from '@/service/api/product/prodInfo';
import SkuModal from '@/views/room-service/modules/sku-modal.vue';
import ProdCategorySelect from '@/components/business/prod-category-select.vue';
import ShopCart from '@/views/room-service/modules/shop-cart.vue';

interface Props {
  orderId: number;
}
const props = defineProps<Props>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const queryParams = reactive<any>(reset());

const loading = ref<boolean>(false);
const productList = ref<Array<Api.Product.ProductInfo>>([]);

/** 获取商品列表 */
async function getProductList() {
  loading.value = true;
  const { data, error } = await fetchGetProdInfoList(queryParams);
  if (!error) {
    productList.value = data.data;
    loading.value = false;
  }
}

// sku 模态框
const visibleSku = ref<boolean>(false);
const prodId = ref<number>();
function openSku(prod: Api.Product.ProductInfo) {
  prodId.value = prod.prodId;
  visibleSku.value = true;
}
watch(visible, val => {
  if (val) {
    Object.assign(queryParams, reset());
    // getCartInfo();
  }
});
function search() {
  queryParams.pageNum = 1;
  getProductList();
}
/** 清除搜索条件 */
function handleClear() {
  queryParams.prodName = undefined;
  search();
}
function reset() {
  return {
    pageNum: 1,
    pageSize: 20,
    categoryId: null,
    prodName: undefined
  };
}

// 处理分类选择
function handleCategorySelect(categoryId: number) {
  queryParams.categoryId = categoryId;
  getProductList();
}

// 添加 ref 用于调用子组件方法
const shopCartRef = ref();

function updateCart() {
  // 调用 ShopCart 组件的刷新方法
  shopCartRef.value?.refreshCart();
}
</script>

<template>
  <NModal v-model:show="visible" title="点单系统" preset="card" class="w-1440px">
    <div class="flex gap-16px overflow-hidden bg-[#F5F5F5]">
      <div class="w-176px flex-shrink-0 bg-white">
        <ProdCategorySelect v-model="queryParams.categoryId" @select="handleCategorySelect" />
      </div>
      <NSpace vertical :size="20" class="flex-1">
        <NGrid responsive="screen" item-responsive class="mt-3">
          <NGi span="24 s:12 m:6">
            <NInput
              v-model:value="queryParams.prodName"
              type="text"
              size="medium"
              clearable
              placeholder="请输入商品名称"
              @keyup.enter="search"
              @clear="handleClear"
            >
              <template #prefix>
                <SvgIcon icon="ep:search"></SvgIcon>
              </template>
            </NInput>
          </NGi>
          <NGi span="24 s:12 m:4" class="ml-20px">
            <NButton type="primary" size="medium" ghost @click="search">
              <template #icon>
                <icon-ic-round-search class="text-icon" />
              </template>
              搜索
            </NButton>
          </NGi>
        </NGrid>
        <NScrollbar class="h-580px pr-20px">
          <div v-if="!loading" class="flex flex-wrap gap-20px">
            <div
              v-for="product in productList"
              :key="product.prodId"
              class="w-280px border rounded-lg bg-white p-4 text-center transition-shadow hover:shadow-lg"
            >
              <img :src="product.images" :alt="product.prodName" class="mb-2 h-158px w-full rounded-md object-cover" />
              <div class="space-y-2">
                <NFlex justify="space-between" class="truncate font-semibold">
                  <span>{{ product.prodName }}</span>
                </NFlex>
                <NFlex justify="space-between">
                  <NFlex align="center" justify="center">
                    <PriceText :value="product.price" size="default" bold />
                    <PriceText :value="product.unPrice" size="small" type="info" />
                  </NFlex>
                  <NFlex justify="flex-end">
                    <NButton secondary size="small" type="primary" @click="openSku(product)">选规格</NButton>
                  </NFlex>
                </NFlex>
              </div>
            </div>
          </div>

          <NEmpty v-if="productList.length === 0 && !loading" description="该分类下暂无商品" class="mt-50"></NEmpty>

          <div v-if="loading" class="flex flex-wrap gap-20px">
            <div v-for="i in 8" :key="i" class="w-283px border rounded-lg bg-white p-4">
              <NSkeleton class="mb-8px h-158px w-full rounded-8px" />
              <div class="space-y-2">
                <NSkeleton text class="mb-4px h-20px w-4/5" />
                <NSkeleton text class="mb-8px h-16px w-3/5" />
                <NSkeleton text class="h-20px w-1/3" />
              </div>
            </div>
          </div>
        </NScrollbar>
        <div class="mb-20px mr-20px">
          <ShopCart ref="shopCartRef" :order-id="props.orderId" />
        </div>
      </NSpace>
    </div>
    <SkuModal
      v-model:visible-sku="visibleSku"
      :prod-id="prodId"
      :order-id="props.orderId"
      @update-cart="updateCart"
    ></SkuModal>
  </NModal>
</template>

<style scoped></style>
