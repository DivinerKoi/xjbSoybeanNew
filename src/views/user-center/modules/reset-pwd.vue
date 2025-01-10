<script setup lang="ts">
import type { FormItemRule } from 'naive-ui';
import { reactive } from 'vue';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { fetchUpdateUserPwd } from '@/service/api/system/user-center';

defineOptions({ name: 'ResetPwd' });

const { formRef, validate } = useNaiveForm();
const { defaultRequiredRule } = useFormRules();

const model = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const rules = {
  oldPassword: defaultRequiredRule,
  newPassword: defaultRequiredRule,
  confirmPassword: [
    defaultRequiredRule,
    {
      validator: (_rule: FormItemRule, value: string) => {
        if (value !== model.newPassword) {
          return new Error('两次输入的密码不一致');
        }
        return true;
      },
      trigger: ['input', 'blur']
    }
  ]
};

async function handleSubmit() {
  await validate();
  const { error } = await fetchUpdateUserPwd(model.oldPassword, model.newPassword);
  if (!error) {
    window.$message?.success('修改成功');
  }
}
</script>

<template>
  <NForm ref="formRef" :model="model" :rules="rules" label-placement="left" :label-width="100" class="py-16px">
    <NFormItem label="当前密码" path="oldPassword">
      <NInput v-model:value="model.oldPassword" type="password" show-password-on="click" placeholder="请输入旧密码" />
    </NFormItem>
    <NFormItem label="新密码" path="newPassword">
      <NInput v-model:value="model.newPassword" type="password" show-password-on="click" placeholder="请输入新密码" />
    </NFormItem>
    <NFormItem label="确认密码" path="confirmPassword">
      <NInput
        v-model:value="model.confirmPassword"
        type="password"
        show-password-on="click"
        placeholder="请确认新密码"
      />
    </NFormItem>
    <div class="ml-100px mt-24px">
      <NButton type="primary" @click="handleSubmit">保存</NButton>
    </div>
  </NForm>
</template>
