<script setup lang="tsx">
import { NButton, NImage, NImageGroup, NModal, NPopconfirm } from 'naive-ui';
import { ref } from 'vue';
import { $t } from '@/locales';
import { useAppStore } from '@/store/modules/app';
import { useTable, useTableOperate } from '@/hooks/common/table';
import { fetchDeleteCourse, fetchGetCourseList } from '@/service/api/article/course';
import CourseOperateDrawer from './modules/course-operateDrawer.vue';
import CourseSearch from './modules/course-search.vue';

interface CourseItem {
  id: number;
  title: string;
  desc: string;
  pic: string;
  visitCount: number;
  context: string;
}

const appStore = useAppStore();

// 富文本预览相关
const showPreview = ref(false);
const previewContent = ref('');

const handlePreview = (content: string) => {
  previewContent.value = content;
  showPreview.value = true;
};

const {
  columns,
  columnChecks,
  data,
  loading,
  getData,
  getDataByPage,
  mobilePagination,
  searchParams,
  resetSearchParams
} = useTable({
  apiFn: fetchGetCourseList,
  apiParams: {
    pageNum: 1,
    pageSize: 10,
    title: null
  },
  showTotal: true,
  columns: () => [
    {
      type: 'selection',
      align: 'center',
      width: 48
    },
    {
      key: 'pic',
      title: '封面',
      align: 'center',
      render: row => (
        <NImageGroup>
          <NImage width="80" height="80" src={row.pic} />
        </NImageGroup>
      )
    },
    {
      key: 'title',
      title: '标题',
      align: 'center',
      minWidth: 120
    },

    {
      key: 'desc',
      title: '描述',
      align: 'center',
      minWidth: 180
    },
    {
      key: 'visitCount',
      title: '点击量',
      align: 'center',
      minWidth: 80
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 200,
      render: (row: CourseItem) => (
        <div class="flex-center gap-8px">
          <NButton type="info" ghost size="small" onClick={() => handlePreview(row.context)}>
            查看
          </NButton>
          <NButton type="primary" ghost size="small" onClick={() => edit(row.id)}>
            编辑
          </NButton>
          <NPopconfirm onPositiveClick={() => handleDelete(row.id)}>
            {{
              default: () => '确认删除？',
              trigger: () => (
                <NButton type="error" ghost size="small">
                  删除
                </NButton>
              )
            }}
          </NPopconfirm>
        </div>
      )
    }
  ]
});

const {
  drawerVisible,
  operateType,
  editingData,
  handleAdd,
  handleSimpleEdit,
  checkedRowKeys,
  onBatchDeleted,
  onDeleted
} = useTableOperate(data, getData, 'id');

// 批量删除
async function handleBatchDelete() {
  const { error } = await fetchDeleteCourse(checkedRowKeys.value);
  if (!error) {
    await onBatchDeleted();
  }
}

// 修改重置方法，重置后自动请求数据
const handleReset = async () => {
  await resetSearchParams();
  await getDataByPage();
};
async function handleDelete(id: string) {
  const { error } = await fetchDeleteCourse([id]);
  if (!error) {
    await onDeleted();
  }
}
async function edit(id: number) {
  handleSimpleEdit(id);
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">

    <CourseSearch v-model:model="searchParams" @reset="handleReset" @search="getDataByPage" />

    <NCard title="雪茄课堂" :bordered="false" size="small" class="sm:flex-1-hidden card-wrapper">

      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          @add="handleAdd"
          @delete="handleBatchDelete"
          @refresh="getData"
        />
      </template>

      <NDataTable
        v-model:checked-row-keys="checkedRowKeys"
        :columns="columns"
        :data="data"
        size="small"
        :flex-height="!appStore.isMobile"
        :scroll-x="702"
        :loading="loading"
        remote
        :row-key="(row: any) => row.roleId"
        :pagination="mobilePagination"
        class="sm:h-full"
      />
      <CourseOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getDataByPage"
      />
    </NCard>

    <!-- 富文本预览弹窗 -->
    <NModal v-model:show="showPreview" preset="card" style="width: 1000px" title="内容预览">
      <div class="rich-text-preview" v-html="previewContent"></div>
    </NModal>
  </div>
</template>

<style scoped>
.rich-text-preview {
  max-height: 60vh;
  overflow-y: auto;
  padding: 16px;
}

/* 确保富文本内容样式正确显示 */
.rich-text-preview :deep(img) {
  max-width: 100%;
  height: auto;
}
</style>
