<script setup lang="ts">
import { reactive, ref } from 'vue';
import { VueCropper } from 'vue-cropper';
import 'vue-cropper/dist/index.css';
import type { UploadFileInfo } from 'naive-ui';
import { fetchUploadAvatar } from '@/service/api/system/user-center';
import { useAuthStore } from '@/store/modules/auth';

defineOptions({ name: 'UserAvatar' });

const authStore = useAuthStore();

const showModal = ref(false);
const visible = ref(false);
const cropperRef = ref();

const options = reactive({
  img: authStore.avatar,
  autoCrop: true,
  autoCropWidth: 200,
  autoCropHeight: 200,
  fixedBox: true,
  outputType: 'png',
  filename: 'avatar',
  previews: {
    url: '',
    img: ''
  }
});

function editAvatar() {
  showModal.value = true;
}

function modalOpened() {
  visible.value = true;
}

function rotateLeft() {
  cropperRef.value?.rotateLeft();
}

function rotateRight() {
  cropperRef.value?.rotateRight();
}

function changeScale(num: number) {
  cropperRef.value?.changeScale(num);
}

function beforeUpload(option: { file: UploadFileInfo; fileList: UploadFileInfo[] }) {
  const file = option.file;
  const isImage = file.type?.includes('image/');
  if (!isImage) {
    window.$message?.error('请上传图片类型,如：JPG，PNG后缀的文件');
    return false;
  }
  const reader = new FileReader();
  if (file.file) {
    reader.readAsDataURL(file.file);
    reader.onload = () => {
      options.img = reader.result as string;
      options.filename = file.name;
    };
  }
  return false;
}

async function uploadAvatar() {
  cropperRef.value?.getCropBlob((data: Blob) => {
    const formData = new FormData();
    formData.append('avatarfile', data, options.filename);
    fetchUploadAvatar(formData).then(({ error }) => {
      if (!error) {
        showModal.value = false;
        window.$message?.success('修改成功');
        visible.value = false;
        authStore.initUserInfo();
      }
    });
  });
}

function realTime(data: { url: string; img: string }) {
  options.previews = data;
}

function closeModal() {
  visible.value = false;
}
</script>

<template>
  <div class="relative inline-block">
    <div class="avatar-wrapper" @click="editAvatar">
      <NAvatar :src="options.img" :size="100" round class="avatar" />
      <div class="avatar-hover">
        <SvgIcon icon="ep:upload-filled" class="text-24px text-white" />
      </div>
    </div>

    <NModal
      v-model:show="showModal"
      title="修改头像"
      preset="card"
      class="w-800px"
      @after-enter="modalOpened"
      @close="closeModal"
    >
      <NGrid :wrap="false" :cols="2" :gap="24">
        <NGi col="12" class="h-350px">
          <VueCropper
            v-if="visible"
            ref="cropperRef"
            :img="options.img"
            :info="true"
            :auto-crop="options.autoCrop"
            :auto-crop-width="options.autoCropWidth"
            :auto-crop-height="options.autoCropHeight"
            :fixed-box="options.fixedBox"
            :output-type="options.outputType"
            @real-time="realTime"
          />
        </NGi>
        <NGi col="12" class="flex-center">
          <div class="avatar-preview">
            <img :src="options.previews.url" :style="options.previews.img" />
          </div>
        </NGi>
      </NGrid>

      <template #footer>
        <NFlex justify="space-between">
          <NFlex align="center" class="gap-12px">
            <NUpload accept="image/*" :max="1" :show-file-list="false" @before-upload="beforeUpload">
              <NButton>选择图片</NButton>
            </NUpload>
            <NButton circle @click="changeScale(1)">
              <SvgIcon icon="ep:plus" />
            </NButton>
            <NButton circle @click="changeScale(-1)">
              <SvgIcon icon="ep:minus" />
            </NButton>
            <NButton circle @click="rotateLeft">
              <SvgIcon icon="ep:refresh-left" />
            </NButton>
            <NButton circle @click="rotateRight">
              <SvgIcon icon="ep:refresh-right" />
            </NButton>
          </NFlex>
          <NButton type="primary" @click="uploadAvatar">提 交</NButton>
        </NFlex>
      </template>
    </NModal>
  </div>
</template>

<style scoped>
.avatar-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
  cursor: pointer;
}

.avatar {
  width: 100%;
  height: 100%;
}

.avatar-hover {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s;
}

.avatar-wrapper:hover .avatar-hover {
  opacity: 1;
}

.avatar-preview {
  width: 200px;
  height: 200px;
  overflow: hidden;
  box-shadow: 0 0 4px #ccc;
  border-radius: 50%;
}
</style>
