<template>
  <div class="static-resource-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">静态资源管理</h1>
      <p class="page-description">统一管理图片和视频资源，支持分类、搜索和统计功能</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">📁</div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.totalResources }}</div>
          <div class="stat-label">总资源数</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">🗂️</div>
        <div class="stat-content">
          <div class="stat-number">{{ totalCategories }}</div>
          <div class="stat-label">分类数量</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">🖼️</div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.imageCount }}</div>
          <div class="stat-label">图片资源</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">🎬</div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.videoCount }}</div>
          <div class="stat-label">视频资源</div>
        </div>
      </div>
    </div>

    <!-- 功能操作区 -->
    <div class="action-section">
      <div class="action-buttons">
        <button class="btn btn-primary" @click="handleUpload">
          <span class="btn-icon">⬆️</span>
          上传资源
        </button>
        <button class="btn btn-secondary" @click="handleCategoryManage">
          <span class="btn-icon">🏷️</span>
          分类管理
        </button>
        <button class="btn btn-secondary" @click="handleBatchOperation">
          <span class="btn-icon">📋</span>
          批量操作
        </button>
        <button class="btn btn-secondary" @click="handleExport">
          <span class="btn-icon">📊</span>
          导出统计
        </button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="filter-section">
      <div class="filter-row">
        <div class="search-box">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="搜索资源名称或标签..."
            class="search-input"
            @keyup.enter="handleSearch"
          />
          <button class="search-btn" @click="handleSearch">🔍</button>
        </div>
        
        <div class="filter-controls">
          <select v-model="selectedType" class="filter-select">
            <option value="">全部类型</option>
            <option value="image">图片</option>
            <option value="video">视频</option>
          </select>
          
          <select v-model="selectedCategory" class="filter-select">
            <option value="">全部分类</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
          
          <select v-model="sortBy" class="filter-select">
            <option value="created_desc">最新上传</option>
            <option value="created_asc">最早上传</option>
            <option value="name_asc">名称A-Z</option>
            <option value="name_desc">名称Z-A</option>
            <option value="size_desc">文件大小↓</option>
            <option value="size_asc">文件大小↑</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 资源列表 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">加载中...</div>
    </div>
    
    <div v-else class="resource-grid">
      <div 
        v-for="resource in resources" 
        :key="resource.id" 
        class="resource-card"
        @click="handleResourceClick(resource)"
      >
        <div class="resource-preview">
          <img 
            v-if="resource.type === 'image'" 
            :src="resource.url" 
            :alt="resource.name"
            class="resource-image"
          />
          <div v-else class="resource-video">
            <div class="video-icon">🎬</div>
            <span class="video-duration">00:00</span>
          </div>
        </div>
        
        <div class="resource-info">
          <div class="resource-name" :title="resource.name">{{ resource.name }}</div>
          <div class="resource-meta">
            <span class="resource-type">{{ resource.type === 'image' ? '图片' : '视频' }}</span>
            <span class="resource-size">{{ formatFileSize(resource.fileSize || 0) }}</span>
          </div>
          <div class="resource-category">{{ getCategoryName(resource.categoryId) }}</div>
          <div class="resource-date">{{ formatDate(resource.uploadedAt) }}</div>
        </div>
        
        <div class="resource-actions">
          <button class="action-btn" @click.stop="handlePreview(resource)" title="预览">👁️</button>
          <button class="action-btn" @click.stop="handleEdit(resource)" title="编辑">✏️</button>
          <button class="action-btn" @click.stop="handleDownload(resource)" title="下载">⬇️</button>
          <button class="action-btn danger" @click.stop="handleDelete(resource)" title="删除">🗑️</button>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <button 
        class="page-btn" 
        :disabled="currentPage === 1"
        @click="handlePageChange(currentPage - 1)"
      >
        上一页
      </button>
      
      <span class="page-info">
        第 {{ currentPage }} 页，共 {{ totalPages }} 页，总计 {{ totalResources }} 条记录
      </span>
      
      <button 
        class="page-btn" 
        :disabled="currentPage === totalPages"
        @click="handlePageChange(currentPage + 1)"
      >
        下一页
      </button>
    </div>

    <!-- 上传模态框 -->
    <div v-if="showUploadModal" class="modal-overlay" @click="showUploadModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>上传静态资源</h3>
          <button class="modal-close" @click="showUploadModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="upload-area" @drop="handleDrop" @dragover.prevent>
            <div class="upload-icon">📁</div>
            <p>拖拽文件到此处或点击选择文件</p>
            <input type="file" multiple accept="image/*,video/*" @change="handleFileSelect" />
          </div>
          
          <div class="upload-options">
            <label>
              分类：
              <select v-model="uploadCategory">
                <option value="">选择分类</option>
                <option v-for="category in secondLevelCategories" :key="category.id" :value="category.id">
                  {{ category.parentName }} / {{ category.name }}
                </option>
              </select>
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showUploadModal = false">取消</button>
          <button class="btn btn-primary" @click="handleUploadConfirm">确认上传</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ResourceApi, ResourceCategoryApi, type Resource, type ResourceCategory, type ResourceStatistics } from '#/api/resource';

