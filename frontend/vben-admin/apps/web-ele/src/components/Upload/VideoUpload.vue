<template>
  <div class="video-upload">
    <el-upload
      ref="uploadRef"
      :action="uploadAction"
      :headers="uploadHeaders"
      :before-upload="beforeUpload"
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-progress="handleProgress"
      :show-file-list="false"
      :auto-upload="true"
      accept="video/*"
      class="upload-demo"
    >
      <div v-if="!videoUrl" class="upload-placeholder">
        <el-icon class="upload-icon"><VideoPlay /></el-icon>
        <div class="upload-text">点击上传视频</div>
        <div class="upload-tip">支持 mp4, avi, mov 等格式</div>
      </div>
      <div v-else class="video-preview">
        <video
          :src="videoUrl"
          class="preview-video"
          controls
          preload="metadata"
        />
        <div class="video-overlay">
          <el-icon class="delete-icon" @click.stop="deleteVideo">
            <Delete />
          </el-icon>
        </div>
      </div>
    </el-upload>

    <!-- 上传进度 -->
    <el-progress
      v-if="uploading"
      :percentage="uploadProgress"
      :show-text="true"
      class="upload-progress"
    />

    <!-- 视频信息 -->
    <div v-if="videoInfo" class="video-info">
      <p>文件名: {{ videoInfo.originalName }}</p>
      <p>文件大小: {{ formatFileSize(videoInfo.size) }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { VideoPlay, Delete } from '@element-plus/icons-vue';
import { uploadVideo, deleteFile } from '#/api/upload';
import { useUserStore } from '#/store';

interface Props {
  modelValue?: string;
  maxSize?: number; // MB
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
  (e: 'change', value: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  maxSize: 100, // 视频文件通常较大，默认100MB
});

const emit = defineEmits<Emits>();

const userStore = useUserStore();
const uploadRef = ref();
const videoUrl = ref(props.modelValue);
const uploading = ref(false);
const uploadProgress = ref(0);
const currentFileKey = ref('');
const videoInfo = ref<any>(null);

const uploadAction = computed(() => '/api/upload/video');
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${userStore.accessToken}`,
}));

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 上传前检查
const beforeUpload = (file: File) => {
  const isVideo = file.type.startsWith('video/');
  const isLtMaxSize = file.size / 1024 / 1024 < props.maxSize;

  if (!isVideo) {
    ElMessage.error('只能上传视频文件!');
    return false;
  }
  if (!isLtMaxSize) {
    ElMessage.error(`视频大小不能超过 ${props.maxSize}MB!`);
    return false;
  }

  uploading.value = true;
  uploadProgress.value = 0;
  return true;
};

// 上传成功
const handleSuccess = (response: any) => {
  uploading.value = false;
  if (response.success) {
    videoUrl.value = response.data.url;
    currentFileKey.value = response.data.key;
    videoInfo.value = response.data;
    emit('update:modelValue', response.data.url);
    emit('change', response.data.url);
    ElMessage.success('视频上传成功!');
  } else {
    ElMessage.error(response.message || '上传失败');
  }
};

// 上传失败
const handleError = (error: any) => {
  uploading.value = false;
  console.error('Upload error:', error);
  ElMessage.error('视频上传失败!');
};

// 上传进度
const handleProgress = (event: any) => {
  uploadProgress.value = Math.round(event.percent);
};

// 删除视频
const deleteVideo = async () => {
  try {
    await ElMessageBox.confirm('确定要删除这个视频吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    if (currentFileKey.value) {
      await deleteFile(currentFileKey.value);
    }

    videoUrl.value = '';
    currentFileKey.value = '';
    videoInfo.value = null;
    emit('update:modelValue', '');
    emit('change', '');
    ElMessage.success('视频删除成功!');
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('视频删除失败!');
    }
  }
};

// 监听外部值变化
watch(() => props.modelValue, (newVal) => {
  videoUrl.value = newVal;
});
</script>

<style scoped>
.video-upload {
  display: inline-block;
}

.upload-demo {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s;
}

.upload-demo:hover {
  border-color: #409eff;
}

.upload-placeholder {
  width: 300px;
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #8c939d;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.upload-text {
  font-size: 16px;
  margin-bottom: 8px;
}

.upload-tip {
  font-size: 12px;
  color: #999;
}

.video-preview {
  position: relative;
  width: 300px;
  height: 200px;
}

.preview-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-overlay {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  padding: 8px;
}

.delete-icon {
  font-size: 16px;
  color: white;
  cursor: pointer;
}

.upload-progress {
  margin-top: 10px;
  width: 300px;
}

.video-info {
  margin-top: 10px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
}

.video-info p {
  margin: 4px 0;
}
</style>