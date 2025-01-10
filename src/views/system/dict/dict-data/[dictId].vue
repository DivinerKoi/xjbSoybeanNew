<script setup lang="tsx">
import { NButton, NPopconfirm, NTag } from 'naive-ui';

import { useRoute } from 'vue-router';
import { fetchDeleteDictData, fetchGetDict, fetchGetDictDataList } from '@/service/api/system/dict';
import { useAppStore } from '@/store/modules/app';
import { useTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import { specialEnableStatusRecord } from '@/constants/business';
import DataOperateDrawer from './modules/data-operate-drawer.vue';
import DataSearch from './modules/data-search.vue';

const appStore = useAppStore();
const route = useRoute();
const dictId = Number(route.params.dictId);

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
  apiFn: fetchGetDictDataList,
  apiParams: {
    pageNum: 1,
    pageSize: 10,
    status: null,
    dictLabel: null,
    dictType: null
  },
  immediate: false,
  columns: () => [
    {
      type: 'selection',
      align: 'center',
      width: 48
    },
    {
      key: 'dictCode',
      title: '字典编码',
      align: 'center'
    },
    {
      key: 'dictLabel',
      title: '字典标签',
      align: 'center'
    },
    {
      key: 'dictValue',
      title: '字典健值',
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
      key: 'remark',
      title: '备注',
      align: 'center'
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 130,
      render: row => (
        <div class="flex-center gap-8px">
          <NButton type="primary" ghost size="small" onClick={() => edit(row.dictCode)}>
            {$t('common.edit')}
          </NButton>
          <NPopconfirm onPositiveClick={() => handleDelete(row.dictCode)}>
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
  // handleEdit,
  handleSimpleEdit,
  checkedRowKeys,
  onBatchDeleted,
  onDeleted
  // closeDrawer
} = useTableOperate(data, getData);

// 查询字典详情
async function getDictInfo() {
  const { data: info, error } = await fetchGetDict(dictId);
  if (!error) {
    searchParams.dictType = info?.dictType;
    await getData();
  }
}

// 批量删除
async function handleBatchDelete() {
  const { error } = await fetchDeleteDictData(checkedRowKeys.value);
  if (!error) {
    await onBatchDeleted();
  }
}

async function handleDelete(id: string) {
  const { error } = await fetchDeleteDictData([id]);
  if (!error) {
    await onDeleted();
  }
}

async function edit(dictCode: string) {
  handleSimpleEdit(dictCode);
}
function init() {
  getDictInfo();
}
init();
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <DataSearch v-model:model="searchParams" @reset="resetSearchParams" @search="getDataByPage" />
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
      <DataOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getDataByPage"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
