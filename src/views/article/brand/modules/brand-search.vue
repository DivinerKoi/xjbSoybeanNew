<script setup lang="ts">
import { $t } from '@/locales';

defineOptions({
  name: 'CategorySearch'
});

interface Emits {
  (e: 'reset'): void;
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const model = defineModel<Api.Brand.BrandInfo>('model', { required: true });

function reset() {
  emit('reset');
}

function search() {
  emit('search');
}
</script>

<template>
  <NCard :bordered="false" size="small" class="card-wrapper">
    <NCollapse :default-expanded-names="['role-search']">
      <NCollapseItem :title="$t('common.search')" name="role-search">
        <NForm :model="model" label-placement="left">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi span="24 s:12 m:6" label="标题" path="title" class="pr-24px">
              <NInput v-model:value="model.title" placeholder="请输入标题" @keyup.enter="search" />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:6" label="描述" path="desc" class="pr-24px">
              <NInput v-model:value="model.desc" placeholder="请输入描述" @keyup.enter="search" />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:12">
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

<style scoped></style>
