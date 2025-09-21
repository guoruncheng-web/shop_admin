<template>
  <div class="image-upload">
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
      accept="image/*"
      class="upload-demo"
    >
      <div v-if="!imageUrl" class="upload-placeholder">
        <el-icon class="upload-icon"><Plus /></el-icon>
        <div class="upload-text">点击上传图片</div>
      </div>
      <div v-else class="image-preview">
        <img :src="imageUrl" alt="预览图" class="preview-image" />
        <div class="image-overlay">
          <el-icon class="preview-icon" @click.stop="previewImage">
            <ZoomIn />
          </el-icon>
          <el-icon class="delete-icon" @click.stop="deleteImage">
            <Delete />
          </el-icon>
        </div>
      </div>
    </el-upload>

    <!-- 图片预览对话框 -->
    <el-dialog v-model="previewVisible" title="图片预览" width="50%">
      <img :src="imageUrl" alt="预览图" style="width: 100%" />
    </el-dialog>

    <!-- 上传进度 -->
    <el-progress
      v-if="uploading"
      :percentage="uploadProgress"
      :show-text="true"
      class="upload-progress"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, ZoomIn, Delete } from 'lucide-vue-next';
import { uploadImage, deleteFile } from '#/api/upload';
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
  maxSize: 5,
});

const emit = defineEmits<Emits>();

const userStore = useUserStore();
const uploadRef = ref();
const imageUrl = ref(props.modelValue);
const uploading = ref(false);
const uploadProgress = ref(0);
const previewVisible = ref(false);
const currentFileKey = ref('');

const uploadAction = computed(() => '/api/upload/image');
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${userStore.accessToken}`,
}));

// 上传前检查
const beforeUpload = (file: File) => {
  const isImage = file.type.startsWith('image/');
  const isLt5M = file.size / 1024 / 1024 < props.maxSize;

  if (!isImage) {
    ElMessage.error('只能上传图片文件!');
    return false;
  }
  if (!isLt5M) {
    ElMessage.error(`图片大小不能超过 ${props.maxSize}MB!`);
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
    imageUrl.value = response.data.url;
    currentFileKey.value = response.data.key;
    emit('update:modelValue', response.data.url);
    emit('change', response.data.url);
    ElMessage.success('图片上传成功!');
  } else {
    ElMessage.error(response.message || '上传失败');
  }
};

// 上传失败
const handleError = (error: any) => {
  uploading.value = false;
  console.error('Upload error:', error);
  ElMessage.error('图片上传失败!');
};

// 上传进度
const handleProgress = (event: any) => {
  uploadProgress.value = Math.round(event.percent);
};

// 预览图片
const previewImage = () => {
  previewVisible.value = true;
};

// 删除图片
const deleteImage = async () => {
  try {
    await ElMessageBox.confirm('确定要删除这张图片吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    if (currentFileKey.value) {
      await deleteFile(currentFileKey.value);
    }

    imageUrl.value = '';
    currentFileKey.value = '';
    emit('update:modelValue', '');
    emit('change', '');
    ElMessage.success('图片删除成功!');
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('图片删除失败!');
    }
  }
};

// 监听外部值变化
watch(() => props.modelValue, (newVal) => {
  imageUrl.value = newVal;
});
</script>

<style scoped>
.image-upload {
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
  width: 148px;
  height: 148px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #8c939d;
}

.upload-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 14px;
}

.image-preview {
  position: relative;
  width: 148px;
  height: 148px;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-preview:hover .image-overlay {
  opacity: 1;
}

.preview-icon,
.delete-icon {
  font-size: 20px;
  color: white;
  margin: 0 10px;
  cursor: pointer;
}

.upload-progress {
  margin-top: 10px;
}
</style>