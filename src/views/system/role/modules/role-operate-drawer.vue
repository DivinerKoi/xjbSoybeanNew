<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import { specialEnableStatusOptions } from '@/constants/business';
import { fetchAddRole, fetchEditRole } from '@/service/api/system/role';
import { type TreeMenuObj, fetchMenuTree, fetchRoleMenuTree } from '@/service/api/system/menu';

defineOptions({
  name: 'RoleOperateDrawer'
});

interface Props {
  /** the type of operation */
  operateType: NaiveUI.TableOperateType;
  /** the edit row data */
  rowData?: Api.SystemManage.Role | null;
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
    add: $t('page.manage.role.addRole'),
    edit: $t('page.manage.role.editRole')
  };
  return titles[props.operateType];
});

type Model = Pick<
  Api.SystemManage.Role,
  'roleId' | 'roleName' | 'roleKey' | 'status' | 'remark' | 'roleSort' | 'menuCheckStrictly' | 'menuIds'
>;

const model: Model = reactive(createDefaultModel());

function createDefaultModel(): Model {
  return {
    roleId: '',
    roleName: '',
    roleKey: '',
    remark: '',
    roleSort: 0,
    status: '0',
    menuCheckStrictly: true,
    menuIds: []
  };
}
const menuRef = ref();
const menuExpand = ref(false);
const menuNodeAll = ref(false);
// 菜单树
const menuOptions = ref<TreeMenuObj[]>([]);
const checkedKeys = ref<number[]>([]); // 选中节点的 key
const defaultCheckedKeys = ref<number[]>([]); // 默认选中节点

type RuleKey = Exclude<keyof Model, 'remark' | 'roleId' | 'menuCheckStrictly' | 'menuIds'>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  roleName: defaultRequiredRule,
  roleKey: defaultRequiredRule,
  status: defaultRequiredRule,
  roleSort: defaultRequiredRule
};

const roleId = computed(() => props.rowData?.roleId || -1);

function handleInitModel() {
  Object.assign(model, createDefaultModel());
  menuExpand.value = false;
  menuNodeAll.value = false;
  if (props.operateType === 'edit' && props.rowData) {
    Object.assign(model, props.rowData);
    getRoleMenuTreeselect();
  }
  if (props.operateType === 'add') {
    getMenuTree();
  }
}

/** 根据角色ID查询菜单树结构 */
async function getRoleMenuTreeselect() {
  const { data, error } = await fetchRoleMenuTree(String(roleId.value));
  if (!error) {
    menuOptions.value = data.menus;
    checkedKeys.value = data.checkedKeys;
  }
}
/** 查询菜单树 */
async function getMenuTree() {
  const { data, error } = await fetchMenuTree();
  if (!error) {
    menuOptions.value = data;
    checkedKeys.value = [];
  }
}

/** 树权限（全选/全不选） */
function handleCheckedTreeNodeAll(checked: boolean) {
  if (checked) {
    checkedKeys.value = menuOptions.value.map(node => node.id); // 获取所有节点的 key
  } else {
    checkedKeys.value = []; // 清空选中节点
  }
}
function updateCheckedKeys(keys: number[]) {
  checkedKeys.value = keys;
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();
  model.menuIds = checkedKeys.value;
  // request
  if (props.operateType === 'edit') {
    const { error } = await fetchEditRole(model);
    if (!error) {
      window.$message?.success($t('common.updateSuccess'));
      closeDrawer();
    }
  } else {
    const { error } = await fetchAddRole(model);
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
        <NFormItem :label="$t('page.manage.role.roleName')" path="roleName">
          <NInput v-model:value="model.roleName" :placeholder="$t('page.manage.role.form.roleName')" />
        </NFormItem>
        <NFormItem label="权限字符" path="roleKey">
          <NInput v-model:value="model.roleKey" placeholder="请输入权限字符" />
        </NFormItem>
        <NFormItem span="24 m:12" label="显示排序" path="roleSort">
          <NInputNumber v-model:value="model.roleSort" class="w-full" placeholder="请输入显示排序" />
        </NFormItem>
        <NFormItem :label="$t('page.manage.role.roleStatus')" path="status">
          <NRadioGroup v-model:value="model.status">
            <NRadio
              v-for="item in specialEnableStatusOptions"
              :key="item.value"
              :value="item.value"
              :label="$t(item.label)"
            />
          </NRadioGroup>
        </NFormItem>
        <NFormItem :label="$t('page.manage.role.roleDesc')" path="remark">
          <NInput v-model:value="model.remark" :placeholder="$t('page.manage.role.form.roleDesc')" />
        </NFormItem>
        <NFormItem label="菜单权限">
          <NCheckbox v-model:checked="menuExpand">展开/折叠</NCheckbox>
          <NCheckbox v-model:checked="menuNodeAll" @update:checked="handleCheckedTreeNodeAll">全选/全不选</NCheckbox>
          <NCheckbox v-model:checked="model.menuCheckStrictly">父子联动</NCheckbox>
        </NFormItem>
        <NFormItem :show-label="false">
          <NTree
            ref="menuRef"
            block-line
            key-field="id"
            multiple
            :cascade="model.menuCheckStrictly"
            checkable
            :data="menuOptions"
            :checked-keys="checkedKeys"
            :default-expand-all="menuExpand"
            :default-checked-keys="defaultCheckedKeys"
            @update:checked-keys="updateCheckedKeys"
          />
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace :size="16">
          <NButton @click="closeDrawer">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped></style>
