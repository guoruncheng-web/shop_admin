<template>
  <div class="menu-management-page">
    <!-- 搜索和操作区域 -->
    <div class="search-section">
      <ElCard class="search-card">
        <div class="search-form">
          <ElForm :model="searchForm" inline class="search-form-inline">
            <ElFormItem label="菜单名称">
              <ElInput
                v-model="searchForm.name"
                placeholder="请输入菜单名称"
                clearable
                style="width: 200px"
                @keyup.enter="handleSearch"
              />
            </ElFormItem>
            <ElFormItem label="菜单类型">
              <ElSelect
                v-model="searchForm.type"
                placeholder="请选择类型"
                clearable
                style="width: 120px"
              >
                <ElOption label="目录" :value="1" />
                <ElOption label="菜单" :value="2" />
                <ElOption label="按钮" :value="3" />
              </ElSelect>
            </ElFormItem>
            <ElFormItem label="状态">
              <ElSelect
                v-model="searchForm.status"
                placeholder="请选择状态"
                clearable
                style="width: 120px"
              >
                <ElOption label="启用" :value="1" />
                <ElOption label="禁用" :value="0" />
              </ElSelect>
            </ElFormItem>
            <ElFormItem>
              <ElButton type="primary" @click="handleSearch" :loading="loading">
                🔍 搜索
              </ElButton>
              <ElButton @click="handleReset">
                🔄 重置
              </ElButton>
            </ElFormItem>
          </ElForm>
        </div>
        
        <div class="action-buttons">
          <ElButton type="primary" @click="handleAdd" v-permission="['system:menu:create']">
            ➕ 新增菜单
          </ElButton>
          <ElButton 
            type="danger" 
            :disabled="selectedIds.length === 0"
            @click="handleBatchDelete"
          >
            🗑️ 批量删除 ({{ selectedIds.length }})
          </ElButton>
          <ElButton @click="handleRefresh" :loading="loading">
            🔄 刷新
          </ElButton>
          <ElButton @click="handleExpandAll">
            {{ isExpandAll ? '🔽 收起全部' : '🔼 展开全部' }}
          </ElButton>
        </div>
      </ElCard>
    </div>

    <!-- 菜单表格 -->
    <div class="table-section">
      <ElCard class="table-card">
        <div v-loading="loading" class="table-container">
          <ElTable
            ref="tableRef"
            :data="menuTreeData"
            row-key="id"
            :check-strictly="true"
            :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
            :default-expand-all="isExpandAll"
            stripe
            border
            class="menu-table"
            @selection-change="handleSelectionChange"
          >
            <!-- 选择列 -->
            <ElTableColumn type="selection" width="55" align="center" />
            
            <!-- 菜单名称 -->
            <ElTableColumn prop="name" label="菜单名称" min-width="200" show-overflow-tooltip>
              <template #default="{ row }">
                <span class="menu-name">{{ row.name || row.title || '未命名' }}</span>
              </template>
            </ElTableColumn>
            
            <!-- 图标 -->
            <ElTableColumn label="图标" width="80" align="center">
              <template #default="{ row }">
                <div class="menu-icon-cell">
                  <!-- 调试信息：显示图标值 -->
                  <!-- <div style="font-size: 10px; color: red;">{{ row.icon }}</div> -->
                  
                  <!-- 如果有完整的图标代码，显示实际图标 -->
                  <Icon 
                    v-if="row.icon && row.icon.includes(':') && row.icon.length > 3" 
                    :icon="row.icon as string" 
                    class="menu-icon"
                    @error="() => console.log('图标加载失败:', row.icon)"
                  />
                  <!-- 如果是emoji或短文本，直接显示 -->
                  <span v-else-if="row.icon && row.icon.length <= 4 && !row.icon.includes(':')" class="menu-icon">{{ row.icon }}</span>
                  <!-- 如果图标值异常，显示错误提示 -->
                  <span v-else-if="row.icon && row.icon.length > 0" class="menu-icon-error" :title="`图标格式错误: ${row.icon}`">❌</span>
                  <!-- 默认图标 -->
                  <span v-else-if="row.type === 1" class="menu-icon-placeholder">📁</span>
                  <span v-else-if="row.type === 2" class="menu-icon-placeholder">📄</span>
                  <span v-else class="menu-icon-placeholder">🔘</span>
                </div>
              </template>
            </ElTableColumn>
            
            <!-- 菜单类型 -->
            <ElTableColumn prop="type" label="类型" width="80" align="center">
              <template #default="{ row }">
                <ElTag
                  v-if="row.type === 1"
                  type="info"
                  size="small"
                >
                  目录
                </ElTag>
                <ElTag
                  v-else-if="row.type === 2"
                  type="primary"
                  size="small"
                >
                  菜单
                </ElTag>
                <ElTag
                  v-else-if="row.type === 3"
                  type="warning"
                  size="small"
                >
                  按钮
                </ElTag>
              </template>
            </ElTableColumn>
            
            <!-- 路由路径 -->
            <ElTableColumn prop="path" label="路由路径" min-width="150" show-overflow-tooltip>
              <template #default="{ row }">
                <code v-if="row.path" class="path-code">{{ row.path }}</code>
                <span v-else class="text-gray">-</span>
              </template>
            </ElTableColumn>
            
            <!-- 组件路径 -->
            <ElTableColumn prop="component" label="组件路径" min-width="180" show-overflow-tooltip>
              <template #default="{ row }">
                <code v-if="row.component" class="component-code">{{ row.component }}</code>
                <span v-else class="text-gray">-</span>
              </template>
            </ElTableColumn>
            
            <!-- 权限标识 -->
            <ElTableColumn prop="code" label="权限标识" min-width="150" show-overflow-tooltip>
              <template #default="{ row }">
                <code v-if="row.code || row.buttonKey" class="permission-code">
                  {{ row.code || row.buttonKey || '-' }}
                </code>
                <span v-else class="text-gray">-</span>
              </template>
            </ElTableColumn>
            
            <!-- 排序 -->
            <ElTableColumn prop="orderNum" label="排序" width="80" align="center">
              <template #default="{ row }">
                <span class="sort-number">{{ row.sort_order || row.orderNum || 0 }}</span>
              </template>
            </ElTableColumn>
            
            <!-- 状态 -->
            <ElTableColumn prop="status" label="状态" width="100" align="center">
              <template #default="{ row }">
                <ElSwitch
                  v-model="row.status"
                  :active-value="true"
                  :inactive-value="false"
                  active-text="启用"
                  inactive-text="禁用"
                  inline-prompt
                  size="small"
                  @change="(value: string | number | boolean) => handleStatusChange(row, value as boolean)"
                />
              </template>
            </ElTableColumn>
            
            <!-- 创建时间 -->
            <ElTableColumn prop="createdAt" label="创建时间" width="160" align="center">
              <template #default="{ row }">
                <span class="time-text">{{ formatDateTime(row.createdAt) }}</span>
              </template>
            </ElTableColumn>
            
            <!-- 操作 -->
            <ElTableColumn label="操作" width="200" align="center" fixed="right">
              <template #default="{ row }">
                <div class="action-buttons">
                  <ElButton type="primary" size="small" @click="handleEdit(row)" v-permission="['system:menu:edit']">
                    编辑
                  </ElButton>
                  <ElButton 
                    v-if="row.type !== 3"
                    type="success" 
                    size="small" 
                    v-permission="['system:menu:create']"
                    @click="handleAddChild(row)"
                  >
                    新增子项
                  </ElButton>
                  <ElButton type="danger" size="small" @click="handleDelete(row)" v-permission="['system:menu:delete']">
                    删除
                  </ElButton>
                </div>
              </template>
            </ElTableColumn>
          </ElTable>
          
          <!-- 空状态 -->
          <div v-if="!loading && menuTreeData.length === 0" class="empty-state">
            <div class="empty-icon">📂</div>
            <div class="empty-text">暂无菜单数据</div>
            <ElButton type="primary" @click="handleAdd">
              ➕ 新增第一个菜单
            </ElButton>
          </div>
        </div>
      </ElCard>
    </div>

    <!-- 菜单表单对话框 -->
    <MenuForm
      v-model:visible="menuFormVisible"
      :menu-data="currentMenu"
      :menu-tree-options="menuTreeOptions"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import {
  ElCard,
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElButton,
  ElTable,
  ElTableColumn,
  ElTag,
  ElSwitch,
  ElMessage,
  ElMessageBox,
  type TableInstance
} from 'element-plus';
import { Icon } from '@iconify/vue';
import type { MenuPermission, MenuSearchParams } from '#/api/system/menu';
import {
  getMenuTreeApi,
  deleteMenuApi,
  batchDeleteMenuApi,
  updateMenuStatusApi
} from '#/api/system/menu';
import MenuForm from './components/MenuForm.vue';

