<template>
  <div class="upload-demo-page">
    <PageWrapper title="文件上传演示">
      <div class="upload-container">
        <!-- 图片上传 -->
        <el-card class="upload-card" header="图片上传">
          <div class="upload-section">
            <ImageUpload
              v-model="imageUrl"
              :max-size="5"
              @change="handleImageChange"
            />
            <div v-if="imageUrl" class="result-info">
              <p><strong>上传结果:</strong></p>
              <p>图片URL: {{ imageUrl }}</p>
            </div>
          </div>
        </el-card>

        <!-- 视频上传 -->
        <el-card class="upload-card" header="视频上传">
          <div class="upload-section">
            <VideoUpload
              v-model="videoUrl"
              :max-size="100"
              @change="handleVideoChange"
            />
            <div v-if="videoUrl" class="result-info">
              <p><strong>上传结果:</strong></p>
              <p>视频URL: {{ videoUrl }}</p>
            </div>
          </div>
        </el-card>

        <!-- 批量上传 -->
        <el-card class="upload-card" header="批量文件上传">
          <div class="upload-section">
            <el-upload
              ref="batchUploadRef"
              :action="batchUploadAction"
              :headers="uploadHeaders"
              :before-upload="beforeBatchUpload"
              :on-success="handleBatchSuccess"
              :on-error="handleBatchError"
              :file-list="fileList"
              :auto-upload="false"
              multiple
              accept="image/*,video/*"
              class="batch-upload"
            >
              <el-button type="primary">选择文件</el-button>
              <template #tip>
                <div class="el-upload__tip">
                  支持图片和视频文件，可多选
                </div>
              </template>
            </el-upload>
            
            <div v-if="fileList.length > 0" class="batch-actions">
              <el-button 
                type="success" 
                @click="submitBatchUpload"
                :loading="batchUploading"
              >
                {{ batchUploading ? '上传中...' : '开始上传' }}
              </el-button>
              <el-button @click="clearFileList">清空列表</el-button>
            </div>

            <!-- 上传结果 -->
            <div v-if="uploadResults.length > 0" class="upload-results">
              <h4>上传结果:</h4>
              <el-table :data="uploadResults" style="width: 100%">
                <el-table-column prop="name" label="文件名" />
                <el-table-column prop="type" label="类型" width="80" />
                <el-table-column prop="size" label="大小" width="100" />
                <el-table-column prop="status" label="状态" width="80">
                  <template #default="{ row }">
                    <el-tag :type="row.status === 'success' ? 'success' : 'danger'">
                      {{ row.status === 'success' ? '成功' : '失败' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="url" label="访问链接">
                  <template #default="{ row }">
                    <el-link 
                      v-if="row.url" 
                      :href="row.url" 
                      target="_blank" 
                      type="primary"
                    >
                      查看文件
                    </el-link>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-card>
      </div>
    </PageWrapper>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { PageWrapper } from '@vben/common-ui';
import ImageUpload from '#/components/Upload/ImageUpload.vue';
import VideoUpload from '#/components/Upload/VideoUpload.vue';
import { uploadImage, uploadVideo } from '#/api/upload';
import { useUserStore } from '#/store';

const userStore = useUserStore();

// 单个文件上传
const imageUrl = ref('');
const videoUrl = ref('');

// 批量上传
const batchUploadRef = ref();
const fileList = ref<any[]>([]);
const batchUploading = ref(false);
const uploadResults = ref<any[]>([]);

const batchUploadAction = computed(() => '/api/upload/image');
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${userStore.accessToken}`,
}));

// 图片上传回调
const handleImageChange = (url: string) => {
  console.log('图片上传完成:', url);
};

// 视频上传回调
const handleVideoChange = (url: string) => {
  console.log('视频上传完成:', url);
};

// 批量上传前检查
const beforeBatchUpload = (file: File) => {
  const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
  const maxSize = file.type.startsWith('image/') ? 5 : 100; // 图片5MB，视频100MB
  const isLtMaxSize = file.size / 1024 / 1024 < maxSize;

  if (!isValidType) {
    ElMessage.error('只支持图片和视频文件!');
    return false;
  }
  if (!isLtMaxSize) {
    ElMessage.error(`文件大小不能超过 ${maxSize}MB!`);
    return false;
  }
  return false; // 阻止自动上传，使用手动上传
};

// 批量上传成功
const handleBatchSuccess = (response: any, file: any) => {
  const result = {
    name: file.name,
    type: file.raw.type.startsWith('image/') ? '图片' : '视频',
    size: formatFileSize(file.size),
    status: response.success ? 'success' : 'error',
    url: response.success ? response.data.url : '',
    message: response.message || '',
  };
  uploadResults.value.push(result);
};

// 批量上传失败
const handleBatchError = (error: any, file: any) => {
  const result = {
    name: file.name,
    type: file.raw.type.startsWith('image/') ? '图片' : '视频',
    size: formatFileSize(file.size),
    status: 'error',
    url: '',
    message: '上传失败',
  };
  uploadResults.value.push(result);
};

// 开始批量上传
const submitBatchUpload = async () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请先选择文件');
    return;
  }

  batchUploading.value = true;
  uploadResults.value = [];

  try {
    for (const fileItem of fileList.value) {
      const file = fileItem.raw;
      try {
        let response;
        if (file.type.startsWith('image/')) {
          response = await uploadImage(file);
        } else if (file.type.startsWith('video/')) {
          response = await uploadVideo(file);
        }

        const result = {
          name: file.name,
          type: file.type.startsWith('image/') ? '图片' : '视频',
          size: formatFileSize(file.size),
          status: response?.success ? 'success' : 'error',
          url: response?.success ? response.data.url : '',
          message: response?.message || '',
        };
        uploadResults.value.push(result);
      } catch (error) {
        const result = {
          name: file.name,
          type: file.type.startsWith('image/') ? '图片' : '视频',
          size: formatFileSize(file.size),
          status: 'error',
          url: '',
          message: '上传失败',
        };
        uploadResults.value.push(result);
      }
    }

    const successCount = uploadResults.value.filter(r => r.status === 'success').length;
    ElMessage.success(`批量上传完成! 成功: ${successCount}/${uploadResults.value.length}`);
  } finally {
    batchUploading.value = false;
  }
};

// 清空文件列表
const clearFileList = () => {
  fileList.value = [];
  uploadResults.value = [];
  batchUploadRef.value?.clearFiles();
};

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
</script>

<style scoped>
.upload-demo-page {
  padding: 20px;
}

.upload-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.upload-card {
  min-height: 300px;
}

.upload-section {
  padding: 20px;
}

.result-info {
  margin-top: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 14px;
}

.result-info p {
  margin: 8px 0;
}

.batch-upload {
  margin-bottom: 20px;
}

.batch-actions {
  margin: 20px 0;
  display: flex;
  gap: 10px;
}

.upload-results {
  margin-top: 20px;
}

.upload-results h4 {
  margin-bottom: 15px;
  color: #333;
}
</style>