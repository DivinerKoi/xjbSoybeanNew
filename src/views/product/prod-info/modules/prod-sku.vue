<script setup lang="tsx">
import { type Ref, ref, watch } from 'vue';
import type { DataTableColumns } from 'naive-ui';
import { NButton, NFormItem, NInput, NInputNumber, NPopconfirm, NSwitch } from 'naive-ui';
import { jsonClone } from '@sa/utils';
import SvgIcon from '@/components/custom/svg-icon.vue';
import ImageUpload from '@/components/common/image-upload.vue';
import type { skuAttrItemType, skuType } from './type.d';

interface Props {
  prodSkus: skuType[];
  specList: string | null;
}

// 定义 v-model 的 emit
const emit = defineEmits<{
  'update:prodSkus': [value: skuType[]];
  'update:specList': [value: string];
}>();

const props = defineProps<Props>();

const skuAttributes: Ref<skuAttrItemType[]> = ref([]);
const stockKeepUnits: Ref<skuType[]> = ref([]);
const formRef = ref();

/** 将 skuAttributes 转换为 specList 格式 */
function transformSpecList(attributes: skuAttrItemType[]) {
  return attributes.map(attr => ({
    name: attr.title,
    list: attr.values.map(value => ({
      name: value.properties
    }))
  }));
}

/** 将 specList 转换为 skuAttributes 格式 */
function transformSpecListToSkuAttributes(specList: string | null): skuAttrItemType[] {
  if (!specList) return [];
  try {
    const parsedSpecList = JSON.parse(specList);
    return parsedSpecList.map((spec: any) => ({
      title: spec.name,
      isAddImage: false,
      values: spec.list.map((item: any) => ({
        properties: item.name,
        skuImg: ''
      }))
    }));
  } catch (error) {
    console.error('解析 specList 失败:', error);
    return [];
  }
}

// 初始化时转换
skuAttributes.value = transformSpecListToSkuAttributes(props.specList);
stockKeepUnits.value =
  props.prodSkus?.map(sku => ({
    ...sku,
    price: Number(sku.price),
    unPrice: Number(sku.unPrice),
    stock: Number(sku.stock),
    totalStock: Number(sku.totalStock)
  })) || [];

// 监听 stockKeepUnits 变化，自动更新父组件的值
watch(
  stockKeepUnits,
  newValue => {
    emit('update:prodSkus', newValue);
  },
  { deep: true }
);

// 监听 skuAttributes 变化，自动更新父组件的值
watch(
  skuAttributes,
  newValue => {
    const transformedData = transformSpecList(newValue);
    emit('update:specList', JSON.stringify(transformedData));
  },
  { deep: true }
);

const skuAttrItem: skuAttrItemType = {
  title: '',
  isAddImage: false,
  values: [{ skuImg: '', properties: '' }]
};

// 校验规则
const rules = {
  properties: {
    required: true,
    message: '请输入名称',
    trigger: ['input', 'blur']
  },
  price: {
    required: true,
    validator: (_rule: any, value: number) => {
      if (!value || value <= 0) {
        return new Error('售价不能为空');
      }
      return true;
    },
    trigger: ['input', 'blur']
  },
  unPrice: {
    required: true,
    validator: (rule: any, value: number) => {
      if (!value || value <= 0) {
        return new Error('划线价不能为空');
      }
      // 获取当前行的售价进行比较
      const rowIndex = rule.field.split('.')[0]; // 获取行索引
      const price = stockKeepUnits.value[rowIndex].price;
      if (price && value < price) {
        return new Error('市场价必须大于等于售价');
      }
      return true;
    },
    trigger: ['input', 'blur']
  },
  stock: {
    required: true,
    validator: (_rule: any, value: number) => {
      if (value < 0) {
        return new Error('库存不能为空');
      }
      return true;
    },
    trigger: ['input', 'blur']
  },
  totalStock: {
    required: true,
    validator: (_rule: any, value: number) => {
      if (value < 0) {
        return new Error('总库存不能为空');
      }
      return true;
    },
    trigger: ['input', 'blur']
  }
};

