<script setup lang="ts">
import { ref, watch } from 'vue';
import BarTitle from '@/components/common/barTitle.vue';
import MemberInfo from '@/views/home/modules/member-info.vue';
import { fetchFuturePreview } from '@/service/api/home';
import { useShopStore } from '@/store/modules/shop';

defineOptions({
  name: 'SubscribeList'
});
const shopStore = useShopStore();

const selectedDate = ref(0);
const subscribeList = ref<Api.Home.FuturePreview[]>([]);

// 切换日期的方法
const handleDateClick = (index: number) => {
  selectedDate.value = index;
};

async function getData() {
  const { data, error } = await fetchFuturePreview({ shopId: shopStore.localShopId });
  if (!error) {
    subscribeList.value = data;
    if (data.length > 0) {
      selectedDate.value = 0;
    }
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
}
init();
</script>

<template>
  <NCard :bordered="false" class="min-h-[400px] card-wrapper">
    <BarTitle title="预约列表"></BarTitle>
    <!-- 日期选择 -->
    <div class="mb-4 flex items-center gap-4">
      <div
        v-for="(item, index) in subscribeList"
        :key="item.exactDate"
        class="cursor-pointer rounded-md px-3 py-1.5 transition-colors"
        :class="index === selectedDate ? 'bg-primary text-white' : 'hover:bg-gray-100'"
        @click="handleDateClick(index)"
      >
        {{ item.exactDate }}
      </div>
    </div>

    <!-- 预约列表 -->
    <div v-if="subscribeList.length > 0" class="space-y-4">
      <div v-for="(item, index) in subscribeList[selectedDate].previewVoList" :key="index">
        <MemberInfo :member-info="item" :user-member="item.userMemberVo"></MemberInfo>
        <NDivider v-if="index < subscribeList[selectedDate].previewVoList.length - 1"></NDivider>
      </div>
    </div>
    <NEmpty v-else class="mt-20"></NEmpty>
  </NCard>
</template>

<style scoped></style>
