<script setup lang="ts">
import { useRouter } from 'vue-router';
import BarTitle from '@/components/common/barTitle.vue';
defineOptions({
  name: 'CommonFunctions'
});
const router = useRouter();

const functionList = [
  {
    name: '包厢服务',
    routeName: 'room-service'
  },
  {
    name: '发布商品',
    routeName: 'product_prod-info'
  },
  {
    name: '历史预约',
    routeName: 'preview'
  },
  {
    name: '会员管理',
    routeName: 'member'
  },
  {
    name: '包厢管理',
    routeName: 'room'
  }
];

// 预定义图片路径数组
const images = [
  new URL('@/assets/imgs/function-1.png', import.meta.url).href,
  new URL('@/assets/imgs/function-2.png', import.meta.url).href,
  new URL('@/assets/imgs/function-3.png', import.meta.url).href,
  new URL('@/assets/imgs/function-4.png', import.meta.url).href,
  new URL('@/assets/imgs/function-5.png', import.meta.url).href
];

// 导航方法
function toNav(routeName: string) {
  try {
    // 如果路由名称为空或不存在，则不执行跳转
    if (!routeName) {
      window.$message?.warning('功能开发中');
      return;
    }

    // 跳转到指定页面
    router
      .push({
        name: routeName
      })
      .catch(err => {
        // 如果路由不存在，显示提示
        if (err.name === 'NavigationFailure') {
          window.$message?.error('页面不存在');
        }
      });
  } catch (error) {
    console.error('Navigation error:', error);
    window.$message?.error('导航出错');
  }
}
</script>

<template>
  <NCard :bordered="false" class="card-wrapper">
    <BarTitle title="常用功能" :show-select="false"></BarTitle>
    <div class="grid grid-cols-5 gap-4">
      <div
        v-for="(item, index) in functionList"
        :key="item.name"
        class="flex-center flex-col cursor-pointer"
        @click="toNav(item.routeName)"
      >
        <div class="h-42px w-42px flex-center rd-full bg-primary:10 transition-shadow duration-300 hover:shadow-lg">
          <img :src="images[index]" class="h-full w-full" alt="" />
        </div>
        <span class="mt-2 text-14px whitespace-nowrap">{{ item.name }}</span>
      </div>
    </div>
  </NCard>
</template>

<style scoped></style>
