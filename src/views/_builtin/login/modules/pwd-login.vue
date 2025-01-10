<script setup lang="ts">
import { reactive, ref } from 'vue';
import { $t } from '@/locales';
import { useNaiveForm } from '@/hooks/common/form';
import { useAuthStore } from '@/store/modules/auth';
import Verify from '@/components/verifition/Verify.vue';

defineOptions({
  name: 'PwdLogin'
});
const authStore = useAuthStore();
const { formRef, validate } = useNaiveForm();

interface FormModel {
  username: string;
  password: string;
  tenantId: string;
  code: string;
  uuid: string;
}

const model: FormModel = reactive({
  username: '',
  password: '',
  tenantId: '000000',
  code: '',
  uuid: ''
});

const loginRules = ref({
  username: [{ required: true, trigger: 'blur', message: '请输入您的账号' }],
  password: [{ required: true, trigger: 'blur', message: '请输入您的密码' }],
  code: [{ required: true, trigger: 'change', message: '请输入验证码' }]
});

const verifyRef = ref<any>();

async function handleSubmit() {
  await validate();
  // 打开验证码弹窗
  verifyRef.value.show();
}
// 验证成功的回调
async function handleVerifySuccess(data: any) {
  verifyRef.value.closeBox();
  const { captchaVerification } = data;
  model.code = captchaVerification;
  // 处理验证成功的逻辑
  await authStore.login(model);
}
</script>

<template>
  <NForm ref="formRef" :model="model" :rules="loginRules" size="large" :show-label="false" @keyup.enter="handleSubmit">
    <NFormItem path="userName">
      <NInput v-model:value="model.username" :placeholder="$t('page.login.common.userNamePlaceholder')" />
    </NFormItem>
    <NFormItem path="password">
      <NInput
        v-model:value="model.password"
        type="password"
        show-password-on="click"
        :placeholder="$t('page.login.common.passwordPlaceholder')"
      />
    </NFormItem>
    <NSpace vertical :size="24">
      <NButton type="primary" size="large" round block :loading="authStore.loginLoading" @click="handleSubmit">
        {{ $t('common.confirm') }}
      </NButton>
    </NSpace>
  </NForm>

  <Verify
    ref="verifyRef"
    mode="pop"
    captcha-type="blockPuzzle"
    :img-size="{ width: '400px', height: '200px' }"
    @success="handleVerifySuccess"
  ></Verify>
</template>

<style scoped></style>
