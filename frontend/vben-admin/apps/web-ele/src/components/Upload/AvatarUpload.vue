<template>
  <div class="avatar-upload">
    <el-upload
      class="avatar-uploader"
      :action="uploadUrl"
      :headers="uploadHeaders"
      :show-file-list="false"
      :on-success="handleSuccess"
      :on-error="handleError"
      :before-upload="beforeUpload"
      accept="image/*"
    >
      <img v-if="imageUrl" :src="imageUrl" class="avatar" />
      <el-icon v-else class="avatar-uploader-icon">
        <span>➕</span>
      </el-icon>
    </el-upload>
    
    <!-- 上传提示 -->
    <div class="upload-tips">
      <p>点击上传头像</p>
      <p>支持 JPG、PNG 格式，文件大小不超过 2MB</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ElMessage, ElUpload } from 'element-plus';
import { useAccessStore } from '@vben/stores';

defineOptions({
  name: 'AvatarUpload',
});

interface Props {
  modelValue?: string;
  maxSize?: number; // MB
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  maxSize: 2,
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'change': [value: string];
}>();

const accessStore = useAccessStore();
const imageUrl = ref(props.modelValue);

// 上传地址和请求头
const uploadUrl = computed(() => '/api/upload/image');
const uploadHeaders = computed(() => {
  // 使用Vben框架的accessStore获取token
  const token = accessStore.accessToken;
  console.log('Upload token:', token ? 'Token exists' : 'No token found');
  
  return {
    Authorization: `Bearer ${token}`,
  };
});

// 上传前检查
const beforeUpload = (file: File) => {
  const isImage = file.type.startsWith('image/');
  const isLt2M = file.size / 1024 / 1024 < props.maxSize;

  if (!isImage) {
    ElMessage.error('只能上传图片文件!');
    return false;
  }
  if (!isLt2M) {
    ElMessage.error(`图片大小不能超过 ${props.maxSize}MB!`);
    return false;
  }
  return true;
};

// 上传成功
const handleSuccess = (response: any) => {
  console.log('Upload response:', response);
  
  // 适配后端响应格式：{ code: 200, data: "图片URL", msg: "上传成功" }
  if (response.code === 200 && response.data) {
    const imageUrl_new = response.data.url;
    imageUrl.value = imageUrl_new;
    emit('update:modelValue', imageUrl_new);
    emit('change', imageUrl_new);
    ElMessage.success(response.msg || '头像上传成功!');
  } else {
    ElMessage.error(response.msg || response.message || '上传失败');
  }
};

// 上传失败
const handleError = (error: any) => {
  console.error('Upload error:', error);
  ElMessage.error('头像上传失败!');
};

// 监听外部值变化
watch(() => props.modelValue, (newVal) => {
  imageUrl.value = newVal;
});
</script>

<style scoped>
.avatar-upload {
  text-align: center;
}

.avatar-uploader {
  display: inline-block;
}

:deep(.avatar-uploader .el-upload) {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.avatar-uploader .el-upload:hover) {
  border-color: var(--el-color-primary);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}

.avatar {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 6px;
}

.upload-tips {
  margin-top: 10px;
  font-size: 12px;
  color: #999;
  line-height: 1.4;
}

.upload-tips p {
  margin: 2px 0;
}
</style>