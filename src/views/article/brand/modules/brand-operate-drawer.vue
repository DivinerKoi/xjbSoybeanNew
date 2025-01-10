<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import { fetchAddBrand, fetchEditBrand } from '@/service/api/article/brand';

defineOptions({
  name: 'CategoryOperateDrawer'
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
    add: '添加品牌',
    edit: '修改品牌'
  };
  return titles[props.operateType];
});

const model: Api.Brand.BrandInfo = reactive(createDefaultModel());

function createDefaultModel(): Api.Brand.BrandInfo {
  return {
    id: undefined,
    title: '',
    pic: '',
    desc: ''
  };
}
// 菜单树

type RuleKey = Exclude<keyof Api.Brand.BrandInfo, 'id'>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  title: defaultRequiredRule,
  pic: defaultRequiredRule,
  desc: defaultRequiredRule
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
    const { error } = await fetchEditBrand(model);
    if (!error) {
      window.$message?.success($t('common.updateSuccess'));
      closeDrawer();
      emit('submitted');
    }
  } else {
    const { error } = await fetchAddBrand(model);
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
  <NModal v-model:show="visible" :title="title" preset="card" class="w-800px">
    <NScrollbar class="h-480px pr-20px">
      <NForm ref="formRef" :model="model" :rules="rules">
        <NFormItem label="图片" path="pic">
          <ImageUpload v-model="model.pic"></ImageUpload>
        </NFormItem>
        <NFormItem label="名称" path="title">
          <NInput v-model:value="model.title" placeholder="请输入名称" />
        </NFormItem>
        <NFormItem label="描述" path="desc">
          <NInput v-model:value="model.desc" type="textarea" :autosize="{ minRows: 3 }"  placeholder="请输入描述" />
        </NFormItem>
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

<style scoped></style>
