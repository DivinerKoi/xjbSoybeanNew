<script setup lang="ts">
import { computed } from 'vue';
import { NImage, NImageGroup } from 'naive-ui';

interface Props {
  /** 图片地址，支持字符串(逗号分隔)或数组 */
  imgs: string | string[];
  /** 图片宽度 */
  width?: number | string;
  /** 图片高度 */
  height?: number | string;
  /** 是否显示图片数量 */
  showCount: boolean;
  /** 物图片文字 */
  emptyText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  width: 80,
  height: 80,
  showCount: true,
  emptyText: '暂无图片'
});

const imageList = computed(() => {
  if (Array.isArray(props.imgs)) {
    return props.imgs;
  }
  return props.imgs ? props.imgs.split(',').filter(Boolean) : [];
});

</script>

<template>
  <div class="relative inline-block">
    <NImageGroup v-if="imageList.length">
      <NImage :src="imageList[0]" :width="width" :height="height" class="rounded" />
      <!-- 用于触发预览的隐藏图片 -->
      <NImage
        v-for="(img, index) in imageList"
        ref="previewImage"
        :key="index"
        :src="img"
        class="hidden"
        :width="0"
        :height="0"
      />
    </NImageGroup>
    <span v-else class="text-gray">{{ props.emptyText }}</span>
    <!-- 图片数量提示 -->
    <div
      v-if="imageList.length > 1"
      class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-center text-12px text-white"
    >
      共{{ imageList.length }}张
    </div>
  </div>
</template>

<style scoped>
.hidden {
  display: none;
}
</style>
