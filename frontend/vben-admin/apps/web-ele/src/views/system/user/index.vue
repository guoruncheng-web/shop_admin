<template>
  <div class="user-management-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">用户管理</h1>
      <p class="page-description">管理系统用户信息，包括用户的增删改查、角色分配和状态管理</p>
    </div>

    <!-- 搜索和操作区域 -->
    <div class="search-section">
      <ElCard class="search-card">
        <div class="search-form">
          <ElForm :model="searchForm" inline class="search-form-inline">
            <ElFormItem label="用户名">
              <ElInput
                v-model="searchForm.username"
                placeholder="请输入用户名"
                clearable
                style="width: 200px"
                @keyup.enter="handleSearch"
              />
            </ElFormItem>
            <ElFormItem label="真实姓名">
              <ElInput
                v-model="searchForm.realName"
                placeholder="请输入真实姓名"
                clearable
                style="width: 200px"
                @keyup.enter="handleSearch"
              />
            </ElFormItem>
            <ElFormItem label="邮箱">
              <ElInput
                v-model="searchForm.email"
                placeholder="请输入邮箱"
                clearable
                style="width: 200px"
                @keyup.enter="handleSearch"
              />
            </ElFormItem>
            <ElFormItem label="状态">
              <ElSelect
                v-model="searchForm.status"
                placeholder="请选择状态"
                clearable
                style="width: 120px"
              >
                <ElOption label="启用" :value="1" />
                <ElOption label="禁用" :value="0" />
              </ElSelect>
            </ElFormItem>
            <ElFormItem>
              <ElButton type="primary" @click="handleSearch" :loading="loading">
                🔍 搜索
              </ElButton>
              <ElButton @click="handleReset">
                🔄 重置
              </ElButton>
            </ElFormItem>
          </ElForm>
        </div>
        
        <div class="action-buttons">
          <ElButton type="primary" @click="handleAdd">
            ➕ 新增用户
          </ElButton>
          <ElButton 
            type="danger" 
            :disabled="selectedIds.length === 0"
            @click="handleBatchDelete"
          >
            🗑️ 批量删除 ({{ selectedIds.length }})
          </ElButton>
          <ElButton @click="handleRefresh" :loading="loading">
            🔄 刷新
          </ElButton>
        </div>
      </ElCard>
    </div>

    <!-- 用户列表 -->
    <div class="table-section">
      <ElCard class="table-card">
        <ElTable
          v-loading="loading"
          :data="userList"
          stripe
          border
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <ElTableColumn type="selection" width="55" align="center" />
          <ElTableColumn prop="id" label="ID" width="80" align="center" />
          
          <ElTableColumn label="用户信息" min-width="200">
            <template #default="{ row }">
              <div class="user-info-cell">
                <ElAvatar :size="40" :src="row.avatar">
                  {{ row.realName?.charAt(0) || row.username?.charAt(0) || 'U' }}
                </ElAvatar>
                <div class="user-details">
                  <div class="username">{{ row.username }}</div>
                  <div class="real-name">{{ row.realName }}</div>
                </div>
              </div>
            </template>
          </ElTableColumn>

          <ElTableColumn prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
          <ElTableColumn prop="phone" label="手机号" width="130" />
          
          <ElTableColumn label="角色" min-width="150">
            <template #default="{ row }">
              <div class="roles-cell">
                <ElTag
                  v-for="role in row.roles"
                  :key="role.id"
                  size="small"
                  type="primary"
                  class="role-tag"
                >
                  {{ role.name }}
                </ElTag>
                <span v-if="!row.roles || row.roles.length === 0" class="no-roles">
                  未分配角色
                </span>
              </div>
            </template>
          </ElTableColumn>

          <ElTableColumn label="状态" width="100" align="center">
            <template #default="{ row }">
              <ElSwitch
                v-model="row.status"
                :active-value="1"
                :inactive-value="0"
                active-text="启用"
                inactive-text="禁用"
                inline-prompt
                @change="handleStatusChange(row)"
              />
            </template>
          </ElTableColumn>

          <ElTableColumn label="最后登录" width="160">
            <template #default="{ row }">
              <div v-if="row.lastLoginTime" class="login-info">
                <div class="login-time">{{ formatDateTime(row.lastLoginTime) }}</div>
                <div class="login-ip">{{ row.lastLoginIp || '-' }}</div>
              </div>
              <span v-else class="no-login">未登录</span>
            </template>
          </ElTableColumn>

          <ElTableColumn prop="createdAt" label="创建时间" width="160">
            <template #default="{ row }">
              {{ formatDateTime(row.createdAt) }}
            </template>
          </ElTableColumn>

          <ElTableColumn label="操作" width="200" align="center" fixed="right">
            <template #default="{ row }">
              <div class="action-buttons-cell">
                <ElButton type="primary" size="small" @click="handleEdit(row)">
                  编辑
                </ElButton>
                <ElButton type="warning" size="small" @click="handleResetPassword(row)">
                  重置密码
                </ElButton>
                <ElButton type="danger" size="small" @click="handleDelete(row)">
                  删除
                </ElButton>
              </div>
            </template>
          </ElTableColumn>
        </ElTable>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <ElPagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :total="pagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </ElCard>
    </div>

    <!-- 用户表单对话框 -->
    <UserForm
      v-model:visible="userFormVisible"
      :user-data="currentUser"
      @success="handleFormSuccess"
    />

    <!-- 重置密码对话框 -->
    <ResetPasswordDialog
      v-model:visible="resetPasswordVisible"
      :user-data="currentUser"
      @success="handleResetSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import {
  ElCard,
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElButton,
  ElTable,
  ElTableColumn,
  ElAvatar,
  ElTag,
  ElSwitch,
  ElPagination,
  ElMessage,
  ElMessageBox,
  type TableInstance
} from 'element-plus';
// 暂时使用简单的文本图标，避免依赖问题
import type { User, QueryUserParams, UserListResult } from '#/api/system/user';
import {
  getUserListApi,
  deleteUserApi,
  batchDeleteUserApi,
  toggleUserStatusApi
} from '#/api/system/user';
import UserForm from './components/UserForm.vue';
import ResetPasswordDialog from './components/ResetPasswordDialog.vue';

