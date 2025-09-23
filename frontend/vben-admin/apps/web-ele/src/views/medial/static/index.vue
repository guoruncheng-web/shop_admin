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
          <span class="btn-icon">📤</span>
          上传资源
        </button>
        <button class="btn btn-secondary" @click="handleCategoryManage">
          <span class="btn-icon">🗂️</span>
          分类管理
        </button>
        <button class="btn btn-secondary" @click="handleBatchOperation">
          <span class="btn-icon">⚡</span>
          批量操作
        </button>
        <button class="btn btn-secondary" @click="handleExport">
          <span class="btn-icon">📈</span>
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
          <ElSelect 
            v-model="selectedType" 
            placeholder="全部类型" 
            clearable
            style="width: 140px"
            @change="handleSearch"
          >
            <ElOption label="全部类型" value="" />
            <ElOption label="图片" value="image" />
            <ElOption label="视频" value="video" />
          </ElSelect>
          
          <ElTreeSelect 
            v-model="selectedCategory" 
            :data="categories"
            placeholder="全部分类" 
            clearable
            check-strictly
            :render-after-expand="false"
            :check-on-click-node="false"
            style="width: 180px"
            :props="{
              value: 'id',
              label: 'name',
              children: 'children',
              disabled: (data:any) => data.children && data.children.length > 0
            }"
            @change="handleSearch"
          />
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
          <button class="action-btn" @click.stop="handleViewDetails(resource)" title="查看详情">📋</button>
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

    <!-- 资源详情模态框 -->
    <div v-if="showDetailsModal" class="modal-overlay" @click="closeDetailsModal">
      <div class="modal-content details-modal" @click.stop>
        <div class="modal-header">
          <h3>资源详情</h3>
          <button class="modal-close" @click="closeDetailsModal">×</button>
        </div>
        
        <div class="modal-body">
          <div v-if="selectedResource" class="details-content">
            <!-- 资源预览 -->
            <div class="details-preview">
              <img 
                v-if="selectedResource.type === 'image'"
                :src="selectedResource.url"
                :alt="selectedResource.name"
                class="details-image"
              />
              <div v-else class="details-video">
                <div class="video-icon">🎬</div>
                <span>视频文件</span>
              </div>
            </div>
            
            <!-- 资源信息 -->
            <div class="details-info">
              <div class="info-row">
                <label>资源名称：</label>
                <span>{{ selectedResource.name }}</span>
              </div>
              
              <div class="info-row">
                <label>资源类型：</label>
                <span>{{ selectedResource.type === 'image' ? '图片' : '视频' }}</span>
              </div>
              
              <div class="info-row">
                <label>文件大小：</label>
                <span>{{ formatFileSize(selectedResource.fileSize || 0) }}</span>
              </div>
              
              <div class="info-row">
                <label>资源分类：</label>
                <span>{{ getCategoryName(selectedResource.categoryId) }}</span>
              </div>
              
              <div class="info-row">
                <label>上传时间：</label>
                <span>{{ formatDate(selectedResource.uploadedAt) }}</span>
              </div>
              
              <div class="info-row">
                <label>资源链接：</label>
                <div class="url-container">
                  <input 
                    type="text" 
                    :value="selectedResource.url" 
                    readonly 
                    class="url-input"
                    ref="urlInput"
                  />
                  <button class="copy-btn" @click="copyUrl">复制</button>
                </div>
              </div>
              
              <div v-if="selectedResource.description" class="info-row">
                <label>描述：</label>
                <span>{{ selectedResource.description }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeDetailsModal">关闭</button>
          <button class="btn btn-primary" @click="handleDownload(selectedResource)">下载资源</button>
        </div>
      </div>
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
            <p v-if="selectedFiles.length === 0">
              拖拽文件到此处或 <span class="upload-link" @click="fileInput?.click()">点击选择</span>
            </p>
            <div v-else class="selected-files">
              <h4>已选择 {{ selectedFiles.length }} 个文件：</h4>
              <ul>
                <li v-for="(file, index) in selectedFiles" :key="index">
                  {{ file.name }} ({{ (file.size / 1024 / 1024).toFixed(2) }}MB)
                </li>
              </ul>
              <p class="reselect-hint">
                <span class="upload-link" @click="fileInput?.click()">重新选择文件</span>
              </p>
            </div>
            <input ref="fileInput" type="file" multiple accept="image/*,video/*" @change="handleFileSelect" style="display: none;">
          </div>
          
          <!-- 上传进度显示 -->
          <div v-if="uploading" class="upload-progress">
            <div class="progress-info">
              <h4>{{ uploadStatus }}</h4>
              <p>当前文件: {{ currentFileName }}</p>
              <p>进度: {{ currentFileIndex }}/{{ selectedFiles.length }} ({{ uploadProgress }}%)</p>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
            </div>
          </div>

          <div class="upload-options" v-if="!uploading">
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
          <button class="btn btn-secondary" @click="handleUploadCancel" :disabled="uploading">取消</button>
          <button 
            class="btn btn-primary" 
            @click="handleUploadConfirm"
            :disabled="uploading || selectedFiles.length === 0 || !uploadCategory"
          >
            {{ uploading ? '上传中...' : '确认上传' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElSelect, ElOption, ElOptionGroup, ElTreeSelect, ElMessage } from 'element-plus';
import { ResourceApi, ResourceCategoryApi, type Resource, type ResourceCategory, type ResourceStatistics } from '#/api/resource';

// 路由实例
const router = useRouter();

// 模板引用
const fileInput = ref<HTMLInputElement>();
const urlInput = ref<HTMLInputElement>();

// 响应式数据
const searchQuery = ref('');
const selectedType = ref('');
const selectedCategory = ref('');
const sortBy = ref('uploadedAt');
const sortOrder = ref<'ASC' | 'DESC'>('DESC');
const currentPage = ref(1);
const pageSize = ref(20);
const showUploadModal = ref(false);
const showDetailsModal = ref(false);
const selectedResource = ref<Resource | null>(null);
const uploadCategory = ref('');
const selectedFiles = ref<File[]>([]);
const uploading = ref(false);
const loading = ref(false);

// 上传进度相关
const uploadProgress = ref(0); // 整体进度 0-100
const currentFileIndex = ref(0); // 当前上传文件索引
const currentFileName = ref(''); // 当前上传文件名
const uploadStatus = ref(''); // 上传状态文本

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
  const result: any[] = [];
  categories.value.forEach(parent => {
    if (parent.children) {
      parent.children.forEach(child => {
        result.push({
          ...child,
          parentName: parent.name
        });
      });
    }
  });
  return result;
});

