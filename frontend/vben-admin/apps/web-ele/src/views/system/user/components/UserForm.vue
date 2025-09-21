<template>
  <ElDialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑用户' : '新增用户'"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <ElForm
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      class="user-form"
    >
      <ElFormItem label="用户名" prop="username">
        <ElInput
          v-model="formData.username"
          placeholder="请输入用户名"
          maxlength="50"
          show-word-limit
          :disabled="isEdit"
        />
        <div v-if="isEdit" class="form-tip">
          编辑模式下不允许修改用户名
        </div>
      </ElFormItem>

      <ElFormItem v-if="!isEdit" label="密码" prop="password">
        <ElInput
          v-model="formData.password"
          type="password"
          placeholder="请输入密码"
          maxlength="100"
          show-password
        />
      </ElFormItem>

      <ElFormItem label="真实姓名" prop="realName">
        <ElInput
          v-model="formData.realName"
          placeholder="请输入真实姓名"
          maxlength="50"
          show-word-limit
        />
      </ElFormItem>

      <ElFormItem label="邮箱" prop="email">
        <ElInput
          v-model="formData.email"
          placeholder="请输入邮箱地址"
          maxlength="100"
          show-word-limit
        />
      </ElFormItem>

      <ElFormItem label="手机号" prop="phone">
        <ElInput
          v-model="formData.phone"
          placeholder="请输入手机号"
          maxlength="11"
          show-word-limit
        />
      </ElFormItem>

      <ElFormItem label="头像" prop="avatar">
        <div class="avatar-form-item">
          <AvatarUpload
            v-model="formData.avatar"
            :max-size="2"
            @change="handleAvatarChange"
          />
          <div v-if="formData.avatar" class="avatar-url-display">
            <el-input
              :model-value="formData.avatar"
              readonly
              placeholder="头像URL将在此显示"
              size="small"
            >
              <template #prepend>
                <span>URL</span>
              </template>
            </el-input>
          </div>
        </div>
      </ElFormItem>

      <ElFormItem label="角色" prop="roleIds">
        <ElSelect
          v-model="formData.roleIds"
          multiple
          placeholder="请选择用户角色"
          style="width: 100%"
          :loading="rolesLoading"
        >
          <ElOption
            v-for="role in roleOptions"
            :key="role.id"
            :label="role.name"
            :value="role.id"
          />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="状态" prop="status">
        <ElRadioGroup v-model="formData.status">
          <ElRadio :label="1">启用</ElRadio>
          <ElRadio :label="0">禁用</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
    </ElForm>

    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="handleClose">取消</ElButton>
        <ElButton
          type="primary"
          :loading="loading"
          @click="handleSubmit"
        >
          {{ isEdit ? '更新' : '创建' }}
        </ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick, onMounted } from 'vue';
import { 
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElRadioGroup,
  ElRadio,
  ElButton,
  ElMessage,
  ElAvatar,
  type FormInstance, 
  type FormRules 
} from 'element-plus';
import type { User, CreateUserParams, UpdateUserParams } from '#/api/system/user';
import { createUserApi, updateUserApi } from '#/api/system/user';
import type { Role } from '#/api/system/role';
import { getAllRolesApi } from '#/api/system/role';
import AvatarUpload from '#/components/Upload/AvatarUpload.vue';

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
const rolesLoading = ref(false);

// Computed
const isEdit = computed(() => !!props.userData?.id);

// 角色选项
const roleOptions = ref<Role[]>([]);

// Form data
const formData = reactive<CreateUserParams & UpdateUserParams & { id?: number }>({
  username: '',
  password: '',
  realName: '',
  email: '',
  phone: '',
  avatar: '',
  status: 1,
  roleIds: [],
});