defineOptions({ name: 'UserManagement' });

// 响应式数据
const loading = ref(false);
const userList = ref<User[]>([]);
const selectedIds = ref<number[]>([]);
const currentUser = ref<User | null>(null);
const userFormVisible = ref(false);
const resetPasswordVisible = ref(false);

// 搜索表单
const searchForm = reactive<QueryUserParams>({
  username: '',
  realName: '',
  email: '',
  status: undefined,
});

// 分页信息
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
});

// 计算属性
const tableRef = ref<TableInstance>();

// 方法
const loadUserList = async () => {
  try {
    loading.value = true;
    const params: QueryUserParams = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm,
    };

    // 过滤空值
    Object.keys(params).forEach(key => {
      if (params[key as keyof QueryUserParams] === '' || params[key as keyof QueryUserParams] === undefined) {
        delete params[key as keyof QueryUserParams];
      }
    });

    console.log('🔍 查询用户列表参数:', params);
    const response = await getUserListApi(params);
    console.log('📋 用户列表响应:', response);

    if (response && response.code === 200 && response.data) {
      const result = response.data;
      userList.value = result.list || [];
      pagination.total = result.total || 0;
      console.log(`✅ 用户列表加载成功: ${userList.value.length} 条记录`);
    } else {
      console.error('❌ 用户列表响应格式错误:', response);
      ElMessage.error(response?.msg || '获取用户列表失败');
    }
  } catch (error: any) {
    console.error('❌ 获取用户列表失败:', error);
    ElMessage.error(error.message || '获取用户列表失败');
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  pagination.page = 1;
  loadUserList();
};

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    username: '',
    realName: '',
    email: '',
    status: undefined,
  });
  pagination.page = 1;
  loadUserList();
};

// 刷新
const handleRefresh = () => {
  loadUserList();
};

// 新增用户
const handleAdd = () => {
  currentUser.value = null;
  userFormVisible.value = true;
};

// 编辑用户
const handleEdit = (user: User) => {
  currentUser.value = { ...user };
  userFormVisible.value = true;
};

