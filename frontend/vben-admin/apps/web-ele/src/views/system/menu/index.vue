<template>
  <Page
    description="管理系统菜单权限，支持三级权限控制：菜单权限、路由权限、按钮权限"
    title="菜单权限管理"
  >
    <!-- 操作栏 -->
    <div class="header-actions">
      <ElButton type="primary" @click="handleAdd">
        <Icon icon="lucide:plus" class="mr-1" />
        新增菜单
      </ElButton>
      <ElButton @click="expandAll">
        <Icon icon="lucide:expand" class="mr-1" />
        展开全部
      </ElButton>
      <ElButton @click="collapseAll">
        <Icon icon="lucide:fold" class="mr-1" />
        收起全部
      </ElButton>
      <ElButton @click="refreshData">
        <Icon icon="lucide:refresh-cw" class="mr-1" />
        刷新
      </ElButton>
    </div>

    <!-- 搜索筛选区域 -->
    <ElCard class="search-card">
      <ElForm :model="searchForm" inline class="search-form">
        <ElFormItem label="菜单名称">
          <ElInput
            v-model="searchForm.name"
            placeholder="请输入菜单名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </ElFormItem>
        <ElFormItem label="权限类型">
          <ElSelect v-model="searchForm.type" placeholder="请选择权限类型" clearable>
            <ElOption label="菜单权限" :value="1" />
            <ElOption label="路由权限" :value="2" />
            <ElOption label="按钮权限" :value="3" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="状态">
          <ElSelect v-model="searchForm.status" placeholder="请选择状态" clearable>
            <ElOption label="启用" :value="true" />
            <ElOption label="禁用" :value="false" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem>
          <ElButton type="primary" @click="handleSearch">
            <Icon icon="lucide:search" class="mr-1" />
            搜索
          </ElButton>
          <ElButton @click="resetSearch">
            <Icon icon="lucide:rotate-ccw" class="mr-1" />
            重置
          </ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>

    <!-- 菜单树形表格 -->
    <ElCard class="table-card">
      <ElTable
        ref="tableRef"
        v-loading="loading"
        :data="menuList"
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        :default-expand-all="false"
        border
        stripe
        class="menu-table"
      >
        <ElTableColumn prop="name" label="菜单名称" min-width="200">
          <template #default="{ row }">
            <div class="menu-name-cell">
              <Icon v-if="row.icon" :icon="row.icon" class="menu-icon" />
              <span class="menu-name">{{ row.name }}</span>
              <ElTag v-if="row.type === 1" type="primary" size="small">菜单</ElTag>
              <ElTag v-else-if="row.type === 2" type="success" size="small">路由</ElTag>
              <ElTag v-else-if="row.type === 3" type="warning" size="small">按钮</ElTag>
            </div>
          </template>
        </ElTableColumn>

        <ElTableColumn prop="code" label="权限标识" min-width="150">
          <template #default="{ row }">
            <ElTag type="info" size="small">{{ row.code }}</ElTag>
          </template>
        </ElTableColumn>

        <ElTableColumn prop="path" label="路由路径" min-width="150">
          <template #default="{ row }">
            <span class="path-text">{{ row.path || '-' }}</span>
          </template>
        </ElTableColumn>

        <ElTableColumn prop="component" label="组件路径" min-width="150">
          <template #default="{ row }">
            <span class="component-text">{{ row.component || '-' }}</span>
          </template>
        </ElTableColumn>

        <ElTableColumn prop="sort_order" label="排序" width="80" align="center">
          <template #default="{ row }">
            <span class="sort-number">{{ row.sort_order }}</span>
          </template>
        </ElTableColumn>

        <ElTableColumn prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <ElSwitch
              v-model="row.status"
              :active-value="true"
              :inactive-value="false"
              @change="handleStatusChange(row)"
            />
          </template>
        </ElTableColumn>

        <ElTableColumn prop="created_at" label="创建时间" width="160">
          <template #default="{ row }">
            <span class="time-text">{{ formatTime(row.created_at) }}</span>
          </template>
        </ElTableColumn>

        <ElTableColumn label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <ElSpace>
              <ElButton
                type="primary"
                size="small"
                @click="handleAdd(row)"
                v-if="row.type !== 3"
              >
                <Icon icon="lucide:plus" class="mr-1" />
                新增
              </ElButton>
              <ElButton
                type="success"
                size="small"
                @click="handleEdit(row)"
              >
                <Icon icon="lucide:edit" class="mr-1" />
                编辑
              </ElButton>
              <ElButton
                type="danger"
                size="small"
                @click="handleDelete(row)"
              >
                <Icon icon="lucide:trash-2" class="mr-1" />
                删除
              </ElButton>
            </ElSpace>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>

    <!-- 菜单表单对话框 -->
    <MenuForm
      v-model:visible="formVisible"
      :menu-data="currentMenuData"
      :menu-tree-options="menuTreeOptions"
      @success="handleFormSuccess"
    />
  </Page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { Page } from '@vben/common-ui';
