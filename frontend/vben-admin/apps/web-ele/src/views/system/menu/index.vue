<template>
  <div class="menu-management">
    <!-- 工具栏 -->
    <div class="toolbar">
      <el-button type="primary" @click="() => handleAdd()">新增菜单</el-button>
      <el-button @click="loadMenuData">刷新</el-button>
    </div>

    <!-- 菜单树形表格 -->
    <el-table
      v-loading="loading"
      :data="menuData"
      row-key="id"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      :default-expand-all="false"
      border
      style="width: 100%; margin-top: 20px"
    >
      <el-table-column prop="name" label="菜单名称" width="200" />
      <el-table-column label="类型" width="80">
        <template #default="{ row }">
          <el-tag
            :type="getTypeTag(String(row.type)) as any"
            size="small"
          >
            {{ getTypeText(String(row.type)) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="path" label="路由路径" width="200" />
      <el-table-column prop="component" label="组件路径" width="200" />
      <el-table-column label="权限标识" width="150">
        <template #default="{ row }">
          <span v-if="row.type === 3 || row.type === 'button'">
            {{ getPermissionText(row) }}
          </span>
          <span v-else style="color: #999;">-</span>
        </template>
      </el-table-column>
      <el-table-column prop="icon" label="图标" width="100" />
      <el-table-column prop="sort" label="排序" width="80" />
      <el-table-column prop="status" label="状态" width="80">
        <template #default="{ row }">
          <el-tag
            :type="row.status ? 'success' : 'danger'"
            size="small"
          >
            {{ row.status ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdByName" label="创建者" width="100">
        <template #default="{ row }">
          <span v-if="row.createdByName" :title="`用户ID: ${row.createdBy}`">
            {{ row.createdByName }}
          </span>
          <span v-else-if="row.createdBy" style="color: #999;">
            ID: {{ row.createdBy }}
          </span>
          <span v-else style="color: #999;">-</span>
        </template>
      </el-table-column>
      <el-table-column prop="updatedByName" label="更新者" width="100">
        <template #default="{ row }">
          <span v-if="row.updatedByName" :title="`用户ID: ${row.updatedBy}`">
            {{ row.updatedByName }}
          </span>
          <span v-else-if="row.updatedBy" style="color: #999;">
            ID: {{ row.updatedBy }}
          </span>
          <span v-else style="color: #999;">-</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" width="160">
        <template #default="{ row }">
          <span v-if="row.updatedAt" :title="`创建时间: ${formatDateTime(row.createdAt)}`">
            {{ formatDateTime(row.updatedAt) }}
          </span>
          <span v-else style="color: #999;">-</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="280" fixed="right">
        <template #default="{ row }">
          <div class="flex space-x-2">
            <el-button
              type="primary"
              size="small"
              @click="handleDetail(row)"
            >
              详情
            </el-button>
            <el-button
              type="warning"
              size="small"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              v-if="row.type !== 3 && row.type !== 'button'"
              type="success"
              size="small"
              @click="handleAdd(row)"
            >
              新增
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 表单弹窗 -->
    <el-dialog
      v-model="modalVisible"
      :title="modalTitle"
      width="600px"
      @close="handleCancel"
    >
      <MenuForm
        ref="menuFormRef"
        :form-data="formData"
        :menu-options="menuOptions"
        @submit="handleFormSubmit"
      />
      <template #footer>
        <el-button @click="handleCancel">取消</el-button>
        <el-button
          type="primary"
          :loading="submitLoading"
          @click="handleSubmit"
        >
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="detailVisible"
      title="菜单详情"
      width="600px"
    >
      <MenuDetail :menu-info="currentMenu || undefined" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  ElButton,
  ElTable,
  ElTableColumn,
  ElTag,
  ElDialog,
  ElMessage,
  ElMessageBox
} from 'element-plus';
import MenuForm from './components/MenuForm.vue';
import MenuDetail from './components/MenuDetail.vue';
import {
  getMenuTreeApi,
  createMenuApi,
  updateMenuApi,
  deleteMenuApi,
  type MenuData,
  type CreateMenuDto,
  type UpdateMenuDto
} from '#/api/system/menu';

// 响应式数据
const loading = ref(false);
const menuData = ref<MenuData[]>([]);
const modalVisible = ref(false);
const detailVisible = ref(false);
const modalTitle = ref('');
const submitLoading = ref(false);
const currentMenu = ref<MenuData | null>(null);
const formData = ref<MenuData | null>(null);
const menuFormRef = ref();

// 菜单选项（用于父级菜单选择）
const menuOptions = ref<MenuData[]>([]);

// 获取类型标签
const getTypeTag = (type: string | number) => {
  const typeValue = String(type);
  const typeMap: Record<string, string> = {
    '1': 'primary',    // 目录
    'directory': 'primary',
    '2': 'success',    // 菜单
    'menu': 'success',
    '3': 'warning',    // 按钮
    'button': 'warning'
  };
  return typeMap[typeValue] || 'primary';
};

// 获取类型文本
const getTypeText = (type: string | number) => {
  const typeValue = String(type);
  const typeMap: Record<string, string> = {
    '1': '目录',
    'directory': '目录',
    '2': '菜单',
    'menu': '菜单',
    '3': '按钮',
    'button': '按钮'
  };
  return typeMap[typeValue] || '未知';
};

// 获取权限标识文本
const getPermissionText = (row: MenuData) => {
  // 兼容不同字段名：permission 或 buttonKey
  const permission = (row as any).permission || (row as any).buttonKey;
  return permission || '-';
};

// 格式化日期时间
const formatDateTime = (dateTime?: string | Date) => {
  if (!dateTime) return '-';
  const date = new Date(dateTime);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  // 如果是今天，只显示时间
  if (diff < 24 * 60 * 60 * 1000 && date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }
  
  // 否则显示日期
  return date.toLocaleDateString('zh-CN', { 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

// 加载菜单数据
const loadMenuData = async () => {
  try {
    loading.value = true;
    const response = await getMenuTreeApi();
    console.log('菜单API原始响应:', response);
    
    // 标准化响应数据格式
    let actualData: MenuData[] = [];
    if (Array.isArray(response)) {
      actualData = response;
    } else if (response && typeof response === 'object') {
      if ('data' in response && Array.isArray(response.data)) {
        actualData = response.data;
      } else if ('list' in response && Array.isArray(response.list)) {
        actualData = response.list;
      } else if ('result' in response && Array.isArray(response.result)) {
        actualData = response.result;
      }
    }
    
    console.log('实际菜单数据:', actualData);
    
    // 如果后端返回的是扁平数据，需要手动构建树形结构
    if (actualData.length > 0 && !actualData.some(item => item.children && item.children.length > 0)) {
      // 数据是扁平的，需要构建树形结构
      menuData.value = buildTreeFromFlatData(actualData);
    } else {
      // 数据已经是树形结构
      menuData.value = actualData || [];
    }
    
    // 构建菜单选项（排除按钮类型）
    menuOptions.value = buildMenuOptions(flattenMenuTree(menuData.value));
    console.log("menuOptions.value", menuOptions.value);
  } catch (error) {
    console.error('加载菜单数据失败:', error);
    ElMessage.error('加载菜单数据失败');
  } finally {
    loading.value = false;
  }
};

// 从扁平数据构建树形结构
function buildTreeFromFlatData(flatData: MenuData[]): MenuData[] {
  const menuMap = new Map<number, MenuData>();
  const rootMenus: MenuData[] = [];

  // 创建菜单映射
  flatData.forEach(menu => {
    const menuNode = { 
      ...menu, 
      children: [],
      hasChildren: false // 初始化为false，后面会更新
    };
    menuMap.set(menu.id, menuNode);
  });

  // 构建树形结构
  flatData.forEach(menu => {
    const menuNode = menuMap.get(menu.id);
    if (menuNode) {
      if (menu.parentId && menu.parentId !== 0) {
        const parent = menuMap.get(menu.parentId);
        if (parent && parent.children) {
          parent.children.push(menuNode);
          parent.hasChildren = true; // 设置父节点有子节点
        }
      } else {
        rootMenus.push(menuNode);
      }
    }
  });

  // 按orderNum排序
  const sortMenus = (menuList: MenuData[]) => {
    menuList.sort((a, b) => {
      const sortA = (a.sort ?? a.orderNum ?? 0);
      const sortB = (b.sort ?? b.orderNum ?? 0);
      return sortA - sortB;
    });
    menuList.forEach(menu => {
      if (menu.children && menu.children.length > 0) {
        menu.hasChildren = true; // 确保有子节点的菜单设置hasChildren
        sortMenus(menu.children);
      }
    });
  };
  sortMenus(rootMenus);

  return rootMenus;
}

// 将树形结构扁平化为一维数组
function flattenMenuTree(treeData: MenuData[]): MenuData[] {
  const result: MenuData[] = [];
  
  function traverse(menus: MenuData[]) {
    menus.forEach(menu => {
      result.push(menu);
      if (menu.children && menu.children.length > 0) {
        traverse(menu.children);
      }
    });
  }
  
  traverse(treeData);
  return result;
}

// 构建菜单选项（树型结构，用于选择器）
function buildMenuOptions(menus: MenuData[]): MenuData[] {
  // 过滤掉按钮类型的菜单，从扩平数据构建树形结构
  const menuMap = new Map<number, MenuData>();
  const rootMenus: MenuData[] = [];

  // 首先过滤掉按钮类型的菜单（兼容不同后端数据格式）
  const validMenus = menus.filter(menu => {
    const menuType = menu.type;
    return menuType !== 3 && menuType !== 'button';
  });

  // 创建菜单映射，确保每个菜单都有children数组
  validMenus.forEach(menu => {
    menuMap.set(menu.id, { ...menu, children: [] });
  });

  // 构建树形结构
  validMenus.forEach(menu => {
    const menuNode = menuMap.get(menu.id);
    if (menuNode) {
      if (menu.parentId && menu.parentId !== 0) {
        // 如果有父级ID，找到父级菜单并添加到children中
        const parent = menuMap.get(menu.parentId);
        if (parent && parent.children) {
          parent.children.push(menuNode);
        }
      } else {
        // 没有父级ID或parentId为0，作为根菜单
        rootMenus.push(menuNode);
      }
    }
  });

  // 按sort或orderNum排序（兼容不同后端字段名）
  const sortMenus = (menuList: MenuData[]) => {
    menuList.sort((a, b) => {
      const sortA = (a.sort ?? a.orderNum ?? 0);
      const sortB = (b.sort ?? b.orderNum ?? 0);
      return sortA - sortB;
    });
    menuList.forEach(menu => {
      if (menu.children && menu.children.length > 0) {
        sortMenus(menu.children);
      }
    });
  };
  sortMenus(rootMenus);

  return rootMenus;
}

// 新增菜单
const handleAdd = (parent?: MenuData) => {
  modalTitle.value = '新增菜单';
  formData.value = parent ? { parentId: parent.id } as MenuData : null;
  modalVisible.value = true;
};

// 编辑菜单
const handleEdit = (menu: MenuData) => {
  modalTitle.value = '编辑菜单';
  formData.value = { ...menu };
  modalVisible.value = true;
};

// 查看详情
const handleDetail = (menu: MenuData) => {
  currentMenu.value = menu;
  detailVisible.value = true;
};

// 处理删除
const handleDelete = async (menu: MenuData) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除菜单 "${menu.name}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    await deleteMenuApi(menu.id!);
    ElMessage.success('删除成功');
    await loadMenuData();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除菜单失败:', error);
      ElMessage.error('删除菜单失败');
    }
  }
};

// 取消操作
const handleCancel = () => {
  modalVisible.value = false;
  formData.value = null;
  submitLoading.value = false;
};

// 提交表单
const handleSubmit = async () => {
  if (!menuFormRef.value) return;
  
  try {
    await menuFormRef.value.handleSubmit();
  } catch (error) {
    console.error('提交失败:', error);
  }
};

// 处理表单提交
const handleFormSubmit = async (data: CreateMenuDto | UpdateMenuDto) => {
  try {
    submitLoading.value = true;
    
    let response;
    if (formData.value?.id) {
      // 编辑
      response = await updateMenuApi(formData.value.id, data as UpdateMenuDto);
    } else {
      // 新增
      response = await createMenuApi(data as CreateMenuDto);
    }
    
    // requestClient 已经通过拦截器处理，成功时直接返回 data 部分
    // 失败时会被错误拦截器捕获并抛出异常
    if (response) {
      ElMessage.success(formData.value?.id ? '更新成功' : '创建成功');
      handleCancel();
      await loadMenuData();
    }
  } catch (error) {
    console.error('提交失败:', error);
    // 错误信息已经在 errorMessageResponseInterceptor 中处理
    // 这里不需要重复显示错误消息
  } finally {
    submitLoading.value = false;
  }
};

// 初始化
onMounted(() => {
  loadMenuData();
});
</script>

<style scoped>
.menu-management {
  padding: 20px;
}

.toolbar {
  margin-bottom: 20px;
}

.toolbar .el-button {
  margin-right: 10px;
}
</style>