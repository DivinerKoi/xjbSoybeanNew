<script setup lang="tsx">
import { NButton, NPopconfirm, NTag } from 'naive-ui';
import type { Ref } from 'vue';
import { ref } from 'vue';
import { fetchDeleteRole, fetchGetRole, fetchGetRoleList } from '@/service/api/system/role';
import { useAppStore } from '@/store/modules/app';
import { useTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import { specialEnableStatusRecord } from '@/constants/business';
import RoleOperateDrawer from './modules/role-operate-drawer.vue';
import RoleSearch from './modules/role-search.vue';

const appStore = useAppStore();

const {
  columns,
  columnChecks,
  data,
  loading,
  getData,
  getDataByPage,
  mobilePagination,
  searchParams,
  resetSearchParams
} = useTable({
  apiFn: fetchGetRoleList,
  apiParams: {
    pageNum: 1,
    pageSize: 10,
    // if you want to use the searchParams in Form, you need to define the following properties, and the value is null
    // the value can not be undefined, otherwise the property in Form will not be reactive
    status: null,
    roleName: null,
    roleKey: null
  },
  showTotal: true,
  columns: () => [
    {
      type: 'selection',
      align: 'center',
      width: 48
    },
    {
      key: 'index',
      title: $t('common.index'),
      width: 64,
      align: 'center'
    },
    {
      key: 'roleName',
      title: $t('page.manage.role.roleName'),
      align: 'center',
      minWidth: 120
    },
    {
      key: 'roleKey',
      title: '权限字符',
      align: 'center',
      minWidth: 120
    },
    {
      key: 'roleSort',
      title: '显示顺序',
      align: 'center',
      minWidth: 60
    },
    {
      key: 'status',
      title: $t('page.manage.role.roleStatus'),
      align: 'center',
      width: 120,
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
      minWidth: 120
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 130,
      render: row => (
        <div class="flex-center gap-8px">
          {!row.admin && (
            <>
              <NButton type="primary" ghost size="small" onClick={() => edit(row.roleId)}>
                {$t('common.edit')}
              </NButton>
              <NPopconfirm onPositiveClick={() => handleDelete(row.roleId)}>
                {{
                  default: () => $t('common.confirmDelete'),
                  trigger: () => (
                    <NButton type="error" ghost size="small">
                      {$t('common.delete')}
                    </NButton>
                  )
                }}
              </NPopconfirm>
            </>
          )}
        </div>
      )
    }
  ]
});

const {
  drawerVisible,
  operateType,
  // editingData,
  handleAdd,
  handleEdit,
  checkedRowKeys,
  onBatchDeleted,
  onDeleted
  // closeDrawer
} = useTableOperate(data, getData);

// 批量删除
async function handleBatchDelete() {
  const { error } = await fetchDeleteRole(checkedRowKeys.value);
  if (!error) {
    await onBatchDeleted();
  }
}

async function handleDelete(id: string) {
  const { error } = await fetchDeleteRole([id]);
  if (!error) {
    await onDeleted();
  }
}

const editingData: Ref<Api.SystemManage.Role | null> = ref(null);

async function edit(roleId: number | string) {
  const { data: rowData, error } = await fetchGetRole(roleId);
  if (!error) {
    editingData.value = rowData;
    handleEdit();
  }
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <RoleSearch v-model:model="searchParams" @reset="resetSearchParams" @search="getDataByPage" />
    <NCard :title="$t('page.manage.role.title')" :bordered="false" size="small" class="sm:flex-1-hidden card-wrapper">
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
        :scroll-x="702"
        :loading="loading"
        remote
        :row-key="(row: any) => row.roleId"
        :pagination="mobilePagination"
        class="sm:h-full"
      />
      <RoleOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getDataByPage"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