// 删除用户
const handleDelete = async (user: User) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${user.username}" 吗？此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    const response = await deleteUserApi(user.id);
    if (response && response.code === 200) {
      ElMessage.success(response.msg || '删除成功');
      loadUserList();
    } else {
      ElMessage.error(response?.msg || '删除失败');
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除用户失败:', error);
      ElMessage.error(error.message || '删除失败');
    }
  }
};

// 批量删除
const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要删除的用户');
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 个用户吗？此操作不可恢复。`,
      '批量删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    const response = await batchDeleteUserApi(selectedIds.value);
    if (response && response.code === 200) {
      ElMessage.success(response.msg || '批量删除成功');
      selectedIds.value = [];
      loadUserList();
    } else {
      ElMessage.error(response?.msg || '批量删除失败');
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error);
      ElMessage.error(error.message || '批量删除失败');
    }
  }
};

// 重置密码
const handleResetPassword = (user: User) => {
  currentUser.value = { ...user };
  resetPasswordVisible.value = true;
};

// 切换用户状态
const handleStatusChange = async (user: User) => {
  try {
    const response = await toggleUserStatusApi(user.id);
    if (response && response.code === 200) {
      ElMessage.success(response.msg || '状态切换成功');
      // 更新本地数据
      const index = userList.value.findIndex(item => item.id === user.id);
      if (index !== -1 && response.data) {
        userList.value[index] = { ...userList.value[index], ...response.data };
      }
    } else {
      // 恢复原状态
      user.status = user.status === 1 ? 0 : 1;
      ElMessage.error(response?.msg || '状态切换失败');
    }
  } catch (error: any) {
    // 恢复原状态
    user.status = user.status === 1 ? 0 : 1;
    console.error('切换用户状态失败:', error);
    ElMessage.error(error.message || '状态切换失败');
  }
};

// 表格选择变化
const handleSelectionChange = (selection: User[]) => {
  selectedIds.value = selection.map(item => item.id);
};

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  pagination.page = 1;
  loadUserList();
};

// 当前页变化
const handleCurrentChange = (page: number) => {
  pagination.page = page;
  loadUserList();
};

// 表单成功回调
const handleFormSuccess = () => {
  loadUserList();
};

// 重置密码成功回调
const handleResetSuccess = () => {
  ElMessage.success('密码重置成功');
};

// 格式化日期时间
const formatDateTime = (dateTime: string) => {
  if (!dateTime) return '-';
  return new Date(dateTime).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// 生命周期
onMounted(() => {
  console.log('🚀 用户管理页面已加载');
  loadUserList();
});
</script>

<style scoped>
.user-management-page {
  padding: 16px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.page-description {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.search-section {
  margin-bottom: 16px;
}

.search-card {
  border-radius: 8px;
}

.search-form {
  margin-bottom: 16px;
}

.search-form-inline {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.table-section {
  margin-bottom: 16px;
}

.table-card {
  border-radius: 8px;
}

.user-info-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-details {
  flex: 1;
}

.username {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 2px;
}

.real-name {
  font-size: 12px;
  color: #6b7280;
}

.roles-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.role-tag {
  margin: 0;
}

.no-roles {
  font-size: 12px;
  color: #9ca3af;
  font-style: italic;
}

.login-info {
  font-size: 12px;
}

.login-time {
  color: #374151;
  margin-bottom: 2px;
}

.login-ip {
  color: #6b7280;
}

.no-login {
  font-size: 12px;
  color: #9ca3af;
  font-style: italic;
}

.action-buttons-cell {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-form-inline {
    flex-direction: column;
  }
  
  .action-buttons {
    justify-content: center;
  }
  
  .action-buttons-cell {
    flex-direction: column;
    gap: 4px;
  }
}

/* Element Plus 样式覆盖 */
:deep(.el-table) {
  border-radius: 8px;
}

:deep(.el-card__body) {
  padding: 20px;
}

:deep(.el-form-item) {
  margin-bottom: 0;
}

:deep(.el-switch__label) {
  font-size: 12px;
}

:deep(.el-avatar) {
  border: 2px solid #e5e7eb;
}
</style>