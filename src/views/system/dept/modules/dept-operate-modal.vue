<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import { specialEnableStatusOptions } from '@/constants/business';
import { fetchGetDeptTree } from '@/service/api/system/user';
import { fetchAddDept, fetchEditDept } from '@/service/api/system/dept';

defineOptions({
  name: 'DeptOperateModal'
});

interface Props {
  /** the type of operation */
  operateType: NaiveUI.TableOperateType;
  /** the edit row data */
  rowData?: Api.SystemManage.User | null;
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
    add: '新增部门',
    edit: '编辑部门'
  };
  return titles[props.operateType];
});

// type Model = Pick<
//   Api.SystemManage.User,
//   'userName' | 'userGender' | 'nickName' | 'userPhone' | 'userEmail' | 'userRoles' | 'status'
// >;

const model: Api.SystemManage.Dept = reactive(createDefaultModel());

function createDefaultModel(): Api.SystemManage.Dept {
  return {
    deptId: '',
    parentId: undefined,
    deptName: undefined,
    orderNum: undefined,
    leader: undefined,
    phone: undefined,
    email: undefined,
    status: '0'
  };
}

type RuleKey = 'deptName' | 'orderNum' | 'status';

const rules: Record<RuleKey, App.Global.FormRule> = {
  deptName: defaultRequiredRule,
  orderNum: defaultRequiredRule,
  status: defaultRequiredRule
};

/** the enabled role options */
// const roleOptions = ref<CommonType.Option<string>[]>([]);
const deptOptions = ref<Api.SystemManage.Dept[]>([]);

/** 获取部门树列表 */
async function getDeptTree() {
  const { data, error } = await fetchGetDeptTree();
  if (!error) {
    deptOptions.value = data;
  }
}
function deptClick(value: string) {
  model.deptId = value;
}
// async function getRoleOptions() {
//   const { error, data } = await fetchGetAllRoles();
//
//   if (!error) {
//     const options = data.map(item => ({
//       label: item.roleName,
//       value: item.roleCode
//     }));
//
//     // the mock data does not have the roleCode, so fill it
//     // if the real request, remove the following code
//     const userRoleOptions = model.userRoles.map(item => ({
//       label: item,
//       value: item
//     }));
//     // end
//
//     roleOptions.value = [...userRoleOptions, ...options];
//   }
// }

async function handleInitModel() {
  Object.assign(model, createDefaultModel());

  if (props.operateType === 'add' && props.rowData) {
    model.parentId = props.rowData.deptId;
  }
  if (props.operateType === 'edit' && props.rowData) {
    Object.assign(model, props.rowData);
  }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();
  const isAdd = props.operateType === 'add';
  const { error } = isAdd ? await fetchAddDept(model) : await fetchEditDept(model);
  if (error) {
    window.$message?.error('操作失败');
    return;
  }
  window.$message?.success($t(isAdd ? 'common.addSuccess' : 'common.updateSuccess'));
  closeDrawer();
  emit('submitted');
}

watch(visible, () => {
  if (visible.value) {
    handleInitModel();
    restoreValidation();
    getDeptTree();
  }
});
</script>

<template>
  <NModal v-model:show="visible" :title="title" preset="card" class="w-800px">
    <NScrollbar class="h-480px pr-20px">
      <NForm ref="formRef" :model="model" :rules="rules" label-placement="left" :label-width="100">
        <NGrid responsive="screen" item-responsive>
          <NFormItemGi span="24 m:24" label="上级部门" path="parentId">
            <NTreeSelect
              :options="deptOptions"
              :default-value="model.parentId"
              key-field="id"
              @update:value="deptClick"
            ></NTreeSelect>
          </NFormItemGi>
          <NFormItemGi span="24 m:12" label="部门名称" path="deptName">
            <NInput v-model:value="model.deptName" placeholder="请输入部门名称" />
          </NFormItemGi>
          <NFormItemGi span="24 m:12" label="负责人" path="leader">
            <NInput v-model:value="model.leader" placeholder="请输入负责人姓名" />
          </NFormItemGi>
          <NFormItemGi span="24 m:12" label="联系电话" path="phone">
            <NInput v-model:value="model.phone" placeholder="请输入联系电话" />
          </NFormItemGi>
          <NFormItemGi span="24 m:12" label="邮箱" path="email">
            <NInput v-model:value="model.email" :placeholder="$t('page.manage.user.form.userEmail')" />
          </NFormItemGi>
          <NFormItemGi span="24 m:12" :label="$t('page.manage.menu.order')" path="orderNum">
            <NInputNumber
              v-model:value="model.orderNum"
              class="w-full"
              :placeholder="$t('page.manage.menu.form.order')"
            />
          </NFormItemGi>
          <NFormItemGi span="24 m:12" label="部门状态" path="status">
            <NRadioGroup v-model:value="model.status">
              <NRadio
                v-for="item in specialEnableStatusOptions"
                :key="item.value"
                :value="item.value"
                :label="$t(item.label)"
              />
            </NRadioGroup>
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

<style scoped></style>
