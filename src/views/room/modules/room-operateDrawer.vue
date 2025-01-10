<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import { fetchAddRoom, fetchEditRoom } from '@/service/api/room';
import { useShopStore } from '@/store/modules/shop';

defineOptions({
  name: 'RoomOperateDrawer'
});

interface Props {
  operateType: NaiveUI.TableOperateType;
  rowData?: Api.Room.Room | null;
  defaultShopId: number;
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
    add: '添加包厢',
    edit: '修改包厢'
  };
  return titles[props.operateType];
});

type Model = Omit<Api.Room.Room, 'roomId' | 'peopleNum'> & {
  peopleNumMin?: string | number;
  peopleNumMax?: string | number;
};

const model: Model = reactive(createDefaultModel());

function createDefaultModel(): Model {
  return {
    roomId: undefined,
    shopId: null,
    roomName: '',
    houseNum: '',
    houseImg: '',
    houseContext: '',
    peopleNumMin: '',
    peopleNumMax: '',
    minPrice: 0,
    maxPrice: undefined
  };
}

const rules = {
  shopId: createRequiredRule('请选择所属门店'),
  roomName: createRequiredRule('请输入包厢名称'),
  houseNum: createRequiredRule('请输入门牌号'),
  houseImg: createRequiredRule('请上传包厢图片'),
  houseContext: createRequiredRule('请输入包厢描述'),
  peopleNumMin: [
    { required: true, message: '请输入最低容纳人数' },
    {
      validator: (_rule: any, value: string) => {
        if (value && model.peopleNumMax && Number(value) > Number(model.peopleNumMax)) {
          return new Error('最低人数不能大于最高人数');
        }
        return true;
      },
      trigger: 'change'
    }
  ],
  peopleNumMax: [
    { required: true, message: '请输入最高容纳人数' },
    {
      validator: (_rule: any, value: string) => {
        if (value && model.peopleNumMin && Number(value) < Number(model.peopleNumMin)) {
          return new Error('最高人数不能小于最低人数');
        }
        return true;
      },
      trigger: 'change'
    }
  ],
  minPrice: createRequiredRule('请输入最低消费')
};

// 监听类型变化
watch(
  () => props.defaultShopId,
  newVal => {
    if (newVal) {
      model.shopId = newVal;
    }
  },
  { immediate: true }
);

function handleInitModel() {
  Object.assign(model, createDefaultModel());
  if (props.operateType === 'edit' && props.rowData) {
    const [min, max] = (props.rowData.peopleNum || '').split('~');
    Object.assign(model, {
      ...props.rowData,
      peopleNumMin: Number(min) || '',
      peopleNumMax: Number(max) || '',
      minPrice: Number(props.rowData.minPrice)
    });
  }
  if (props.defaultShopId) {
    model.shopId = props.defaultShopId;
  }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();
  const submitData = {
    ...model,
    peopleNum: `${model.peopleNumMin}~${model.peopleNumMax}`,
    shopId: shopStore.localShopId
  };

  delete submitData.peopleNumMin;
  delete submitData.peopleNumMax;

  if (props.operateType === 'edit') {
    const { error } = await fetchEditRoom(submitData);
    if (!error) {
      window.$message?.success($t('common.updateSuccess'));
      closeDrawer();
      emit('submitted');
    }
  } else {
    const { error } = await fetchAddRoom(submitData);
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
  <NModal v-model:show="visible" :title="title" preset="card" class="w-900px">
    <NScrollbar class="h-480px pr-20px">
      <NForm ref="formRef" :model="model" :rules="rules" label-placement="left" :label-width="100">
        <NGrid responsive="screen" item-responsive>
          <NFormItemGi span="24 m:24" label="包厢图片" path="houseImg">
            <ImageUpload v-model="model.houseImg" :max-count="5" />
          </NFormItemGi>
          <NFormItemGi span="24 m:12" label="包厢名称" path="roomName">
            <NInput v-model:value="model.roomName" placeholder="请输入包厢名称" />
          </NFormItemGi>
          <NFormItemGi span="24 m:12" label="门牌号" path="houseNum">
            <NInput v-model:value="model.houseNum" placeholder="请输入门牌号" />
          </NFormItemGi>
          <NFormItemGi span="24 m:12" label="最低消费" path="minPrice">
            <NInputNumber v-model:value="model.minPrice" :precision="2" placeholder="请输入最低消费" />
          </NFormItemGi>
          <!--          <NFormItemGi span="24 m:12" label="最高消费" path="maxPrice">-->
          <!--            <NInputNumber v-model:value="model.maxPrice" :precision="2" placeholder="请输入最高消费" />-->
          <!--          </NFormItemGi>-->
          <NFormItemGi span="24 m:12" label="容纳人数" path="peopleNumMin">
            <NFlex align="center" :wrap="false">
              <NInputNumber v-model:value="model.peopleNumMin" placeholder="最低人数" :min="1" class="!w-120px" />
              <div class="mx-2">至</div>
              <NInputNumber v-model:value="model.peopleNumMax" placeholder="最高人数" :min="1" class="!w-120px" />
              <span class="ml-2">人</span>
            </NFlex>
          </NFormItemGi>

          <NFormItemGi span="24 m:24" label="包厢描述" path="houseContext">
            <NInput v-model:value="model.houseContext" type="textarea" placeholder="请输入包厢描述" />
          </NFormItemGi>
        </NGrid>
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

<style scoped>
:deep(.n-input-number) {
  width: 120px !important;
}
</style>
