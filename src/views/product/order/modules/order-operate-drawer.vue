<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import { fetchAddOrder, fetchEditOrder } from '@/service/api/product/order';

defineOptions({
  name: 'OrderOperateDrawer'
});

interface Props {
  operateType: NaiveUI.TableOperateType;
  rowData?: Api.Order.OrderInfo | null;
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
    add: '添加订单',
    edit: '修改订单'
  };
  return titles[props.operateType];
});

const model = reactive(createDefaultModel());

function createDefaultModel(): Api.Order.OrderInfo {
  return {
    orderId: undefined,
    orderNum: '',
    shopId: 0,
    shopName: '',
    roomId: 0,
    roomName: '',
    previewId: 0,
    memberId: 0,
    openId: '',
    price: 0,
    unPrice: 0,
    status: 0,
    noticeCount: 0,
    compTime: ''
  };
}

const rules = {
  orderNum: defaultRequiredRule,
  shopName: defaultRequiredRule,
  roomName: defaultRequiredRule,
  price: defaultRequiredRule
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
  if (props.operateType === 'edit') {
    const { error } = await fetchEditOrder(model);
    if (!error) {
      window.$message?.success($t('common.updateSuccess'));
      closeDrawer();
      emit('submitted');
    }
  } else {
    const { error } = await fetchAddOrder(model);
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
        <NFormItem label="订单编号" path="orderNum">
          <NInput v-model:value="model.orderNum" placeholder="请输入订单编号" />
        </NFormItem>
        <NFormItem label="商户名称" path="shopName">
          <NInput v-model:value="model.shopName" placeholder="请输入商户名称" />
        </NFormItem>
        <NFormItem label="包间名称" path="roomName">
          <NInput v-model:value="model.roomName" placeholder="请输入包间名称" />
        </NFormItem>
        <NFormItem label="订单金额" path="price">
          <NInputNumber v-model:value="model.price" placeholder="请输入订单金额" />
        </NFormItem>
        <NFormItem label="优惠金额" path="unPrice">
          <NInputNumber v-model:value="model.unPrice" placeholder="请输入优惠金额" />
        </NFormItem>
        <NFormItem label="订单状态" path="status">
          <NSelect
            v-model:value="model.status"
            :options="[
              { label: '进行中', value: '0' },
              { label: '已结算', value: '1' }
            ]"
            placeholder="请选择订单状态"
          />
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
