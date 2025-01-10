<script setup lang="tsx">
import { NButton, NPopconfirm, NTag } from 'naive-ui';
import { ref } from 'vue';
import { fetchDeleteUser, fetchGetDeptTree, fetchGetUserList } from '@/service/api/system/user';
import { $t } from '@/locales';
import { useAppStore } from '@/store/modules/app';
import { specialEnableStatusRecord } from '@/constants/business';
import { useTable, useTableOperate } from '@/hooks/common/table';
import UserOperateModal from './modules/user-operate-modal.vue';
import UserSearch from './modules/user-search.vue';

const appStore = useAppStore();

/** 编辑中数据 */
// const editingData: Ref<Api.SystemManage.User | null> = ref(null);

/** 部门树列表 */
const deptOptions = ref<Api.SystemManage.Dept[]>([]);
// 获取部门树列表
async function getDeptTree() {
  const { data, error } = await fetchGetDeptTree();
  if (!error) {
    deptOptions.value = data;
  }
}

// nodeProps: ({ option }: { option: TreeOption }) => {
//   return {
//     onClick() {
//       message.info(`[Click] ${option.label}`)
//     },
//   }
// }

const {
  columns,
  columnChecks,
  data,
  getData,
  getDataByPage,
  loading,
  mobilePagination,
  searchParams,
  resetSearchParams
} = useTable({
  apiFn: fetchGetUserList,
  showTotal: true,
  apiParams: {
    pageNum: 1,
    pageSize: 10,
    deptId: null,
    nickName: null,
    phonenumber: null,
    status: null
  },
  columns: () => [
    {
      type: 'selection',
      align: 'center',
      width: 48
    },
    {
      key: 'userId',
      title: '用户编号',
      align: 'center',
      width: 100
    },
    {
      key: 'userName',
      title: $t('page.manage.user.userName'),
      align: 'center',
      minWidth: 100
    },
    {
      key: 'nickName',
      title: $t('page.manage.user.nickName'),
      align: 'center',
      minWidth: 100
    },
    {
      key: 'dept',
      title: '部门',
      align: 'center',
      minWidth: 100,
      render: row => row.dept?.deptName || '-'
    },
    {
      key: 'phonenumber',
      title: $t('page.manage.user.userPhone'),
      align: 'center',
      width: 120
    },
    {
      key: 'status',
      title: $t('page.manage.user.userStatus'),
      align: 'center',
      width: 100,
      render: row => {
        if (row.status === null) {
          return null;
        }
        const tagMap: Record<Api.Common.SpecialEnableStatus, NaiveUI.ThemeColor> = {
          '0': 'success',
          '1': 'warning'
        };
        const label = $t(specialEnableStatusRecord[row.status]);
        return <NTag type={tagMap[row.status]}>{label}</NTag>;
      }
    },
    {
      key: 'createTime',
      title: '创建时间',
      align: 'center',
      minWidth: 120
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 130,
      render: row => (
        <div class="flex-center gap-8px">
          <NButton type="primary" ghost size="small" onClick={() => edit(row.userId)}>
            {$t('common.edit')}
          </NButton>
          <NPopconfirm onPositiveClick={() => handleDelete(row.userId)}>
            {{
              default: () => $t('common.confirmDelete'),
              trigger: () => (
                <NButton type="error" ghost size="small">
                  {$t('common.delete')}
                </NButton>
              )
            }}
          </NPopconfirm>
        </div>
      )
    }
  ]
});

const {
  drawerVisible,
  operateType,
  editingData,
  handleAdd,
  handleSimpleEdit,
  // handleEdit,
  checkedRowKeys,
  onBatchDeleted,
  onDeleted
  // closeDrawer
} = useTableOperate(data, getData, 'userId');
/** 选择部门 */
function handleSelectKeys(keys: Array<string>) {
  searchParams.deptId = keys[0];
  getDataByPage();
}
async function handleBatchDelete() {
  const { error } = await fetchDeleteUser(checkedRowKeys.value);
  if (!error) {
    onBatchDeleted();
  }
}

async function handleDelete(id: string) {
  const { error } = await fetchDeleteUser([id]);
  if (!error) {
    onDeleted();
  }
}
async function edit(userId: string) {
  handleSimpleEdit(userId);
}
async function init() {
  await getDeptTree();
}
init();
</script>

<template>
  <div class="flex">
    <NGrid :x-gap="8" :y-gap="8" item-responsive responsive="screen">
      <NGridItem span="5" class="flex-col">
        <NCard title="部门列表" class="sm:flex-1-hidden">
          <NTree
            block-line
            key-field="id"
            :data="deptOptions"
            default-expand-all
            @update-selected-keys="handleSelectKeys"
          />
        </NCard>
      </NGridItem>
      <NGridItem span="19">
        <div class="h-full flex-col-stretch gap-8px overflow-hidden lt-sm:overflow-auto">
          <UserSearch v-model:model="searchParams" @reset="resetSearchParams" @search="getDataByPage" />
          <NCard
            :title="$t('page.manage.user.title')"
            :bordered="false"
            size="small"
            class="sm:flex-1-hidden card-wrapper"
          >
            <template #header-extra>
              <TableHeaderOperation
                v-model:columns="columnChecks"
                :disabled-delete="checkedRowKeys.length === 0"
                :loading="loading"
                @add="handleAdd"
                @delete="handleBatchDelete"
                @refresh="getData"
              />
            </template>
            <NDataTable
              v-model:checked-row-keys="checkedRowKeys"
              :columns="columns"
              :data="data"
              size="small"
              :flex-height="!appStore.isMobile"
              :loading="loading"
              remote
              :row-key="(row: Api.SystemManage.User) => row.userId"
              :pagination="mobilePagination"
              class="sm:h-full"
            />
            <UserOperateModal
              v-model:visible="drawerVisible"
              :operate-type="operateType"
              :row-data="editingData"
              @submitted="getData"
            />
          </NCard>
        </div>
      </NGridItem>
    </NGrid>
  </div>
</template>

<style scoped></style>
