<script setup lang="ts">
import { reactive, watch } from 'vue';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { fetchUpdateUserProfile } from '@/service/api/system/user-center';

defineOptions({ name: 'UserInfo' });

interface Props {
  user: {
    userName: string;
    phonenumber: string;
    email: string;
    sex?: string;
    nickName?: string;
  };
}

const props = defineProps<Props>();

const model = reactive({
  userName: '',
  phonenumber: '',
  email: '',
  sex: '',
  nickName: ''
});

// 监听 props.user 的变化，同步更新表单数据
watch(
  () => props.user,
  newUser => {
    Object.assign(model, newUser);
  },
  { immediate: true }
);

const { formRef, validate, restoreValidation } = useNaiveForm();
const { defaultRequiredRule } = useFormRules();

const rules = {
  userName: defaultRequiredRule,
  phonenumber: defaultRequiredRule,
  email: defaultRequiredRule,
  sex: defaultRequiredRule
};

async function handleSubmit() {
  await validate();
  const { error } = await fetchUpdateUserProfile(model);
  if (!error) {
    window.$message?.success('保存成功');
    restoreValidation();
  }
}
</script>

<template>
  <NForm ref="formRef" :model="model" :rules="rules" label-placement="left" :label-width="80" class="py-16px">
    <NFormItem label="用户昵称" path="nickName">
      <NInput v-model:value="model.nickName" placeholder="请输入用户昵称" />
    </NFormItem>
    <NFormItem label="手机号码" path="phonenumber">
      <NInput v-model:value="model.phonenumber" maxlength="11" placeholder="请输入手机号码" />
    </NFormItem>
    <NFormItem label="邮箱" path="email">
      <NInput v-model:value="model.email" placeholder="请输入邮箱" />
    </NFormItem>
    <NFormItem label="性别" path="sex">
      <NRadioGroup v-model:value="model.sex">
        <NRadio value="0">男</NRadio>
        <NRadio value="1">女</NRadio>
      </NRadioGroup>
    </NFormItem>
    <div class="ml-80px mt-24px">
      <NButton type="primary" @click="handleSubmit">保存</NButton>
    </div>
  </NForm>
</template>
