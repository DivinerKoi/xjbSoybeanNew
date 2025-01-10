<script setup lang="tsx">
import { NButton, NPopconfirm, NTag } from 'naive-ui';
import dayjs from 'dayjs';
import { useRouter } from 'vue-router';
import { useAppStore } from '@/store/modules/app';
import { useTable, useTableOperate } from '@/hooks/common/table';
import { fetchDeletePreview, fetchGetPreview, fetchGetPreviewList, fetchWriteOff } from '@/service/api/preview';
import { $t } from '@/locales';
import { useShopStore } from '@/store/modules/shop';
import PreviewSearch from './modules/preview-search.vue';
const router = useRouter();
const appStore = useAppStore();
const shopStore = useShopStore();
const { currentShopId } = shopStore;
const statusMap = {
  '1': { label: '未核销', type: 'warning' },
  '2': { label: '进行中', type: 'success' },
  '3': { label: '已完成', type: 'info' },
  '4': { label: '已撤销', type: 'error' }
};

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
  apiFn: fetchGetPreviewList,
  apiParams: {
    pageNum: 1,
    pageSize: 10,
    shopId: Number(currentShopId),
    previewNum: null,
    shopName: null,
    nickName: null,
    phone: null,
    previewDate: null,
    statusList: null
  },
  showTotal: true,
  columns: () => [
    {
      type: 'selection',
      align: 'center',
      width: 48
    },
    {
      key: 'nickName',
      title: '预约人',
      align: 'center',
      minWidth: 80
    },
    {
      key: 'phone',
      title: '联系电话',
      align: 'center',
      minWidth: 120
    },
    {
      key: 'peopleNum',
      title: '预约人数',
      align: 'center',
      width: 90,
      render: (row: Api.Preview.PreviewInfo) => (
        <div>
          <span class="text-primary font-bold">{row.peopleNum}</span>
          <span class="ml-1 text-12px">人</span>
        </div>
      )
    },
    {
      key: 'previewNum',
      title: '预约码',
      align: 'center',
      minWidth: 120
    },
    {
      key: 'roomName',
      title: '包间名称',
      align: 'center',
      minWidth: 120,
      render: (row: Api.Preview.PreviewInfo) => (
        <div class="cursor-pointer text-primary hover:underline" onClick={() => toRoomService(row.previewId)}>
          {row.roomName}
        </div>
      )
    },
    {
      key: 'previewStartTime',
      title: '预约时间',
      align: 'center',
      render: row => {
        // 格式化时间
        const startTime = dayjs(row.previewStartTime).format('YYYY-MM-DD HH:mm');
        const endTime = dayjs(row.previewEndTime).format('HH:mm');

        return (
          <div class="flex-col">
            <span>{`${startTime} ~ ${endTime}`}</span>
          </div>
        );
      }
    },
    {
      key: 'remarks',
      title: '预约备注',
      align: 'center',
      minWidth: 120,
      render: row => {
        return row.remarks ? (
          <div class="flex-col">
            <span>{row.remarks}</span>
          </div>
        ) : (
          <div class="flex-col">
            <span class="text-gray-400">/</span>
          </div>
        );
      }
    },
    {
      key: 'status',
      title: '状态',
      align: 'center',
      width: 100,
      render: (row: Api.Preview.PreviewInfo) => {
        const tagMap: Record<Api.Preview.PreviewStatus, NaiveUI.ThemeColor> = {
          1: 'warning',
          2: 'info',
          3: 'success',
          4: 'error'
        };
        const label = statusMap[row.status].label;
        return <NTag type={tagMap[row.status]}>{label}</NTag>;
      }
    },
    {
      key: 'operate',
      title: '操作',
      align: 'center',
      width: 200,
      render: (row: Api.Preview.PreviewInfo) => {
        const isRevoked = row.status === 4; // 已撤销状态

        return (
          <div class="flex-center gap-8px">
            <NPopconfirm onPositiveClick={() => handleWriteOff(row.previewId, row)} disabled={row.status !== 1}>
              {{
                default: () => '确认核销？',
                trigger: () => (
                  <NButton type="primary" ghost size="small" disabled={row.status !== 1}>
                    核销
                  </NButton>
                )
              }}
            </NPopconfirm>
            <NPopconfirm onPositiveClick={() => handleDelete(row.previewId)} disabled={!isRevoked}>
              {{
                default: () => $t('common.confirmDelete'),
                trigger: () => (
                  <NButton type="error" ghost size="small" disabled={!isRevoked}>
                    {$t('common.delete')}
                  </NButton>
                )
              }}
            </NPopconfirm>
          </div>
        );
      }
    }
  ]
});

const {
  // drawerVisible,
  // operateType,
  // editingData,
  // handleAdd,
  // handleSimpleEdit,
  checkedRowKeys,
  onBatchDeleted,
  onDeleted
} = useTableOperate(data, getData);

async function handleBatchDelete() {
  const { error } = await fetchDeletePreview(checkedRowKeys.value);
  if (!error) {
    await onBatchDeleted();
  }
}
async function handleDelete(id: number) {
  const { error } = await fetchDeletePreview([String(id)]);
  if (!error) {
    await onDeleted();
  }
}
// 拿到订单号，跳转到包厢服务
async function toRoomService(previewId: number) {
  const { data: previewInfo, error } = await fetchGetPreview(previewId);
  if (!error) {
    const orderNum = previewInfo.orderVo?.orderNum;
    if (orderNum) {
      router.push({
        name: 'room-service',
        query: {
          orderNum,
          previewId
        }
      });
    } else {
      window.$message?.error('订单号不存在');
    }
  }
}
async function handleWriteOff(id?: number, currentRow?: Api.Preview.PreviewInfo) {
  const params = id ? { previewIdList: [String(id)] } : { previewIdList: checkedRowKeys.value };

  // 如果是单个核销，需要检查日期
  if (id && currentRow) {
    // 获取预约日期
    const previewDate = dayjs(currentRow.previewStartTime).format('YYYY-MM-DD');
    // 获取今天日期
    const today = dayjs().format('YYYY-MM-DD');

    if (previewDate !== today) {
      window.$message?.error('只能核销当天的预约记录！');
      return;
    }
  } else {
    // 批量核销时检查所有选中记录
    const invalidRecords = data.value.filter(item => {
      if (checkedRowKeys.value.includes(item.previewId)) {
        const previewDate = dayjs(item.previewStartTime).format('YYYY-MM-DD');
        const today = dayjs().format('YYYY-MM-DD');
        return previewDate !== today;
      }
      return false;
    });

    if (invalidRecords.length > 0) {
      window.$message?.error('只能核销当天的预约记录！');
      return;
    }
  }

  const { error } = await fetchWriteOff(params);
  if (!error) {
    window.$message?.success('核销成功');
    getData();
  }
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <PreviewSearch v-model:model="searchParams" @reset="resetSearchParams" @search="getDataByPage" />
    <NCard title="预约记录" :bordered="false" size="small" class="sm:flex-1-hidden card-wrapper">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          :show-add-btn="false"
          :show-delete-btn="false"
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
        :row-key="(row: any) => row.previewId"
        :pagination="mobilePagination"
        class="sm:h-full"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