// 路由实例
const router = useRouter();

// 响应式数据
const searchQuery = ref('');
const selectedType = ref('');
const selectedCategory = ref('');
const sortBy = ref('uploadedAt');
const sortOrder = ref<'ASC' | 'DESC'>('DESC');
const currentPage = ref(1);
const pageSize = ref(20);
const showUploadModal = ref(false);
const uploadCategory = ref('');
const loading = ref(false);

// 统计数据
const stats = reactive<ResourceStatistics>({
  totalResources: 0,
  imageCount: 0,
  videoCount: 0,
  totalSize: 0,
  totalDownloads: 0
});

// 分类数据
const categories = ref<ResourceCategory[]>([]);
const resources = ref<Resource[]>([]);
const totalResources = ref(0);

// 计算属性
const secondLevelCategories = computed(() => {
  return categories.value
    .filter(cat => cat.parentId)
    .map(cat => ({
      ...cat,
      parentName: categories.value.find(p => p.id === cat.parentId)?.name || ''
    }));
});

const totalPages = computed(() => Math.ceil(totalResources.value / pageSize.value));
const totalCategories = computed(() => categories.value.length);

// API调用方法
const loadStatistics = async () => {
  try {
    const result = await ResourceApi.getStatistics();
    Object.assign(stats, result);
  } catch (error) {
    console.error('加载统计数据失败:', error);
  }
};

const loadCategories = async () => {
  try {
    const result = await ResourceCategoryApi.getCategoryTree();
    categories.value = result;
  } catch (error) {
    console.error('加载分类数据失败:', error);
  }
};

const loadResources = async () => {
  try {
    loading.value = true;
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      name: searchQuery.value || undefined,
      type: selectedType.value as 'image' | 'video' || undefined,
      categoryId: selectedCategory.value ? parseInt(selectedCategory.value) : undefined,
      sortBy: sortBy.value,
      sortOrder: sortOrder.value
    };
    
    const result = await ResourceApi.getResources(params);
    resources.value = result.data;
    totalResources.value = result.total;
  } catch (error) {
    console.error('加载资源数据失败:', error);
  } finally {
    loading.value = false;
  }
};

