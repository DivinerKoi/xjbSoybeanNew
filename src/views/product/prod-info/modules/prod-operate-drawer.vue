<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import { fetchAddProdInfo, fetchEditProdInfo } from '@/service/api/product/prodInfo';
import { fetchGetProdCategoryList } from '@/service/api/product/category';
import ProdSku from '@/views/product/prod-info/modules/prod-sku.vue';
import WangEditor from '@/components/WangEditor/index.vue';
import { useShopStore } from '@/store/modules/shop';
const shopStore = useShopStore();

defineOptions({
  name: 'ProdOperateDrawer'
});

interface Props {
  /** the type of operation */
  operateType: NaiveUI.TableOperateType;
  /** the edit row data */
  rowData?: Api.Product.ProductInfo | null;
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
// const { formRef: detailFormRef, validate: detailValidate, restoreValidation: detailRestoreValidation } = useNaiveForm();
const { defaultRequiredRule } = useFormRules();

const title = computed(() => {
  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: '添加商品',
    edit: '修改商品'
  };
  return titles[props.operateType];
});
type ActiveTab = 'basic' | 'sku' | 'detail';
// 添加当前激活的标签页
const activeTab = ref<ActiveTab>('basic');

type Model = Pick<
  Api.Product.ProductInfo,
  | 'prodId'
  | 'shopId'
  | 'prodName'
  | 'categoryId'
  | 'images'
  | 'price'
  | 'unPrice'
  | 'brief'
  | 'context'
  | 'status'
  | 'specList'
  | 'prodSkus'
>;

const model: Model = reactive(createDefaultModel());

function createDefaultModel(): Model {
  return {
    prodId: undefined,
    shopId: undefined,
    prodName: '',
    categoryId: undefined,
    images: '',
    price: null,
    unPrice: null,
    brief: '',
    context: '',
    specList: '',
    status: 1,
    prodSkus: []
  };
}
type RuleKey = Exclude<keyof Model, 'prodId' | 'shopId' | 'specList'>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  prodName: defaultRequiredRule,
  categoryId: defaultRequiredRule,
  images: defaultRequiredRule,
  price: defaultRequiredRule,
  unPrice: defaultRequiredRule,
  brief: defaultRequiredRule,
  context: defaultRequiredRule,
  status: defaultRequiredRule,
  // specList: defaultRequiredRule,
  prodSkus: defaultRequiredRule
};

function handleInitModel() {
  activeTab.value = 'basic';
  Object.assign(model, createDefaultModel());
  if (props.operateType === 'edit' && props.rowData) {
    Object.assign(model, props.rowData);
    model.price = Number(model.price);
    model.unPrice = Number(model.unPrice);
  }
}

const categoryOptions = ref<CommonType.Option[]>([]);
// 获取商品分类列表
async function getCategoryList() {
  const { data, error } = await fetchGetProdCategoryList();
  if (!error) {
    const result = data.data;
    categoryOptions.value = result.map(item => ({
      label: item.categoryName,
      value: item.categoryId
    }));
  }
}

function closeDrawer() {
  visible.value = false;
}

const skuFormRef = ref();

async function handleSubmit() {
  try {
    // 如果当前激活的标签页是 SKU 表单，则先验证 SKU 表单
    if (activeTab.value === 'sku') {
      // 再验证 SKU 表单
      await skuFormRef.value?.validate();
    }
    // 验证主表单
    await validate();
    await skuFormRef.value?.validate();
    // 所有验证通过后，提交表单
    model.shopId = shopStore.localShopId;

    if (props.operateType === 'edit') {
      const { error } = await fetchEditProdInfo(model);
      if (!error) {
        window.$message?.success($t('common.updateSuccess'));
        closeDrawer();
        emit('submitted');
      }
    } else {
      const { error } = await fetchAddProdInfo(model);
      if (!error) {
        window.$message?.success($t('common.addSuccess'));
        closeDrawer();
        emit('submitted');
      }
    }
  } catch (err) {
    // 处理验证错误
    if (Array.isArray(err)) {
      const firstError = err[0][0];
      // 根据错误字段判断应该跳转到哪个标签页
      const basicFields = ['prodName', 'categoryId', 'images', 'price', 'unPrice', 'brief', 'status'];
      const skuFields = ['prodSkus'];
      const detailFields = ['context'];

      if (basicFields.includes(firstError.field)) {
        activeTab.value = 'basic';
      } else if (skuFields.includes(firstError.field)) {
        activeTab.value = 'sku';
      } else if (detailFields.includes(firstError.field)) {
        activeTab.value = 'detail';
      } else {
        activeTab.value = 'sku';
      }
    }
  }
}

