<script setup lang="tsx">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';
import type { FormInst } from 'naive-ui';
import MemberInfo from '@/views/home/modules/member-info.vue';
import { fetchConflictTime, fetchEditPreview } from '@/service/api/preview';

defineOptions({
  name: 'RoomInfo'
});
interface Props {
  fixedHeight?: boolean;
  showServiceBtn?: boolean;
  previewInfo: any;
  currentOrder: Api.Home.NoDeliveryRoom;
}
const { fixedHeight = true, previewInfo, currentOrder, showServiceBtn = true } = defineProps<Props>();
const router = useRouter();
interface Emits {
  (e: 'submitExtend'): void;
}

const emit = defineEmits<Emits>();
/** 计算剩余时间或已结束 */
const duration = computed(() => {
  const now = new Date().getTime();
  const start = new Date(previewInfo.previewStartTime).getTime();
  const end = new Date(previewInfo.previewEndTime).getTime();
  // 判断当前时间是否已经超过结束时间
  if (now >= end) {
    return 0; // 已结束
  }
  // 判断是否已经开始，如果还未开始返回剩余到开始的时间
  if (now < start) {
    return -1; // 距离开始的剩余时间  未开始
  }
  // 已开始但未结束，计算剩余时间
  return end - now;
});
const renderCountdown = (info: any) => {
  const { hours, minutes, seconds } = info;
  return (
    <div class="flex items-center">
      <div class="flex items-center">
        <div class="text-24px text-primary font-bold">{String(hours).padStart(2, '0')}</div>
        <div class="ml-12px mr-12px text-16px font-medium">时</div>
      </div>
      <div class="flex items-center">
        <div class="text-24px text-primary font-bold">{String(minutes).padStart(2, '0')}</div>
        <div class="ml-12px mr-12px text-16px font-medium">分</div>
      </div>
      <div class="flex items-center">
        <div class="text-24px text-primary font-bold">{String(seconds).padStart(2, '0')}</div>
        <div class="ml-12px mr-12px text-16px font-medium">秒</div>
      </div>
    </div>
  );
};
const statusMap = {
  '1': { label: '未核销', type: 'warning' },
  '2': { label: '进行中', type: 'primary' },
  '3': { label: '已完成', type: 'success' },
  '4': { label: '已撤销', type: 'error' }
};
function toService() {
  if (previewInfo.orderVo) {
    router.push({
      name: 'room-service',
      query: {
        orderNum: previewInfo.orderVo.orderNum,
        previewId: previewInfo.orderVo.previewId
      }
    });
  } else {
    window.$message?.error('当前预约未核销，无法前往服务');
  }

}

const extendVisible = ref(false);
const conflictTimes = ref<Api.Home.ConflictTime[]>([]);
const formRef = ref<FormInst | null>(null);
const formModel = ref({
  startTime: null as string | null,
  endTime: null as string | null
});

const rules = {
  endTime: {
    required: true,
    message: '请选择结束时间',
    trigger: ['blur', 'change']
  }
};

async function showExtendTime() {
  extendVisible.value = true;

  // 重置表单，使用时间戳
  formModel.value = {
    startTime: dayjs(previewInfo.previewStartTime).format('HH:mm:ss'),
    endTime: dayjs(previewInfo.previewEndTime).format('HH:mm:ss')
  };
  const query = {
    shopId: previewInfo.shopId,
    roomId: previewInfo.roomId,
    previewDate: dayjs(previewInfo.previewStartTime).format('YYYY-MM-DD')
  };

  const { data, error } = await fetchConflictTime(query);
  if (!error) {
    conflictTimes.value = data || [];
  }
}

// 修改 handleExtend 函数来正确处理时间戳
async function handleExtend() {
  await formRef.value?.validate();
  if (!formModel.value.endTime) return;
  const previewDate = dayjs(previewInfo.previewStartTime).format('YYYY-MM-DD');
  // const endTimeStr = dayjs(formModel.value.endTime).format('HH:mm:ss');
  const endTimeStr = formModel.value.endTime;

  const params = {
    previewId: previewInfo.previewId,
    roomId: previewInfo.roomId,
    previewStartTime: previewInfo.previewStartTime,
    previewEndTime: `${previewDate} ${endTimeStr}`,
    phone: previewInfo.phone
  };

  const { error } = await fetchEditPreview(params);
  if (!error) {
    extendVisible.value = false;
    window.$message?.success('延长预约成功');
    emit('submitExtend');
  }
}

// 添加禁用时间的处理函数
function isHourDisabled(hour: number) {
  const startHour = dayjs(previewInfo.previewEndTime).hour();

  // 如果有冲突时间，找出第一个冲突的时间作为结束限制
  if (conflictTimes.value.length > 0) {
    const nextConflict = conflictTimes.value
      .filter(time => dayjs(time.previewStartTime).isAfter(dayjs(previewInfo.previewEndTime)))
      .sort((a, b) => dayjs(a.previewStartTime).valueOf() - dayjs(b.previewStartTime).valueOf())[0];

    if (nextConflict) {
      const conflictHour = dayjs(nextConflict.previewStartTime).hour();
      return hour < startHour || hour >= conflictHour;
    }
  }

  return hour < startHour;
}

function isMinuteDisabled(minute: number, hour: number | null) {
  if (hour === null) return true;

  const startTime = dayjs(previewInfo.previewEndTime);

  // 如果是开始小时，限制分钟必须大于等于开始分钟
  if (hour === startTime.hour()) {
    return minute < startTime.minute();
  }

  // 如果有冲突时间，处理冲突时间的分钟限制
  if (conflictTimes.value.length > 0) {
    const nextConflict = conflictTimes.value
      .filter(time => dayjs(time.previewStartTime).isAfter(startTime))
      .sort((a, b) => dayjs(a.previewStartTime).valueOf() - dayjs(b.previewStartTime).valueOf())[0];

    if (nextConflict) {
      const conflictTime = dayjs(nextConflict.previewStartTime);
      if (hour === conflictTime.hour()) {
        return minute >= conflictTime.minute();
      }
    }
  }

  return false;
}
</script>

