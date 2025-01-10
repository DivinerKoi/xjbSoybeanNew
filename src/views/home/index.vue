<script setup lang="tsx">
import { computed, ref } from 'vue';
import { useAppStore } from '@/store/modules/app';
import IncomeChart from '@/views/home/modules/income-chart.vue';
import RoomInfo from '@/views/home/modules/room-info.vue';
import { useShopStore } from '@/store/modules/shop';
import { fetchGetPreview, fetchGetPreviewList } from '@/service/api/preview';
import OrderData from './modules/order-data.vue';
import CommonFunctions from './modules/common-functions.vue';
import DataSummary from './modules/data-summary.vue';
import SubscribeList from './modules/subscribe-list.vue';
import SalesRank from './modules/sales-rank.vue';

const appStore = useAppStore();
const shopStore = useShopStore();

const gap = computed(() => (appStore.isMobile ? 0 : 16));
// 门店hook
// 当前订单的信息
const currentOrder = ref<Api.Home.NoDeliveryRoom | null>(null);
function changeOrder(item: Api.Home.NoDeliveryRoom) {
  currentOrder.value = item;
}
const orderDataRef = ref();
function submitExtend() {
  orderDataRef.value?.getOrderProdRecord();
}

const previewInfo = ref();
// 获取初始第一条的预约记录，当直接点击包厢服务菜单进来时，没有路由信息，需要调用（TODO:待优化，目前查询太多接口了）
async function getInitPreview() {
  const params = {
    pageNum: 1,
    pageSize: 1,
    statusList: '2', // 已核销的预约
    shopId: shopStore.localShopId
  };
  const { data: result, error } = await fetchGetPreviewList(params);
  if (!error) {
    if (result.data.length > 0) {
      const { previewId } = result.data[0];
      const { data: info } = await fetchGetPreview(previewId);
      previewInfo.value = info;
    }
  }
}
function init() {
  getInitPreview();
}
init();
</script>

<template>
  <div class="flex gap-16px">
    <!-- 左侧内容区域 -->
    <div class="flex-1">
      <NSpace vertical :size="16" class="w-full">
        <OrderData ref="orderDataRef" @change-order="changeOrder"></OrderData>
        <!-- 常用功能 -->
        <CommonFunctions></CommonFunctions>
        <!-- 数据汇总 -->
        <DataSummary></DataSummary>
        <NGrid :x-gap="gap" :y-gap="16" responsive="screen" item-responsive>
          <NGi span="24 s:24 m:12">
            <!--每周收入柱状图-->
            <IncomeChart></IncomeChart>
          </NGi>
          <NGi span="24 s:24 m:12">
            <!--预约列表-->
            <SubscribeList></SubscribeList>
          </NGi>
        </NGrid>
      </NSpace>
    </div>

    <!-- 右侧内容区域 -->
    <div class="w-388px">
      <NSpace vertical :size="16" class="w-full">
        <!-- 包厢倒计时卡片 -->
        <RoomInfo :preview-info="previewInfo" :current-order="currentOrder" @submit-extend="submitExtend"></RoomInfo>
        <!-- 热销商品排行 -->
        <SalesRank></SalesRank>
      </NSpace>
    </div>
  </div>
</template>

<style scoped></style>