import { Icon } from '@iconify/vue';
import {
  ElButton,
  ElCard,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElMessageBox,
  ElOption,
  ElSelect,
  ElSpace,
  ElSwitch,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';
import type { MenuPermission, MenuSearchParams } from '#/api/system/menu';
import { 
  getMenuListApi, 
  deleteMenuApi, 
  updateMenuStatusApi 
} from '#/api/system/menu';
import MenuForm from './components/MenuForm.vue';

// 页面标题
defineOptions({
  name: 'SystemMenu',
});

// 响应式数据
const loading = ref(false);
const formVisible = ref(false);
const tableRef = ref<InstanceType<typeof ElTable>>();
const currentMenuData = ref<MenuPermission | null>(null);

// 搜索表单
const searchForm = reactive<MenuSearchParams>({
  name: '',
  type: undefined,
  status: undefined,
});

// 菜单列表数据
const menuList = ref<MenuPermission[]>([]);
const originalMenuList = ref<MenuPermission[]>([]);

// 计算属性
const menuTreeOptions = computed(() => {
  const buildTree = (list: MenuPermission[], excludeId?: number): any[] => {
    if (!list || !Array.isArray(list)) return [];
    return list
      .filter(item => item.id !== excludeId && item.type !== 3) // 排除按钮权限和当前编辑的项
      .map(item => ({
        id: item.id,
        name: item.name,
        children: item.children ? buildTree(item.children, excludeId) : [],
      }));
  };
  return [
    { id: 0, name: '顶级菜单', children: buildTree(originalMenuList.value || [], currentMenuData.value?.id) }
  ];
});

// 方法定义
const formatTime = (time: string) => {
  if (!time) return '-';
  return new Date(time).toLocaleString('zh-CN');
};

// 获取菜单列表
const fetchMenuList = async () => {
  loading.value = true;
  try {
    console.log('🚀 开始获取菜单列表...');
    console.log('📋 搜索参数:', searchForm);
    
    const data = await getMenuListApi(searchForm);
    console.log('✅ 菜单数据获取成功:', data);
    console.log('📊 数据类型:', typeof data, '是否为数组:', Array.isArray(data));
    console.log('📈 数据长度:', data?.length);
    
    if (Array.isArray(data)) {
      originalMenuList.value = data;
      menuList.value = data;
      ElMessage.success(`菜单列表加载成功，共 ${data.length} 条记录`);
    } else {
      console.warn('⚠️ 返回的数据不是数组格式:', data);
      originalMenuList.value = [];
      menuList.value = [];
      ElMessage.warning('菜单数据格式异常');
    }
  } catch (error: any) {
    console.error('❌ 获取菜单列表失败:', error);
    console.error('❌ 错误详情:', {
      message: error.message,
      status: error.status,
      response: error.response?.data,
      stack: error.stack
    });
    
    // 根据错误类型显示不同的提示
    if (error.status === 401 || error.message?.includes('Unauthorized')) {
      ElMessage.error('未授权访问，请重新登录');
    } else if (error.status === 403) {
      ElMessage.error('权限不足，无法访问菜单数据');
    } else {
      ElMessage.error(error.message || '获取菜单列表失败');
    }
    
    // 设置空数据
    originalMenuList.value = [];
    menuList.value = [];
  } finally {
    loading.value = false;
  }
};

// 搜索功能
const handleSearch = () => {
  let filteredList = [...originalMenuList.value];
  
  if (searchForm.name) {
    filteredList = filterByName(filteredList, searchForm.name);
  }
  
  if (searchForm.type !== undefined) {
    filteredList = filterByType(filteredList, searchForm.type);
  }
  
  if (searchForm.status !== undefined) {
    filteredList = filterByStatus(filteredList, searchForm.status);
  }
  
  menuList.value = filteredList;
};

const filterByName = (list: MenuPermission[], name: string): MenuPermission[] => {
  if (!list || !Array.isArray(list)) return [];
  const result: MenuPermission[] = [];
  
  for (const item of list) {
    if (item.name && item.name.includes(name)) {
      result.push({ ...item });
    } else if (item.children && Array.isArray(item.children)) {
      const filteredChildren = filterByName(item.children, name);
      if (filteredChildren.length > 0) {
        result.push({ ...item, children: filteredChildren });
      }
    }
  }
  
  return result;
};

const filterByType = (list: MenuPermission[], type: number): MenuPermission[] => {
  if (!list || !Array.isArray(list)) return [];
  const result: MenuPermission[] = [];
  
  for (const item of list) {
    const newItem = { ...item };
    
    if (item.children && Array.isArray(item.children)) {
      newItem.children = filterByType(item.children, type);
    }
    
    if (item.type === type || (newItem.children && newItem.children.length > 0)) {
      result.push(newItem);
    }
  }
  
  return result;
};

const filterByStatus = (list: MenuPermission[], status: boolean): MenuPermission[] => {
  if (!list || !Array.isArray(list)) return [];
  const result: MenuPermission[] = [];
  
  for (const item of list) {
    const newItem = { ...item };
    
    if (item.children && Array.isArray(item.children)) {
      newItem.children = filterByStatus(item.children, status);
    }
    
    if (item.status === status || (newItem.children && newItem.children.length > 0)) {
      result.push(newItem);
    }
  }
  
  return result;
};

const resetSearch = () => {
  searchForm.name = '';
  searchForm.type = undefined;
  searchForm.status = undefined;
  menuList.value = [...originalMenuList.value];
};

// 表格操作
const expandAll = () => {
  const expandAllRows = (data: MenuPermission[]) => {
    if (!data || !Array.isArray(data)) return;
    data.forEach(row => {
      tableRef.value?.toggleRowExpansion(row, true);
      if (row.children && Array.isArray(row.children)) {
        expandAllRows(row.children);
      }
    });
  };
  expandAllRows(menuList.value || []);
};

const collapseAll = () => {
  const collapseAllRows = (data: MenuPermission[]) => {
    if (!data || !Array.isArray(data)) return;
    data.forEach(row => {
      tableRef.value?.toggleRowExpansion(row, false);
      if (row.children && Array.isArray(row.children)) {
        collapseAllRows(row.children);
      }
    });
  };
  collapseAllRows(menuList.value || []);
};

const refreshData = () => {
  resetSearch();
  fetchMenuList();
};

// CRUD操作
const handleAdd = (parent?: MenuPermission) => {
  if (parent) {
    // 新增子菜单
    currentMenuData.value = {
      parent_id: parent.id,
      name: '',
      code: '',
      type: parent.type === 1 ? 2 : 3, // 菜单下默认添加路由，路由下默认添加按钮
      path: '',
      component: '',
      icon: '',
      sort_order: 0,
      status: true,
    } as MenuPermission;
  } else {
    // 新增顶级菜单
    currentMenuData.value = null;
  }
  formVisible.value = true;
};

const handleEdit = (row: MenuPermission) => {
  currentMenuData.value = { ...row };
  formVisible.value = true;
};

const handleDelete = async (row: MenuPermission) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除菜单"${row.name}"吗？删除后不可恢复！`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
    await deleteMenuApi(row.id);
    ElMessage.success('删除成功');
    await fetchMenuList();
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
      ElMessage.error(error.message || '删除失败');
    }
  }
};

const handleStatusChange = async (row: MenuPermission) => {
  try {
    await updateMenuStatusApi(row.id, row.status);
    ElMessage.success(`${row.status ? '启用' : '禁用'}成功`);
  } catch (error: any) {
    console.error('状态更新失败:', error);
    row.status = !row.status; // 回滚状态
    ElMessage.error(error.message || '状态更新失败');
  }
};

const handleFormSuccess = () => {
  fetchMenuList();
};

// 生命周期
onMounted(() => {
  fetchMenuList();
});
</script>

<style scoped lang="scss">
.header-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.search-card {
  margin-bottom: 16px;
  
  .search-form {
    .el-form-item {
      margin-bottom: 0;
    }
  }
}

.table-card {
  .menu-table {
    .menu-name-cell {
      display: flex;
      align-items: center;
      gap: 8px;

      .menu-icon {
        font-size: 16px;
        color: #3b82f6;
      }

      .menu-name {
        font-weight: 500;
      }
    }

    .path-text,
    .component-text {
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 12px;
      color: #6b7280;
    }

    .sort-number {
      font-weight: 600;
      color: #3b82f6;
    }

    .time-text {
      font-size: 12px;
      color: #6b7280;
    }
  }
}

.mr-1 {
  margin-right: 4px;
}
</style>