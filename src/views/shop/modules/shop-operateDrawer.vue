<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import { fetchAddShop, fetchEditShop } from '@/service/api/shop';
import Location from '@/components/common/map-search.vue';
import TimePicker from '@/components/common/time-picker.vue';
const showMapSearch = ref(false);

defineOptions({
  name: 'ShopOperateDrawer'
});

interface Props {
  operateType: NaiveUI.TableOperateType;
  rowData?: Api.Shop.Shop | null;
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
    add: '添加门店',
    edit: '修改门店'
  };
  return titles[props.operateType];
});

const model = reactive<Api.Shop.ShopAdd>(createDefaultModel());
function createDefaultModel(): Api.Shop.ShopAdd {
  return {
    name: '',
    img: '',
    address: '',
    lngLat: '',
    bossName: '',
    phone: '',
    sort: 0,
    status: 0,
    businessHours: '08:00-22:00'
  };
}
const rules = {
  name: defaultRequiredRule,
  img: defaultRequiredRule,
  address: defaultRequiredRule,
  bossName: defaultRequiredRule,
  phone: defaultRequiredRule
};

function handleInitModel() {
  Object.assign(model, createDefaultModel());
  if (props.operateType === 'edit' && props.rowData) {
    const { name, img, address, lngLat, bossName, phone, sort, status, businessHours } = props.rowData;
    Object.assign(model, { name, img, address, lngLat, bossName, phone, sort, status, businessHours });
  }
}

function closeDrawer() {
  visible.value = false;
}

const loading = ref(false);

async function handleSubmit() {
  console.log(model)
  loading.value = true;
  try {
    await validate();
    if (!model.lngLat) {
      window.$message?.error('请选择地址位置');
      return;
    }
    if (props.operateType === 'edit') {
      const editData = {
        ...model,
        shopId: props.rowData!.shopId
      };
      const { error } = await fetchEditShop(editData);
      if (!error) {
        window.$message?.success($t('common.updateSuccess'));
        closeDrawer();
      }
    } else {
      const { error } = await fetchAddShop(model);
      if (!error) {
        window.$message?.success($t('common.addSuccess'));
        closeDrawer();
      }
    }
    emit('submitted');
  } finally {
    loading.value = false;
  }
}

watch(visible, () => {
  if (visible.value) {
    handleInitModel();
    restoreValidation();
  }
});

function handleLocationSelect(location: { address: string; longitude: number; latitude: number }) {
  model.lngLat = `${location.longitude},${location.latitude}`;
  if (!/^-?\d+\.?\d*,\s*-?\d+\.?\d*$/.test(location.address)) {
    model.address = location.address;
  }
}

function handleAddressChange() {
  model.lngLat = '';
}
</script>

<template>
  <NModal v-model:show="visible" :title="title" preset="card" style="width: 600px">
    <NScrollbar class="pr-20px">
      <NForm ref="formRef" :model="model" :rules="rules" label-placement="left" :label-width="100">
        <NFormItem label="店铺图片" path="img">
          <ImageUpload v-model="model.img" :max-count="5" />
        </NFormItem>
        <NFormItem label="商户名称" path="name">
          <NInput v-model:value="model.name" placeholder="请输入商户名称" />
        </NFormItem>
        <NFormItem label="地址" path="address">
          <NInputGroup>
            <NInput v-model:value="model.address" placeholder="请输入地址" @update:value="handleAddressChange" />
            <NButton @click="showMapSearch = true">选择位置</NButton>
          </NInputGroup>
        </NFormItem>
        <NFormItem label="门店联系人" path="bossName">
          <NInput v-model:value="model.bossName" placeholder="请输入门店联系人" />
        </NFormItem>
        <NFormItem label="联系电话" path="phone">
          <NInput v-model:value="model.phone" placeholder="请输入联系电话" />
        </NFormItem>
        <NFormItem label="排序" path="sort">
          <NInputNumber v-model:value="model.sort" placeholder="请输入排序号" />
        </NFormItem>
        <NFormItem label="状态" path="status">
          <NSelect
            v-model:value="model.status"
            :options="[
              { label: '开启', value: 0 },
              { label: '关闭', value: 1 }
            ]"
            placeholder="请选择状态"
          />
        </NFormItem>
        <NFormItem label="营业时间" path="businessHours">
          <TimePicker v-model="model.businessHours" />
        </NFormItem>
      </NForm>
    </NScrollbar>
    <template #footer>
      <NSpace justify="end" :size="16">
        <NButton @click="closeDrawer">{{ $t('common.cancel') }}</NButton>
        <NButton type="primary" :loading="loading" @click="handleSubmit">
          {{ $t('common.confirm') }}
        </NButton>
      </NSpace>
    </template>
    <Location v-model:visible="showMapSearch" @confirm="handleLocationSelect" />
  </NModal>
</template>

<style scoped></style>
