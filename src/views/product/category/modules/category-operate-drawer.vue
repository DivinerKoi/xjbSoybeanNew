<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import { fetchAddProdCategory, fetchEditProdCategory } from '@/service/api/product/category';
import { useShopStore } from '@/store/modules/shop';
import { classNames } from '@/constants/iconfont-names';

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

const shopStore = useShopStore();

const { formRef, validate, restoreValidation } = useNaiveForm();
const { createRequiredRule } = useFormRules();

const title = computed(() => {
  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: '添加商品分类',
    edit: '修改商品分类'
  };
  return titles[props.operateType];
});

type Model = Partial<Api.Product.Category>;

const model: Model = reactive(createDefaultModel());

function createDefaultModel(): Model {
  return {
    categoryId: undefined,
    shopId: undefined,
    categoryName: '',
    icon: '',
    pic: ''
  };
}
type RuleKey = Exclude<keyof Model, 'categoryId' | 'shopId'>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  categoryName: createRequiredRule('请输入分类名称'),
  icon: createRequiredRule('请选择图标'),
  pic: createRequiredRule('请上传分类图片')
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
    const { error } = await fetchEditProdCategory(model as Api.Product.Category);
    if (!error) {
      window.$message?.success($t('common.updateSuccess'));
      closeDrawer();
      emit('submitted');
    }
  } else {
    const { error } = await fetchAddProdCategory(model as Api.Product.Category);
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
      <NForm ref="formRef" :model="model" :rules="rules" label-placement="left" :label-width="100">
        <NFormItem label="分类名称" path="categoryName">
          <NInput v-model:value="model.categoryName" placeholder="请输入分类名称" />
        </NFormItem>
        <NFormItem label="图标" path="icon">
          <NScrollbar class="h-270px">
            <NFlex :wrap="true" class="gap-4">
              <div
                v-for="icon in classNames"
                :key="icon"
                class="h-12 w-10 flex-center cursor-pointer border border-[#eee] rounded p-3 transition-colors duration-300"
                :class="{ 'border-primary bg-primary bg-opacity-7': model.icon === icon }"
                @click="model.icon = icon"
              >
                <i :class="[icon]" class="iconfont text-26px"></i>
              </div>
            </NFlex>
          </NScrollbar>

        </NFormItem>
        <NFormItem label="分类图片" path="pic">
          <ImageUpload v-model="model.pic" :max-count="5"></ImageUpload>
        </NFormItem>
      </NForm>
    </NScrollbar>
    <template #footer>
      <NSpace justify="end" :size="16">
        <NButton @click="closeDrawer">取消</NButton>
        <NButton type="primary" @click="handleSubmit">确定</NButton>
      </NSpace>
    </template>
  </NModal>
</template>

<style scoped></style>
