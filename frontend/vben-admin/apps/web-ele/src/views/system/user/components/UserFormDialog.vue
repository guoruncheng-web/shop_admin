<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑用户' : '新增用户'"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="80px"
      class="user-form"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="formData.username"
              placeholder="请输入用户名"
              :disabled="isEdit"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="真实姓名" prop="realName">
            <el-input
              v-model="formData.realName"
              placeholder="请输入真实姓名"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="邮箱" prop="email">
            <el-input
              v-model="formData.email"
              placeholder="请输入邮箱"
              type="email"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="手机号" prop="phone">
            <el-input
              v-model="formData.phone"
              placeholder="请输入手机号"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20" v-if="!isEdit">
        <el-col :span="12">
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="formData.password"
              placeholder="请输入密码"
              type="password"
              show-password
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input
              v-model="formData.confirmPassword"
              placeholder="请再次输入密码"
              type="password"
              show-password
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-select v-model="formData.status" placeholder="请选择状态" class="w-full">
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="角色" prop="roleIds">
            <el-select
              v-model="formData.roleIds"
              placeholder="请选择角色"
              multiple
              class="w-full"
            >
              <el-option
                v-for="role in roleOptions"
                :key="role.id"
                :label="role.name"
                :value="role.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="头像" prop="avatar">
        <el-input
          v-model="formData.avatar"
          placeholder="请输入头像URL"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          {{ isEdit ? '更新' : '创建' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted } from 'vue';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import type { User, CreateUserParams, UpdateUserParams } from '#/api/system/user';
import { createUserApi, updateUserApi } from '#/api/system/user';

// Props
interface Props {
  visible: boolean;
  userData?: User | null;
  isEdit: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  userData: null,
  isEdit: false,
});

// Emits
const emit = defineEmits<{
  'update:visible': [value: boolean];
  success: [];
}>();

// 响应式数据
const formRef = ref<FormInstance>();
const submitLoading = ref(false);
const roleOptions = ref([
  { id: 1, name: '超级管理员', code: 'super_admin' },
  { id: 2, name: '管理员', code: 'admin' },
  { id: 3, name: '普通用户', code: 'user' },
]);

// 表单数据
const formData = reactive<CreateUserParams & { confirmPassword?: string }>({
  username: '',
  password: '',
  confirmPassword: '',
  realName: '',
  email: '',
  phone: '',
  avatar: '',
  status: 1,
  roleIds: [],
});

// 计算属性
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
});

// 表单验证规则
const formRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名长度在 3 到 50 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少 6 个字符', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== formData.password) {
          callback(new Error('两次输入密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { max: 50, message: '真实姓名长度不能超过 50 个字符', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
  phone: [
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号格式',
      trigger: 'blur',
    },
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' },
  ],
};

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    username: '',
    password: '',
    confirmPassword: '',
    realName: '',
    email: '',
    phone: '',
    avatar: '',
    status: 1,
    roleIds: [],
  });
  formRef.value?.clearValidate();
};

// 填充表单数据
const fillFormData = (user: User) => {
  Object.assign(formData, {
    username: user.username,
    realName: user.realName,
    email: user.email,
    phone: user.phone || '',
    avatar: user.avatar || '',
    status: user.status,
    roleIds: user.roles?.map(role => role.id) || [],
  });
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitLoading.value = true;

    if (props.isEdit && props.userData) {
      // 编辑用户
      const updateData: UpdateUserParams = {
        username: formData.username,
        realName: formData.realName,
        email: formData.email,
        phone: formData.phone,
        avatar: formData.avatar,
        status: formData.status,
        roleIds: formData.roleIds,
      };
      await updateUserApi(props.userData.id, updateData);
      ElMessage.success('用户更新成功');
    } else {
      // 新增用户
      const createData: CreateUserParams = {
        username: formData.username,
        password: formData.password,
        realName: formData.realName,
        email: formData.email,
        phone: formData.phone,
        avatar: formData.avatar,
        status: formData.status,
        roleIds: formData.roleIds,
      };
      await createUserApi(createData);
      ElMessage.success('用户创建成功');
    }

    emit('success');
  } catch (error) {
    console.error('提交失败:', error);
    ElMessage.error(props.isEdit ? '用户更新失败' : '用户创建失败');
  } finally {
    submitLoading.value = false;
  }
};

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false;
  resetForm();
};

// 监听对话框显示状态
watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      if (props.isEdit && props.userData) {
        fillFormData(props.userData);
      } else {
        resetForm();
      }
    }
  }
);

// 监听编辑状态变化，动态调整验证规则
watch(
  () => props.isEdit,
  (isEdit) => {
    if (isEdit) {
      // 编辑模式下移除密码验证
      delete formRules.password;
      delete formRules.confirmPassword;
    } else {
      // 新增模式下添加密码验证
      formRules.password = [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度至少 6 个字符', trigger: 'blur' },
      ];
      formRules.confirmPassword = [
        { required: true, message: '请再次输入密码', trigger: 'blur' },
        {
          validator: (rule, value, callback) => {
            if (value !== formData.password) {
              callback(new Error('两次输入密码不一致'));
            } else {
              callback();
            }
          },
          trigger: 'blur',
        },
      ];
    }
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
.user-form {
  .el-form-item {
    margin-bottom: 20px;
  }
}

.dialog-footer {
  text-align: right;
}
</style>