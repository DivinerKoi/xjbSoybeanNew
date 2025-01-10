<script setup lang="tsx">
import { computed, ref } from 'vue';
import { NButton, NCheckbox, NFlex, NInput, NScrollbar, NSpace, useDialog } from 'naive-ui';
import { useThrottleFn } from '@vueuse/core';
import {
  fetchBasket,
  fetchClearBasket,
  fetchSubmitOrderFromCart,
  fetchUpdateBasket
} from '@/service/api/home/room-service';

const dialog = useDialog();

interface Props {
  orderId: number;
}
const props = defineProps<Props>();
const cartInfo = ref<Api.RoomService.BasketData>();
const selectedItems = ref<number[]>([]); // 存储选中的购物车项 basketId
/** 获取购物车信息 */
async function getCartInfo() {
  const { data, error } = await fetchBasket({ orderId: props.orderId });
  if (!error) {
    cartInfo.value = data;
  }
}
const recRemark = ref<string>('');

const cartVisible = ref<boolean>(false);
// 打开购物车商品弹窗
function openCartModel() {
  cartVisible.value = true;
}

async function handleSubmit() {
  // 如果购物车为空，不允许下单
  if (!cartInfo.value?.num) {
    window.$message?.warning('购物车为空，请先添加商品');
    return;
  }

  dialog.warning({
    title: '确认下单',
    content: () => (
      <div>
        <p>确定要提交订单吗？</p>
        <NInput
          type="textarea"
          placeholder="请输入下单备注信息（选填）"
          rows={2}
          value={recRemark.value}
          onUpdateValue={(val: string) => {
            recRemark.value = val;
          }}
        />
      </div>
    ),
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      // 构建请求参数
      const params: Api.RoomService.SubmitOrderParams = {
        orderId: props.orderId,
        recRemark: recRemark.value
      };

      // 如果有选中的商品，则添加 basketIdList
      if (selectedItems.value.length > 0) {
        params.basketIdList = selectedItems.value;
      }

      const { error } = await fetchSubmitOrderFromCart(params);
      if (!error) {
        window.$message?.success('下单成功');
        // 清空选中状态
        selectedItems.value = [];
        // 刷新购物车信息
        getCartInfo();
        // 关闭弹窗
        cartVisible.value = false;
      }
    }
  });
}
const refreshCart = () => {
  getCartInfo();
};

// 处理全选
const handleSelectAll = (checked: boolean) => {
  if (checked) {
    selectedItems.value = cartInfo.value?.basketOrderProdItem.map(item => item.basketId) || [];
  } else {
    selectedItems.value = [];
  }
};

// 处理单个选择
const handleSelect = (basketId: number, checked: boolean) => {
  if (checked) {
    selectedItems.value.push(basketId);
  } else {
    selectedItems.value = selectedItems.value.filter(id => id !== basketId);
  }
};

// 选中商品的总价 - 计算属性
const selectedTotal = computed(() => {
  if (!cartInfo.value?.basketOrderProdItem) return 0;
  return cartInfo.value.basketOrderProdItem
    .filter(item => selectedItems.value.includes(item.basketId))
    .reduce((total, item) => total + (item.price || 0) * (item.num || 0), 0);
});

// 选中商品的总数量 - 计算属性
const selectedCount = computed(() => {
  if (!cartInfo.value?.basketOrderProdItem) return 0;
  return cartInfo.value.basketOrderProdItem
    .filter(item => selectedItems.value.includes(item.basketId))
    .reduce((total, item) => total + (item.num || 0), 0);
});

// 删除购物车项
const handleDeleteItem = async () => {
  const params: Api.RoomService.DeleteCartParams = {
    orderId: props.orderId,
    basketIdArr: selectedItems.value.toString()
  };
  const { error } = await fetchClearBasket(params);
  if (!error) {
    window.$message?.success('删除成功');
    refreshCart();
  }
};

// 提交选中的商品
const handleSubmitSelected = () => {
  if (selectedItems.value.length === 0) {
    window.$message?.warning('请先选择商品');
    return;
  }
  handleSubmit();
};

// 更新商品数量
const updateItemNum = useThrottleFn(async (item: any, delta: number) => {
  const newNum = (item.num || 0) + delta;

  // 当数量为1且要减少时，显示确认对话框
  if (item.num === 1 && delta < 0) {
    dialog.warning({
      title: '确认删除',
      content: '确定要删除该商品吗？',
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        // 乐观更新UI
        const originalNum = item.num;
        item.num = newNum;

        const updateCartParams: Api.RoomService.UpdateCartParams = {
          orderId: props.orderId,
          prodId: item.prodId,
          skuId: item.skuId,
          count: delta
        };

        const { error } = await fetchUpdateBasket(updateCartParams);
        if (error) {
          // 如果请求失败，回滚UI更新
          item.num = originalNum;
        } else {
          refreshCart();
        }
      }
    });
    return;
  }

  if (newNum < 0) return;

  // 乐观更新UI
  const originalNum = item.num;
  item.num = newNum;

  const updateCartParams: Api.RoomService.UpdateCartParams = {
    orderId: props.orderId,
    prodId: item.prodId,
    skuId: item.skuId,
    count: delta
  };

  const { error } = await fetchUpdateBasket(updateCartParams);
  if (error) {
    // 如果请求失败，回滚UI更新
    item.num = originalNum;
  } else {
    refreshCart();
  }
}, 500); // 500ms 内的重复点击会被忽略