// 获取父级分类（用于筛选下拉框）
const parentCategories = computed(() => {
  return categories.value.filter(cat => !cat.parentId);
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
    const result = await ResourceCategoryApi.getCategoryTree() as any ;
    if(result.code === 200) {
       console.log("🚀 分类数据：", result)
       // 直接使用树形结构，不需要扁平化
       categories.value = result.data;   
    }
   
    
    console.log('✅ 分类数据加载成功:', categories.value);
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
    
    const result = await ResourceApi.getResources(params) as any;
    console.log("资源",result)
    resources.value = result.data.data;
    totalResources.value = result.data.total;
  } catch (error) {
    console.error('加载资源数据失败:', error);
  } finally {
    loading.value = false;
  }
};

// 工具方法
const getCategoryName = (categoryId: number) => {
  // 在一级分类中查找
  const parentCategory = categories.value.find(c => c.id === categoryId);
  if (parentCategory) {
    return parentCategory.name;
  }
  
  // 在二级分类中查找
  for (const parent of categories.value) {
    if (parent.children) {
      const childCategory = parent.children.find(c => c.id === categoryId);
      if (childCategory) {
        return `${parent.name} / ${childCategory.name}`;
      }
    }
  }
  
  return '未分类';
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

const handleViewDetails = (resource: Resource) => {
  selectedResource.value = resource;
  showDetailsModal.value = true;
  console.log('查看详情:', resource);
};

const closeDetailsModal = () => {
  showDetailsModal.value = false;
  selectedResource.value = null;
};

const copyUrl = async () => {
  if (!selectedResource.value || !urlInput.value) return;
  
  try {
    await navigator.clipboard.writeText(selectedResource.value.url);
    ElMessage.success('链接已复制到剪贴板');
  } catch (error) {
    // 降级方案：选中文本
    urlInput.value.select();
    document.execCommand('copy');
    ElMessage.success('链接已复制到剪贴板');
  }
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
  
  // 过滤只保留图片和视频文件
  const validFiles = files.filter(file => {
    const type = file.type;
    return type.startsWith('image/') || type.startsWith('video/');
  });
  
  if (validFiles.length > 0) {
    selectedFiles.value = validFiles;
    console.log('拖拽文件:', validFiles);
  } else {
    ElMessage.warning('请选择图片或视频文件');
  }
};

const handleFileSelect = (e: Event) => {
  const files = Array.from((e.target as HTMLInputElement).files || []);
  
  // 过滤只保留图片和视频文件
  const validFiles = files.filter(file => {
    const type = file.type;
    return type.startsWith('image/') || type.startsWith('video/');
  });
  
  if (validFiles.length > 0) {
    selectedFiles.value = validFiles;
    console.log('选择文件:', validFiles);
  } else {
    ElMessage.warning('请选择图片或视频文件');
  }
};

const handleUploadCancel = () => {
  showUploadModal.value = false;
  selectedFiles.value = [];
  uploadCategory.value = '';
};

const handleUploadConfirm = async () => {
  if (!uploadCategory.value) {
    ElMessage.warning('请选择分类');
    return;
  }
  
  if (selectedFiles.value.length === 0) {
    ElMessage.warning('请选择要上传的文件');
    return;
  }
  
  uploading.value = true;
  uploadProgress.value = 0;
  currentFileIndex.value = 0;
  
  try {
    const totalFiles = selectedFiles.value.length;
    
    // 逐个上传文件
    for (let i = 0; i < selectedFiles.value.length; i++) {
      const file = selectedFiles.value[i];
      currentFileIndex.value = i + 1;
      currentFileName.value = file.name;
      uploadStatus.value = `正在上传第 ${i + 1}/${totalFiles} 个文件...`;
      // 1. 先上传文件到云存储
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'images'); // 可选的文件夹参数
      
      uploadStatus.value = `正在上传文件到云存储: ${file.name}`;
      const uploadResult = await ResourceApi.uploadResource(formData);
      console.log('文件上传成功:', uploadResult);
      
      uploadStatus.value = `正在保存资源记录: ${file.name}`;
      // 2. 将上传结果保存到资源池
      const resourceData = {
        name: file.name.split('.')[0] || 'untitled', // 去掉扩展名作为名称
        url: (uploadResult as any).data.url, // 使用上传返回的URL
        type: file.type.startsWith('image/') ? 'image' as const : 'video' as const,
        fileSize: (uploadResult as any).data.size || file.size,
        categoryId: parseInt(uploadCategory.value),
        uploaderId: 1, // 临时使用固定用户ID
        uploaderName: '管理员', // 添加上传者姓名
        description: `上传的${file.type.startsWith('image/') ? '图片' : '视频'}文件`,
        tags: ['上传', file.type.startsWith('image/') ? '图片' : '视频']
      };
      
      const resourceResult = await ResourceApi.createResource(resourceData);
      console.log('资源记录创建成功:', resourceResult);
      
      // 更新进度
      uploadProgress.value = Math.round(((i + 1) / totalFiles) * 100);
      uploadStatus.value = `已完成 ${i + 1}/${totalFiles} 个文件`;
    }
    
    ElMessage.success(`成功上传 ${selectedFiles.value.length} 个文件`);
    
    // 重置状态
    showUploadModal.value = false;
    selectedFiles.value = [];
    uploadCategory.value = '';
    
    // 重新加载资源列表和统计信息
    await Promise.all([
      loadResources(),
      loadStatistics()
    ]);
    
  } catch (error) {
    console.error('上传失败:', error);
    ElMessage.error('上传失败，请稍后重试');
  } finally {
    uploading.value = false;
    uploadProgress.value = 0;
    currentFileIndex.value = 0;
    currentFileName.value = '';
    uploadStatus.value = '';
  }
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
  padding: 16px; /* 减少内边距 */
  background-color: #fafafa; /* 更浅的背景色 */
  min-height: 100vh;
}

