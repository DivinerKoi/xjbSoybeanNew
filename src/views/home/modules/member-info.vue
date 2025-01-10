<script setup lang="ts">
import dayjs from 'dayjs';
import { ref } from 'vue';

defineOptions({
  name: 'MemberInfo'
});

interface Props {
  userMember: any;
  memberInfo: any;
  showTime?: boolean;
}

const { userMember, memberInfo, showTime = true } = defineProps<Props>();

// 会员详情弹窗
const showMemberDetail = ref(false);

// 格式化时间
const formatTime = (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss');

// 复制电话号码
const handleCopy = (phone: string) => {
  navigator.clipboard.writeText(phone).then(() => {
    window.$message?.success('复制成功');
  });
};

function showDetail() {
  showMemberDetail.value = true;
}
</script>

<template>
  <div
    class="flex cursor-pointer items-center justify-between rounded-md p-2px transition-all duration-300 hover:shadow-lg"
    @click="showDetail"
  >
    <div class="flex flex-1 items-center gap-3">
      <div class="h-40px w-40px shrink-0 overflow-hidden rounded-full">
        <img :src="userMember.avatar" class="h-full w-full object-cover" alt="" />
      </div>
      <div class="min-w-0 flex-1">
        <NFlex>
          <div class="flex items-center gap-2">
            <span class="text-16px text-[#333]">{{ userMember.name }}</span>
            <NTag size="small" round type="primary">Lv.{{ userMember.grade }}</NTag>
          </div>
        </NFlex>

        <div class="mt-1 flex items-center justify-between gap-2 text-14px text-[#666]">
          <div class="flex items-center">
            <span class="text-[#999]">
              联系电话：
              <span class="text-16px text-[#333]">{{ userMember.phone }}</span>
            </span>
            <div
              class="ml-[5px] flex cursor-pointer text-primary inline-block"
              @click.stop="handleCopy(userMember.phone)"
            >
              <SvgIcon icon="si:copy-duotone" />
              <span class="ml-[2px] text-10px">复制</span>
            </div>
          </div>
          <div v-if="showTime" class="flex items-center text-[#999]">
            <span class="text-[#999]">
              预约时间：
              <span class="text-16px text-[#333]">
                {{ dayjs(memberInfo?.previewStartTime).format('HH:mm') }} -
                {{ dayjs(memberInfo?.previewEndTime).format('HH:mm') }}
              </span>
            </span>
            <!--            <div class="ml-[5px] flex cursor-pointer text-primary" @click="handleCopy(memberInfo.phone)">-->
            <!--              <SvgIcon icon="si:settings-cute-line" />-->
            <!--              <span class="ml-[2px] text-10px">延长</span>-->
            <!--            </div>-->
          </div>
        </div>
      </div>
    </div>
    <div class="ml-4 flex shrink-0 items-center gap-2">
      <SvgIcon icon="si:chevron-right-alt-fill" class="h-5 w-5 text-[#999999]"></SvgIcon>
    </div>
    <NModal v-model:show="showMemberDetail" preset="card" title="会员详情" class="w-[400px]">
      <NFlex vertical :size="24">
        <NFlex align="center" justify="center">
          <NAvatar :size="100" round :src="userMember?.avatar" />
        </NFlex>

        <NDescriptions bordered :column="2">
          <NDescriptionsItem label="会员名称">
            {{ userMember?.name }}
          </NDescriptionsItem>
          <NDescriptionsItem label="性别">
            <NTag :type="userMember?.sex === '男' ? 'success' : 'error'">
              {{ userMember?.sex }}
            </NTag>
          </NDescriptionsItem>
          <NDescriptionsItem label="联系电话">
            <NFlex align="center">
              <span>{{ userMember?.phone }}</span>
              <div class="ml-8px flex cursor-pointer text-primary" @click="handleCopy(userMember.phone)">
                <SvgIcon icon="si:copy-duotone" />
                <span class="ml-[2px] text-10px">复制</span>
              </div>
            </NFlex>
          </NDescriptionsItem>
          <NDescriptionsItem label="会员等级">
            {{ userMember?.grade }}
          </NDescriptionsItem>
          <NDescriptionsItem label="总消费">
            <PriceText :value="userMember?.usePrice" size="small" />
          </NDescriptionsItem>
          <NDescriptionsItem label="生日">
            {{
              userMember?.birthday ? dayjs(userMember?.birthday).format('YYYY-MM-DD') : '-'
            }}
          </NDescriptionsItem>
          <NDescriptionsItem label="注册时间">
            {{ formatTime(userMember?.registartionTime || '') }}
          </NDescriptionsItem>
        </NDescriptions>
      </NFlex>
    </NModal>
  </div>
</template>

<style scoped></style>
