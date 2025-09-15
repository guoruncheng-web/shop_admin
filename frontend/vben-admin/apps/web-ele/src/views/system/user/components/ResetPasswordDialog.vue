<template>
  <el-dialog
    v-model="dialogVisible"
    title="重置密码"
    width="400px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="80px"
      class="reset-password-form"
    >
      <el-form-item label="用户">
        <el-input
          :value="userData?.realName + ' (' + userData?.username + ')'"
          disabled
        />
      </el-form-item>
      
      <el-form-item label="新密码" prop="newPassword">
        <el-input
          v-model="formData.newPassword"
          placeholder="请输入新密码"
          type="password"
          show-password
        />
      </el-form-item>
      
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input
          v-model="formData.confirmPassword"
          placeholder="请再次输入新密码"
          type="password"
          show-password
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定重置
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import type { User } from '#/api/system/user';
import { resetPasswordApi } from '#/api/system/user';

interface Props {
  visible: boolean;
  userData?: User | null;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  userData: null,
});

const emit = defineEmits<{
  'update:visible': [value: boolean];
  success: [];
}>();

const formRef = ref<FormInstance>();
const submitLoading = ref(false);

const formData = reactive({
  newPassword: '',
  confirmPassword: '',
});

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
});

const formRules: FormRules = {
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少 6 个字符', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== formData.newPassword) {
          callback(new Error('两次输入密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
};

const resetForm = () => {
  Object.assign(formData, {
    newPassword: '',
    confirmPassword: '',
  });
  formRef.value?.clearValidate();
};

const handleSubmit = async () => {
  if (!formRef.value || !props.userData) return;

  try {
    await formRef.value.validate();
    submitLoading.value = true;

    await resetPasswordApi(props.userData.id, formData.newPassword);
    ElMessage.success('密码重置成功');
    emit('success');
    handleClose();
  } catch (error) {
    console.error('重置密码失败:', error);
    ElMessage.error('重置密码失败');
  } finally {
    submitLoading.value = false;
  }
};

const handleClose = () => {
  dialogVisible.value = false;
  resetForm();
};

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      resetForm();
    }
  }
);
</script>

<style lang="scss" scoped>
.reset-password-form {
  .el-form-item {
    margin-bottom: 20px;
  }
}

.dialog-footer {
  text-align: right;
}
</style>