.page-header {
  text-align: left; /* 左对齐，更简洁 */
  margin-bottom: 24px; /* 减少间距 */
}

.page-title {
  font-size: 24px; /* 减小字号 */
  font-weight: 600; /* 减轻字重 */
  color: #1f2937;
  margin-bottom: 4px;
}

.page-description {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); /* 减小最小宽度 */
  gap: 16px; /* 减小间距 */
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  padding: 16px; /* 减小内边距 */
  border-radius: 8px; /* 减小圆角 */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); /* 减轻阴影 */
  display: flex;
  align-items: center;
  gap: 12px;
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
  margin-bottom: 32px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #cbd5e1;
}

.action-buttons {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-height: 48px;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: 2px solid transparent;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
}

.btn-secondary {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  color: #374151;
  border: 2px solid #e5e7eb;
}

.btn-secondary:hover {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-color: #3b82f6;
  color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.15);
}

.btn-icon {
  font-size: 18px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
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
  /* background: white; */
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

.details-modal {
  max-width: 800px;
}

.details-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.details-preview {
  text-align: center;
  background: #f8fafc;
  border-radius: 8px;
  padding: 20px;
}

.details-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.details-video {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #6b7280;
}

.details-video .video-icon {
  font-size: 64px;
}

.details-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.info-row label {
  font-weight: 600;
  color: #374151;
  min-width: 80px;
  flex-shrink: 0;
}

.info-row span {
  color: #6b7280;
  word-break: break-all;
}

.url-container {
  display: flex;
  gap: 8px;
  flex: 1;
  align-items: center;
}

.url-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: #f9fafb;
  color: #374151;
}

.copy-btn {
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.copy-btn:hover {
  background: #2563eb;
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

.upload-link {
  color: #3b82f6;
  cursor: pointer;
  text-decoration: underline;
}

.upload-link:hover {
  color: #2563eb;
}

.selected-files {
  text-align: left;
}

.selected-files h4 {
  margin: 0 0 12px 0;
  color: #1f2937;
  font-size: 16px;
}

.selected-files ul {
  list-style: none;
  padding: 0;
  margin: 0 0 16px 0;
  max-height: 120px;
  overflow-y: auto;
}

.selected-files li {
  padding: 8px 12px;
  background: #f3f4f6;
  border-radius: 6px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #374151;
}

.reselect-hint {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.upload-progress {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.progress-info h4 {
  margin: 0 0 8px 0;
  color: #1f2937;
  font-size: 16px;
  font-weight: 600;
}

.progress-info p {
  margin: 4px 0;
  color: #6b7280;
  font-size: 14px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
  position: relative;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
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