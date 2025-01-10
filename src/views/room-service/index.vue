<script setup lang="tsx">
import { computed, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  NAvatar,
  NButton,
  NDataTable,
  NDescriptions,
  NDescriptionsItem,
  NFlex,
  NImage,
  NImageGroup,
  NInput,
  NInputNumber,
  NModal,
  NPopconfirm,
  NSelect,
  NSwitch,
  NTag
} from 'naive-ui';
import { useBoolean } from '@sa/hooks';
import dayjs from 'dayjs';
import OrderData from '@/views/home/modules/order-data.vue';
import RoomInfo from '@/views/home/modules/room-info.vue';
import { useAppStore } from '@/store/modules/app';
import PriceText from '@/components/common/price-text.vue';
import {
  fetchOrderFinish,
  fetchPageByOrderNum,
  fetchProdCancel,
  fetchProdComplete,
  fetchUpdateOrderProdCount
} from '@/service/api/home/room-service';
import SvgIcon from '@/components/custom/svg-icon.vue';
import { useTable, useTableOperate } from '@/hooks/common/table';
import { fetchGetPreview, fetchGetPreviewList } from '@/service/api/preview';
import { useShopStore } from '@/store/modules/shop';
import AddProdModal from './modules/add-prod-modal.vue';
const appStore = useAppStore();
const shopStore = useShopStore();
const currentOrder = reactive<Api.Home.NoDeliveryRoom>({});

// 添加修改数量相关的状态
const editingItem = ref<Api.Home.OrderItem | null>(null);
const editCount = ref(0);
const { bool: editModalVisible, setTrue: openEditModalVisible, setFalse: closeEditModalVisible } = useBoolean();

function handleRowClick(row: Api.Home.OrderItem) {
  // 只有待配送状态可以修改
  if (row.status === 0) {
    editingItem.value = row;
    editCount.value = row.prodNum;
    openEditModalVisible();
  }
}
// 状态映射
const statusMap: Record<Api.Order.OrderDeliveryStatus, { label: string; color: NaiveUI.ThemeColor }> = {
  0: { label: '待配送', color: 'warning' },
  1: { label: '已送达', color: 'success' },
  2: { label: '已取消', color: 'error' }
};

// 状态选项
const statusOptions = [
  ...Object.entries(statusMap).map(([value, { label }]) => ({
    label,
    value: Number(value) as Api.Order.OrderDeliveryStatus
  }))
];

// 添加 loading 状态管理
const loadingStatus = ref<number[]>([]);
const route = useRoute();
const router = useRouter();

