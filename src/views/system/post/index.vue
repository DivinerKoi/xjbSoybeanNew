<script setup lang="tsx">
import { NButton, NPopconfirm, NTag } from 'naive-ui';
import { fetchDeletePost, fetchGetPostList } from '@/service/api/system/post';
import { useAppStore } from '@/store/modules/app';
import { useTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import { specialEnableStatusRecord } from '@/constants/business';
import PostOperateDrawer from './modules/post-operate-drawer.vue';
import PostSearch from './modules/post-search.vue';

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
  apiFn: fetchGetPostList,
  apiParams: {
    pageNum: 1,
    pageSize: 10,
    status: null,
    postName: null,
    postCode: null
  },
  columns: () => [
    {
      type: 'selection',
      align: 'center',
      width: 48
    },
    {
      key: 'postCode',
      title: '岗位编码',
      align: 'center',
      minWidth: 120
    },
    {
      key: 'postName',
      title: '岗位名称',
      align: 'center',
      minWidth: 120
    },
    {
      key: 'postSort',
      title: '岗位排序',
      align: 'center',
      minWidth: 60
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
              <NButton type="primary" ghost size="small" onClick={() => edit(row.postId)}>
                {$t('common.edit')}
              </NButton>
              <NPopconfirm onPositiveClick={() => handleDelete(row.postId)}>
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
  const {error} = await fetchDeletePost(checkedRowKeys.value);
  if (!error) {
    await onBatchDeleted();
  }
}

async function handleDelete(id: string) {
  const {error} = await fetchDeletePost([id]);
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
    <PostSearch v-model:model="searchParams" @reset="resetSearchParams" @search="getDataByPage"/>
    <NCard title="岗位列表" :bordered="false" size="small" class="sm:flex-1-hidden card-wrapper">
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
        :row-key="(row: Api.SystemManage.Post) => row.postId"
        :pagination="mobilePagination"
        class="sm:h-full"
      />
      <PostOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getDataByPage"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
