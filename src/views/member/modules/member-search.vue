<script setup lang="ts">
defineOptions({ name: 'MemberSearch' });

interface Emits {
  (e: 'reset'): void;
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();
const model = defineModel<Api.Member.MemberSearchParams>('model', { required: true });

function reset() {
  emit('reset');
}

function search() {
  emit('search');
}
</script>

<template>
  <NCard :bordered="false" size="small" class="card-wrapper">
    <NCollapse :default-expanded-names="['member-search']">
      <NCollapseItem :title="$t('common.search')" name="member-search">
        <NForm :model="model" label-placement="left">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi span="24 s:12 m:6" label="会员名称" path="name" class="pr-24px">
              <NInput v-model:value="model.name" placeholder="请输入会员名称" @keyup.enter="search" />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:6" label="用户类型" path="type" class="pr-24px">
              <NSelect
                v-model:value="model.type"
                :options="[
                  { label: '会员', value: 1 },
                  { label: '服务员', value: 2 }
                ]"
                placeholder="请选择用户类型"
                clearable
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
