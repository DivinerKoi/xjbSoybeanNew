<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import { fetchAddMember, fetchEditMember } from '@/service/api/member';
import { useShopStore } from '@/store/modules/shop';

defineOptions({ name: 'MemberOperateDrawer' });

interface Props {
  operateType: NaiveUI.TableOperateType;
  rowData?: Api.Member.MemberInfo | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{ (e: 'submitted'): void }>();
const shopStore = useShopStore();
const visible = defineModel<boolean>('visible', { default: false });

const { formRef, validate, restoreValidation } = useNaiveForm();
const { defaultRequiredRule } = useFormRules();

const title = computed(() => {
  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: '添加会员',
    edit: '修改会员'
  };
  return titles[props.operateType];
});

const model = reactive<Api.Member.MemberInfo>(createDefaultModel());

function createDefaultModel(): Api.Member.MemberInfo {
  return {
    memberId: undefined,
    shopId: Number(shopStore.localShopId),
    name: '',
    avatar: '',
    sex: '',
    birthday: '',
    grade: '',
    type: 1
  };
}

const rules = {
  name: defaultRequiredRule,
  avatar: defaultRequiredRule,
  sex: defaultRequiredRule,
  birthday: defaultRequiredRule,
  grade: defaultRequiredRule,
  type: defaultRequiredRule
};

function handleInitModel() {
  Object.assign(model, createDefaultModel());
  if (props.operateType === 'edit' && props.rowData) {
    Object.assign(model, props.rowData);
  }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();
  model.shopId = shopStore.localShopId;

  if (props.operateType === 'edit') {
    const { error } = await fetchEditMember(model);
    if (!error) {
      window.$message?.success($t('common.updateSuccess'));
      closeDrawer();
      emit('submitted');
    }
  } else {
    const { error } = await fetchAddMember(model);
    if (!error) {
      window.$message?.success($t('common.addSuccess'));
      closeDrawer();
      emit('submitted');
    }
  }
}

watch(visible, () => {
  if (visible.value) {
    handleInitModel();
    restoreValidation();
  }
});
</script>

<template>
  <NModal v-model:show="visible" :title="title" preset="card" class="w-600px">
    <NScrollbar class="h-480px pr-20px">
      <NForm ref="formRef" :model="model" :rules="rules" label-placement="left" :label-width="120">
        <NGrid responsive="screen" item-responsive>
          <NFormItemGi span="24 m:24" label="会员名称" path="name">
            <NInput v-model:value="model.name" placeholder="请输入会员名称" />
          </NFormItemGi>
          <NFormItemGi span="24 m:24" label="会员头像" path="avatar">
            <ImageUpload v-model="model.avatar" />
          </NFormItemGi>
          <NFormItemGi span="24 m:24" label="性别" path="sex">
            <NRadioGroup v-model:value="model.sex">
              <NRadio value="男">男</NRadio>
              <NRadio value="女">女</NRadio>
            </NRadioGroup>
          </NFormItemGi>
<!--          <NFormItemGi span="24 m:24" label="生日" path="birthday">-->
<!--            <NDatePicker-->
<!--              v-model:formatted-value="model.birthday"-->
<!--              type="date"-->
<!--              clearable-->
<!--              format="yyyy-MM-dd"-->
<!--              value-format="yyyy-MM-dd"-->
<!--              placeholder="请选择生日"-->
<!--            />-->
<!--          </NFormItemGi>-->
          <NFormItemGi span="24 m:24" label="会员等级" path="grade">
            <NInput v-model:value="model.grade" placeholder="请输入会员等级" />
          </NFormItemGi>
          <NFormItemGi span="24 m:24" label="用户类型" path="type">
            <NRadioGroup v-model:value="model.type">
              <NRadio :value="1">会员</NRadio>
              <NRadio :value="2">服务员</NRadio>
            </NRadioGroup>
          </NFormItemGi>
        </NGrid>
      </NForm>
    </NScrollbar>
    <template #footer>
      <NSpace justify="end" :size="16">
        <NButton @click="closeDrawer">取消</NButton>
        <NButton type="primary" @click="handleSubmit">确认</NButton>
      </NSpace>
    </template>
  </NModal>
</template>

<style scoped>
:deep(.n-date-picker) {
  width: 100%;
}
</style>
