<script setup lang="tsx">
import { NButton, NImage, NImageGroup, NModal, NPopconfirm, NSpace } from 'naive-ui';
import { ref, watch } from 'vue';
import { useTable, useTableOperate } from '@/hooks/common/table';
import { fetchDeleteRoom, fetchGetRoomList, fetchWxQrCode } from '@/service/api/room';
import { useShopList } from '@/hooks/business/useShopList';
import { useShopStore } from '@/store/modules/shop';
import PriceText from '@/components/common/price-text.vue';
import RoomOperateDrawer from './room-operateDrawer.vue';
import RoomSearch from './room-search.vue';

const shopStore = useShopStore();

// 定义props类型
interface Props {
  // 类型 1: 包厢 2：门店打开的包厢
  type: string;
  // 门店ID
  shopId: number;
}
const props = defineProps<Props>();

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
  apiFn: fetchGetRoomList,
  immediate: false,
  apiParams: {
    pageNum: 1,
    pageSize: 10,
    shopId: null,
    roomName: null,
    peopleNumMin: null,
    peopleNumMax: null,
    minPrice: null
  },
  showTotal: true,
  columns: () => [
    {
      type: 'selection',
      align: 'center',
      width: 48
    },
    {
      key: 'roomName',
      title: '包厢名称',
      align: 'center',
      minWidth: 120
    },
    {
      key: 'houseNum',
      title: '门牌号',
      align: 'center',
      minWidth: 100
    },
    {
      key: 'houseImg',
      title: '包厢图片',
      align: 'center',
      render: row => (
        <NImageGroup>
          <NImage width="80" height="80" src={row.houseImg} />
        </NImageGroup>
      )
    },
    {
      key: 'peopleNum',
      title: '容纳人数',
      align: 'center',
      minWidth: 100,
      render: row => (
        <div class="flex-center">
          <div>{row.peopleNum}</div>
          <div>人</div>
        </div>
      )
    },
    {
      key: 'minPrice',
      title: '最低消费',
      align: 'center',
      minWidth: 100,
      render: row => <PriceText value={row.minPrice} size="small"></PriceText>
    },

    {
      key: 'operate',
      title: '操作',
      align: 'center',
      width: 160,
      render: (row: Api.Room.Room) => (
        <div class="flex-center gap-8px">
          <NButton type="primary" ghost size="small" onClick={() => getQrCode(row.roomId, row.roomName)}>
            包厢二维码
          </NButton>
          <NButton type="primary" ghost size="small" onClick={() => edit(row.roomId)}>
            编辑
          </NButton>
          <NPopconfirm onPositiveClick={() => handleDelete(row.roomId)}>
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
} = useTableOperate(data, getData, 'roomId');

const { shopOptions, getShopList, getFirstShopId } = useShopList();

/** 获取门店列表并初始化查询 */
async function initData() {
  await getShopList();
  if (props.type === '1') {
    const firstShopId = getFirstShopId();
    if (firstShopId) {
      searchParams.shopId = firstShopId;
      await getData();
    }
  }
}

// 监听类型变化
watch(
  () => props.type,
  newVal => {
    if (newVal === '2') {
      searchParams.shopId = props.shopId;
      getData();
    }
  },
  { immediate: true }
);
// 监听门店ID变化
watch(
  () => shopStore.localShopId,
  val => {
    searchParams.shopId = val;
    getDataByPage();
  }
);
// 二维码相关
const qrCodeVisible = ref(false);
const qrCodeUrl = ref('');
const currentRoomName = ref('');
const qrCodeLoading = ref(false);
const downloadLoading = ref(false);

// 下载二维码
function downloadQrCode() {
  downloadLoading.value = true;
  const link = document.createElement('a');
  link.href = qrCodeUrl.value;
  link.download = `${currentRoomName.value}二维码.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => {
    downloadLoading.value = false;
  }, 500);
}

async function getQrCode(roomId: number, roomName: string) {
  qrCodeUrl.value = '';
  qrCodeLoading.value = true;
  currentRoomName.value = roomName;
  qrCodeVisible.value = true;
  const { data: codeUrl, error } = await fetchWxQrCode({ roomId });
  if (!error) {
    qrCodeUrl.value = `data:image/png;base64,${codeUrl.base64}`;
  }
  qrCodeLoading.value = false;
}

async function handleBatchDelete() {
  const { error } = await fetchDeleteRoom(checkedRowKeys.value);
  if (!error) {
    await onBatchDeleted();
  }
}

const handleReset = async () => {
  resetSearchParams();
  searchParams.shopId = shopStore.localShopId;
  await getDataByPage();
};

async function handleDelete(id: number) {
  const { error } = await fetchDeleteRoom([String(id)]);
  if (!error) {
    await onDeleted();
  }
}

async function edit(id: number) {
  handleSimpleEdit(id);
}

// 组件挂载时初始化数据
function init() {
  initData();
}
init();
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <RoomSearch v-model:model="searchParams" @reset="handleReset" @search="getDataByPage" />
    <NCard title="包厢管理" :bordered="false" size="small" class="sm:flex-1-hidden card-wrapper">
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
        :scroll-x="800"
        :loading="loading"
        remote
        :row-key="(row: any) => row.roomId"
        :pagination="mobilePagination"
        class="sm:h-full"
      />

      <RoomOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        :shop-options="shopOptions"
        :default-shop-id="props.shopId"
        @submitted="getDataByPage"
      />
    </NCard>

    <!-- 二维码弹窗 -->
    <NModal v-model:show="qrCodeVisible" preset="card" class="w-400px" title="包厢二维码">
      <NSpin :show="qrCodeLoading">
        <NSpace v-show="qrCodeUrl" vertical align="center" :size="20">
          <div class="text-center text-16px font-bold">{{ currentRoomName }}</div>
          <img :src="qrCodeUrl" alt="二维码" class="h-200px w-200px" />
          <NButton type="primary" block :loading="downloadLoading" @click="downloadQrCode">下载二维码</NButton>
        </NSpace>
      </NSpin>
    </NModal>
  </div>
</template>

<style scoped></style>