defineOptions({ name: 'MenuManagement' });

// 响应式数据
const loading = ref(false);
const menuTreeData = ref<MenuPermission[]>([]);
const selectedIds = ref<number[]>([]);
const currentMenu = ref<MenuPermission | null>(null);
const menuFormVisible = ref(false);
const isExpandAll = ref(false);
const isInitializing = ref(true); // 添加初始化标志

// 搜索表单
const searchForm = reactive<MenuSearchParams>({
  name: '',
  type: undefined,
  status: undefined,
});

// 计算属性
const tableRef = ref<TableInstance>();

// 菜单树选项（用于表单中的上级菜单选择）
const menuTreeOptions = computed(() => {
  const buildTreeOptions = (menus: MenuPermission[]): MenuPermission[] => {
    return menus
      .filter(menu => menu.type !== 3) // 按钮不能作为父菜单
      .map(menu => ({
        ...menu,
        children: menu.children ? buildTreeOptions(menu.children) : undefined,
      }));
  };
  
  // 添加根节点选项
  return [
    { id: 0, name: '根目录', type: 1, status: true, sort_order: 0, orderNum: 0 } as MenuPermission,
    ...buildTreeOptions(menuTreeData.value),
  ];
});

const loadMenuList = async () => {
  try {
    loading.value = true;
    console.log('🔍 查询菜单树参数:', searchForm);
    
    const response = await getMenuTreeApi(searchForm);
    console.log('📋 菜单树响应:', response);

    if (response) {
      // 处理不同的响应格式
      let menuData: MenuPermission[] = [];
      
      if (Array.isArray(response)) {
        menuData = response;
      } else if (response.data && Array.isArray(response.data)) {
        menuData = response.data;
      } else if (response.code === 200 && response.data && Array.isArray(response.data)) {
        menuData = response.data;
      }
      
      // 确保每个菜单项都有必要的属性，并生成合适的显示名称
      const processMenuData = (menus: any[]): MenuPermission[] => {
        return menus.map(menu => {
          // 生成显示名称 - 优先使用非空的 name 或 title，否则根据路径和类型生成
          let displayName = '';
          
          if (menu.name && menu.name.trim() && menu.name !== '') {
            displayName = menu.name;
          } else if (menu.title && menu.title.trim() && menu.title !== '') {
            displayName = menu.title;
          } 
          
          return {
            id: menu.id,
            name: displayName,
            title: displayName,
            type: menu.type || 1,
            status: typeof menu.status === 'boolean' ? menu.status : (menu.status === 1),
            orderNum: menu.sort_order || menu.orderNum || 0,
            path: menu.path || '',
            component: menu.component || '',
            code: menu.code || menu.permission || menu.buttonKey || '',
            icon: menu.icon || '',
            sort_order: menu.sort_order || menu.orderNum || 0,
            parent_id: menu.parent_id || menu.parentId || 0,
            parentId: menu.parent_id || menu.parentId || 0,
            createdAt: menu.createdAt || menu.created_at || '',
            buttonKey: menu.buttonKey || '',
            authority: menu.authority || null,
            children: menu.children && menu.children.length > 0 ? processMenuData(menu.children) : undefined,
          };
        });
      };
      
      menuTreeData.value = processMenuData(menuData);
      console.log(`✅ 菜单树加载成功: ${menuTreeData.value.length} 条记录`, menuTreeData.value);
      
      // 数据加载完成后，延迟设置初始化完成标志，避免初始渲染时触发change事件
      setTimeout(() => {
        isInitializing.value = false;
      }, 100);
    } else {
      console.error('❌ 菜单列表响应格式错误:', response);
      ElMessage.error('获取菜单列表失败');
    }
  } catch (error: any) {
    console.error('❌ 获取菜单列表失败:', error);
    ElMessage.error(error.message || '获取菜单列表失败');
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  isInitializing.value = true;
  loadMenuList();
};

// 重置搜索
const handleReset = () => {
  isInitializing.value = true;
  Object.assign(searchForm, {
    name: '',
    type: undefined,
    status: undefined,
  });
  loadMenuList();
};

// 刷新
const handleRefresh = () => {
  isInitializing.value = true;
  loadMenuList();
};

// 展开/收起全部
const handleExpandAll = () => {
  isExpandAll.value = !isExpandAll.value;
  if (tableRef.value) {
    // 获取所有节点的key
    const getAllNodeKeys = (nodes: MenuPermission[]): number[] => {
      const keys: number[] = [];
      nodes.forEach(node => {
        keys.push(node.id);
        if (node.children && node.children.length > 0) {
          keys.push(...getAllNodeKeys(node.children));
        }
      });
      return keys;
    };
    
    const allKeys = getAllNodeKeys(menuTreeData.value);
    
    if (isExpandAll.value) {
      // 展开所有节点
      allKeys.forEach(key => {
        tableRef.value?.toggleRowExpansion({ id: key } as any, true);
      });
    } else {
      // 收起所有节点
      allKeys.forEach(key => {
        tableRef.value?.toggleRowExpansion({ id: key } as any, false);
      });
    }
  }
};

// 表格选择变化
const handleSelectionChange = (selection: MenuPermission[]) => {
  // 构建父映射：child id -> parent id
  const parentMap = new Map<number, number>();
  const buildMap = (menus: MenuPermission[]) => {
    for (const item of menus) {
      if (item.children && item.children.length > 0) {
        for (const child of item.children) {
          parentMap.set(child.id, item.id);
        }
        buildMap(item.children);
      }
    }
  };
  buildMap(menuTreeData.value);

  const result = new Set<number>();
  // 将选中节点及其所有祖先节点一并加入
  selection.forEach((item) => {
    result.add(item.id);
    let pid = parentMap.get(item.id);
    while (pid) {
      result.add(pid);
      pid = parentMap.get(pid);
    }
  });

  selectedIds.value = Array.from(result);
};

// 新增菜单
const handleAdd = () => {
  currentMenu.value = null;
  menuFormVisible.value = true;
};

// 新增子菜单
const handleAddChild = (menu: MenuPermission) => {
  // 创建一个新的菜单对象，设置父ID
  currentMenu.value = {
    parent_id: menu.id,
    type: menu.type === 1 ? 2 : 3, // 目录下默认创建菜单，菜单下默认创建按钮
  } as MenuPermission;
  menuFormVisible.value = true;
};

// 编辑菜单
const handleEdit = (menu: MenuPermission) => {
  currentMenu.value = { ...menu };
  menuFormVisible.value = true;
};

// 删除菜单
const handleDelete = async (menu: MenuPermission) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除菜单 "${menu.name}" 吗？${menu.children && menu.children.length > 0 ? '删除后其子菜单也会被删除。' : ''}此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    await deleteMenuApi(menu.id);
    ElMessage.success('删除成功');
    loadMenuList();
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除菜单失败:', error);
      ElMessage.error(error.message || '删除失败');
    }
  }
};

