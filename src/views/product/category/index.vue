<script setup lang="tsx">
import { NButton, NPopconfirm } from 'naive-ui';
import { watch } from 'vue';
import { useAppStore } from '@/store/modules/app';
import { useTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import { fetchDeleteProdCategory, fetchGetProdCategoryList } from '@/service/api/product/category';
import TableImage from '@/components/common/table-image.vue';
import { useShopStore } from '@/store/modules/shop';
import CategoryOperateDrawer from './modules/category-operate-drawer.vue';
import CategorySearch from './modules/category-search.vue';

const appStore = useAppStore();
const shopStore = useShopStore();

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
  apiFn: fetchGetProdCategoryList,
  apiParams: {
    pageNum: 1,
    pageSize: 10,
    shopId: shopStore.localShopId,
    categoryName: null
  },
  showTotal: true,
  columns: () => [
    {
      type: 'selection',
      align: 'center',
      width: 48
    },
    {
      key: 'categoryName',
      title: '分类名称',
      align: 'center',
      minWidth: 120,
      render: row => {
        return (
          <div class="flex-center gap-2">
            <i class={`iconfont ${row.icon}`} style="font-size: 24px;"></i>
            <span>{row.categoryName}</span>
          </div>
        );
      }
    },
    {
      key: 'pic',
      title: '分类图片',
      align: 'center',
      render: (row: any) => (row.pic ? <TableImage imgs={row.pic} /> : '/')
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 130,
      render: row => (
        <div class="flex-center gap-8px">
          <NButton type="primary" ghost size="small" onClick={() => edit(row?.categoryId)}>
            {$t('common.edit')}
          </NButton>
          <NPopconfirm onPositiveClick={() => handleDelete(row?.categoryId)}>
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
} = useTableOperate(data, getData, 'categoryId');

// 批量删除
async function handleBatchDelete() {
  const { error } = await fetchDeleteProdCategory(checkedRowKeys.value);
  if (!error) {
    await onBatchDeleted();
  }
}

async function handleDelete(id: number) {
  const { error } = await fetchDeleteProdCategory([String(id)]);
  if (!error) {
    await onDeleted();
  }
}
async function edit(categoryId: number) {
  handleSimpleEdit(categoryId);
}
function handleReset() {
  resetSearchParams();
  searchParams.shopId = shopStore.localShopId;
  getDataByPage();
}
watch(
  () => shopStore.localShopId,
  val => {
    searchParams.shopId = val;
    getDataByPage();
  }
);
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <CategorySearch v-model:model="searchParams" @reset="handleReset" @search="getDataByPage" />
    <NCard title="分类列表" :bordered="false" size="small" class="sm:flex-1-hidden card-wrapper">
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
        :row-key="(row: any) => row.categoryId"
        :pagination="mobilePagination"
        class="sm:h-full"
      />
      <CategoryOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getDataByPage"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
