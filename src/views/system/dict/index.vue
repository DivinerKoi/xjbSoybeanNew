<script setup lang="tsx">
import { NButton, NPopconfirm, NTag } from 'naive-ui';
import { fetchDeleteDict, fetchGetDictList } from '@/service/api/system/dict';
import { useAppStore } from '@/store/modules/app';
import { useTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import { specialEnableStatusRecord } from '@/constants/business';
import DictOperateDrawer from './modules/dict-operate-drawer.vue';
import DictSearch from './modules/dict-search.vue';

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
  apiFn: fetchGetDictList,
  apiParams: {
    pageNum: 1,
    pageSize: 10,
    status: null,
    dictName: null,
    dictType: null
  },
  showTotal: true,
  columns: () => [
    {
      type: 'selection',
      align: 'center',
      width: 48
    },
    {
      key: 'dictName',
      title: '字典名称',
      align: 'center'
    },
    {
      key: 'dictType',
      title: '字典类型',
      align: 'center',
      render: row => {
        return (
          <router-link to={`/system/dict/dict-data/${row.dictId}`}>
            <span class="color-primary hover:underline">{row.dictType}</span>
          </router-link>
        );
      }
    },
    {
      key: 'remark',
      title: '备注',
      align: 'center'
    },
    {
      key: 'status',
      title: '状态',
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
              <NButton type="primary" ghost size="small" onClick={() => edit(row.dictId)}>
                {$t('common.edit')}
              </NButton>
              <NPopconfirm onPositiveClick={() => handleDelete(row.dictId)}>
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
  editingData,
  handleAdd,
  // handleEdit,
  handleSimpleEdit,
  checkedRowKeys,
  onBatchDeleted,
  onDeleted
  // closeDrawer
} = useTableOperate(data, getData, 'postId');

// 批量删除
async function handleBatchDelete() {
  const { error } = await fetchDeleteDict(checkedRowKeys.value);
  if (!error) {
    await onBatchDeleted();
  }
}

async function handleDelete(id: string) {
  const { error } = await fetchDeleteDict([id]);
  if (!error) {
    await onDeleted();
  }
}

async function edit(postId: string) {
  handleSimpleEdit(postId);
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <DictSearch v-model:model="searchParams" @reset="resetSearchParams" @search="getDataByPage" />
    <NCard title="字典列表" :bordered="false" size="small" class="sm:flex-1-hidden card-wrapper">
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
        :row-key="(row: Api.SystemManage.Dict) => row.dictId"
        :pagination="mobilePagination"
        class="sm:h-full"
      />
      <DictOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getDataByPage"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