<template>
  <NCard
    :bordered="false"
    class="min-h-0 flex flex-col flex-1 card-wrapper"
    :class="fixedHeight ? 'max-h-445px min-h-445px overflow-auto' : ''"
  >
    <BarTitle title="包厢倒计时">
      <NButton
        v-if="showServiceBtn && previewInfo"
        icon-placement="right"
        type="primary"
        size="small"
        @click="toService"
      >
        前往服务
        <template #icon>
          <SvgIcon icon="si:chevron-right-alt-fill" class="text-12px"></SvgIcon>
        </template>
      </NButton>
    </BarTitle>
    <div v-if="previewInfo">
      <NFlex justify="center">
        <NCountdown v-if="duration > 0" :render="renderCountdown" :duration="duration" />
        <span v-if="duration === 0" class="text-primary font-700">已结束</span>
        <span v-if="duration === -1" class="text-primary font-700">未开始</span>
      </NFlex>
      <NDivider class="mb-10px mt-10px"></NDivider>
      <BarTitle title="客户信息">
        <NTag :type="statusMap[previewInfo.status].type">
          {{ statusMap[previewInfo.status].label }}
        </NTag>
      </BarTitle>
      <MemberInfo
        v-if="previewInfo.userMemberVo"
        :user-member="previewInfo.userMemberVo"
        :member-info="currentOrder"
        :show-time="false"
      ></MemberInfo>
      <span v-else class="flex-center text-gray">暂无客户信息</span>
      <NDivider></NDivider>
      <BarTitle title="预约信息">
        <span class="color-primary">{{ dayjs(previewInfo.previewStartTime).format('YYYY年MM月DD日') }}</span>
      </BarTitle>
      <NFlex justify="space-between">
        <div class="flex items-center text-[#999]">
          <span class="text-[#999]">
            预约时间：
            <span class="text-16px text-[#333]">
              {{ dayjs(previewInfo.previewStartTime).format('HH:mm') }} -
              {{ dayjs(previewInfo.previewEndTime).format('HH:mm') }}
            </span>
          </span>
          <div
            v-if="previewInfo.status === 2"
            class="ml-[5px] flex cursor-pointer text-primary"
            @click="showExtendTime"
          >
            <SvgIcon icon="si:settings-cute-line" />
            <span class="ml-[2px] text-10px">延长</span>
          </div>
        </div>
        <div>
          <span class="text-[#999]">到店人数：</span>
          <span class="text-16px text-primary font-700">
            {{ previewInfo.peopleNum }}
          </span>
          <span class="text-[#999]">人</span>
        </div>
      </NFlex>
      <NDivider></NDivider>
      <BarTitle title="备注信息"></BarTitle>
      <div class="text-14px text-[#999]">
        {{ previewInfo.remarks }}
      </div>
    </div>
    <NEmpty v-else class="mt20" :show-icon="false" :show-description="false">
      <template #extra>
        <img src="@/assets/imgs/empty.png" alt="empty" class="h-[100px] w-[150px]" />
        <div class="text-16px text-gray">暂无预约信息</div>
      </template>
    </NEmpty>
    <NModal v-model:show="extendVisible" title="延长预约时间" preset="card" class="w-800px">
      <NForm
        ref="formRef"
        :model="formModel"
        :rules="rules"
        label-placement="left"
        label-width="130"
        require-mark-placement="right-hanging"
      >
        <NFormItem label="当前预约时间段">
          <div class="text-14px color-[#666]">
            {{ dayjs(previewInfo.previewStartTime).format('YYYY-MM-DD HH:mm') }} -
            {{ dayjs(previewInfo.previewEndTime).format('HH:mm') }}
          </div>
        </NFormItem>

        <NFormItem label="延长时间设置" class="mb-0">
          <NFlex align="center" :wrap="false">
            <NTimePicker
              v-model:formatted-value="formModel.startTime"
              disabled
              format="HH:mm"
              value-format="HH:mm:00"
              placeholder="开始时间"
              class="!w-120px"
            />
            <div class="mx-2">至</div>
            <NTimePicker
              v-model:formatted-value="formModel.endTime"
              format="HH:mm"
              placeholder="结束时间"
              value-format="HH:mm:00"
              :is-hour-disabled="isHourDisabled"
              :is-minute-disabled="isMinuteDisabled"
              class="!w-120px"
            />
          </NFlex>
        </NFormItem>

        <NFormItem v-if="conflictTimes.length > 0" label="已被预约时间段">
          <NFlex class="text-14px color-[#ff4d4f]">
            <div v-for="(time, index) in conflictTimes" :key="index">
              {{ dayjs(time.previewStartTime).format('HH:mm') }} -
              {{ dayjs(time.previewEndTime).format('HH:mm') }}
            </div>
          </NFlex>
        </NFormItem>

        <NFormItem label=" " :show-label="false">
          <div class="text-12px color-[#999]">注：结束时间不能与其他预约时间段冲突</div>
        </NFormItem>
      </NForm>

      <template #footer>
        <div class="flex justify-end gap-12px">
          <NButton @click="extendVisible = false">取消</NButton>
          <NButton type="primary" :disabled="!formModel.endTime" @click="handleExtend">确认延长</NButton>
        </div>
      </template>
    </NModal>
  </NCard>
</template>

<style scoped>
:deep(.n-divider) {
  margin: 10px 0;
}
:deep(.n-button__icon) {
  margin: 0 !important;
}
</style>
