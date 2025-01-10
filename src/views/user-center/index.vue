<script setup lang="ts">
import { computed, ref } from 'vue';
import { fetchGetUserProfile } from '@/service/api/system/user-center';
import UserAvatar from './modules/user-avatar.vue';
import UserInfo from './modules/user-info.vue';
import ResetPwd from './modules/reset-pwd.vue';

defineOptions({ name: 'UserCenter' });

const activeTab = ref('userinfo');
const user = ref({
  userName: '',
  phonenumber: '',
  email: '',
  dept: {
    deptName: ''
  },
  createTime: '',
  avatar: ''
});
const roleGroup = ref('');
const postGroup = ref('');
function getUser() {
  fetchGetUserProfile().then(response => {
    user.value = response.data.user;
    roleGroup.value = response.data.roleGroup;
    postGroup.value = response.data.postGroup;
  });
}
function init() {
  getUser();
}
init();

const userInfoList = computed(() => [
  {
    icon: 'ep:user',
    label: '用户名称',
    value: user.value.userName
  },
  {
    icon: 'ep:phone',
    label: '手机号码',
    value: user.value.phonenumber
  },
  {
    icon: 'ep:message',
    label: '用户邮箱',
    value: user.value.email
  },
  {
    icon: 'ep:office-building',
    label: '所属部门',
    value: `${user.value.dept?.deptName} / ${postGroup.value}`
  },
  {
    icon: 'ep:user-filled',
    label: '所属角色',
    value: roleGroup.value
  },
  {
    icon: 'ep:calendar',
    label: '创建日期',
    value: user.value.createTime
  }
]);
</script>

<template>
  <NGrid :y-gap="16" :x-gap="16" responsive="screen" item-responsive>
    <NGi span="24 m:6">
      <!-- 左侧个人信息卡片 -->
      <NCard size="small">
        <template #header>
          <div class="text-16px font-medium">个人信息</div>
        </template>
        <div class="flex-col-center gap-16px">
          <div class="text-center">
            <UserAvatar :user="user" />
          </div>
          <div class="w-full">
            <NFlex
              v-for="(item, index) in userInfoList"
              :key="index"
              justify="space-between"
              align="center"
              class="border-b border-[#eee] py-12px last:border-none"
            >
              <NFlex align="center" class="gap-8px text-[#606266]">
                <SvgIcon :icon="item.icon" />
                <span>{{ item.label }}</span>
              </NFlex>
              <span class="text-[#303133]">{{ item.value }}</span>
            </NFlex>
          </div>
        </div>
      </NCard>
    </NGi>
    <NGi span="24 m:18">
      <!-- 右侧编辑卡片 -->
      <NCard size="small">
        <template #header>
          <div class="text-16px font-medium">基本资料</div>
        </template>
        <NTabs v-model:value="activeTab" type="line" animated>
          <NTabPane name="userinfo" tab="基本资料">
            <UserInfo :user="user" />
          </NTabPane>
          <NTabPane name="resetPwd" tab="修改密码">
            <ResetPwd :user="user" />
          </NTabPane>
        </NTabs>
      </NCard>
    </NGi>
  </NGrid>
</template>

<style scoped></style>
