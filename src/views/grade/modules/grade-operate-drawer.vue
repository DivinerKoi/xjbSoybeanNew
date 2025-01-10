<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import { fetchAddGrade, fetchEditGrade } from '@/service/api/grade';
import { useShopStore } from '@/store/modules/shop';

defineOptions({
  name: 'GradeOperateDrawer'
});

interface Props {
  operateType: NaiveUI.TableOperateType;
  rowData?: Api.Grade.GradeInfo | null;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();
const shopStore = useShopStore();
const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, restoreValidation } = useNaiveForm();
const { defaultRequiredRule } = useFormRules();

const title = computed(() => {
  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: '添加等级权益',
    edit: '修改等级权益'
  };
  return titles[props.operateType];
});

type Model = Pick<
  Api.Grade.GradeInfo,
  'shopId' | 'gradeName' | 'pointsLowerBound' | 'pointsUpperBound' | 'originalPrice' | 'discountedPrice'
> & {
  benefitJson: NonNullable<Api.Grade.GradeInfo['benefitJson']>;
};

const model = ref(createDefaultModel());

const benefits = ref<Api.Grade.BenefitButton[]>([]);

function createDefaultModel(): Model {
  return {
    shopId: undefined,
    gradeName: '',
    pointsLowerBound: 0,
    pointsUpperBound: null,
    originalPrice: 0,
    discountedPrice: 0,
    benefitJson: ''
  };
}

function handleCreateButton() {
  const buttonItem: Api.Grade.BenefitButton = {
    name: '',
    desc: ''
  };
  return buttonItem;
}

const rules = {
  gradeName: defaultRequiredRule,
  pointsLowerBound: defaultRequiredRule,
  originalPrice: defaultRequiredRule,
  discountedPrice: defaultRequiredRule
};

function handleInitModel() {
  model.value = createDefaultModel();
  if (props.operateType === 'edit') {
    Object.assign(model.value, props.rowData);
    model.value.originalPrice = Number(model.value.originalPrice);
    model.value.discountedPrice = Number(model.value.discountedPrice);
  }
  try {
    benefits.value = JSON.parse(model.value.benefitJson);
  } catch {
    benefits.value = [];
  }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();
  model.value.shopId = shopStore.localShopId;
  model.value.benefitJson = JSON.stringify(benefits.value);
  if (props.operateType === 'edit') {
    const { error } = await fetchEditGrade(model);
    if (!error) {
      window.$message?.success($t('common.updateSuccess'));
      closeDrawer();
      emit('submitted');
    }
  } else {
    const { error } = await fetchAddGrade(model);
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

// watch(
//   benefits,
//   newVal => {
//     model.benefitJson = JSON.stringify(newVal);
//   },
//   { deep: true }
// );
</script>

<template>
  <NModal v-model:show="visible" :title="title" preset="card" class="w-800px">
    <NScrollbar class="h-680px pr-20px">
      <NForm ref="formRef" :model="model" :rules="rules" label-placement="left" :label-width="80">
        <NGrid responsive="screen" item-responsive>
          <NFormItemGi span="24 m:24" label="会员等级" path="gradeName">
            <NInput v-model:value="model.gradeName" placeholder="请输入等级名称" />
          </NFormItemGi>
          <NFormItemGi span="24 m:12" label="积分下限" path="pointsLowerBound">
            <NInputNumber v-model:value="model.pointsLowerBound" :min="0" placeholder="请输入积分下限" />
          </NFormItemGi>
          <NFormItemGi span="24 m:12" label="积分上限" path="pointsUpperBound">
            <NInputNumber
              v-model:value="model.pointsUpperBound"
              :min="model.pointsLowerBound || 0"
              placeholder="请输入积分上限(不填则无上限)"
              clearable
            />
          </NFormItemGi>
          <NFormItemGi span="24 m:12" label="折前价格" path="originalPrice">
            <NInputNumber v-model:value="model.originalPrice" :min="0" :precision="2" placeholder="请输入折前价格" />
          </NFormItemGi>
          <NFormItemGi span="24 m:12" label="折后价格" path="discountedPrice">
            <NInputNumber v-model:value="model.discountedPrice" :min="0" :precision="2" placeholder="请输入折后价格" />
          </NFormItemGi>
          <NFormItemGi span="24 m:24" label="其他权益">
            <NDynamicInput v-model:value="benefits" :on-create="handleCreateButton">
              <template #default="{ value }">
                <div class="ml-8px flex-y-center flex-1 gap-12px">
                  <NInput v-model:value="value.name" placeholder="请输入权益名称" class="flex-1" />
                  <NInput v-model:value="value.desc" placeholder="请输入权益描述" class="flex-1" />
                </div>
              </template>
              <template #action="{ index, create, remove }">
                <NSpace class="ml-12px">
                  <NButton size="medium" @click="() => create(index)">
                    <icon-ic-round-plus class="text-icon" />
                  </NButton>
                  <NButton size="medium" @click="() => remove(index)">
                    <icon-ic-round-remove class="text-icon" />
                  </NButton>
                </NSpace>
              </template>
            </NDynamicInput>
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