// 工具方法
const getCategoryName = (categoryId: number) => {
  const category = categories.value.find(c => c.id === categoryId);
  return category?.name || '未分类';
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 事件处理
const handleUpload = () => {
  showUploadModal.value = true;
};

const handleCategoryManage = () => {
  // 使用 Vue Router 跳转到分类管理页面
  router.push('/medial/category');
};

const handleBatchOperation = () => {
  alert('批量操作功能');
};

const handleExport = () => {
  alert('导出统计报告');
};

const handleResourceClick = (resource: any) => {
  console.log('点击资源:', resource);
};

const handlePreview = (resource: Resource) => {
  console.log('预览资源:', resource);
  // 在新窗口打开资源
  window.open(resource.url, '_blank');
};

const handleEdit = (resource: Resource) => {
  console.log('编辑资源:', resource);
  alert(`编辑功能开发中: ${resource.name}`);
};

const handleDownload = async (resource: Resource) => {
  try {
    // 记录下载次数
    await ResourceApi.recordDownload(resource.id);
    
    // 创建下载链接
    const link = document.createElement('a');
    link.href = resource.url;
    link.download = resource.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('下载资源:', resource);
  } catch (error) {
    console.error('下载失败:', error);
    alert('下载失败，请稍后重试');
  }
};

const handleDelete = async (resource: Resource) => {
  if (confirm(`确定要删除 "${resource.name}" 吗？`)) {
    try {
      await ResourceApi.deleteResource(resource.id);
      alert(`已删除: ${resource.name}`);
      // 重新加载资源列表
      await loadResources();
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败，请稍后重试');
    }
  }
};

const handleDrop = (e: DragEvent) => {
  e.preventDefault();
  const files = Array.from(e.dataTransfer?.files || []);
  console.log('拖拽文件:', files);
};

const handleFileSelect = (e: Event) => {
  const files = Array.from((e.target as HTMLInputElement).files || []);
  console.log('选择文件:', files);
};

const handleUploadConfirm = () => {
  console.log('确认上传，分类:', uploadCategory.value);
  showUploadModal.value = false;
  alert('上传功能开发中...');
};

// 监听搜索和筛选条件变化
const handleSearch = () => {
  currentPage.value = 1;
  loadResources();
};

// 监听分页变化
const handlePageChange = (page: number) => {
  currentPage.value = page;
  loadResources();
};

// 生命周期
onMounted(async () => {
  console.log('静态资源管理页面已加载');
  // 并行加载数据
  await Promise.all([
    loadStatistics(),
    loadCategories(),
    loadResources()
  ]);
});
</script>

<style scoped>
.static-resource-page {
  padding: 24px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
}

.page-title {
  font-size: 32px;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 8px;
}

.page-description {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  font-size: 32px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 50%;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #1f2937;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
}

.action-section {
  margin-bottom: 24px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #f9fafb;
}

.filter-section {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.filter-row {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  display: flex;
  flex: 1;
  min-width: 300px;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px 0 0 8px;
  font-size: 14px;
}

.search-btn {
  padding: 12px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0 8px 8px 0;
  cursor: pointer;
}

.filter-controls {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-select {
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  background: white;
}

.resource-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.resource-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.resource-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.resource-preview {
  height: 180px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.resource-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.resource-video {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.video-icon {
  font-size: 48px;
}

.video-duration {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.resource-info {
  padding: 16px;
}

.resource-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.resource-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.resource-type,
.resource-size {
  font-size: 12px;
  color: #6b7280;
}

.resource-category {
  font-size: 12px;
  color: #3b82f6;
  margin-bottom: 4px;
}

.resource-date {
  font-size: 12px;
  color: #9ca3af;
}

.resource-actions {
  display: flex;
  justify-content: space-around;
  padding: 12px 16px;
  border-top: 1px solid #f3f4f6;
}

.action-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.action-btn:hover {
  background: #f3f4f6;
}

.action-btn.danger:hover {
  background: #fee2e2;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.page-btn {
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  background: #2563eb;
}

.page-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #6b7280;
}

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
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f3f4f6;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
}

.modal-body {
  padding: 20px;
}

.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  margin-bottom: 20px;
  position: relative;
}

.upload-area input[type="file"] {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.upload-options label {
  display: block;
  margin-bottom: 12px;
  font-weight: 500;
}

.upload-options select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  margin-top: 4px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #f3f4f6;
}

@media (max-width: 768px) {
  .static-resource-page {
    padding: 16px;
  }
  
  .stats-grid,
  .resource-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    min-width: auto;
  }
  
  .action-buttons {
    justify-content: center;
  }
}
</style>