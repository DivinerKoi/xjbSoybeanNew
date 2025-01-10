<script setup lang="tsx">
import { NButton, NPopconfirm, NTag } from 'naive-ui';
import { computed } from 'vue';
import { useAppStore } from '@/store/modules/app';
import { useTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import { specialEnableStatusRecord } from '@/constants/business';
import { fetchDeleteDept, fetchGetDeptList } from '@/service/api/system/dept';
import { handleTree } from '@/utils/ruoyi';
import DeptOperateModal from './modules/dept-operate-modal.vue';
import DeptSearch from './modules/dept-search.vue';

const appStore = useAppStore();

const {
  columns,
  columnChecks,
  data,
  loading,
  getData,
  getDataByPage,
  // mobilePagination,
  searchParams,
  resetSearchParams
} = useTable({
  apiFn: fetchGetDeptList,
  apiParams: {
    deptName: null,
    status: null
  },
  columns: () => [
    {
      key: 'deptName',
      title: '部门名称',
      align: 'center'
    },
    {
      key: 'orderNum',
      title: '显示顺序',
      align: 'center'
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
      title: '创建时间'
      // minWidth: 120
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      // width: 180,
      render: row => (
        <div class="flex-center gap-8px">
          <NButton type="primary" ghost size="small" onClick={() => edit(row.deptId)}>
            {$t('common.edit')}
          </NButton>
          <NButton type="primary" ghost size="small" onClick={() => add(row)}>
            {$t('common.add')}
          </NButton>
          <NPopconfirm onPositiveClick={() => handleDelete(row.deptId)}>
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
  // handleAdd,
  handleSimpleEdit,
  // handleEdit,
  checkedRowKeys,
  onBatchDeleted,
  onDeleted
  // closeDrawer
} = useTableOperate(data, getData, 'deptId');

// 计算树形
const treeData = computed(() => {
  return handleTree(data.value, 'deptId');
});

// 更新部门信息
function updateDept() {
  window.$message?.warning('TODO: 更新部门信息');
}
// 批量删除
async function handleBatchDelete() {
  const { error } = await fetchDeleteDept(checkedRowKeys.value);
  if (!error) {
    await onBatchDeleted();
  }
}

async function handleDelete(id: string) {
  const { error } = await fetchDeleteDept([id]);
  if (!error) {
    await onDeleted();
  }
}

async function edit(deptId: string) {
  handleSimpleEdit(deptId);
}
function add(row: any) {
  operateType.value = 'add';
  drawerVisible.value = true;
  editingData.value = row;
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <DeptSearch v-model:model="searchParams" @reset="resetSearchParams" @search="getDataByPage" />
    <NCard title="部门列表" :bordered="false" size="small" class="sm:flex-1-hidden card-wrapper">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          @delete="handleBatchDelete"
          @refresh="getData"
        >
          <template #default>
            <NButton size="small" ghost type="primary" @click="updateDept">
              <template #icon>
                <icon-mdi-refresh class="text-icon" />
              </template>
              更新部门信息
            </NButton>
          </template>
        </TableHeaderOperation>
      </template>
      <NDataTable
        v-model:checked-row-keys="checkedRowKeys"
        :columns="columns"
        :data="treeData"
        size="small"
        :flex-height="!appStore.isMobile"
        :scroll-x="1088"
        :loading="loading"
        remote
        :row-key="(row: any) => row.deptId"
        class="sm:h-full"
      />
      <DeptOperateModal
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getDataByPage"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
