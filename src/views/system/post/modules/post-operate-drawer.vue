<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import { specialEnableStatusOptions } from '@/constants/business';
import { fetchAddPost, fetchEditPost } from '@/service/api/system/post';

defineOptions({
  name: 'PostOperateDrawer'
});

interface Props {
  /** the type of operation */
  operateType: NaiveUI.TableOperateType;
  /** the edit row data */
  rowData?: Api.SystemManage.Post | null;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, restoreValidation } = useNaiveForm();
const { defaultRequiredRule } = useFormRules();

const title = computed(() => {
  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: '添加岗位',
    edit: '修改岗位'
  };
  return titles[props.operateType];
});

type Model = Pick<
  Api.SystemManage.Post,
  'postId' | 'postName' | 'postCode' | 'postSort' | 'status' | 'remark'
>;

const model: Model = reactive(createDefaultModel());

function createDefaultModel(): Model {
  return {
    postId: '',
    postName: '',
    postCode: '',
    postSort: 0,
    status: '0',
    remark: ''
  };
}
// 菜单树

type RuleKey = Exclude<keyof Model, 'remark' | 'postId'>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  postName: defaultRequiredRule,
  postCode: defaultRequiredRule,
  postSort: defaultRequiredRule,
  status: defaultRequiredRule
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
  // request
  if (props.operateType === 'edit') {
    const { error } = await fetchEditPost(model);
    if (!error) {
      window.$message?.success($t('common.updateSuccess'));
      closeDrawer();
    }
  } else {
    const { error } = await fetchAddPost(model);
    if (!error) {
      window.$message?.success($t('common.addSuccess'));
      closeDrawer();
    }
  }
  emit('submitted');
}

watch(visible, () => {
  if (visible.value) {
    handleInitModel();
    restoreValidation();
  }
});
</script>

<template>
  <NDrawer v-model:show="visible" display-directive="show" :width="360">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules">
        <NFormItem label="岗位名称" path="postName">
          <NInput v-model:value="model.postName" placeholder="请输入岗位名称" />
        </NFormItem>
        <NFormItem label="岗位编码" path="postCode">
          <NInput v-model:value="model.postCode" placeholder="请输入岗位编码" />
        </NFormItem>
        <NFormItem span="24 m:12" label="显示排序" path="postSort">
          <NInputNumber v-model:value="model.postSort" class="w-full" placeholder="请输入显示排序" />
        </NFormItem>
        <NFormItem label="岗位状态" path="status">
          <NRadioGroup v-model:value="model.status">
            <NRadio
              v-for="item in specialEnableStatusOptions"
              :key="item.value"
              :value="item.value"
              :label="$t(item.label)"
            />
          </NRadioGroup>
        </NFormItem>
        <NFormItem label="备注" path="remark">
          <NInput v-model:value="model.remark" placeholder="请输入内容" />
        </NFormItem>
      </NForm>

      <template #footer>
        <NSpace :size="16">
          <NButton @click="closeDrawer">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped></style>
