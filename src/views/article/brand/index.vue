<script setup lang="tsx">
import { NButton, NPopconfirm } from 'naive-ui';
import { useAppStore } from '@/store/modules/app';
import { useTable, useTableOperate } from '@/hooks/common/table';
import TableImage from '@/components/common/table-image.vue';
import { $t } from '@/locales';
import { fetchDeleteBrand, fetchGetBrandList } from '@/service/api/article/brand';
import BrandOperateDrawer from './modules/brand-operate-drawer.vue';
import BrandSearch from './modules/brand-search.vue';

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
  apiFn: fetchGetBrandList,
  apiParams: {
    pageNum: 1,
    pageSize: 10,
    title: null,
    desc: null
  },
  showTotal: true,
  columns: () => [
    {
      type: 'selection',
      align: 'center',
      width: 48
    },
    {
      key: 'pic',
      title: '图片',
      align: 'center',
      width: 100,
      render: row => <TableImage imgs={row.pic} />
    },
    {
      key: 'title',
      title: '标题',
      align: 'center'
    },
    {
      key: 'desc',
      title: '描述',
      align: 'center'
    },
    {
      key: 'createTime',
      title: '创建时间',
      align: 'center'
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 130,
      render: row => (
        <div class="flex-center gap-8px">
          <NButton type="primary" ghost size="small" onClick={() => edit(row.id)}>
            {$t('common.edit')}
          </NButton>
          <NPopconfirm onPositiveClick={() => handleDelete(row.id)}>
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
} = useTableOperate(data, getData, 'id');

// 批量删除
async function handleBatchDelete() {
  const { error } = await fetchDeleteBrand(checkedRowKeys.value.map(item => Number(item)));
  if (!error) {
    await onBatchDeleted();
  }
}

async function handleDelete(id: number) {
  const { error } = await fetchDeleteBrand([id]);
  if (!error) {
    await onDeleted();
  }
}
async function edit(id: number) {
  handleSimpleEdit(id);
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <BrandSearch v-model:model="searchParams" @reset="resetSearchParams" @search="getDataByPage" />
    <NCard title="品牌探寻列表" :bordered="false" size="small" class="sm:flex-1-hidden card-wrapper">
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
        :row-key="(row: any) => row.id"
        :pagination="mobilePagination"
        class="sm:h-full"
      />
      <BrandOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getDataByPage"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
