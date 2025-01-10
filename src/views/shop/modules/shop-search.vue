<script setup lang="ts">
import { $t } from '@/locales';

defineOptions({
  name: 'ShopSearch'
});

interface Emits {
  (e: 'reset'): void;
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const model = defineModel<Api.Shop.ShopSearchParams>('model', { required: true });

function reset() {
  emit('reset');
}

function search() {
  emit('search');
}
</script>

<template>
  <NCard :bordered="false" size="small" class="card-wrapper">
    <NCollapse :default-expanded-names="['shop-search']">
      <NCollapseItem :title="$t('common.search')" name="shop-search">
        <NForm :model="model" label-placement="left" :label-width="80">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi span="24 s:12 m:6" label="商户名称" path="name" class="pr-24px">
              <NInput v-model:value="model.name" placeholder="请输入商户名称" @keyup.enter="search" />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:6" label="状态" path="status" class="pr-24px">
              <NSelect
                v-model:value="model.status"
                :options="[
                  { label: '开启', value: 0 },
                  { label: '关闭', value: 1 }
                ]"
                placeholder="请选择状态"
              />
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
