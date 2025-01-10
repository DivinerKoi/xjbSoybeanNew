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

const model = defineModel<Api.Product.ProductInfo>('model', { required: true });

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
        <NForm :model="model" label-placement="left" :label-width="80" inline>
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi span="24 s:12 m:6" label="商品名称" path="prodName" class="pr-24px">
              <NInput v-model:value="model.prodName" placeholder="请输入商品名称" @keyup.enter="search" />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:6" label="商品价格" path="price" class="pr-24px">
              <NInput v-model:value="model.price" placeholder="请输入商品价格" @keyup.enter="search" />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:6" label="简单描述" path="brief" class="pr-24px">
              <NInput v-model:value="model.brief" placeholder="请输入简单描述" @keyup.enter="search" />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:6" class="justify-end">
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
