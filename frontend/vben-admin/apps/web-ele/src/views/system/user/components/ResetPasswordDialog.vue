<template>
  <ElDialog
    v-model="dialogVisible"
    title="重置密码"
    width="400px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="reset-password-content">
      <div class="user-info">
        <ElAvatar :size="48" :src="userData?.avatar">
          {{ userData?.realName?.charAt(0) || userData?.username?.charAt(0) || 'U' }}
        </ElAvatar>
        <div class="user-details">
          <div class="username">{{ userData?.username }}</div>
          <div class="real-name">{{ userData?.realName }}</div>
        </div>
      </div>

      <ElForm
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        class="reset-form"
      >
        <ElFormItem label="新密码" prop="newPassword">
          <ElInput
            v-model="formData.newPassword"
            type="password"
            placeholder="请输入新密码"
            maxlength="100"
            show-password
          />
        </ElFormItem>

        <ElFormItem label="确认密码" prop="confirmPassword">
          <ElInput
            v-model="formData.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            maxlength="100"
            show-password
          />
        </ElFormItem>
      </ElForm>

      <div class="password-tips">
        <div class="tips-title">密码要求：</div>
        <ul class="tips-list">
          <li>长度至少6个字符</li>
          <li>建议包含字母、数字和特殊字符</li>
          <li>避免使用过于简单的密码</li>
        </ul>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="handleClose">取消</ElButton>
        <ElButton
          type="primary"
          :loading="loading"
          @click="handleSubmit"
        >
          重置密码
        </ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
defineOptions({
  name: 'ResetPasswordDialog',
});

import { ref, reactive, computed, watch, nextTick } from 'vue';
import { 
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElButton,
  ElMessage,
  ElAvatar,
  type FormInstance, 
  type FormRules 
} from 'element-plus';
import type { User } from '#/api/system/user';
import { resetPasswordApi } from '#/api/system/user';

// Props
interface Props {
  visible: boolean;
  userData?: User | null;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  userData: null,
});

// Emits
const emit = defineEmits<{
  'update:visible': [value: boolean];
  'success': [];
}>();

/** v-model:visible 双向绑定封装 */
const dialogVisible = computed({
  get: () => props.visible,
  set: (val: boolean) => emit('update:visible', val),
});

// Refs
const formRef = ref<FormInstance>();
const loading = ref(false);

// Form data
const formData = reactive({
  newPassword: '',
  confirmPassword: '',
});

// Form rules
const formRules: FormRules = {
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 100, message: '密码长度在 6 到 100 个字符', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== formData.newPassword) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
};

// Watch props
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      initForm();
    }
  },
);

// Methods
const initForm = () => {
  // 重置表单数据
  formData.newPassword = '';
  formData.confirmPassword = '';

  // 清除表单验证
  nextTick(() => {
    formRef.value?.clearValidate();
  });
};

const handleSubmit = async () => {
  if (!formRef.value || !props.userData) return;

  try {
    await formRef.value.validate();
    loading.value = true;

    const response = await resetPasswordApi(props.userData.id, formData.newPassword);
    if (response && response.code === 200) {
      ElMessage.success(response.msg || '密码重置成功');
      emit('success');
      handleClose();
    } else {
      ElMessage.error(response?.msg || '重置密码失败');
    }
  } catch (error: any) {
    console.error('重置密码失败:', error);
    ElMessage.error(error.message || '重置密码失败');
  } finally {
    loading.value = false;
  }
};

const handleClose = () => {
  emit('update:visible', false);
};
</script>

<style scoped>
.reset-password-content {
  padding: 0 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;

  .user-details {
    .username {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 4px;
    }

    .real-name {
      font-size: 14px;
      color: #606266;
    }
  }
}

.reset-form {
  margin-bottom: 20px;
}

.password-tips {
  padding: 16px;
  background: #fff7e6;
  border: 1px solid #ffd591;
  border-radius: 6px;
  margin-bottom: 20px;

  .tips-title {
    font-size: 14px;
    font-weight: 600;
    color: #d46b08;
    margin-bottom: 8px;
  }

  .tips-list {
    margin: 0;
    padding-left: 16px;
    color: #d46b08;

    li {
      font-size: 12px;
      line-height: 1.6;
      margin-bottom: 4px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

.dialog-footer {
  text-align: right;
}
</style>