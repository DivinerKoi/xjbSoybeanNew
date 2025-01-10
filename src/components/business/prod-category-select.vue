<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { fetchGetProdCategoryList } from '@/service/api/product/category';

interface Props {
  modelValue?: number; // 当前选中的分类ID
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:modelValue': [value: number];
  select: [categoryId: number]; // 选择分类时触发
}>();

const categoryList = ref<Array<Api.Product.Category>>([]);

// 获取分类列表
async function getCategoryList() {
  const { data, error } = await fetchGetProdCategoryList();
  if (!error) {
    const result = data.data;
    categoryList.value = result;
    // 如果没有选中值且有分类数据，默认选中第一个
    if (!props.modelValue && result.length) {
      handleSelect(result[0].categoryId);
    }
  }
}

// 处理分类选择
function handleSelect(categoryId: number) {
  emit('update:modelValue', categoryId);
  emit('select', categoryId);
}

// 组件挂载时获取分类列表
onMounted(() => {
  getCategoryList();
});
</script>

<template>
  <NCard class="h-full w-176px bg-white" size="small">
    <div
      v-for="item in categoryList"
      :key="item.categoryId"
      class="pb-10px pt-10px"
      :class="{
        'bg-gray-100 rounded-t-md': item.categoryId === modelValue,
        'hover:scale-105': item.categoryId !== modelValue
      }"
    >
      <NFlex
        align="flex-start"
        class="cursor-pointer"
        :class="{ 'text-primary': item.categoryId === modelValue }"
        @click="handleSelect(item.categoryId)"
      >
        <i class="iconfont ml-2" :class="item.icon" />
        <span>{{ item.categoryName }}</span>
      </NFlex>
    </div>
  </NCard>
</template>

<style scoped></style>
