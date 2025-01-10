<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import { specialEnableStatusOptions, userGenderOptions } from '@/constants/business';
import {
  fetchAddUser,
  fetchEditUser,
  fetchGetDeptTree,
  fetchGetPostAndRoleList,
  fetchGetUser
} from '@/service/api/system/user';

defineOptions({
  name: 'UserOperateDrawer'
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
    add: $t('page.manage.user.addUser'),
    edit: $t('page.manage.user.editUser')
  };
  return titles[props.operateType];
});

// type Model = Pick<
//   Api.SystemManage.User,
//   'userName' | 'userGender' | 'nickName' | 'userPhone' | 'userEmail' | 'userRoles' | 'status'
// >;

const model: Api.SystemManage.User = reactive(createDefaultModel());

function createDefaultModel(): Api.SystemManage.User {
  return {
    userId: '',
    deptId: undefined,
    userName: undefined,
    nickName: undefined,
    password: undefined,
    phonenumber: undefined,
    email: undefined,
    sex: undefined,
    status: '0',
    remark: undefined,
    postIds: [],
    roleIds: []
  };
}

type RuleKey = 'nickName' | 'userName' | 'password' | 'status';

const rules: Record<RuleKey, App.Global.FormRule> = {
  nickName: defaultRequiredRule,
  userName: defaultRequiredRule,
  password: defaultRequiredRule,
  status: defaultRequiredRule
};

/** the enabled role options */
// const roleOptions = ref<CommonType.Option<string>[]>([]);
const deptOptions = ref<Api.SystemManage.Dept[]>([]);
const postOptions = ref<Api.SystemManage.Post[]>([]);
const roleOptions = ref<Api.SystemManage.Role[]>([]);

// 获取角色和岗位列表
async function getRolePost() {
  const { data, error } = await fetchGetPostAndRoleList();
  if (!error) {
    postOptions.value = data.posts;
    roleOptions.value = data.roles;
  }
}
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

  if (props.operateType === 'edit' && props.rowData) {
    Object.assign(model, props.rowData);
    // 拿用户id查询详情
    const { data, error } = await fetchGetUser(props.rowData.userId);
    if (!error) {
      const { postIds, roleIds, user } = data;
      Object.assign(model, user);
      model.postIds = postIds;
      model.roleIds = roleIds;
    }
  }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  try {
    await validate();
    const isAdd = props.operateType === 'add';
    const { error } = isAdd ? await fetchAddUser(model) : await fetchEditUser(model);
    if (error) {
      window.$message?.error('操作失败');
      return;
    }
    window.$message?.success($t(isAdd ? 'common.addSuccess' : 'common.updateSuccess'));
    closeDrawer();
    emit('submitted');
  } catch (e) {
    window.$message?.error(`操作失败${e}`);
  }
}

watch(visible, () => {
  if (visible.value) {
    handleInitModel();
    restoreValidation();
    // getRoleOptions();
    getDeptTree();
    getRolePost();
  }
});
</script>

<template>
  <NModal v-model:show="visible" :title="title" preset="card" class="w-800px">
    <NScrollbar class="h-480px pr-20px">
      <NForm ref="formRef" :model="model" :rules="rules" label-placement="left" :label-width="100">
        <NGrid responsive="screen" item-responsive>
          <NFormItemGi span="24 m:12" :label="$t('page.manage.user.nickName')" path="nickName">
            <NInput v-model:value="model.nickName" :placeholder="$t('page.manage.user.form.nickName')" />
          </NFormItemGi>
          <NFormItemGi span="24 m:12" label="归属部门" path="deptId">
            <NTreeSelect
              :options="deptOptions"
              :default-value="model.deptId"
              key-field="id"
              @update:value="deptClick"
            ></NTreeSelect>
          </NFormItemGi>
          <NFormItemGi span="24 m:12" :label="$t('page.manage.user.userPhone')" path="phonenumber">
            <NInput v-model:value="model.phonenumber" :placeholder="$t('page.manage.user.form.userPhone')" />
          </NFormItemGi>
          <NFormItemGi span="24 m:12" :label="$t('page.manage.user.userEmail')" path="email">
            <NInput v-model:value="model.email" :placeholder="$t('page.manage.user.form.userEmail')" />
          </NFormItemGi>
          <NFormItemGi
            v-if="props.operateType === 'add'"
            span="24 m:12"
            :label="$t('page.manage.user.userName')"
            path="userName"
          >
            <NInput v-model:value="model.userName" :placeholder="$t('page.manage.user.form.userName')" />
          </NFormItemGi>
          <NFormItemGi v-if="props.operateType === 'add'" span="24 m:12" label="用户密码" path="password">
            <NInput
              v-model:value="model.password"
              type="password"
              show-password-on="mousedown"
              placeholder="请输入用户密码"
            />
          </NFormItemGi>
          <NFormItemGi span="24 m:12" :label="$t('page.manage.user.userGender')" path="sex">
            <NRadioGroup v-model:value="model.sex">
              <NRadio v-for="item in userGenderOptions" :key="item.value" :value="item.value" :label="$t(item.label)" />
            </NRadioGroup>
          </NFormItemGi>
          <NFormItemGi span="24 m:12" :label="$t('page.manage.user.userStatus')" path="status">
            <NRadioGroup v-model:value="model.status">
              <NRadio
                v-for="item in specialEnableStatusOptions"
                :key="item.value"
                :value="item.value"
                :label="$t(item.label)"
              />
            </NRadioGroup>
          </NFormItemGi>
          <NFormItemGi span="24 m:12" label="岗位" path="postIds">
            <NSelect
              v-model:value="model.postIds"
              label-field="postName"
              value-field="postId"
              multiple
              :options="postOptions"
              placeholder="请选择岗位"
            />
          </NFormItemGi>
          <NFormItemGi span="24 m:12" :label="$t('page.manage.user.userRole')" path="roleIds">
            <NSelect
              v-model:value="model.roleIds"
              label-field="roleName"
              value-field="roleId"
              multiple
              :options="roleOptions"
              :placeholder="$t('page.manage.user.form.userRole')"
            />
          </NFormItemGi>
          <NFormItemGi span="24 m:24" label="备注" path="remark">
            <NInput v-model:value="model.remark" type="textarea" placeholder="请输入内容" />
          </NFormItemGi>
        </NGrid>
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
