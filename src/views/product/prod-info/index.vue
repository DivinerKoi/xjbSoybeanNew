<script setup lang="tsx">
import { ref, watch } from 'vue';
import { NButton, NPopconfirm, NTag } from 'naive-ui';
import { useAppStore } from '@/store/modules/app';
import { useTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import { enableStatusRecord } from '@/constants/business';
import { fetchDeleteProdInfo, fetchGetProdInfo, fetchGetProdInfoList } from '@/service/api/product/prodInfo';
import { useShopList } from '@/hooks/business/useShopList';
import ProdCategorySelect from '@/components/business/prod-category-select.vue';
import TableImage from '@/components/common/table-image.vue';
import RichTextModal from '@/components/business/rich-text-modal.vue';
import { useShopStore } from '@/store/modules/shop';
import ProdOperateDrawer from './modules/prod-operate-drawer.vue';
import ProdSearch from './modules/prod-search.vue';
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
  // resetSearchParams
} = useTable({
  apiFn: fetchGetProdInfoList,
  immediate: false,
  apiParams: {
    pageNum: 1,
    pageSize: 10,
    shopId: shopStore.localShopId,
    prodName: null,
    price: null,
    brief: null,
    categoryId: null
  },
  showTotal: true,
  columns: () => [
    {
      type: 'selection',
      align: 'center',
      width: 48
    },
    {
      key: 'images',
      title: '商品图片',
      align: 'center',
      render: row => <TableImage imgs={row.images} />
    },
    {
      key: 'prodName',
      title: '名称',
      align: 'center',
      minWidth: 120
    },
    {
      key: 'price',
      title: '价格 | 原价',
      align: 'center',
      minWidth: 120,
      render: row => (
        <div>
          <span class="mr-4px text-primary">{row.price}元</span>
          <span>/ </span>
          <span class="text-gray-400 line-through">{row.unPrice}元 </span>
        </div>
      )
    },
    {
      key: 'brief',
      title: '简单描述',
      align: 'center'
    },
    {
      key: 'context',
      title: '简介',
      align: 'center',
      render: row => {
        return (
          <div
            class="cursor-pointer text-primary hover:underline"
            onClick={() => {
              showRichText(row.context);
            }}
          >
            点击查看
          </div>
        );
      }
    },
    {
      key: 'status',
      title: '状态',
      align: 'center',
      width: 120,
      render: (row: Api.Product.ProductInfo) => {
        const tagMap: Record<Api.Common.EnableStatus, NaiveUI.ThemeColor> = {
          '1': 'success',
          '0': 'warning'
        };
        const label = $t(enableStatusRecord[row.status]);
        return <NTag type={tagMap[row.status]}>{label}</NTag>;
      }
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 130,
      render: row => (
        <div class="flex-center gap-8px">
          <NButton type="primary" ghost size="small" onClick={() => edit(row.prodId)}>
            {$t('common.edit')}
          </NButton>
          <NPopconfirm onPositiveClick={() => handleDelete(row.prodId)}>
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
  handleEdit,
  // handleSimpleEdit,
  checkedRowKeys,
  onBatchDeleted,
  onDeleted
  // closeDrawer
} = useTableOperate(data, getData);

watch(
  () => shopStore.localShopId,
  val => {
    searchParams.shopId = val;
    getDataByPage();
  }
);

const richTextVisible = ref<boolean>(false);
const richText = ref<string>('');
function showRichText(context: string) {
  richText.value = context;
  richTextVisible.value = true;
}
// 批量删除
async function handleBatchDelete() {
  const { error } = await fetchDeleteProdInfo(checkedRowKeys.value);
  if (!error) {
    await onBatchDeleted();
  }
}

async function handleDelete(id: number) {
  const { error } = await fetchDeleteProdInfo([String(id)]);
  if (!error) {
    await onDeleted();
  }
}
async function edit(prodId: number) {
  const { data: info, error } = await fetchGetProdInfo(prodId);
  if (!error) {
    editingData.value = info;
    handleEdit();
  }
}
function resetOtherParams() {
  searchParams.prodName = null;
  searchParams.price = null;
  searchParams.brief = null;
  getData();
}
</script>

<template>
  <div class="flex gap-16px overflow-hidden">
    <div class="w-176px flex-shrink-0">
      <ProdCategorySelect v-model="searchParams.categoryId" @select="resetOtherParams" />
    </div>
    <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
      <ProdSearch v-model:model="searchParams" @reset="resetOtherParams" @search="getDataByPage"></ProdSearch>
      <NCard title="商品列表" :bordered="false" size="small" class="sm:flex-1-hidden card-wrapper">
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
          :row-key="(row: any) => row.prodId"
          :pagination="mobilePagination"
          class="sm:h-full"
        />
        <ProdOperateDrawer
          v-model:visible="drawerVisible"
          :operate-type="operateType"
          :row-data="editingData"
          @submitted="getDataByPage"
        />
        <RichTextModal v-model:visible="richTextVisible" :content="richText" title="商品简介"></RichTextModal>
      </NCard>
    </div>
  </div>
</template>

<style scoped></style>
