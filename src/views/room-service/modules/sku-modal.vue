<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useDialog } from 'naive-ui';
import { fetchGetProdInfo } from '@/service/api/product/prodInfo';
import { fetchSubmitOrderDirectly, fetchUpdateBasket } from '@/service/api/home/room-service';

const dialog = useDialog();

const visibleSku = defineModel<boolean>('visibleSku', {
  default: false
});

interface Props {
  prodId: number;
  orderId: number;
}
const props = defineProps<Props>();

interface Emits {
  (e: 'updateCart'): void;
}
const emit = defineEmits<Emits>();

const prodInfo = ref<Api.Product.ProductInfo>();
const quantity = ref(1);
const selectedSku = ref<Api.Product.ProdSku>();

// 解析规格列表
const specList = computed(() => {
  if (!prodInfo.value?.specList) return [];
  try {
    return JSON.parse(prodInfo.value.specList);
  } catch (e) {
    console.error('规格解析错误:', e);
    return [];
  }
});

// 选中的规格
const selectedSpecs = ref<Record<string, string>>({});
const recRemark = ref('');
// 初始化选中规格
watch(
  specList,
  newSpecList => {
    selectedSpecs.value = {};
    newSpecList.forEach((spec: any) => {
      selectedSpecs.value[spec.name] = '';
    });
  },
  { immediate: true }
);

async function getProdInfo() {
  const { data, error } = await fetchGetProdInfo(props.prodId);
  if (!error) {
    prodInfo.value = data;
  }
}
// 检查规格是否全部选择完成
const isSpecsComplete = computed(() => {
  return Object.values(selectedSpecs.value).every(value => value !== '');
});

// 处理规格选择
function handleSpecSelect(specName: string, valueName: string) {
  selectedSpecs.value[specName] = valueName;
  // 每次选择规格后，重新匹配 SKU
  const newSelectedProperties = Object.values(selectedSpecs.value).filter(Boolean).join(',');

  if (prodInfo.value?.prodSkus && isSpecsComplete.value) {
    const matchedSku = prodInfo.value.prodSkus.find(sku => sku.properties === newSelectedProperties);
    selectedSku.value = matchedSku;
  } else {
    selectedSku.value = undefined;
  }
  // console.log('选中规格', selectedSku.value);
}

// 获取已选规格文本
const selectedSpecsText = computed(() => {
  if (selectedSku.value) {
    return selectedSku.value.properties;
  }
  return Object.entries(selectedSpecs.value)
    .map(([_key, value]) => (value ? `${value}` : ''))
    .filter(Boolean)
    .join(',');
});

// 修改加入购物车方法
async function handleAddToCart() {
  if (!selectedSku.value) {
    window.$message?.warning('请选择完整规格');
    return;
  }
  dialog.warning({
    title: '确认提示',
    content: '确定要加入购物车吗？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      const updateCartParams: Api.RoomService.UpdateCartParams = {
        orderId: props.orderId,
        prodId: props.prodId,
        skuId: selectedSku.value!.skuId,
        count: quantity.value
      };
      const { error } = await fetchUpdateBasket(updateCartParams);
      if (!error) {
        window.$message?.success('加入购物车成功');
        visibleSku.value = false;
        emit('updateCart');
      }
    }
  });
}

// 修改立即购买方法
async function handleBuyNow() {
  if (!selectedSku.value) {
    window.$message?.warning('请选择完整规格');
    return;
  }
  dialog.warning({
    title: '确认提示',
    content: '确定要立即购买吗？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      const orderParams: Api.RoomService.OrderDirectly = {
        orderId: props.orderId,
        prodId: props.prodId,
        skuId: selectedSku.value!.skuId,
        count: quantity.value,
        recRemark: recRemark.value
      };
      const { error } = await fetchSubmitOrderDirectly(orderParams);
      if (!error) {
        window.$message?.success('下单成功');
        visibleSku.value = false; // 成功后关闭弹窗
      }
    }
  });
}

watch(visibleSku, val => {
  if (val) {
    quantity.value = 1;
    getProdInfo();
  }
});

