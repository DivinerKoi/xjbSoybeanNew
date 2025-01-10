<script setup lang="ts">
import { onBeforeUnmount, ref, shallowRef, watch } from 'vue';
import '@wangeditor/editor/dist/css/style.css';
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import type { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor';
import { localStg } from '@/utils/storage';

interface Props {
  modelValue?: string;
  height?: string;
  mode?: 'default' | 'simple';
  placeholder?: string;
  readonly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  height: '400px',
  mode: 'default',
  placeholder: '请输入内容...',
  readonly: false
});

const emit = defineEmits(['update:modelValue', 'change']);

// 编辑器实例
const editorRef = shallowRef<IDomEditor>();

// 内容
const valueHtml = ref(props.modelValue);

// 工具栏配置
const toolbarConfig = ref<Partial<IToolbarConfig>>({
  excludeKeys: props.mode === 'simple' ? ['uploadImage', 'insertTable', 'codeBlock', 'todo'] : []
});

// 编辑器配置
const editorConfig = ref<Partial<IEditorConfig>>({
  placeholder: props.placeholder,
  readOnly: props.readonly,
  MENU_CONF: {
    uploadImage: {
      server: `${import.meta.env.VITE_SERVICE_BASE_URL}/${import.meta.env.VITE_SERVICE_UPLOAD}`,
      fieldName: 'file',
      maxFileSize: 10 * 1024 * 1024,
      maxNumberOfFiles: 10,
      allowedFileTypes: ['image/*'],
      headers: {
        Authorization: `Bearer ${localStg.get('token')}` as string
      },
      customInsert(res: { data: { url: string } }, insertFn: (url: string) => void) {
        insertFn(res.data.url);
      }
    }
  }
});

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor === null || editor === undefined) return;
  editor.destroy();
});

// 监听内容变化
watch(
  () => valueHtml.value,
  (val: string) => {
    emit('update:modelValue', val);
    emit('change', val);
  }
);

// 监听 props.modelValue 变化
watch(
  () => props.modelValue,
  (val: string) => {
    if (val !== valueHtml.value) valueHtml.value = val;
  }
);
</script>

<template>
  <div class="wang-editor-container">
    <Toolbar :editor="editorRef" :default-config="toolbarConfig" mode="default" class="border border-[#ccc]" />
    <Editor
      v-model="valueHtml"
      :default-config="editorConfig"
      mode="default"
      :style="{ height: props.height }"
      class="border border-t-0 border-[#ccc]"
      @on-created="editorRef = $event"
    />
  </div>
</template>

<style scoped>
.wang-editor-container {
  width: 100%;
}
</style>
