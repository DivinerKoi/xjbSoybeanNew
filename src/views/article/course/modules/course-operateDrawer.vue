<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import { fetchAddCourse, fetchEditCourse } from '@/service/api/article/course';
import WangEditor from '@/components/WangEditor/index.vue'

defineOptions({
  name: 'CourseOperateDrawer'
});

interface Props {
  /** the type of operation */
  operateType: NaiveUI.TableOperateType;
  /** the edit row data */
  rowData?: Api.Course.Course | null;
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
    add: '添加课程',
    edit: '修改课程'
  };
  return titles[props.operateType];
});

type Model = Pick<Api.Course.Course, 'title' | 'pic' | 'desc' | 'context' | 'sort'>;

const model: Model = reactive(createDefaultModel());

function createDefaultModel(): Model {
  return {
    title: '',
    pic: '',
    desc: '',
    context: '',
    sort: 0
  };
}

// 表单验证规则
type RuleKey = keyof Omit<Model, 'sort'>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  title: defaultRequiredRule,
  pic: defaultRequiredRule,
  desc: defaultRequiredRule,
  context: defaultRequiredRule
};

function handleInitModel() {
  Object.assign(model, createDefaultModel());
  if (props.operateType === 'edit' && props.rowData) {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const { title, pic, desc, context, sort } = props.rowData;
    Object.assign(model, { title, pic, desc, context, sort });
  }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();
  if (props.operateType === 'edit') {
    const editData = {
      ...model,
      id: props.rowData!.id
    };
    const { error } = await fetchEditCourse(editData);
    if (!error) {
      window.$message?.success($t('common.updateSuccess'));
      closeDrawer();
    }
  } else {
    const { error } = await fetchAddCourse(model);
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
  <NModal v-model:show="visible" :title="title" preset="card" class="w-1000px">
    <NScrollbar class="h-680px pr-20px">
      <NForm ref="formRef" :model="model" :rules="rules">
        <NFormItem label="课程封面" path="pic">
          <ImageUpload v-model="model.pic"></ImageUpload>
        </NFormItem>
        <NFormItem label="课程标题" path="title">
          <NInput v-model:value="model.title" placeholder="请输入课程标题" />
        </NFormItem>
        <NFormItem label="课程描述" path="desc">
          <NInput v-model:value="model.desc" type="textarea" placeholder="请输入课程描述" />
        </NFormItem>
        <NFormItem label="课程内容" path="context">
          <WangEditor
            v-model="model.context"
            height="300px"
            mode="default"
            placeholder="请输入课程内容"
          />
        </NFormItem>
        <NFormItem label="排序" path="sort">
          <NInputNumber v-model:value="model.sort" placeholder="请输入排序号" />
        </NFormItem>
      </NForm>
    </NScrollbar>
    <template #footer>
      <NSpace justify="end" :size="16">
        <NButton @click="closeDrawer">{{ $t('common.cancel') }}</NButton>
        <NButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</NButton>
      </NSpace>
    </template>
  </NModal>
</template>

<style scoped></style>