const hasOrder = computed(() => {
  return Boolean(route.query.orderNum && route.query.previewId);
});
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
  apiFn: fetchPageByOrderNum,
  apiParams: {
    pageNum: 1,
    pageSize: 10,
    orderNum: route.query.orderNum as string,
    prodName: null,
    skuName: null,
    status: null
  },
  showTotal: true,
  immediate: false,
  columns: () => [
    {
      type: 'selection',
      align: 'center',
      width: 48
    },
    {
      key: 'prodPic',
      title: '商品图片',
      align: 'center',
      width: 100,
      render: row => (
        <NImageGroup>
          <NImage width="60" height="60" src={row.prodPic} />
        </NImageGroup>
      )
    },
    {
      key: 'prodName',
      title: '商品名称 | 规格名称',
      align: 'center',
      width: 180,
      render: row => (
        <NFlex vertical align="center">
          <span>{row.prodName}</span>
          <span class="color-[#999]">{row.skuName}</span>
        </NFlex>
      )
    },
    {
      key: 'prodNum',
      title: '数量',
      align: 'center',
      width: 80
    },
    {
      key: 'price',
      title: '总价',
      align: 'center',
      width: 80,
      render: (row: any) => <PriceText value={row.price * row.prodNum} size="small" />
    },
    {
      key: 'status',
      title: '状态',
      align: 'center',
      width: 120,
      render: (row: Api.Home.OrderItem) => {
        const isDeliverable = row.status === 0;
        const isLoading = loadingStatus.value.includes(row.orderItemId);

        return row.status === 2 ? (
          <NTag type="error">已取消</NTag>
        ) : (
          <NPopconfirm
            disabled={!isDeliverable || isLoading || row.status === 1}
            onPositiveClick={() => {
              handleDeliveryChange(true, row);
            }}
          >
            {{
              default: () => '确认完成配送？',
              trigger: () => (
                <NSwitch
                  value={row.status === 1}
                  disabled={!isDeliverable || isLoading}
                  loading={isLoading}
                  onUpdateValue={value => {
                    return value;
                  }}
                >
                  {{
                    'checked-icon': () => <SvgIcon icon="emojione-v1:face-savoring-food" />,
                    'unchecked-icon': () => <SvgIcon icon="emojione-v1:eight-thirty" />,
                    checked: () => '已送达',
                    unchecked: () => '待配送'
                  }}
                </NSwitch>
              )
            }}
          </NPopconfirm>
        );
      }
    },
    {
      key: 'recTime',
      title: '下单时间',
      align: 'center',
      width: 160
    },
    {
      key: 'recRemark',
      title: '下单备注',
      align: 'center',
      width: 120,
      render: row => <div>{row.recRemark ? <span>{row.recRemark}</span> : <span class="color-[#999]">/</span>}</div>
    },
    {
      key: 'operate',
      title: '操作',
      align: 'center',
      width: 220,
      render: (row: Api.Home.OrderItem) => {
        const isDeliverable = row.status === 0; // 只有待配送状态可以操作
        const isLoading = loadingStatus.value.includes(row.orderItemId);

        return (
          <NFlex justify="center" align="center" class="gap-8px">
            {row.status !== 2 && (
              <NButton
                size="small"
                type="primary"
                ghost
                onClick={() => handleRowClick(row)}
                disabled={!isDeliverable || isLoading}
              >
                修改数量
              </NButton>
            )}
            <NPopconfirm onPositiveClick={() => handleCancel(row.orderItemId)}>
              {{
                default: () => '确认删除吗？',
                trigger: () => (
                  <NButton
                    type="error"
                    ghost
                    size="small"
                    disabled={row.status === 1} // 已送达的商品不能删除
                    onClick={e => e.stopPropagation()}
                  >
                    删除
                  </NButton>
                )
              }}
            </NPopconfirm>
          </NFlex>
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
  // handleEdit,
  // handleSimpleEdit,
  checkedRowKeys,
  onBatchDeleted,
  onDeleted
  // closeDrawer
} = useTableOperate(data, getData);

// 获取初始第一条的预约记录，当直接点击包厢服务菜单进来时，没有路由信息，需要调用（TODO:待优化，目前查询太多接口了）
async function getInitPreview() {
  const params = {
    pageNum: 1,
    pageSize: 1,
    statusList: '2', // 已核销的预约
    shopId: shopStore.localShopId
  };
  const { data: result, error } = await fetchGetPreviewList(params);
  if (!error) {
    if (result.data.length > 0) {
      const { previewId } = result.data[0];
      const { data: info } = await fetchGetPreview(previewId);
      const orderNum = info?.orderVo.orderNum;
      searchParams.orderNum = orderNum;
      router.replace({
        query: {
          orderNum,
          previewId
        }
      });
    }
  }
}

// 预约详情
const previewInfo = ref<Api.Preview.PreviewInfo | null>(null);
async function getPreviewInfo() {
  const { data: info, error } = await fetchGetPreview(Number(route.query.previewId));
  if (!error) {
    previewInfo.value = info;
  }
}
// 订单详情
const orderVo = computed(() => previewInfo.value?.orderVo);
// 会员详情
const userMemberVo = computed(() => previewInfo.value?.userMemberVo);
// 订单是否结算
const isSettle = computed(() => {
  return orderVo.value?.status === 1;
});
function changeOrder(item: Api.Home.NoDeliveryRoom) {
  Object.assign(currentOrder, item);

  if (item.orderVo?.orderNum) {
    // 更新搜索参数
    searchParams.orderNum = item.orderVo.orderNum;
    // 否则更新路由参数
    router.replace({
      query: {
        orderNum: item.orderVo?.orderNum,
        previewId: item.orderVo?.previewId
      }
    });
  }
}
// 删除订单商品
async function handleCancel(orderItemId: number) {
  const query: Api.RoomService.ProdCancelParams = {
    orderNum: orderVo.value.orderNum,
    orderItemIds: [orderItemId]
  };
  const { error } = await fetchProdCancel(query);
  if (!error) {
    onDeleted();
  }
}
// 批量删除订单商品
async function handleBatchDelete() {
  const query: Api.RoomService.ProdCancelParams = {
    orderNum: orderVo.value.orderNum,
    orderItemIds: checkedRowKeys.value.map(item => Number(item))
  };
  const { error } = await fetchProdCancel(query);
  if (!error) {
    await onBatchDeleted();
  }
}
/** 计算总数量 */
const totalSum = computed(() => {
  return previewInfo.value?.orderItemVoList?.reduce((acc, cur) => acc + cur.prodNum, 0);
});
const visible = ref(false);
function handleAdd() {
  visible.value = true;
}
// 监听 visible 变化，关闭时刷新表格数据和预约详情
watch(visible, val => {
  if (!val) {
    getData();
    getPreviewInfo();
  }
});
/** 重置 */
function handleReset() {
  resetSearchParams();
  // 只有在有订单的情况下才设置订单号
  if (orderVo.value.orderNum) {
    searchParams.orderNum = orderVo.value.orderNum;
    getDataByPage();
  }
}
const orderDataRef = ref();

/** 结算 */
async function handleSettlement() {
  const { error } = await fetchOrderFinish({ orderId: orderVo.value.orderId });
  if (!error) {
    window.$message?.success('结算成功');
    // 刷新订单数据
    getData();
    // 刷新预约详情
    getPreviewInfo();
  }
}
function submitExtend() {
  getPreviewInfo();
}

// 处理配送
async function handleDeliveryChange(_value: boolean, row: Api.Home.OrderItem) {
  if (row.status !== 0) return;

  // 添加到 loading 状态
  loadingStatus.value.push(row.orderItemId);

  try {
    const query: Api.RoomService.ProdCancelParams = {
      orderNum: orderVo.value.orderNum,
      orderItemIds: [row.orderItemId]
    };
    const { error } = await fetchProdComplete(query);

    if (!error) {
      window.$message?.success('配送成功');
      getData();
    }
  } finally {
    // 移除 loading 状态
    loadingStatus.value = loadingStatus.value.filter(id => id !== row.orderItemId);
  }
}
/** 批量完成配送 */
async function handleBatchDelivery() {
  const query: Api.RoomService.ProdCancelParams = {
    orderNum: orderVo.value.orderNum,
    orderItemIds: checkedRowKeys.value.map(item => Number(item))
  };
  const { error } = await fetchProdComplete(query);

  if (!error) {
    window.$message?.success('配送成功');
    getData();
  }
  checkedRowKeys.value = [];
}

// 修改数量
async function handleSaveEdit() {
  if (!editingItem.value) return;

  const addSubCount = editCount.value - editingItem.value.prodNum;
  if (addSubCount === 0) {
    closeEditModalVisible();
    return;
  }

  const params = {
    orderNum: orderVo.value.orderNum,
    prodAddSubCountList: [
      {
        orderItemId: editingItem.value.orderItemId,
        addSubCount
      }
    ]
  };

  const { error } = await fetchUpdateOrderProdCount(params);
  if (!error) {
    window.$message?.success('修改成功');
    closeEditModalVisible();
    getData(); // 刷新表格数据
    // orderDataRef.value?.getNoFinishRoom();
  }
}

// 会员详情相关
const showMemberDetail = ref(false);
const currentMember = ref<Api.Member.MemberInfo>();

// 用户类型映射
const typeMap = {
  1: '会员',
  2: '服务员'
} as const;

// 格式化时间
const formatTime = (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss');

function showDetail() {
  if (userMemberVo.value) {
    currentMember.value = userMemberVo.value;
    showMemberDetail.value = true;
  }
}

// 监听路由参数变化
watch(
  () => route.query,
  query => {
    // 如果有 orderNum 和 previewId，就查询数据
    if (query.orderNum && query.previewId) {
      getData();
      getPreviewInfo();
    } else {
      getInitPreview();
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- 顶部订单数据 -->
    <OrderData ref="orderDataRef" />

    <!-- 主要内容区域 -->
    <div class="mt-20px h-[calc(100%-100px)] min-h-0 flex">
      <!-- 左侧内容区域 -->
      <div class="mr-16px min-w-0 flex flex-col flex-1">
        <!-- 搜索栏 -->
        <NFlex justify="space-between" class="mb-16px">
          <NFlex align="center" :wrap="false" class="gap-12px">
            <NInput
              v-model:value="searchParams.prodName"
              placeholder="商品名称"
              clearable
              class="!w-200px"
              :disabled="!hasOrder"
            >
              <template #prefix>
                <SvgIcon icon="material-symbols:search" class="text-16px" />
              </template>
            </NInput>
            <NInput
              v-model:value="searchParams.skuName"
              placeholder="搜索规格名称"
              clearable
              class="!w-200px"
              :disabled="!hasOrder"
            >
              <template #prefix>
                <SvgIcon icon="material-symbols:search" class="text-16px" />
              </template>
            </NInput>
            <NSelect
              v-model:value="searchParams.status"
              :options="statusOptions"
              placeholder="配送状态"
              clearable
              class="!w-120px"
              :disabled="!hasOrder"
              @update:value="getData"
            />
            <NButton type="default" size="small" :disabled="!hasOrder" @click="handleReset">重置</NButton>
            <NButton type="primary" size="small" :disabled="!hasOrder" @click="getData">搜索</NButton>
          </NFlex>
        </NFlex>

        <!-- 表格区域 -->
        <NCard title="订单商品" :bordered="false" size="small" class="min-h-0 flex flex-col flex-1">
          <template v-if="hasOrder" #header-extra>
            <TableHeaderOperation
              v-model:columns="columnChecks"
              :disabled-delete="checkedRowKeys.length === 0"
              :loading="loading"
              :show-add-btn="!isSettle"
              :show-delete-btn="!isSettle"
              @add="handleAdd"
              @delete="handleBatchDelete"
              @refresh="getData"
            >
              <template v-if="!isSettle" #middle>
                <NPopconfirm @positive-click="handleBatchDelivery">
                  <template #trigger>
                    <NButton size="small" ghost type="primary" :disabled="checkedRowKeys.length === 0">
                      <template #icon>
                        <SvgIcon icon="emojione-v1:ballot-box-bold-check" class="text-icon" />
                      </template>
                      批量完成配送
                    </NButton>
                  </template>
                  确认批量完成配送？
                </NPopconfirm>
              </template>
            </TableHeaderOperation>
          </template>

          <div class="min-h-0 flex flex-col flex-1">
            <NDataTable
              v-model:checked-row-keys="checkedRowKeys"
              :columns="columns"
              :data="data"
              size="small"
              :flex-height="!appStore.isMobile"
              :scroll-x="702"
              :loading="loading"
              remote
              :style="{ height: 'calc(100vh - 410px)' }"
              :row-key="(row: any) => row.orderItemId"
              :pagination="mobilePagination"
              class="sm:h-full"
            />
          </div>
          <!--
  :row-props="
                (row: Api.Home.OrderItem) => ({
                  style: row.status === 0 ? 'cursor: pointer' : '',
                  onClick: () => handleRowClick(row)
                })
              "
-->

          <!-- 底部结算区域 -->
          <NFlex justify="flex-end" class="mt-16px">
            <NFlex align="center">
              <div>
                <div>
                  <span class="color-[#FD6A6A]">需付款：</span>
                  <span class="text-18px color-[#000]">￥{{ previewInfo?.orderVo.price || 0 }}</span>
                </div>
                <div>
                  <span class="color-[#999]">
                    共
                    <span class="color-primary font-700">{{ totalSum }}</span>
                    个商品
                  </span>
                </div>
              </div>
              <NPopconfirm v-if="!isSettle" @positive-click="handleSettlement">
                <template #trigger>
                  <NButton type="primary" size="large">
                    <template #icon>
                      <SvgIcon icon="f7:money-yen-circle-fill"></SvgIcon>
                    </template>
                    包厢结算
                  </NButton>
                </template>
                <template #default>
                  确认结算该包厢订单吗？
                  <div class="mt-8px color-[#999]">
                    <div>包厢：{{ orderVo.roomName }}</div>
                    <div>
                      金额：
                      <PriceText :value="orderVo.price" size="small"></PriceText>
                    </div>
                  </div>
                </template>
              </NPopconfirm>
              <NButton v-else type="default" size="large" disabled>
                <template #icon>
                  <SvgIcon icon="f7:money-yen-circle-fill"></SvgIcon>
                </template>
                已结算
              </NButton>
            </NFlex>
          </NFlex>
        </NCard>
      </div>

      <!-- 右侧内容区域 -->
      <div class="mt-50px w-388px flex-shrink-0">
        <RoomInfo
          class="h-full"
          :fixed-height="false"
          :preview-info="previewInfo"
          :show-service-btn="false"
          @submit-extend="submitExtend"
          @show-detail="showDetail"
        />
      </div>
    </div>

    <AddProdModal v-model:visible="visible" :order-id="orderVo?.orderId" />

    <!-- 添加修改数量弹框 -->
    <NModal v-model:show="editModalVisible" preset="dialog" title="修改数量">
      <div class="flex-col gap-16px">
        <div class="flex items-center gap-8px">
          <span>商品：</span>
          <span>{{ editingItem?.prodName }}</span>
        </div>
        <div class="flex items-center gap-8px">
          <span>规格：</span>
          <span>{{ editingItem?.properties.replace(/,/g, '/') }}</span>
        </div>
        <div class="flex items-center gap-8px">
          <span>数量：</span>
          <NInputNumber v-model:value="editCount" :min="1" :precision="0" class="!w-120px" />
        </div>
      </div>
      <template #action>
        <NButton class="mr-16px" @click="closeEditModalVisible">取消</NButton>
        <NButton type="primary" :disabled="!editCount" @click="handleSaveEdit">确定</NButton>
      </template>
    </NModal>

    <!-- 添加会员详情弹窗 -->
    <NModal v-model:show="showMemberDetail" preset="card" title="会员详情" style="width: 600px">
      <NFlex vertical :size="24">
        <NFlex align="center" justify="center">
          <NAvatar :size="100" round :src="currentMember?.avatar" />
        </NFlex>

        <NDescriptions bordered :column="2">
          <NDescriptionsItem label="会员名称">
            {{ currentMember?.name }}
          </NDescriptionsItem>
          <NDescriptionsItem label="性别">
            <NTag :type="currentMember?.sex === '男' ? 'success' : 'error'">
              {{ currentMember?.sex }}
            </NTag>
          </NDescriptionsItem>
          <NDescriptionsItem label="联系电话">
            {{ currentMember?.phone }}
          </NDescriptionsItem>
          <NDescriptionsItem label="会员等级">
            {{ currentMember?.grade }}
          </NDescriptionsItem>
          <NDescriptionsItem label="用户类型">
            <NTag :type="currentMember?.type === 1 ? 'success' : 'warning'">
              {{ typeMap[currentMember?.type || 1] }}
            </NTag>
          </NDescriptionsItem>
          <NDescriptionsItem label="总消费">
            <PriceText :value="currentMember?.usePrice" size="small" />
          </NDescriptionsItem>
          <NDescriptionsItem label="生日">
            {{ currentMember?.birthday ? dayjs(currentMember.birthday).format('YYYY-MM-DD') : '-' }}
          </NDescriptionsItem>
          <NDescriptionsItem label="注册时间">
            {{ formatTime(currentMember?.registartionTime || '') }}
          </NDescriptionsItem>
          <NDescriptionsItem label="最后登录">
            {{ formatTime(currentMember?.loginTime || '') }}
          </NDescriptionsItem>
        </NDescriptions>
      </NFlex>
    </NModal>
  </div>
</template>

<style scoped></style>
