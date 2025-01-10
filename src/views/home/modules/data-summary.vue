<script setup lang="ts">
import { ref, watch } from 'vue';
import BarTitle from '@/components/common/barTitle.vue';
import { fetchDataSummary } from '@/service/api/home';
import { useShopStore } from '@/store/modules/shop';
const shopStore = useShopStore();
defineOptions({
  name: 'DataSummary'
});
// const shopId = ref<string>('');
const summaryData = ref<Api.Home.Summary>({
  totalIncome: 0,
  todayIncome: 0,
  totalPreview: 0,
  totalMember: 0,
  snowballCount: 0
});

const summaryList: Array<{
  title: string;
  decimals: number; // 小数位数
  keyField: keyof Api.Home.Summary;
  unit: string;
  img: string;
}> = [
  {
    title: '总收入',
    decimals: 2,
    keyField: 'totalIncome',
    unit: '元',
    img: new URL('@/assets/imgs/summary-1.png', import.meta.url).href
  },
  {
    title: '预约次数',
    decimals: 0,
    keyField: 'totalPreview',
    unit: '次',
    img: new URL('@/assets/imgs/summary-2.png', import.meta.url).href
  },
  {
    title: '会员数量',
    decimals: 0,
    keyField: 'totalMember',
    unit: '个',
    img: new URL('@/assets/imgs/summary-3.png', import.meta.url).href
  },
  {
    title: '暂存雪茄数量',
    decimals: 0,
    keyField: 'snowballCount',
    unit: '件',
    img: new URL('@/assets/imgs/summary-4.png', import.meta.url).href
  }
];
async function getData() {
  const { data, error } = await fetchDataSummary({ shopId: shopStore.localShopId });
  if (!error) {
    summaryData.value = data;
  }
}
watch(
  () => shopStore.localShopId,
  () => {
    getData();
  }
);
function init() {
  getData();
};
init();
</script>

<template>
  <NCard :bordered="false" class="card-wrapper min-w-[933px]" >
    <BarTitle title="数据汇总"></BarTitle>
    <NGrid :x-gap="14" :y-gap="16" responsive="screen" item-responsive >
      <NGi v-for="item in summaryList" :key="item.title" span="24 s:12 m:6">
        <div class="flex items-center rounded-md bg-[#EEF6FF]">
          <div class="flex-1 p-4">
            <div class="flex items-center">
              <span class="text-16px text-[#333]">{{ item.title }}</span>
            </div>
            <div class="mt-2">
              <CountTo
                :start-value="0"
                :decimals="item.decimals"
                :end-value="Number(summaryData[item.keyField])"
                class="mr-0.5 whitespace-nowrap text-24px color-primary dark:text-dark"
              />
              <!--              <span class="mr-0.5 text-24px color-primary font-700">{{ summaryData[item.keyField] }}</span>-->
              <span class="text-14px text-[#666]">{{ item.unit }}</span>
            </div>
          </div>
          <div class="ml-4 w-[113px] flex items-center justify-center">
            <img :src="item.img" class="h-full w-full object-contain" alt="" />
          </div>
        </div>
      </NGi>
    </NGrid>
  </NCard>
</template>
