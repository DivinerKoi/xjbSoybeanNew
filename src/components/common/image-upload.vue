<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { UploadFileInfo } from 'naive-ui';
import { localStg } from '@/utils/storage';
import { isExternal } from '@/utils/ruoyi';
defineOptions({
  name: 'ImageUpload'
});
// 上传服务器地址
const baseUrl: string = import.meta.env.VITE_BASE_URL;
const uploadUrl: string = `${import.meta.env.VITE_SERVICE_BASE_URL}/${import.meta.env.VITE_SERVICE_UPLOAD}`;

interface Headers {
  Authorization: string;
}
const headers: Headers = {
  Authorization: `Bearer ${localStg.get('token')}` as string
};
interface Props {
  modelValue?: string | string[]; // 用于v-model绑定
  maxCount?: number; // 最大上传数量
  maxSize?: number; // 最大文件大小(MB)
  accept?: string[]; // 允许的文件类型
  multiple?: boolean; // 是否支持多选
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  maxCount: 1,
  maxSize: 15,
  accept: () => ['.jpg', '.jpeg', '.png', '.gif'],
  multiple: true
});

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void;
}>();

// 示例：触发事件
emit('update:modelValue', '');

const isMultiple = computed(() => {
  if (props.maxCount === 1) return false;
  return props.multiple;
});

// 文件列表
const fileList = ref<UploadFileInfo[]>([]);

watch(
  () => props.modelValue,
  val => {
    if (val) {
      // 将值转换为数组
      let list: string[] = [];

      // 确保 list 是数组，如果是字符串，则 split 成数组
      if (Array.isArray(val)) {
        list = val;
      } else if (typeof props.modelValue === 'string') {
        list = props.modelValue.split(',');
      }

      // 转换为符合要求的对象数组
      fileList.value = list.map((item: any, index: number) => {
        let name = '';
        let url = '';

        if (typeof item === 'string') {
          // 检查是否为外部链接或需要补全 baseUrl
          if (!item.includes(baseUrl) && !isExternal(item)) {
            url = `${baseUrl}${item}`;
            name = item.split('/').pop() || '未知文件'; // 使用文件名部分
          } else {
            url = item;
            name = item.split('/').pop() || '未知文件'; // 使用文件名部分
          }
        } else if (typeof item === 'object' && item.url) {
          url = item.url;
          name = item.name || item.url.split('/').pop() || '未知文件';
        }

        // 返回符合要求的对象
        return {
          id: String(index + 1), // 使用索引 + 1 作为 ID
          name,
          status: 'finished', // 统一状态为 'finished'
          url
        };
      });
    } else {
      fileList.value = []; // 如果值为空，则重置列表
    }
    emit('update:modelValue', listToString(fileList.value));
  },
  { deep: true, immediate: true }
);

// 上传前校验
const beforeUpload = (data: { file: UploadFileInfo; fileList: UploadFileInfo[] }) => {
  // 检查文件大小
  if (data.file.file) {
    const sizeInMB = data.file.file.size / 1024 / 1024;
    if (sizeInMB > props.maxSize) {
      window.$message?.error(`文件大小不能超过${props.maxSize}MB`);
      return false;
    }
  }
  // 检查文件类型
  if (data.file.file) {
    const fileName = data.file.file.name;
    const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
    if (!props.accept.includes(ext)) {
      window.$message?.error(`只支持${props.accept.join('、')}格式`);
      return false;
    }
  }

  return true;
};

// 上传完成
const handleSuccess = ({ event }: { event: Event }) => {
  const target = event.target as XMLHttpRequest; // 将 event.target 显式地断言为 XMLHttpRequest
  const res = JSON.parse(target.response); // 访问 response 属性
  fileList.value.push({
    id: String(fileList.value.length + 1),
    name: res.data.name,
    status: 'finished',
    url: res.data.url
  });
  emit('update:modelValue', listToString(fileList.value));
};

//
// const handleSuccess = (data: any) => {
//   console.log('handleSuccess', data)
//   console.log('fileList', fileList.value);
//
//   const response = data.file.response as { url: string };
//   emit('update:value', response.url);
// };

// 删除文件
const handleRemove = ({ index }: { index: number }) => {
  fileList.value.splice(index, 1);
  emit('update:modelValue', listToString(fileList.value));
};
// 对象转成指定字符串分隔
function listToString(list: UploadFileInfo[], separator: string = ','): string {
  // 过滤掉不合法的 URL，保留符合条件的
  return list
    .map(item => item.url)
    .filter(url => url && !url.startsWith('blob:')) // 忽略 blob URL
    .join(separator); // 以逗号拼接
}
</script>

<template>
  <NUpload
    :action="uploadUrl"
    :headers="headers"
    :max="maxCount"
    :default-file-list="fileList"
    list-type="image-card"
    :accept="accept.join(',')"
    :multiple="isMultiple"
    @before-upload="beforeUpload"
    @finish="handleSuccess"
    @remove="handleRemove"
  >
    点击上传
  </NUpload>
</template>

<style scoped></style>