// 批量删除
const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要删除的菜单');
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 个菜单吗？此操作不可恢复。`,
      '批量删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    await batchDeleteMenuApi(selectedIds.value);
    ElMessage.success('批量删除成功');
    selectedIds.value = [];
    // 清空表格选择
    if (tableRef.value) {
      tableRef.value.clearSelection();
    }
    loadMenuList();
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error);
      ElMessage.error(error.message || '批量删除失败');
    }
  }
};

// 切换菜单状态
const handleStatusChange = async (menu: MenuPermission, newStatus: boolean) => {
  // 如果正在初始化，不执行状态切换
  if (isInitializing.value) {
    return;
  }
  
  const originalStatus = menu.status;
  
  try {
    // 先更新本地状态
    menu.status = newStatus;
    
    // 调用API更新后端状态（转换为数字）
    await updateMenuStatusApi(menu.id, newStatus ? 1 : 0);
    ElMessage.success('状态切换成功');
    
    // 更新本地数据（确保数据一致性）
    const updateMenuStatus = (menus: MenuPermission[], targetId: number, status: boolean) => {
      for (const item of menus) {
        if (item.id === targetId) {
          item.status = status;
          break;
        }
        if (item.children) {
          updateMenuStatus(item.children, targetId, status);
        }
      }
    };
    updateMenuStatus(menuTreeData.value, menu.id, newStatus);
  } catch (error: any) {
    // 恢复原状态
    menu.status = originalStatus;
    console.error('切换菜单状态失败:', error);
    ElMessage.error(error.message || '状态切换失败');
  }
};

// 表单成功回调
const handleFormSuccess = () => {
  loadMenuList();
};

// 格式化日期时间
const formatDateTime = (dateTime: string) => {
  if (!dateTime) return '-';
  return new Date(dateTime).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// 生命周期
onMounted(() => {
  console.log('🚀 菜单管理页面已加载');
  loadMenuList();
});
</script>

<style scoped>
.menu-management-page {
  padding: 16px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.page-description {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.search-section {
  margin-bottom: 16px;
}

.search-card {
  border-radius: 8px;
}

.search-form {
  margin-bottom: 16px;
}

.search-form-inline {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.table-section {
  margin-bottom: 16px;
}

.table-card {
  border-radius: 8px;
}

.table-container {
  min-height: 400px;
}

.menu-table {
  width: 100%;
}

.menu-icon-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-icon {
  font-size: 18px;
  color: #3b82f6;
  width: 18px;
  height: 18px;
}

.menu-icon-placeholder {
  font-size: 18px;
  color: #9ca3af;
}

.menu-icon-error {
  font-size: 14px;
  color: #f56565;
  cursor: help;
}

.menu-name {
  font-weight: 500;
  color: #fff;
  flex: 1;
  min-width: 0;
}

.path-code,
.component-code,
.permission-code {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  color: #374151;
}

.text-gray {
  color: #9ca3af;
}

.sort-number {
  font-weight: 600;
  color: #3b82f6;
}

.time-text {
  color: #6b7280;
  font-size: 12px;
}

.action-buttons {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  font-size: 16px;
  color: #6b7280;
  margin-bottom: 24px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-form-inline {
    flex-direction: column;
  }
  
  .action-buttons {
    justify-content: center;
  }
  
  .tree-node-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .menu-actions {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-left: 0;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #e5e7eb;
  }
  
  .menu-details {
    grid-template-columns: 1fr;
  }
}

/* Element Plus 样式覆盖 */
:deep(.el-card__body) {
  padding: 20px;
}

:deep(.el-form-item) {
  margin-bottom: 0;
}

:deep(.el-tree-node__content) {
  padding: 0;
  background: transparent;
  border: none;
}

:deep(.el-tree-node__expand-icon) {
  color: #3b82f6;
  font-size: 14px;
}

:deep(.el-tree-node__label) {
  flex: 1;
}

:deep(.el-checkbox) {
  margin-right: 8px;
}

:deep(.el-switch__label) {
  font-size: 12px;
}

/* 树形结构缩进 */
:deep(.el-tree-node__children) {
  padding-left: 20px;
}

/* 树形节点悬停效果 */
:deep(.el-tree-node:hover > .el-tree-node__content) {
  background-color: transparent;
}
</style>