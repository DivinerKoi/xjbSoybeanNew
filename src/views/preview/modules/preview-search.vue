<script setup lang="ts">
import { NDatePicker } from 'naive-ui';
import { $t } from '@/locales';

defineOptions({
  name: 'PreviewSearch'
});
interface Emits {
  (e: 'reset'): void;
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const model = defineModel<Api.Preview.PreviewSearchParams>('model', { required: true });

function reset() {
  emit('reset');
}

function search() {
  emit('search');
}

</script>

<template>
  <NCard :bordered="false" size="small" class="card-wrapper">
    <NCollapse :default-expanded-names="['preview-search']">
      <NCollapseItem :title="$t('common.search')" name="preview-search">
        <NForm :model="model" label-placement="left">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi span="24 s:12 m:6" label="预约人" path="nickName" class="pr-24px">
              <NInput v-model:value="model.nickName" placeholder="请输入预约人" @keyup.enter="search" />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:6" label="预约码" path="previewNum" class="pr-24px">
              <NInput v-model:value="model.previewNum" placeholder="请输入预约码" @keyup.enter="search" />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:6" label="联系电话" path="phone" class="pr-24px">
              <NInput v-model:value="model.phone" placeholder="请输入联系电话" @keyup.enter="search" />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:6" label="预约日期" path="previewDate" class="pr-24px">
              <NDatePicker
                v-model:formatted-value="model.previewDate"
                type="date"
                clearable
                format="yyyy-MM-dd"
                value-format="yyyy-MM-dd"
                placeholder="请选择预约日期"
                @update:formatted-value="search"
              />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:6" label="预约状态" path="statusList" class="pr-24px">
              <NSelect
                v-model:value="model.statusList"
                multiple
                :options="[
                  { label: '未核销', value: '1' },
                  { label: '进行中', value: '2' },
                  { label: '已完成', value: '3' },
                  { label: '已撤销', value: '4' }
                ]"
                placeholder="请选择预约状态"
                clearable
              />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:18">
              <NSpace class="w-full" justify="end">
                <NButton @click="reset">
                  <template #icon>
                    <icon-ic-round-refresh class="text-icon" />
                  </template>
                  重置
                </NButton>
                <NButton type="primary" ghost @click="search">
                  <template #icon>
                    <icon-ic-round-search class="text-icon" />
                  </template>
                  搜索
                </NButton>
              </NSpace>
            </NFormItemGi>
          </NGrid>
        </NForm>
      </NCollapseItem>
    </NCollapse>
  </NCard>
</template>

<style scoped>
:deep(.n-date-picker) {
  width: 100%;
}
</style>
