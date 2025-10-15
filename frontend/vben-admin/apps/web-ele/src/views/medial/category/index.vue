<template>
  <Page>
    <div class="category-management">
      <!-- 操作栏 -->
      <div class="action-bar">
        <el-button type="primary" @click="showAddDialog = true" v-permission="['system:medialCategory:add']">
          <span class="icon">+</span>
          添加一级分类
        </el-button>
        <button class="btn btn-secondary" @click="refreshCategories">
          <span class="icon">🔄</span>
          刷新
        </button>
      </div>

      <!-- 分类树 -->
      <div class="category-tree">
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <span>加载中...</span>
        </div>
        <div v-else-if="!categories.length" class="empty-state">
          <div class="empty-icon">📁</div>
          <h3>暂无分类</h3>
          <p>点击上方按钮添加第一个分类</p>
        </div>
        <ElTree 
          v-else
          style="max-width: 600px" 
          :data="data" 
          :props="defaultProps" 
          @node-click="handleNodeClick"
          default-expand-all
          :expand-on-click-node="false"
        >
          <template #default="{ node, data }">
            <div class="tree-node">
              <span class="node-label">{{ node.label }}</span>
              <div class="node-actions">
                <!-- 一级分类可以添加子分类 -->
                <el-button 
                  v-if="data.level === 1" 
                  size="small" 
                  type="primary" 
                  @click.stop="addSubCategoryFromTree(data)"
                  title="添加子分类"
                  v-permission="['system:medialCategory:add']"
                >
                  新增
                </el-button>
                <!-- 编辑按钮 -->
                <el-button 
                  size="small" 
                  type="warning" 
                  @click.stop="editCategoryFromTree(data)"
                  v-permission="['system:medialCategory:edit']"
                  title="编辑"
                >
                  编辑
                </el-button>
                <!-- 删除按钮 -->
                <el-button 
                  size="small" 
                  type="danger" 
                  @click.stop="deleteCategoryFromTree(data)"
                  title="删除"
                  v-permission="['system:medialCategory:delete']"
                >
                  删除
                </el-button>
              </div>
            </div>
          </template>
        </ElTree>
      </div>

      <!-- 添加/编辑分类对话框 -->
      <div v-if="showAddDialog || showEditDialog" class="modal-overlay" @click="closeDialog">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>{{ editingCategory ? '编辑分类' : '添加分类' }}</h3>
            <button class="close-btn" @click="closeDialog">×</button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label>分类名称</label>
              <input v-model="categoryForm.name" type="text" placeholder="请输入分类名称" class="form-input">
            </div>

            <div v-if="!editingCategory || editingCategory.level === 1" class="form-group">
              <label>分类类型</label>
              <select v-model="categoryForm.level" class="form-select">
                <option value="1">一级分类</option>
                <option value="2" v-if="parentCategory">二级分类</option>
              </select>
            </div>

            <div v-if="categoryForm.level === 2 && !parentCategory" class="form-group">
              <label>父级分类</label>
              <select v-model="categoryForm.parentId" class="form-select">
                <option value="">请选择父级分类</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>排序</label>
              <input v-model.number="categoryForm.sortOrder" type="number" placeholder="数字越小排序越靠前" class="form-input">
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeDialog">取消</button>
            <button class="btn btn-primary" @click="saveCategory">
              {{ editingCategory ? '更新' : '添加' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { ResourceCategoryApi } from '#/api/resource';
import type { ResourceCategory } from '#/api/resource/types';
import { ElTree, ElButton, ElMessage } from 'element-plus';
import { Page } from '@vben/common-ui';

// 响应式数据
const loading = ref(false);
const categories = ref<ResourceCategory[]>([]);
const showAddDialog = ref(false);
const showEditDialog = ref(false);
const editingCategory = ref<ResourceCategory | null>(null);
const parentCategory = ref<ResourceCategory | null>(null);
const defaultProps = {
  children: 'children',
  label: 'name', // 使用name字段作为显示标签
}

interface TreeNode {
  id: number;
  name: string;
  label: string; // Element Plus Tree需要的字段
  children?: TreeNode[];
  level: number;
  parentId?: number;
}

const handleNodeClick = (data: TreeNode) => {
  console.log('点击节点:', data);
}

// 将后端数据转换为Tree组件需要的格式
const data = computed(() => {
  return transformCategoriesToTreeData(categories.value);
});

const transformCategoriesToTreeData = (cats: ResourceCategory[]): TreeNode[] => {
  return cats.map(cat => ({
    id: cat.id,
    name: cat.name,
    label: cat.name, // Element Plus Tree组件需要label字段
    level: cat.level,
    parentId: cat.parentId,
    children: cat.children ? transformCategoriesToTreeData(cat.children) : []
  }));
};

const categoryForm = ref({
  name: '',
  level: 1,
  parentId: null as number | null,
  sortOrder: 1
});

// 方法
const loadCategories = async () => {
  loading.value = true;
  try {
    const response = await ResourceCategoryApi.getCategoryTree();
    console.log('🔍 API响应:', response);
    
    // 处理后端返回的数据格式
    if (response && (response as any).data) {
      categories.value = (response as any).data;
    } else if (Array.isArray(response)) {
      categories.value = response;
    } else {
      categories.value = [];
    }
    
    console.log('✅ 分类数据加载成功:', categories.value);
  } catch (error) {
    console.error('❌ 加载分类失败:', error);
    categories.value = [];
  } finally {
    loading.value = false;
  }
};

const refreshCategories = () => {
  loadCategories();
};

const addSubCategory = (parent: ResourceCategory) => {
  parentCategory.value = parent;
  categoryForm.value = {
    name: '',
    level: 2,
    parentId: parent.id,
    sortOrder: (parent.children?.length || 0) + 1
  };
  showAddDialog.value = true;
};

const editCategory = (category: ResourceCategory) => {
  editingCategory.value = category;
  categoryForm.value = {
    name: category.name,
    level: category.level,
    parentId: category.parentId || null,
    sortOrder: category.sortOrder || 1
  };
  showEditDialog.value = true;
};

const deleteCategory = async (category: ResourceCategory) => {
  // 检查是否有子分类
  if (category.children && category.children.length > 0) {
    ElMessage.warning('该分类下还有子分类，请先删除子分类');
    return;
  }

  if (!confirm(`确定要删除分类"${category.name}"吗？删除后不可恢复。`)) {
    return;
  }

  try {
    await ResourceCategoryApi.deleteCategory(category.id);
    ElMessage.success('删除成功');
    loadCategories();
  } catch (error) {
    console.error('❌ 删除失败:', error);
    ElMessage.error('删除失败，请稍后重试');
  }
};

// 从树节点添加子分类
const addSubCategoryFromTree = (nodeData: TreeNode) => {
  // 找到对应的分类数据
  const category = findCategoryById(categories.value, nodeData.id);
  if (category) {
    addSubCategory(category);
  }
};

// 从树节点编辑分类
const editCategoryFromTree = (nodeData: TreeNode) => {
  // 找到对应的分类数据
  const category = findCategoryById(categories.value, nodeData.id);
  if (category) {
    editCategory(category);
  }
};

// 从树节点删除分类
const deleteCategoryFromTree = (nodeData: TreeNode) => {
  // 找到对应的分类数据
  const category = findCategoryById(categories.value, nodeData.id);
  if (category) {
    deleteCategory(category);
  }
};

// 递归查找分类
const findCategoryById = (cats: ResourceCategory[], id: number): ResourceCategory | null => {
  for (const cat of cats) {
    if (cat.id === id) {
      return cat;
    }
    if (cat.children) {
      const found = findCategoryById(cat.children, id);
      if (found) return found;
    }
  }
  return null;
};

const saveCategory = async () => {
  if (!categoryForm.value.name.trim()) {
    ElMessage.warning('请输入分类名称');
    return;
  }

  if (categoryForm.value.level === 2 && !categoryForm.value.parentId && !parentCategory.value) {
    ElMessage.warning('请选择父级分类');
    return;
  }

  try {
    const data = {
      name: categoryForm.value.name.trim(),
      level: categoryForm.value.level,
      parentId: categoryForm.value.parentId || parentCategory.value?.id || undefined,
      sortOrder: categoryForm.value.sortOrder || 0
    };

    console.log('💾 保存分类数据:', data);

    if (editingCategory.value) {
      await ResourceCategoryApi.updateCategory(editingCategory.value.id, data);
      ElMessage.success('更新成功');
    } else {
      await ResourceCategoryApi.createCategory(data);
      ElMessage.success('添加成功');
    }

    closeDialog();
    loadCategories();
  } catch (error) {
    console.error('❌ 保存失败:', error);
    ElMessage.error('保存失败，请稍后重试');
  }
};

const closeDialog = () => {
  showAddDialog.value = false;
  showEditDialog.value = false;
  editingCategory.value = null;
  parentCategory.value = null;
  categoryForm.value = {
    name: '',
    level: 1,
    parentId: null,
    sortOrder: 1
  };
};





// 生命周期
onMounted(() => {
  loadCategories();
});
</script>

<style scoped>
.category-tree {
  width: 100%;
}
.category-management {
  margin: 0 auto;
  width: 100%;
}
:deep(.el-tree) {
  width: 100%;
}

:deep(.el-tree-node) {
  margin-bottom: 8px;
}

:deep(.el-tree-node__content) {
  height: auto !important;
  min-height: 48px;
  padding: 0 !important;
}

:deep(.el-tree-node__children) {
  padding-left: 20px;
}

.page-header {
  margin-bottom: 20px;
  /* 减少间距 */
}

.page-header h2 {
  color: #333;
  margin-bottom: 4px;
  /* 减少间距 */
  font-size: 20px;
  /* 减小字号 */
  font-weight: 600;
  /* 减轻字重 */
}

.page-header p {
  color: #666;
  margin: 0;
}

.action-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-primary {
  background: #1890ff;
  color: white;
}

.btn-primary:hover {
  background: #40a9ff;
}

.btn-secondary {
  background: #f5f5f5;
  color: #333;
}

.btn-secondary:hover {
  background: #e6f7ff;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px;
  color: #666;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.tree-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.category-item {
  border-bottom: 1px solid #f0f0f0;
}

.category-item:last-child {
  border-bottom: none;
}

.category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  transition: background-color 0.2s;
}

.category-header:hover {
  background: #fafafa;
}

.level-1 .category-header {
  background: #f8f9fa;
  font-weight: 500;
}

.level-2 {
  margin-left: 40px;
  border-left: 2px solid #e6f7ff;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.category-icon {
  font-size: 16px;
}

.category-name {
  font-size: 16px;
  color: #333;
}

.category-count,
.resource-count {
  font-size: 12px;
  color: #999;
}

.category-actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 4px;
  background: #f5f5f5;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #e6f7ff;
}

.btn-icon.danger:hover {
  background: #fff2f0;
  color: #ff4d4f;
}

.subcategories {
  background: #fafafa;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  font-size: 20px;
  cursor: pointer;
  color: #999;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

.form-input,
.form-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 20px;
  border-top: 1px solid #f0f0f0;
}

/* 树节点样式 */
.tree-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 16px;
  border-radius: 6px;
  transition: background-color 0.2s;
  margin: 6px 0;
  min-height: 48px;
}

.tree-node:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.node-label {
  flex: 1;
  font-size: 14px;
  color: #fff;
  line-height: 1.2;
}

.node-actions {
  display: flex;
  gap: 8px;
  opacity: 1;
  visibility: visible;
  margin-left: 12px;
}

.node-actions .el-button {
  padding: 4px 8px;
  font-size: 12px;
  min-height: 28px;
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.node-actions .el-button:hover {
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .category-management {
    padding: 16px;
  }

  .category-header {
    padding: 12px 16px;
  }

  .level-2 {
    margin-left: 20px;
  }

  .modal-content {
    width: 95%;
    margin: 20px;
  }
}
</style>