watch(visible, () => {
  if (visible.value) {
    getCategoryList();
    handleInitModel();
    restoreValidation();
  }
});
</script>

<template>
  <NModal v-model:show="visible" :title="title" preset="card" class="w-75%">
    <NForm ref="formRef" :model="model" :rules="rules" label-placement="left" :label-width="100">
      <NTabs v-model:value="activeTab" type="line" animated>
        <NTabPane name="basic" display-directive="show" tab="基础信息">
          <NScrollbar class="h-68vh pr-20px">
            <NGrid responsive="screen" item-responsive>
              <NFormItemGi span="24 m:24" label="商品分类" path="categoryId">
                <NSelect
                  v-model:value="model.categoryId"
                  :options="categoryOptions"
                  placeholder="请选择商品分类"
                  class="w-50%"
                />
              </NFormItemGi>
              <NFormItemGi span="24 m:24" label="商品名称" path="prodName">
                <NInput v-model:value="model.prodName" placeholder="请输入商品名称" class="!w-50%" />
              </NFormItemGi>
              <NFormItemGi span="24 m:24" label="商品图片" path="images">
                <ImageUpload v-model="model.images" max-count="5"></ImageUpload>
              </NFormItemGi>
              <NFormItemGi span="24 m:24" label="价格" path="price">
                <NInputNumber v-model:value="model.price" :precision="2" placeholder="请输入商品价格" />
              </NFormItemGi>
              <NFormItemGi span="24 m:24" label="原价" path="unPrice">
                <NInputNumber v-model:value="model.unPrice" :precision="2" placeholder="请输入商品原价" />
              </NFormItemGi>
              <NFormItemGi span="24 m:24" label="简单描述" path="brief">
                <NInput v-model:value="model.brief" type="textarea" :autosize="{ minRows: 1, maxRows: 3 }" placeholder="请输入商品简介" class="!w-50%" />
              </NFormItemGi>
              <NFormItemGi span="24 m:24" label="状态" path="status">
                <NRadioGroup v-model:value="model.status">
                  <NRadio label="上架" :value="1"></NRadio>
                  <NRadio label="下架" :value="0"></NRadio>
                </NRadioGroup>
              </NFormItemGi>
            </NGrid>
          </NScrollbar>
        </NTabPane>

        <NTabPane name="sku" display-directive="show" tab="规格库存">
          <NScrollbar class="h-68vh pr-20px">
            <NFormItem label="商品规格" path="prodSkus">
              <ProdSku ref="skuFormRef" v-model:prod-skus="model.prodSkus" v-model:spec-list="model.specList" />
            </NFormItem>
          </NScrollbar>
        </NTabPane>

        <NTabPane name="detail" display-directive="show" tab="商品详情">
          <NScrollbar class="h-68vh pr-20px">
            <NGrid x-gap="20px">
              <NFormItemGi span="24 m:24 17" label="商品简介" path="context" label-width="auto" label-placement="top">
                <WangEditor v-model="model.context" height="55vh" mode="default" placeholder="请输入商品简介" />
              </NFormItemGi>
              <NFormItemGi span="24 m:24 6" class="ifam">
                <div class="content" v-html="model.context"></div>
              </NFormItemGi>
            </NGrid>
          </NScrollbar>
        </NTabPane>
      </NTabs>
    </NForm>

    <template #footer>
      <NSpace justify="end" :size="16">
        <NButton @click="closeDrawer">取消</NButton>
        <NButton type="primary" @click="handleSubmit">确定</NButton>
      </NSpace>
    </template>
  </NModal>
</template>

<style lang="scss" scoped>
.ifam {
  width: 344px;
  height: 65vh;
  background: url('@/assets/imgs/phone-bg.png') no-repeat center top;
  background-size: 344px 65vh;
  padding: 40px 20px;
  padding-top: 50px;
  margin: 0 auto;

  .content {
    height: 55vh;
    overflow: hidden;
    scrollbar-width: none; /* firefox */
    -ms-overflow-style: none; /* IE 10+ */
    overflow-x: hidden;
    overflow-y: auto;
  }

  .content::-webkit-scrollbar {
    display: none; /* Chrome Safari */
  }
}
</style>
