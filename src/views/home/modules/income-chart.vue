<script setup lang="ts">
import { reactive, watch } from 'vue';
import { useEcharts } from '@/hooks/common/echarts';
import { fetchWeeklyIncome } from '@/service/api/home';
import { useShopStore } from '@/store/modules/shop';

defineOptions({
  name: 'IncomeChart'
});
const shopStore = useShopStore();

const incomeData = reactive<Api.Home.WeekDayIncome[]>([]);

const { domRef, updateOptions } = useEcharts(() => ({
  grid: {
    left: '0%',
    right: '0%',
    bottom: '10%',
    top: '3%',
    containLabel: true
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  xAxis: {
    type: 'category',
    data: [] as string[]
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '收入',
      type: 'bar',
      barWidth: 30,
      data: [] as number[],
      itemStyle: {
        borderRadius: [30, 30, 30, 30],
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgb(145, 200, 255)' },
            { offset: 1, color: 'rgb(52, 108, 254)' }
          ]
        }
      }
    }
  ]
}));
async function getIncomeData() {
  const { data, error } = await fetchWeeklyIncome({ shopId: shopStore.localShopId });
  if (!error) {
    Object.assign(incomeData, data);
    updateOptions(opts => {
      opts.xAxis.data = incomeData.map(item => {
        const [_year, month, day] = item.exactDate.split('-');
        return `${month}-${day}`;
      });
      opts.series[0].data = incomeData.map(item => Number(item.totalIncome));
      return opts;
    });
  }
}

// 监听店铺变化
watch(
  () => shopStore.localShopId,
  () => {
    getIncomeData();
  }
);
function init() {
  getIncomeData();
}
init();
</script>

<template>
  <NCard :bordered="false" class="h-400px card-wrapper">
    <BarTitle title="每周收入柱状图分析"></BarTitle>
    <div ref="domRef" class="h-340px overflow-hidden"></div>
  </NCard>
</template>

<style scoped></style>
