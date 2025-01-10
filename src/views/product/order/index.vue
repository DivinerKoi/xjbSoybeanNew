<script setup lang="tsx">
import { NButton, NPopconfirm, NTag } from 'naive-ui';
import { watch } from 'vue';
import { useTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import { fetchDeleteOrder, fetchGetOrderList } from '@/service/api/product/order';
import { useShopStore } from '@/store/modules/shop';
import { useAppStore } from '@/store/modules/app';
import OrderOperateDrawer from './modules/order-operate-drawer.vue';
import OrderSearch from './modules/order-search.vue';
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
  apiFn: fetchGetOrderList,
  apiParams: {
    pageNum: 1,
    pageSize: 10,
    shopId: null,
    orderNum: null,
    shopName: null,
    status: 0
  },
  immediate: false,
  showTotal: true,
  columns: () => [
    {
      type: 'selection',
      align: 'center',
      width: 48
    },
    {
      key: 'orderNum',
      title: '订单编号',
      align: 'center',
      minWidth: 160
    },
    {
      key: 'shopName',
      title: '商户名称',
      align: 'center',
      minWidth: 120
    },
    {
      key: 'roomName',
      title: '包间名称',
      align: 'center',
      minWidth: 120
    },
    {
      key: 'price',
      title: '订单金额 | 优惠金额',
      align: 'center',
      minWidth: 100,
      render: row => (
        <div>
          <span class="mr-4px text-primary">{row.price}元</span>
          <span> | </span>
          <span class="text-gray-400 line-through">{row.unPrice}元 </span>
        </div>
      )
    },
    {
      key: 'status',
      title: '订单状态',
      align: 'center',
      width: 100,
      render: row => {
        const tagMap: Record<Api.Common.EnableStatus, NaiveUI.ThemeColor> = {
          '0': 'warning',
          '1': 'success'
        };
        const statusMap = {
          '0': '进行中',
          '1': '已结算'
        };
        return <NTag type={tagMap[row.status]}>{statusMap[row.status]}</NTag>;
      }
    },
    {
      key: 'compTime',
      title: '结算时间',
      align: 'center',
      minWidth: 160,
      render: (row: Api.Order.OrderInfo) => {
        if (row.status === 0) {
          return <span class="text-gray">-</span>;
        }
        return row.compTime;
      }
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 150,
      render: row => (
        <div class="flex-center gap-8px">
          <NPopconfirm onPositiveClick={() => handleDelete(row.orderId)}>
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
  checkedRowKeys,
  onBatchDeleted,
  onDeleted
} = useTableOperate(data, getData, 'orderId');

async function handleBatchDelete() {
  const { error } = await fetchDeleteOrder(checkedRowKeys.value);
  if (!error) {
    await onBatchDeleted();
  }
}

async function handleDelete(id: number) {
  const { error } = await fetchDeleteOrder([String(id)]);
  if (!error) {
    await onDeleted();
  }
}

// async function edit(orderId: number) {
//   handleSimpleEdit(orderId);
// }
// 重置
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
  },
  { immediate: true }
);
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <OrderSearch v-model:model="searchParams" @reset="handleReset" @search="getDataByPage" />
    <NCard :bordered="false" size="small" class="sm:flex-1-hidden card-wrapper">
      <template #header>
        <NTabs v-model:value="searchParams.status" type="line" @update:value="getDataByPage">
          <NTab :name="0">进行中</NTab>
          <NTab :name="1">已结算</NTab>
        </NTabs>
      </template>
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          :show-add-btn="false"
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
        :scroll-x="1088"
        :loading="loading"
        remote
        :row-key="(row: any) => row.orderId"
        :pagination="mobilePagination"
        class="sm:h-full"
      />
      <OrderOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getDataByPage"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