// 添加最大库存的计算属性
const maxStock = computed(() => {
  return selectedSku.value?.stock || prodInfo.value?.prodSkus?.[0]?.stock || 0;
});

// 监听 SKU 变化，调整数量
watch(selectedSku, newSku => {
  // 如果当前数量超过新 SKU 的库存，则自动调整为最大库存
  if (newSku && quantity.value > newSku.stock) {
    quantity.value = newSku.stock;
  }
});
</script>

<template>
  <NModal v-model:show="visibleSku" title="规格选择" preset="card" class="w-560px">
    <div class="p-4">
      <!-- 商品基本信息 -->
      <NFlex :size="16">
        <img :src="selectedSku?.skuImg || prodInfo?.images" class="h-100px w-100px rounded-md object-cover" />
        <div>
<!--          <NFlex align="center" justify="center" class="text-center">-->
<!--            <PriceText :value="selectedSku?.price || prodInfo?.price" size="small" />-->
<!--            <PriceText :value="selectedSku?.unPrice || prodInfo?.unPrice" size="small" type="info" />-->
<!--          </NFlex>-->
          <NSpace :size="4" class="text-16px font-500">
            <PriceText :value="selectedSku?.price || prodInfo?.price" size="default" />
            <PriceText :value="selectedSku?.unPrice || prodInfo?.unPrice" size="small" type="info" />
          </NSpace>
          <div class="text-14px text-gray-500">
            库存：{{ selectedSku?.stock || prodInfo?.prodSkus?.[0]?.stock || 0 }}份
          </div>
          <div class="text-14px text-gray-500">已选：{{ selectedSpecsText || '请选择规格' }}</div>
        </div>
      </NFlex>

      <!-- 规格选择区 -->
      <div class="mt-4 space-y-4">
        <!-- 动态规格选择 -->
        <div v-for="spec in specList" :key="spec.name">
          <div class="mb-2 text-14px text-gray-600">{{ spec.name }}</div>
          <NSpace>
            <NButton
              v-for="item in spec.list"
              :key="item.name"
              size="small"
              :type="selectedSpecs[spec.name] === item.name ? 'primary' : 'default'"
              @click="handleSpecSelect(spec.name, item.name)"
            >
              {{ item.name }}
            </NButton>
          </NSpace>
        </div>

        <!-- 数量选择 -->
        <div>
          <div class="mb-2 text-14px text-gray-600">数量</div>
          <NFlex align="center" :size="4">
            <NButton circle size="tiny" :disabled="quantity <= 1" @click="quantity--">
              <IconIcRoundRemove class="text-primary"></IconIcRoundRemove>
            </NButton>
            <NInputNumber
              v-model:value="quantity"
              :min="1"
              :max="maxStock"
              size="small"
              class="mx-2 w-60px"
              :show-button="false"
              :status="quantity > maxStock ? 'error' : undefined"
            />
            <NButton circle size="tiny" :disabled="quantity >= maxStock" @click="quantity++">
              <IconIcRoundPlus class="text-primary"></IconIcRoundPlus>
            </NButton>
          </NFlex>
          <div v-if="quantity > maxStock" class="mt-1 text-12px text-error">数量不能超过库存</div>
        </div>
      </div>

      <!-- 添加备注输入框 -->
      <div class="mt-4">
        <div class="mb-2 text-14px text-gray-600">备注</div>
        <NInput
          v-model:value="recRemark"
          type="textarea"
          placeholder="请输入下单备注信息（选填）"
          :rows="2"
          class="w-full"
        />
      </div>

      <!-- 底部按钮 -->
      <NFlex class="mt-6">
        <NButtonGroup class="w-full">
          <NButton size="large" class="w-50%" :disabled="!selectedSku" @click="handleAddToCart">加入购物车</NButton>
          <NButton type="primary" size="large" class="w-50%" :disabled="!selectedSku" @click="handleBuyNow">
            直接下单
          </NButton>
        </NButtonGroup>
      </NFlex>
    </div>
  </NModal>
</template>

<style scoped></style>
