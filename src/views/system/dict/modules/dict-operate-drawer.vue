<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import { specialEnableStatusOptions } from '@/constants/business';
import { fetchAddDict, fetchEditDict } from '@/service/api/system/dict';

defineOptions({
  name: 'DictOperateDrawer'
});

interface Props {
  /** the type of operation */
  operateType: NaiveUI.TableOperateType;
  /** the edit row data */
  rowData?: Api.SystemManage.Dict | null;
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
    add: '添加字典',
    edit: '修改字典'
  };
  return titles[props.operateType];
});

type Model = Pick<
  Api.SystemManage.Dict,
  'dictId' | 'dictName' | 'dictType' | 'status' | 'remark'
>;

const model: Model = reactive(createDefaultModel());

function createDefaultModel(): Model {
  return {
    dictId: '',
    dictName: '',
    dictType: '',
    status: '0',
    remark: ''
  };
}
// 菜单树

type RuleKey = Exclude<keyof Model, 'remark' | 'dictId'>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  dictName: defaultRequiredRule,
  dictType: defaultRequiredRule,
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
    const { error } = await fetchEditDict(model);
    if (!error) {
      window.$message?.success($t('common.updateSuccess'));
      closeDrawer();
    }
  } else {
    const { error } = await fetchAddDict(model);
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
        <NFormItem label="字典名称" path="dictName">
          <NInput v-model:value="model.dictName" placeholder="请输入字典名称" />
        </NFormItem>
        <NFormItem label="字典类型" path="dictType">
          <NInput v-model:value="model.dictType" placeholder="请输入字典类型" />
        </NFormItem>
        <NFormItem label="字典状态" path="status">
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
          <NInput v-model:value="model.remark" type="textarea" placeholder="请输入内容" />
        </NFormItem>
      </NForm>

      <template #footer>
        <NSpace :size="16">
          <NButton @click="closeDrawer">取消</NButton>
          <NButton type="primary" @click="handleSubmit">确认</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped></style>
