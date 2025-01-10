<script setup lang="tsx">
import { NButton, NPopconfirm, NTag } from 'naive-ui';
import { watch } from 'vue';
import { useAppStore } from '@/store/modules/app';
import { useTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import { fetchDeleteGrade, fetchGetGradeList } from '@/service/api/grade';
import { useShopStore } from '@/store/modules/shop';
import PriceText from '@/components/common/price-text.vue';
import GradeOperateDrawer from './modules/grade-operate-drawer.vue';
import GradeSearch from './modules/grade-search.vue';

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
  apiFn: fetchGetGradeList,
  apiParams: {
    pageNum: 1,
    pageSize: 10,
    gradeName: null,
    shopId: null
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
      key: 'gradeName',
      title: '等级名称',
      align: 'center',
      minWidth: 120
    },
    {
      key: 'pointsLowerBound',
      title: '积分下限',
      align: 'center',
      minWidth: 120
    },
    {
      key: 'pointsUpperBound',
      title: '积分上限',
      align: 'center',
      minWidth: 120,
      render: row => row.pointsUpperBound || '无上限'
    },
    {
      key: 'memberCount',
      title: '会员数量',
      align: 'center',
      width: 100
    },
    {
      key: 'originalPrice',
      title: '折前价格',
      align: 'center',
      minWidth: 120,
      render: row => <PriceText value={row.originalPrice} size="small" />
    },
    {
      key: 'originalDuration',
      title: '折前时长',
      align: 'center',
      width: 100,
      render: row => `${row.originalDuration}小时`
    },
    {
      key: 'discountedPrice',
      title: '折后价格',
      align: 'center',
      minWidth: 120,
      render: row => <PriceText value={row.discountedPrice} size="small" />
    },
    {
      key: 'discountedDuration',
      title: '折后时长',
      align: 'center',
      width: 100,
      render: row => `${row.discountedDuration}小时`
    },
    {
      key: 'benefitJson',
      title: '其他权益',
      align: 'center',
      minWidth: 200,
      render: row => {
        try {
          const benefits = JSON.parse(row.benefitJson || '[]');
          return benefits.map((benefit: { name: string; desc: string }, index: number) => (
            <NTag key={index} class="mb-4px mr-8px">
              {benefit.name}
              {benefit.desc ? <span class="ml-4px text-12px">({benefit.desc})</span> : null}
            </NTag>
          ));
        } catch {
          return '-';
        }
      }
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
  handleSimpleEdit,
  checkedRowKeys,
  onBatchDeleted,
  onDeleted
} = useTableOperate(data, getData, 'id');

async function handleBatchDelete() {
  const { error } = await fetchDeleteGrade(checkedRowKeys.value);
  if (!error) {
    await onBatchDeleted();
  }
}

async function handleDelete(id: number) {
  const { error } = await fetchDeleteGrade([String(id)]);
  if (!error) {
    await onDeleted();
  }
}

async function edit(id: number) {
  handleSimpleEdit(id);
}
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
    getData();
  },
  { immediate: true }
);
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <GradeSearch v-model:model="searchParams" @reset="handleReset" @search="getDataByPage" />
    <NCard title="等级权益" :bordered="false" size="small" class="sm:flex-1-hidden card-wrapper">
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
      <GradeOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getDataByPage"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