const columns: DataTableColumns<skuType> = [
  {
    key: 'properties',
    title: '销售规格',
    align: 'center',
    minWidth: 100
  },
  {
    key: 'skuImg',
    title: '图片',
    align: 'center',
    render: row => <ImageUpload v-model={row.skuImg} />
  },
  {
    key: 'skuName',
    title: '名称',
    align: 'center',
    render: (row, index) => (
      <NFormItem path={`${index}.skuName`} rule={rules.properties}>
        <NInput v-model:value={row.skuName} placeholder="请输入名称" />
      </NFormItem>
    )
  },
  {
    key: 'price',
    title: '*售价',
    align: 'center',
    minWidth: 100,
    render: (row, index) => (
      <NFormItem path={`${index}.price`} rule={rules.price}>
        <NInputNumber
          v-model:value={row.price}
          min={0}
          precision={2}
          placeholder="请输入售价"
          onUpdate:value={value => {
            // 当售价变化时的处理
            if (value) {
              // 如果市场价为0或未设置，则将市场价设置为售价
              if (!row.unPrice || row.unPrice === 0) {
                row.unPrice = value;
              }
              // 如果市场价小于售价，则将市场价设置为售价
              else if (row.unPrice < value) {
                row.unPrice = value;
              }
            }
          }}
        />
      </NFormItem>
    )
  },
  {
    key: 'unPrice',
    title: '*划线价',
    align: 'center',
    minWidth: 100,
    render: (row, index) => (
      <NFormItem path={`${index}.unPrice`} rule={rules.unPrice}>
        <NInputNumber v-model:value={row.unPrice} min={0} precision={2} placeholder="请输入市场价" />
      </NFormItem>
    )
  },
  {
    key: 'stock',
    title: '*剩余库存',
    align: 'center',
    minWidth: 100,
    render: (row, index) => (
      <NFormItem path={`${index}.stock`} rule={rules.stock}>
        <NInputNumber v-model:value={row.stock} min={0} precision={0} placeholder="请输入库存" />
      </NFormItem>
    )
  },
  {
    key: 'totalStock',
    title: '*总库存',
    align: 'center',
    minWidth: 100,
    render: (row, index) => (
      <NFormItem path={`${index}.totalStock`} rule={rules.totalStock}>
        <NInputNumber v-model:value={row.totalStock} min={0} precision={0} placeholder="请输入总库存" />
      </NFormItem>
    )
  },
  {
    key: 'status',
    title: '状态',
    align: 'center',
    render: row => (
      <NSwitch v-model:value={row.status} checked-value={1} unchecked-value={0} class="mb-5">
        {{
          'checked-icon': () => <SvgIcon icon="ep:check" />,
          'unchecked-icon': () => <SvgIcon icon="ep:close" />,
          checked: () => '上架',
          unchecked: () => '下架'
        }}
      </NSwitch>
    )
  }
];

/**
 * 删除销售属性
 *
 * @param index
 */
function deleteSkuAttr(index: number) {
  skuAttributes.value.splice(index, 1);
}

/**
 * 删除销售属性字段
 *
 * @param index
 * @param cindex
 */
function deleteSkuAttrName(index: number, cindex: number) {
  skuAttributes.value[index].values.splice(cindex, 1);
}

/**
 * 增加sku属性图片
 *
 * @param index
 * @param cindex
 */
// async function addSkuAttrImage(index: number, cindex: number) {
//   console.log('addSkuAttrImage', index, cindex);
//   // const res = await chooseToFile();
//   // console.log(res);
//   // // 生产环境此处应该是上传到服务端,获取线上url
//   // // 此处写法仅限测试,上传大图片可能造成卡顿
//   // _blobToDataUrl(res[0], res => {
//   //   skuAttributes.value[index].values[cindex].skuImg = res;
//   // });
// }

/**
 * 增加销售属性字段
 *
 * @param index
 */
function addSkuAttrName(index: number) {
  skuAttributes.value[index].values.push({ skuImg: '', properties: '' });
}

/** 切换首个sku是否上传图片的状态 */
// function toggleSkuImg(index: number) {
//   const { isAddImage } = skuAttributes.value[index];
//   if (isAddImage) {
//     skuAttributes.value[index].values.map(e => {
//       e.skuImg = '';
//       return e;
//     });
//   }
//   skuAttributes.value[index].isAddImage = !isAddImage;
// }

/** 增加销售属性 */
function addSkuAttr() {
  skuAttributes.value.push(jsonClone(skuAttrItem));
}

/**
 * 动态更新表格字段
 *
 * @param index
 * @param dataIndex
 */
// function changeSkuData(index: number, dataIndex: string, evt: any) {
//   const value = evt.target.value;
//   stockKeepUnits.value[index][dataIndex] = value;
// }

