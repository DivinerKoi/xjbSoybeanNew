<script setup lang="ts">
import { ref, watch } from 'vue';
import { useBoolean } from '@sa/hooks';
import { fetchProdRank } from '@/service/api/home';
import { useShopStore } from '@/store/modules/shop';
defineOptions({
  name: 'SalesRank'
});
const { bool: loading, setTrue: loadingStart, setFalse: loadingFinish } = useBoolean();
const shopStore = useShopStore();
const prodRankList = ref<Api.Home.ProdRank[]>([]);

async function getData() {
  loadingStart();
  const { data, error } = await fetchProdRank({ shopId: Number(shopStore.localShopId) });
  if (!error) {
    prodRankList.value = data;
  }
  loadingFinish();
}

watch(
  () => shopStore.localShopId,
  () => {
    getData();
  }
);
function init() {
  getData();
}
init();
</script>

<template>
  <NCard :bordered="false" class="h-400px card-wrapper">
    <BarTitle title="销量排行榜"></BarTitle>
    <NSpin :show="loading">
      <NScrollbar v-if="prodRankList.length" class="h-320px pr-10px">
        <div v-for="(item, index) in prodRankList" :key="item.prodId" class="flex items-center pb-10px">
          <div class="flex items-center gap-2">
            <div class="w-[50px] flex items-center">
              <div class="w-[40px] flex flex-col flex-shrink-0 items-center gap-1">
                <template v-if="index < 3">
                  <img :src="`/src/assets/imgs/rank-${index + 1}.png`" :alt="`rank ${index + 1}`" class="h-6 w-6" />
                </template>
                <span class="whitespace-nowrap text-sm">{{ item.count || 0 }} 件</span>
              </div>
            </div>
            <div class="h-10 w-10 text-center">
              <img v-if="item.prodPic" :src="item.prodPic" alt="product" class="h-10 w-10" />
              <div v-else class="h-10 w-10 rounded-[10px] bg-gray-300"></div>
            </div>
            <div class="flex-1">
              <div class="w-[130px] text-16px color-[#333333]">
                <NEllipsis>{{ item.prodName }}</NEllipsis>
              </div>
              <div class="text-xs text-gray-500">{{ item.skuName }}</div>
            </div>
          </div>
          <div class="ml-auto min-w-[80px] flex-shrink-0 text-right text-primary">
            <PriceText :value="item.price" size="small" bold></PriceText>
          </div>
        </div>
      </NScrollbar>
      <NEmpty v-else size="large" description="暂无数据" class="mt-20"></NEmpty>
    </NSpin>
  </NCard>
</template>

<style scoped></style>