// Form rules
const formRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名长度在 3 到 50 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 100, message: '密码长度在 6 到 100 个字符', trigger: 'blur' },
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 2, max: 50, message: '真实姓名长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' },
  ],
  status: [
    { required: true, message: '请选择用户状态', trigger: 'change' },
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

watch(
  () => props.userData,
  (newVal) => {
    if (newVal && props.visible) {
      initForm();
    }
  },
);

// Methods
const initForm = () => {
  if (props.userData) {
    // 编辑模式
    Object.assign(formData, {
      id: props.userData.id,
      username: props.userData.username,
      realName: props.userData.realName,
      email: props.userData.email,
      phone: props.userData.phone || '',
      avatar: props.userData.avatar || '',
      status: props.userData.status,
      roleIds: props.userData.roles?.map(role => role.id) || [],
    });
  } else {
    // 新增模式
    Object.assign(formData, {
      username: '',
      password: '',
      realName: '',
      email: '',
      phone: '',
      avatar: '',
      status: 1,
      roleIds: [],
    });
  }

  // 清除表单验证
  nextTick(() => {
    formRef.value?.clearValidate();
  });
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    loading.value = true;

    let response;
    if (isEdit.value) {
      const updateData: UpdateUserParams = {
        realName: formData.realName,
        email: formData.email,
        phone: formData.phone,
        avatar: formData.avatar,
        status: formData.status,
        roleIds: formData.roleIds,
      };
      response = await updateUserApi(formData.id!, updateData);
    } else {
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
      response = await createUserApi(createData);
    }

    if (response && response.code === 200) {
      ElMessage.success(response.msg || (isEdit.value ? '用户更新成功' : '用户创建成功'));
      emit('success');
      handleClose();
    } else {
      ElMessage.error(response?.msg || '操作失败');
    }
  } catch (error: any) {
    console.error('提交失败:', error);
    ElMessage.error(error.message || '操作失败');
  } finally {
    loading.value = false;
  }
};

const handleClose = () => {
  emit('update:visible', false);
};

// 头像变更处理
const handleAvatarChange = (url: string) => {
  formData.avatar = url;
  console.log('头像已更新:', url);
};

// 获取角色列表
const fetchRoles = async () => {
  rolesLoading.value = true;
  try {
    const response = await getAllRolesApi();
    if (response && Array.isArray(response)) {
      roleOptions.value = response;
      console.log('角色列表加载完成:', roleOptions.value);
    } else {
      console.warn('角色API响应异常:', response);
      // 使用默认角色选项
      roleOptions.value = [
        { id: 1, name: '超级管理员', code: 'super_admin', status: 1, createdAt: '', updatedAt: '' },
        { id: 2, name: '管理员', code: 'admin', status: 1, createdAt: '', updatedAt: '' },
        { id: 3, name: '普通用户', code: 'user', status: 1, createdAt: '', updatedAt: '' },
        { id: 4, name: '访客', code: 'guest', status: 1, createdAt: '', updatedAt: '' },
      ];
    }
  } catch (error) {
    console.error('获取角色列表失败:', error);
    // 如果API调用失败，使用默认角色选项
    roleOptions.value = [
      { id: 1, name: '超级管理员', code: 'super_admin', status: 1, createdAt: '', updatedAt: '' },
      { id: 2, name: '管理员', code: 'admin', status: 1, createdAt: '', updatedAt: '' },
      { id: 3, name: '普通用户', code: 'user', status: 1, createdAt: '', updatedAt: '' },
      { id: 4, name: '访客', code: 'guest', status: 1, createdAt: '', updatedAt: '' },
    ];
  } finally {
    rolesLoading.value = false;
  }
};

// 生命周期
onMounted(() => {
  fetchRoles();
});
</script>

<style scoped>
.user-form {
  padding: 0 20px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
}

.avatar-form-item {
  width: 100%;
}

.avatar-url-display {
  margin-top: 15px;
}

.avatar-url-display :deep(.el-input-group__prepend) {
  background: #f5f7fa;
  color: #909399;
  font-size: 12px;
}

.dialog-footer {
  text-align: right;
}

:deep(.el-input-group__prepend) {
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>