// 监听销售属性的变化,并构建sku
watch(
  () => skuAttributes.value,
  value => {
    if (value.length) {
      generateSku(jsonClone(value));
    }
  },
  { deep: true }
);

/** 更新销售属性构建sku */
function generateSku(skuAttribute: skuAttrItemType[]) {
  const attrValue: any[] = [];
  skuAttribute.forEach((item: skuAttrItemType) => {
    attrValue.push(item.values);
  });

  let skus: any[] = [];
  if (attrValue.length === 0) {
    stockKeepUnits.value = [];
    return;
  }

  // 生成笛卡尔积
  skus = attrValue.reduce((col: any[], set) => {
    const res: any[] = [];
    if (col.length === 0) {
      return set.map((s: any) => ({
        properties: s.properties,
        skuName: '', // 初始化为空字符串
        skuImg: s.skuImg || ''
      }));
    }
    col.forEach(c => {
      set.forEach((s: any) => {
        const t = `${c.properties},${s.properties}`;
        res.push({
          properties: t,
          skuName: '', // 初始化为空字符串
          skuImg: c.skuImg || s.skuImg || ''
        });
      });
    });
    return res;
  }, []);

  // 保持原有数据
  const oldSkus = stockKeepUnits.value;

  // 增加,回填相关字段
  skus = skus.map((e: skuType) => {
    // 寻找销售规格一致的副本数据
    const old = oldSkus.find(item => item.properties === e.properties);
    return {
      ...e,
      skuId: old?.skuId ?? null,
      skuName: old?.skuName ?? '', // 使用原有的 skuName 或空字符串
      price: old?.price ? Number(old.price) : 0,
      unPrice: old?.unPrice ? Number(old.unPrice) : 0,
      stock: old?.stock ? Number(old.stock) : 0,
      totalStock: old?.totalStock ? Number(old.totalStock) : 0,
      skuImg: old?.skuImg ?? e.skuImg,
      status: old?.status ?? 1
    };
  });

  stockKeepUnits.value = skus;
  // 直接发送更新，不需要交换字段
  emit('update:prodSkus', stockKeepUnits.value);
}

// 添加表单验证方法
async function validate() {
  return formRef.value?.validate();
}

// 暴露验证方法给父组件
defineExpose({
  validate
});
</script>

<template>
  <div class="base_card w-full">
    <div v-for="(item, index) in skuAttributes" :key="index" class="mb-[10px] bg-[#fafafa] p-[8px]">
      <div class="relative flex items-center">
        <NPopconfirm @positive-click="deleteSkuAttr(index)">
          <template #trigger>
            <NButton size="small" class="absolute right-[5px] top-[5px]">删除</NButton>
          </template>
          确认删除吗?
        </NPopconfirm>
        <div class="w-[70px] text-right">属性名称:</div>
        <div>
          <NInput v-model:value="item.title" class="ml-5 w-[130px]" placeholder="请输入属性名称"></NInput>
        </div>
      </div>
      <div class="mt-5 flex items-start">
        <div class="w-[70px] text-right leading-[32px]">属性值:</div>
        <div v-for="(text, cindex) in item.values" :key="cindex" class="sku_item relative ml-5">
          <NButton
            class="sku_item_delete absolute right-[4px] top-[-4px] z-50"
            size="tiny"
            circle
            type="error"
            @click="deleteSkuAttrName(index, cindex)"
          >
            <icon-ic-round-remove class="text-icon" />
          </NButton>
          <div class="mr-[10px] flex flex-col items-center">
            <NInput v-model:value="text.properties" placeholder="请输入属性值" class="w-[130px]"></NInput>
          </div>
        </div>
        <NButton :disabled="item.values.length >= 5" type="primary" quaternary @click="addSkuAttrName(index)">
          增加字段
        </NButton>
      </div>
    </div>
    <div class="mb-3 flex items-center justify-start">
      <NButton type="primary" ghost @click="addSkuAttr">增加销售属性</NButton>
    </div>
    <NForm ref="formRef" :model="stockKeepUnits" :rules="rules" label-placement="left">
      <NDataTable :columns="columns" :data="stockKeepUnits" :pagination="false" :single-line="false" size="small" />
    </NForm>
  </div>
</template>

<style lang="scss" scoped>
.sku_item {
  &:hover {
    .sku_item_delete {
      opacity: 1;
    }
  }
  .sku_item_delete {
    opacity: 0;
  }
}
</style>
