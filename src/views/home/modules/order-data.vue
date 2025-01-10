<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { fetchNoFinishRoom } from '@/service/api/home';
import { useShopStore } from '@/store/modules/shop';

defineOptions({ name: 'OrderData' });

const shopStore = useShopStore();
const emit = defineEmits<{
  (e: 'changeOrder', orderInfo: Api.Home.NoDeliveryRoom | null): void;
}>();

const orderList = ref<Api.Home.NoDeliveryRoom[]>([]);
const currentIndex = ref<number>(0);

// 添加轮询定时器
let pollTimer: ReturnType<typeof setInterval> | null = null;
// 轮询间隔时间(ms)
const POLL_INTERVAL = 5000;
// 开始轮询(先不开启)
function startPolling() {
  // 确保只有一个定时器在运行
  stopPolling();
  pollTimer = setInterval(() => {
    getNoFinishRoom();
  }, POLL_INTERVAL);
}
// 停止轮询
function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

/** 还未结算的包厢 */
async function getNoFinishRoom() {
  const { data, error } = await fetchNoFinishRoom({ shopId: shopStore.localShopId });
  if (!error) {
    orderList.value = data || [];
    // orderList.value = orderList
    if (orderList.value.length > 0) {
      emit('changeOrder', orderList.value[currentIndex.value]);
    } else {
      emit('changeOrder', null);
    }
  }
}

function handleClick(index: number) {
  currentIndex.value = index;
}

watch(currentIndex, val => {
  emit('changeOrder', orderList.value[val]);
});

// 监听店铺变化
watch(
  () => shopStore.localShopId,
  () => {
    getNoFinishRoom();
  }
);

// 组件挂载时开始轮询
onMounted(() => {
  getNoFinishRoom();
  // startPolling();
});

// 组件卸载时清理定时器
onBeforeUnmount(() => {
  stopPolling();
});

// 暴露刷新方法给父组件
defineExpose({
  getNoFinishRoom
});
</script>

<template>
  <NCard :bordered="false" class="min-h-[70px] card-wrapper">
    <NScrollbar x-scrollable>
      <div class="flex items-center">
        <div
          v-for="(item, index) in orderList"
          :key="index"
          class="mr-16px flex-shrink-0 cursor-pointer rounded-[5px] p-5px hover:bg-gray-100"
          :class="{ 'bg-gray-100': index === currentIndex }"
          @click="handleClick(index)"
        >
          <NFlex class="flex items-center whitespace-nowrap">
            <img class="mr-8px h-[23px] w-[23px]" src="@/assets/imgs/sofa.png" alt="sofa" />
            <div class="text-16px">
              <span class="color-[#999999]">
                包厢
                <span class="mx-1px color-[#333333] font-700">{{ item.orderVo.roomName }}</span>
                客人已下单
              </span>
              <!--              <span class="cursor-pointer color-primary">点击查看</span>-->
            </div>
          </NFlex>
        </div>
        <div v-if="orderList.length === 0" class="text-center">暂无包厢数据</div>
      </div>
    </NScrollbar>
  </NCard>
</template>

<style scoped></style>
