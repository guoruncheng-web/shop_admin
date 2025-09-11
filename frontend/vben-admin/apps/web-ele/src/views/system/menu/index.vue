<template>
  <div class="menu-management">
    <!-- 工具栏 -->
    <div class="toolbar">
      <el-button type="primary" @click="handleAdd">新增菜单</el-button>
      <el-button @click="loadMenuData">刷新</el-button>
    </div>

    <!-- 菜单树形表格 -->
    <el-table
      v-loading="loading"
      :data="menuData"
      row-key="id"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      border
      style="width: 100%; margin-top: 20px"
    >
      <el-table-column prop="name" label="菜单名称" width="200" />
      <el-table-column prop="type" label="类型" width="100">
        <template #default="{ row }">
          <el-tag
            :type="getTypeColor(row.type)"
            size="small"
          >
            {{ getTypeText(row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="path" label="路由路径" width="200" />
      <el-table-column prop="component" label="组件路径" width="200" />
      <el-table-column prop="permission" label="权限标识" width="150" />
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
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
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
      <MenuDetail :menu-info="currentMenu" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
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
  getMenuListApi,
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

// 获取类型颜色
function getTypeColor(type: string) {
  switch (type) {
    case 'directory':
      return 'primary';
    case 'menu':
      return 'success';
    case 'button':
      return 'warning';
    default:
      return 'primary';
  }
}

// 获取类型文本
function getTypeText(type: string) {
  switch (type) {
    case 'directory':
      return '目录';
    case 'menu':
      return '菜单';
    case 'button':
      return '按钮';
    default:
      return '未知';
  }
}

// 加载菜单数据
const loadMenuData = async () => {
  try {
    loading.value = true;
    const response = await getMenuListApi();
    if (response.code === 200) {
      menuData.value = response.data || [];
      // 构建菜单选项（排除按钮类型）
      menuOptions.value = buildMenuOptions(menuData.value);
    }
  } catch (error) {
    console.error('加载菜单数据失败:', error);
    ElMessage.error('加载菜单数据失败');
  } finally {
    loading.value = false;
  }
};

// 构建菜单选项
function buildMenuOptions(menus: MenuData[]): MenuData[] {
  return menus
    .filter(menu => menu.type !== 'button')
    .map(menu => ({
      ...menu,
      children: menu.children ? buildMenuOptions(menu.children) : []
    }));
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

// 删除菜单
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
    
    const response = await deleteMenuApi(menu.id!);
    if (response.code === 200) {
      ElMessage.success('删除成功');
      await loadMenuData();
    } else {
      ElMessage.error(response.message || '删除失败');
    }
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
    
    if (response.code === 200) {
      ElMessage.success(formData.value?.id ? '更新成功' : '创建成功');
      handleCancel();
      await loadMenuData();
    } else {
      ElMessage.error(response.message || '操作失败');
    }
  } catch (error) {
    console.error('提交失败:', error);
    ElMessage.error('操作失败');
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