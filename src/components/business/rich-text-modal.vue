<script setup lang="ts">
import {NModal} from "naive-ui";
defineOptions({
  name: 'RichTextModal' // 富文本预览弹窗
});
const visible = defineModel<boolean>('visible', {
  default: false
});
interface Props {
  title: string;
  content: string;
}

const props = defineProps<Props>();
</script>

<template>
  <NModal v-model:show="visible" preset="card" class="w-800px" :title="props.title">
    <NScrollbar class="h-75vh">
      <div class="" v-html="props.content"></div>
    </NScrollbar>
  </NModal>
</template>

<style scoped></style>
