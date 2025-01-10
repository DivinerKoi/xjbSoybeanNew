<script setup lang="tsx">
import { NButton, NImage, NImageGroup, NPopconfirm, NTag } from 'naive-ui';
import { ref } from 'vue';
import { useAppStore } from '@/store/modules/app';
import { useTable, useTableOperate } from '@/hooks/common/table';
import { fetchDeleteShop, fetchGetShopList } from '@/service/api/shop';
import RoomPublic from '@/views/room/modules/roomPublic.vue';
import ShopOperateDrawer from './modules/shop-operateDrawer.vue';
import ShopSearch from './modules/shop-search.vue';

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
  apiFn: fetchGetShopList,
  apiParams: {
    pageNum: 1,
    pageSize: 10,
    name: null,
    status: null
  },
  columns: () => [
    {
      type: 'selection',
      align: 'center',
      width: 48
    },
    {
      key: 'name',
      title: '商户名称',
      align: 'center',
      minWidth: 120
    },
    {
      key: 'img',
      title: '店铺图片',
      align: 'center',
      render: (row: Api.Shop.Shop) => (
        <NImageGroup>
          <NImage width="80" height="80" src={row.img} />
        </NImageGroup>
      )
    },
    {
      key: 'address',
      title: '地址',
      align: 'center',
      minWidth: 180
    },
    {
      key: 'bossName',
      title: '门店联系人',
      align: 'center',
      minWidth: 100
    },
    {
      key: 'phone',
      title: '联系电话',
      align: 'center',
      minWidth: 120
    },
    {
      key: 'status',
      title: '状态',
      align: 'center',
      width: 100,
      render: row => <NTag type={row.status === 0 ? 'success' : 'error'}>{row.status === 0 ? '开启' : '关闭'}</NTag>
    },
    {
      key: 'businessHours',
      title: '营业时间',
      align: 'center',
      minWidth: 120
    },
    {
      key: 'operate',
      title: '操作',
      align: 'center',
      width: 200,
      render: (row: Api.Shop.Shop) => (
        <div class="flex-center gap-8px">
          <NButton type="primary" ghost size="small" onClick={() => handleConnect(row.shopId)}>
            关联包厢
          </NButton>
          <NButton type="primary" ghost size="small" onClick={() => edit(row.shopId)}>
            编辑
          </NButton>
          <NPopconfirm onPositiveClick={() => handleDelete(row.shopId)}>
            {{
              default: () => '确认删除？',
              trigger: () => (
                <NButton type="error" ghost size="small">
                  删除
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
  checkedRowKeys,
  onBatchDeleted,
  onDeleted
} = useTableOperate(data, getData, 'shopId');

const shopId = ref<number>();
const openRoom = ref(false);
/** 关联包厢 */
function handleConnect(id: number) {
  openRoom.value = true;
  shopId.value = id;
}

async function handleBatchDelete() {
  const { error } = await fetchDeleteShop(checkedRowKeys.value);
  if (!error) {
    await onBatchDeleted();
  }
}

const handleReset = async () => {
  await resetSearchParams();
  await getDataByPage();
};

async function handleDelete(id: number) {
  const { error } = await fetchDeleteShop([id.toString()]);
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
    <ShopSearch v-model:model="searchParams" @reset="handleReset" @search="getDataByPage" />

    <NCard title="门店管理" :bordered="false" size="small" class="sm:flex-1-hidden card-wrapper">
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
        :scroll-x="800"
        :loading="loading"
        remote
        :row-key="(row: any) => row.shopId"
        :pagination="mobilePagination"
        class="sm:h-full"
      />

      <ShopOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getDataByPage"
      />

      <NModal v-model:show="openRoom" title="关联包厢" preset="card" class="w-1000px">
        <RoomPublic type="2" :shop-id="shopId" />
      </NModal>
    </NCard>
  </div>
</template>

<style scoped></style>
