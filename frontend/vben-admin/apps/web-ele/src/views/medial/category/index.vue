<template>
  <Page>
    <div class="category-management">
      <!-- 操作栏 -->
      <div class="action-bar">
        <el-button type="primary" @click="showAddDialog = true">
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
        <ElTree style="max-width: 600px" :data="data" :props="defaultProps" @node-click="handleNodeClick" />
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
import { ref, onMounted } from 'vue';
import { ResourceCategoryApi, type ResourceCategory } from '#/api/resource';
import { ElTree, ElButton } from 'element-plus';
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
  label: 'label',
}
interface Tree {
  label: string
  children?: Tree[]
}

const handleNodeClick = (data: Tree) => {
  console.log(data)
}
const data: Tree[] = [
  {
    label: 'Level one 1',
    children: [
      {
        label: 'Level two 1-1',
        children: [
          {
            label: 'Level three 1-1-1',
          },
        ],
      },
    ],
  },
  {
    label: 'Level one 2',
    children: [
      {
        label: 'Level two 2-1',
        children: [
          {
            label: 'Level three 2-1-1',
          },
        ],
      },
      {
        label: 'Level two 2-2',
        children: [
          {
            label: 'Level three 2-2-1',
          },
        ],
      },
    ],
  },
  {
    label: 'Level one 3',
    children: [
      {
        label: 'Level two 3-1',
        children: [
          {
            label: 'Level three 3-1-1',
          },
        ],
      },
      {
        label: 'Level two 3-2',
        children: [
          {
            label: 'Level three 3-2-1',
          },
        ],
      },
    ],
  },
]
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
    categories.value = response;
  } catch (error) {
    console.error('加载分类失败:', error);
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
    sortOrder: 1 // 临时设置，因为原始数据可能没有 sortOrder
  };
  showEditDialog.value = true;
};

const deleteCategory = async (category: ResourceCategory) => {
  if (!confirm(`确定要删除分类"${category.name}"吗？`)) {
    return;
  }

  try {
    await ResourceCategoryApi.deleteCategory(category.id);
    alert('删除成功');
    loadCategories();
  } catch (error) {
    console.error('删除失败:', error);
    alert('删除失败');
  }
};

const saveCategory = async () => {
  if (!categoryForm.value.name.trim()) {
    alert('请输入分类名称');
    return;
  }

  try {
    if (editingCategory.value) {
      await ResourceCategoryApi.updateCategory(editingCategory.value.id, {
        name: categoryForm.value.name,
        parentId: categoryForm.value.parentId || undefined
      });
      alert('更新成功');
    } else {
      await ResourceCategoryApi.createCategory({
        name: categoryForm.value.name,
        parentId: categoryForm.value.parentId || undefined
      });
      alert('添加成功');
    }

    closeDialog();
    loadCategories();
  } catch (error) {
    console.error('保存失败:', error);
    alert('保存失败');
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

const getResourceCount = (categoryId: number) => {
  // 这里可以从资源统计中获取具体数量
  return Math.floor(Math.random() * 10); // 临时随机数
};

const viewResources = (category: ResourceCategory) => {
  // 跳转到资源列表页面，并筛选该分类
  window.location.href = `/medial/static?categoryId=${category.id}`;
};

// 生命周期
onMounted(() => {
  loadCategories();
});
</script>

<style scoped>
.category-management {
  margin: 0 auto;
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