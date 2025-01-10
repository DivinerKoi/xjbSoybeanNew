<script setup lang="tsx">
import { NAvatar, NButton, NFlex, NPopconfirm, NTag } from 'naive-ui';
import { watch } from 'vue';
import dayjs from 'dayjs';
import { useAppStore } from '@/store/modules/app';
import { useTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import { fetchDeleteMember, fetchGetMemberList } from '@/service/api/member';
import { useShopStore } from '@/store/modules/shop';
import PriceText from '@/components/common/price-text.vue';
import MemberOperateModal from './modules/member-operate-modal.vue';
import MemberSearch from './modules/member-search.vue';

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
  apiFn: fetchGetMemberList,
  apiParams: {
    pageNum: 1,
    pageSize: 10,
    shopId: shopStore.localShopId,
    name: null,
    type: null
  },
  showTotal: true,
  columns: () => [
    {
      type: 'selection',
      align: 'center',
      width: 48
    },
    {
      key: 'avatar',
      title: '头像',
      align: 'center',
      width: 80,
      render: row => <NAvatar round size={40} src={row.avatar} />
    },
    {
      key: 'name',
      title: '会员名称',
      align: 'center',
      render: row => {
        let tagType: 'success' | 'error' | 'warning' = 'warning';
        let sexText = '未知';
        if (row.sex) {
          tagType = row.sex === '男' ? 'success' : 'error';
          sexText = row.sex;
        }
        return (
          <NFlex align="center" justify="center" class="gap-8px">
            <span>{row.name}</span>
            <NTag type={tagType} size="small">
              {sexText}
            </NTag>
          </NFlex>
        );
      }
    },
    {
      key: 'birthday',
      title: '生日',
      align: 'center',
      render: row => {
        return row.birthday ? dayjs(row.birthday).format('YYYY-MM-DD') : '-';
      }
    },
    {
      key: 'grade',
      title: '会员等级',
      align: 'center'
    },
    {
      key: 'type',
      title: '用户类型',
      align: 'center',
      render: row => {
        const typeMap = {
          1: { label: '会员', type: 'success' },
          2: { label: '服务员', type: 'warning' }
        } as const;
        return <NTag type={typeMap[row.type].type}>{typeMap[row.type].label}</NTag>;
      }
    },
    {
      key: 'usePrice',
      title: '总消费',
      align: 'center',
      render: row => <PriceText value={row.usePrice} size="small" />
    },
    {
      key: 'registartionTime',
      title: '注册时间',
      align: 'center',
      render: row => {
        return row.registartionTime ? dayjs(row.registartionTime).format('YYYY-MM-DD HH:mm:ss') : '-';
      }
    },
    {
      key: 'loginTime',
      title: '上次登录',
      align: 'center',
      render: row => {
        return row.loginTime ? dayjs(row.loginTime).format('YYYY-MM-DD HH:mm:ss') : '-';
      }
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 130,
      render: row => (
        <div class="flex-center gap-8px">
          <NButton type="primary" ghost size="small" onClick={() => edit(row.memberId)}>
            {$t('common.edit')}
          </NButton>
          <NPopconfirm onPositiveClick={() => handleDelete(row.memberId)}>
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
} = useTableOperate(data, getData, 'memberId');

async function handleBatchDelete() {
  const { error } = await fetchDeleteMember(checkedRowKeys.value.map(item => Number(item)));
  if (!error) {
    await onBatchDeleted();
  }
}

async function handleDelete(id: number) {
  const { error } = await fetchDeleteMember([id]);
  if (!error) {
    await onDeleted();
  }
}

async function edit(memberId: number) {
  handleSimpleEdit(memberId);
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
    <MemberSearch v-model:model="searchParams" @reset="handleReset" @search="getDataByPage" />
    <NCard title="会员列表" :bordered="false" size="small" class="sm:flex-1-hidden card-wrapper">
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
        :scroll-x="702"
        :loading="loading"
        remote
        :row-key="(row: any) => row.memberId"
        :pagination="mobilePagination"
        class="sm:h-full"
      />
      <MemberOperateModal
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getDataByPage"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
