<script setup lang="ts">
import { ref } from 'vue';
import type { UploadFileInfo } from 'naive-ui';
import { localStg } from '@/utils/storage';

defineOptions({
  name: 'MaterialsUpload'
});

// 上传服务器地址
const uploadUrl = `${import.meta.env.VITE_SERVICE_BASE_URL}/system/oss/uploadLocalDev`;

// 请求头中添加 token
const headers = {
  Authorization: `Bearer ${localStg.get('token')}` as string
};

const fileList = ref<UploadFileInfo[]>([]);

// 上传前校验
const beforeUpload = (data: { file: UploadFileInfo; fileList: UploadFileInfo[] }) => {
  // 检查文件大小（限制为 15MB）
  if (data.file.file) {
    const sizeInMB = data.file.file.size / 1024 / 1024;
    if (sizeInMB > 15) {
      window.$message?.error('文件大小不能超过15MB');
      return false;
    }
  }

  // 检查文件类型
  if (data.file.file) {
    const fileName = data.file.file.name;
    const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
    const allowTypes = ['.jpg', '.jpeg', '.png', '.gif'];
    if (!allowTypes.includes(ext)) {
      window.$message?.error(`只支持${allowTypes.join('、')}格式`);
      return false;
    }
  }

  return true;
};

// 上传完成回调
const handleFinish = ({ file, event }: { file: UploadFileInfo, event: Event }) => {
  const target = event.target as XMLHttpRequest; // 将 event.target 显式地断言为 XMLHttpRequest
  const res = JSON.parse(target.response); // 访问 response 属性
  const copyUrl = res.data.url; // 拷贝文件 URL 到剪贴板
  const input = document.createElement('input');
  input.value = copyUrl;
  document.body.appendChild(input);
  input.select();
  document.execCommand('copy');
  document.body.removeChild(input);
  if (file.status === 'finished') {
    window.$message?.success(`${file.name} 上传成功, 链接已复制到剪贴板`);
  } else {
    window.$message?.error(`${file.name} 上传失败`);
  }
};
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <NCard title="素材上传" :bordered="false" size="small" class="sm:flex-1-hidden card-wrapper">
      <div class="w-full flex-center">
        <NUpload
          :action="uploadUrl"
          :headers="headers"
          :default-file-list="fileList"
          :max="10"
          multiple
          directory-dnd
          :accept="['.jpg', '.jpeg', '.png', '.gif']"
          @before-upload="beforeUpload"
          @finish="handleFinish"
        >
          <NUploadDragger>
            <div class="flex-col-center py-24px">
              <div class="mb-12px">
                <!--                <NIcon size="48" :depth="3">-->
                <!--                  <CloudUploadOutline />-->
                <!--                </NIcon>-->
              </div>
              <NText class="text-16px">点击或者拖动文件到该区域来上传</NText>
              <NP depth="3" class="mb-0 mt-8px">支持 jpg、jpeg、png、gif 格式，单个文件不超过 15MB</NP>
            </div>
          </NUploadDragger>
        </NUpload>
      </div>
    </NCard>
  </div>
</template>

<style scoped>
:deep(.n-upload-trigger) {
  width: 100%;
  max-width: 600px;
}
</style>
