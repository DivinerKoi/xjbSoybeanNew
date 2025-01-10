<script setup lang="tsx">
// import { jsonClone } from '@sa/utils';
import type { Ref } from 'vue';
import { computed, ref } from 'vue';
import { NButton, NPopconfirm, NTag } from 'naive-ui';
import dayjs from 'dayjs';
import { type MenuObj, fetchDeleteMenu, fetchGetMenuList } from '@/service/api/system/menu';
import { useAppStore } from '@/store/modules/app';
import { useTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
// import { yesOrNoRecord } from '@/constants/common';
// import { enableStatusRecord, menuTypeRecord } from '@/constants/business';
import SvgIcon from '@/components/custom/svg-icon.vue';
import { handleTree } from '@/utils/ruoyi';
import MenuOperateModal, { type OperateType } from './modules/menu-operate-modal.vue';
// const { bool: visible, setTrue: openModal } = useBoolean();
const appStore = useAppStore();

const wrapperRef = ref<HTMLElement | null>(null);
const { columns, columnChecks, data, loading, getData } = useTable({
  apiFn: fetchGetMenuList,
  columns: () => [
    {
      key: 'menuName',
      title: '菜单名称',
      align: 'center',
      width: 160,
      render: row => {
        return <span>{row.menuName}</span>;
      }
    },
    {
      key: 'icon',
      title: $t('page.manage.menu.icon'),
      align: 'center',
      width: 60,
      render: row => {
        const icon = row.iconType === '1' ? row.icon : undefined;
        const localIcon = row.iconType === '2' ? row.icon : undefined;
        return (
          <div class="flex-center">
            <SvgIcon icon={icon} localIcon={localIcon} class="text-icon" />
          </div>
        );
      }
    },
    {
      key: 'orderNum',
      title: '排序',
      align: 'center',
      width: 60,
      render: row => <span>{row.orderNum}</span>
    },
    {
      key: 'perms',
      title: '权限标识',
      align: 'center',
      render: row => <span>{row.perms}</span>
    },
    {
      key: 'component',
      title: '组件路径',
      align: 'center',
      render: row => <span title={row.component}>{row.component}</span>
    },
    {
      key: 'path',
      title: '路由路径',
      align: 'center',
      render: row => <span title={row.path}>{row.path}</span>
    },
    {
      key: 'status',
      title: '状态',
      align: 'center',
      width: 80,
      render: row => {
        const tagMap: Record<Api.Common.SpecialEnableStatus, NaiveUI.ThemeColor> = {
          '0': 'success',
          '1': 'warning'
        };
        return <NTag type={tagMap[row.status]}>{row.status === '0' ? '启用' : '禁用'}</NTag>;
      }
    },
    {
      key: 'createTime',
      title: '创建时间',
      align: 'center',
      width: 160,
      render: row => <span>{dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss')}</span>
    },
    {
      key: 'operate',
      title: '操作',
      align: 'center',
      width: 210,
      render: row => (
        <div class="flex-center justify-end gap-8px">
          <NButton type="primary" ghost size="small" onClick={() => edit(row)}>
            {$t('common.edit')}
          </NButton>
          <NButton type="primary" ghost size="small" onClick={() => handleAddChild(row)}>
            新增子菜单
          </NButton>
          <NPopconfirm onPositiveClick={() => handleDelete(row.menuId)}>
            {{
              default: () => $t('common.confirmDelete'),
              trigger: () => (
                <NButton type="error" ghost size="small">
                  {$t('common.delete')}
                </NButton>
              )
            }}
          </NPopconfirm>
        </div>
      )
    }
  ]
});

// const data = ref<MenuObj[]>([]); // 表格数据
// const loading = ref(false); // 加载状态
// 获取菜单列表
// const getData = async () => {
//   loading.value = true;
//   const response = await fetchGetMenuList();
//   getAllPages(response?.data ?? []);
//   const records: MenuObj[] = jsonClone(response?.data ?? []); // 如果是 null，使用空数组
//   data.value = handleTree(records, 'menuId'); // 处理树形结构
//   console.log('菜单的树形结构：', data.value);
//   loading.value = false;
//   // pagination.value.itemCount = total;
//   // eslint-disable-next-line no-useless-catch,@typescript-eslint/no-unused-vars
// };

// const columns = [
//   {
//     key: 'menuName',
//     title: '菜单名称',
//     align: 'center',
//     width: 160,
//     render: (row: MenuObj) => {
//       // const { i18nKey, menuName } = row;
//
//       // const label = i18nKey ? $t(i18nKey) : menuName;
//
//       return <span>{row.menuName}</span>;
//     }
//   },
//   {
//     key: 'icon',
//     title: $t('page.manage.menu.icon'),
//     align: 'center',
//     width: 60,
//     render: (row: MenuObj) => {
//       const icon = row.iconType === '1' ? row.icon : undefined;
//       const localIcon = row.iconType === '2' ? row.icon : undefined;
//       //       const icon = '1';
//       //       const localIcon = '2';
//       return (
//         <div class="flex-center">
//           <SvgIcon icon={icon} localIcon={localIcon} class="text-icon" />
//         </div>
//       );
//     }
//   },
//   {
//     key: 'orderNum',
//     title: '排序',
//     align: 'center',
//     width: 60,
//     render: (row: MenuObj) => <span>{row.orderNum}</span>
//   },
//   {
//     key: 'perms',
//     title: '权限标识',
//     align: 'center',
//     render: (row: MenuObj) => <span>{row.perms}</span>
//   },
//   {
//     key: 'component',
//     title: '组件路径',
//     align: 'center',
//     render: (row: MenuObj) => <span title={row.component}>{row.component}</span>
//   },
//   {
//     key: 'path',
//     title: '路由路径',
//     align: 'center',
//     render: (row: MenuObj) => <span title={row.path}>{row.path}</span>
//   },
//   {
//     key: 'status',
//     title: '状态',
//     align: 'center',
//     width: 80,
//     render: (row: MenuObj) => {
//       const tagMap: Record<Api.Common.SpecialEnableStatus, NaiveUI.ThemeColor> = {
//         '0': 'success',
//         '1': 'warning'
//       };
//       // const label = $t(enableStatusRecord[row.status]);
//       return <NTag type={tagMap[row.status]}>{row.status === '0' ? '启用' : '禁用'}</NTag>;
//     }
//   },
//   {
//     key: 'createTime',
//     title: '创建时间',
//     align: 'center',
//     width: 160,
//     render: (row: MenuObj) => <span>{dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss')}</span>
//   },
//   {
//     key: 'operate',
//     title: '操作',
//     align: 'center',
//     width: 210,
//     render: (row: MenuObj) => (
//       <div class="flex-center justify-end gap-8px">
//         <NButton type="primary" ghost size="small" onClick={() => handleEdit(row)}>
//           {$t('common.edit')}
//         </NButton>
//         <NButton type="primary" ghost size="small" onClick={() => handleAdd(row)}>
//           新增
//         </NButton>
//         <NPopconfirm onPositiveClick={() => handleDelete(row)}>
//           {{
//             default: () => $t('common.confirmDelete'),
//             trigger: () => (
//               <NButton type="error" ghost size="small">
//                 {$t('common.delete')}
//               </NButton>
//             )
//           }}
//         </NPopconfirm>
//       </div>
//     )
//   }
// ];

const { drawerVisible, checkedRowKeys, onBatchDeleted, onDeleted } = useTableOperate(data, getData);

// 计算树形
const treeData = computed(() => {
  return handleTree(data.value, 'menuId');
});

const allPages = computed(() => {
  return data.value
    .filter(item => (item.menuType === 'M' || item.menuType === 'C') && item.routeName)
    .map(item => item.routeName as string);
});

const operateType = ref<OperateType>('add');
/** the edit menu data or the parent menu data when adding a child menu */
const editingData: Ref<Api.SystemManage.Menu | null> = ref(null);
function handleAdd() {
  operateType.value = 'add';
  drawerVisible.value = true;
}
function handleAddChild(item: Api.SystemManage.Menu) {
  operateType.value = 'addChild';
  editingData.value = { ...item };
  drawerVisible.value = true;
}
async function handleBatchDelete() {
  onBatchDeleted();
}
// 删除菜单
async function handleDelete(menuId: number) {
  // request
  const { error } = await fetchDeleteMenu(menuId);
  if (!error) {
    await onDeleted();
  }
  // if (!error) {
  //   window.$message?.success($t('common.deleteSuccess'));
  //
  //   await getData();
  // }
}

// function handleEdit(item: Api.SystemManage.Menu) {
//   operateType.value = 'edit';
//   editingData.value = { ...item };
//   openModal();
// }

// function handleAddChildMenu(item: Api.SystemManage.Menu) {
//   operateType.value = 'addChild';
//
//   editingData.value = { ...item };
//
//   openModal();
// }

// const allPages = ref<string[]>([]);
// // 获取所有页面 （用于隐藏菜单是选择哪个高亮)
// function getAllPages(list: Api.SystemManage.Menu[]) {
//   const pages = list
//     .filter(item => (item.menuType === 'M' || item.menuType === 'C') && item.routeName)
//     .map(item => item.routeName as string);
//   allPages.value = pages;
// }

async function edit(item: Api.SystemManage.Menu) {
  operateType.value = 'edit';
  editingData.value = item;
  drawerVisible.value = true;
}

function init() {
  // getAllPages();
  // getData();
}

// init
init();
</script>

<template>
  <div ref="wrapperRef" class="flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <NCard :title="$t('page.manage.menu.title')" :bordered="false" size="small" class="sm:flex-1-hidden card-wrapper">
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
        :data="treeData"
        size="small"
        :flex-height="!appStore.isMobile"
        :scroll-x="1088"
        :loading="loading"
        :row-key="(row: MenuObj) => row.menuId"
        remote
        class="sm:h-full"
      />
      <MenuOperateModal
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        :all-pages="allPages"
        @submitted="getData"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