// 禁用按钮的计算属性
// const isUpdating = ref(false);
// const disableDecrease = computed(() => (item: any) => item.num <= 1 || isUpdating.value);
// const disableIncrease = computed(() => (item: any) => isUpdating.value);

// 暴露方法给父组件调用
defineExpose({
  refreshCart
});

function init() {
  getCartInfo();
}
init();
</script>

<template>
  <NCard size="small">
    <NFlex justify="space-between">
      <NFlex :size="10" align="center" class="cursor-pointer hover:scale-105" @click="openCartModel">
        <div class="position-relative">
          <img src="@/assets/imgs/cart.png" class="h-48px w-60px" />
          <div
            class="position-absolute right-0 top-0 h-20px w-20px rounded-full bg-primary text-center text-white font-bold"
          >
            {{ cartInfo?.num || 0 }}
          </div>
        </div>
        <NFlex align="center" :size="5">
          <span>已选{{ cartInfo?.num || 0 }}件</span>
          <SvgIcon icon="weui:arrow-outlined"></SvgIcon>
        </NFlex>
      </NFlex>
      <NFlex :size="10" align="center">
        <div>
          合计：
          <span class="color-primary font-700">{{ cartInfo?.totalPrice || 0 }}</span>
          元
        </div>
        <NButton type="primary" size="large" @click="handleSubmit">下单</NButton>
      </NFlex>
    </NFlex>

    <NModal v-model:show="cartVisible" title="购物车" preset="card" class="w-860px">
      <NSpace vertical>
        <!-- 表头 -->
        <NFlex class="border-b pb-3">
          <NFlex align="center" class="w-60px">
            <NCheckbox
              :checked="selectedItems.length === cartInfo?.basketOrderProdItem?.length"
              :indeterminate="
                selectedItems.length > 0 && selectedItems.length < (cartInfo?.basketOrderProdItem?.length || 0)
              "
              @update:checked="handleSelectAll"
            />
          </NFlex>
          <div class="w-120px text-center">图片</div>
          <div class="flex-1 text-center">名称</div>
          <div class="w-120px text-center">数量</div>
          <div class="w-120px text-center">价格</div>
        </NFlex>

        <!-- 商品列表 -->
        <NScrollbar class="h-400px">
          <NSpace vertical>
            <NFlex
              v-for="item in cartInfo?.basketOrderProdItem"
              :key="item.basketId"
              align="center"
              class="cursor-pointer border-b py-3 transition-colors duration-300 hover:bg-gray-50"
              @click="handleSelect(item.basketId, !selectedItems.includes(item.basketId))"
            >
              <NFlex align="center" class="w-60px">
                <NCheckbox
                  :checked="selectedItems.includes(item.basketId)"
                  @update:checked="(checked: boolean) => handleSelect(item.basketId, checked)"
                  @click.stop
                />
              </NFlex>
              <div class="w-120px text-center">
                <img :src="item.skuImg" class="mx-auto h-60px w-60px rounded object-cover" alt="" />
              </div>
              <div class="flex-1 px-4 text-center">
                <div class="text-14px">{{ item.prodName }}</div>
                <div class="mt-1 text-12px text-gray-500">{{ item.properties }}</div>
              </div>
              <div class="w-120px text-center">
                <NFlex align="center" justify="center" :size="8">
                  <NButton size="tiny" circle @click.stop="updateItemNum(item, -1)">
                    <IconIcRoundRemove class="text-primary"></IconIcRoundRemove>
                  </NButton>
                  <span>{{ item.num }}</span>
                  <NButton size="tiny" circle @click.stop="updateItemNum(item, 1)">
                    <IconIcRoundAdd class="text-primary"></IconIcRoundAdd>
                  </NButton>
                </NFlex>
              </div>
              <div class="w-120px text-center">
                <PriceText :value="item.price" size="small" />
              </div>
            </NFlex>
          </NSpace>
        </NScrollbar>

        <!-- 底部操作 -->
        <NFlex justify="space-between" align="center" class="border-t pt-3">
          <span>
            已选
            <span class="text-primary">{{ selectedCount }}</span>
            件商品， 合计：
            <span class="color-primary font-700">{{ selectedTotal }}</span>
            元
          </span>
          <NFlex>
            <NButton v-show="selectedItems.length > 0" type="error" @click="handleDeleteItem">删除选中</NButton>
            <NButton type="primary" @click="handleSubmitSelected">下单</NButton>
          </NFlex>
        </NFlex>
      </NSpace>
    </NModal>
  </NCard>
</template>

<style scoped></style>
