3其他<template>
  <Page
    description="管理系统用户信息，支持用户的增删改查、状态管理、密码重置等功能"
    title="用户管理"
  >
    <!-- 操作栏 -->
    <div class="header-actions">
      <ElButton type="primary" @click="handleAdd">
        <Icon icon="lucide:user-plus" class="mr-1" />
        新增用户
      </ElButton>
      <ElButton @click="refreshData">
        <Icon icon="lucide:refresh-cw" class="mr-1" />
        刷新
      </ElButton>
      <ElButton 
        type="danger" 
        :disabled="selectedIds.length === 0"
        @click="handleBatchDelete"
      >
        <Icon icon="lucide:trash-2" class="mr-1" />
        批量删除
      </ElButton>
    </div>

    <!-- 搜索筛选区域 -->
    <ElCard class="search-card">
      <ElForm :model="searchForm" inline class="search-form">
        <ElFormItem label="用户名">
          <ElInput
            v-model="searchForm.username"
            placeholder="请输入用户名"
            clearable
            @keyup.enter="handleSearch"
          />
        </ElFormItem>
        <ElFormItem label="真实姓名">
          <ElInput
            v-model="searchForm.realName"
            placeholder="请输入真实姓名"
            clearable
            @keyup.enter="handleSearch"
          />
        </ElFormItem>
        <ElFormItem label="邮箱">
          <ElInput
            v-model="searchForm.email"
            placeholder="请输入邮箱"
            clearable
            @keyup.enter="handleSearch"
          />
        </ElFormItem>
        <ElFormItem label="状态">
          <ElSelect v-model="searchForm.status" placeholder="请选择状态" clearable>
            <ElOption label="启用" :value="1" />
            <ElOption label="禁用" :value="0" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem>
          <ElButton type="primary" @click="handleSearch">
            <Icon icon="lucide:search" class="mr-1" />
            搜索
          </ElButton>
          <ElButton @click="resetSearch">
            <Icon icon="lucide:rotate-ccw" class="mr-1" />
            重置
          </ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>

    <!-- 用户表格 -->
    <ElCard class="table-card">
      <ElTable
        ref="tableRef"
        v-loading="loading"
        :data="userList"
        border
        stripe
        class="user-table"
        @selection-change="handleSelectionChange"
      >
        <ElTableColumn type="selection" width="55" />
        
        <ElTableColumn prop="id" label="ID" width="80" />
        
        <ElTableColumn prop="username" label="用户名" min-width="120">
          <template #default="{ row }">
            <div class="user-info">
              <ElAvatar 
                :size="32" 
                :src="row.avatar" 
                class="user-avatar"
              >
                {{ row.realName?.charAt(0) || row.username.charAt(0).toUpperCase() }}
              </ElAvatar>
              <span class="username">{{ row.username }}</span>
            </div>
          </template>
        </ElTableColumn>

        <ElTableColumn prop="realName" label="真实姓名" min-width="100" />

        <ElTableColumn prop="email" label="邮箱" min-width="180">
          <template #default="{ row }">
            <span class="email-text">{{ row.email || '-' }}</span>
          </template>
        </ElTableColumn>

        <ElTableColumn prop="phone" label="手机号" min-width="120">
          <template #default="{ row }">
            <span class="phone-text">{{ row.phone || '-' }}</span>
          </template>
        </ElTableColumn>

        <ElTableColumn prop="roles" label="角色" min-width="120">
          <template #default="{ row }">
            <div class="roles-container">
              <ElTag 
                v-for="role in row.roles" 
                :key="role.id" 
                type="primary" 
                size="small"
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

        <ElTableColumn prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <ElSwitch
              :model-value="row.status === 1"
              :disabled="statusUpdateMap.has(row.id)"
              @change="handleStatusToggle(row, $event)"
            />
          </template>
        </ElTableColumn>

        <ElTableColumn prop="lastLoginTime" label="最后登录" width="160">
          <template #default="{ row }">
            <span class="time-text">{{ formatTime(row.lastLoginTime) }}</span>
          </template>
        </ElTableColumn>

        <ElTableColumn prop="createdAt" label="创建时间" width="160">
          <template #default="{ row }">
            <span class="time-text">{{ formatTime(row.createdAt) }}</span>
          </template>
        </ElTableColumn>

        <ElTableColumn label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <ElSpace>
              <ElButton
                type="primary"
                size="small"
                @click="handleEdit(row)"
              >
                <Icon icon="lucide:edit" class="mr-1" />
                编辑
              </ElButton>
              <ElButton
                type="warning"
                size="small"
                @click="handleResetPassword(row)"
              >
                <Icon icon="lucide:key" class="mr-1" />
                重置密码
              </ElButton>
              <ElButton
                type="danger"
                size="small"
                @click="handleDelete(row)"
              >
                <Icon icon="lucide:trash-2" class="mr-1" />
                删除
              </ElButton>
            </ElSpace>
          </template>
        </ElTableColumn>
      </ElTable>

      <!-- 分页 -->
      <div class="pagination-container">
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

    <!-- 用户表单对话框 -->
    <UserForm
      v-model:visible="formVisible"
      :user-data="currentUserData"
      @success="handleFormSuccess"
    />

    <!-- 重置密码对话框 -->
    <ResetPasswordDialog
      v-model:visible="resetPasswordVisible"
      :user-data="currentUserData"
      @success="handleResetPasswordSuccess"
    />
  </Page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { Page } from '@vben/common-ui';
import { Icon } from '@iconify/vue';
import {
  ElButton,
  ElCard,
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElMessage,
  ElMessageBox,
  ElSpace,
  ElSwitch,
  ElTable,
  ElTableColumn,
  ElTag,
  ElAvatar,
  ElPagination,
} from 'element-plus';
import type { User, QueryUserParams } from '#/api/system/user';
import { 
  getUserListApi, 
  deleteUserApi, 
  batchDeleteUserApi,
  toggleUserStatusApi 
} from '#/api/system/user';
import UserForm from './components/UserForm.vue';
import ResetPasswordDialog from './components/ResetPasswordDialog.vue';

// 页面标题
defineOptions({
  name: 'SystemUser',
});

// 响应式数据
const loading = ref(false);
const formVisible = ref(false);
const resetPasswordVisible = ref(false);
const tableRef = ref<InstanceType<typeof ElTable>>();
const currentUserData = ref<User | null>(null);
const selectedIds = ref<number[]>([]);

// 搜索表单
const searchForm = reactive<QueryUserParams>({
  username: '',
  realName: '',
  email: '',
  status: undefined,
  page: 1,
  pageSize: 20,
});

// 分页信息
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
});

// 用户列表数据
const userList = ref<User[]>([]);

// 状态更新防抖和请求管理
const statusUpdateMap = new Map<number, boolean>();

// 方法定义
const formatTime = (time: string) => {
  if (!time) return '-';
  return new Date(time).toLocaleString('zh-CN');
};

// 获取用户列表
const fetchUserList = async () => {
  loading.value = true;
  try {
    console.log('🚀 开始获取用户列表...');
    console.log('📋 搜索参数:', { ...searchForm, ...pagination });

    const params = {
      ...searchForm,
      page: pagination.page,
      pageSize: pagination.pageSize,
    };

    const response = await getUserListApi(params);
    console.log('✅ 用户数据获取成功:', response);

    // 现在返回完整的响应格式: { code: 200, data: { list: [...], total: 10 }, msg: "成功" }
    if (response && response.code === 200 && response.data) {
      const { list, total } = response.data;
      userList.value = list || [];
      pagination.total = total || 0;
      ElMessage.success(`用户列表加载成功，共 ${list?.length || 0} 条记录`);
    } else {
      console.warn('⚠️ 返回的数据格式异常:', response);
      userList.value = [];
      pagination.total = 0;
      ElMessage.warning('用户数据格式异常');
    }
  } catch (error: any) {
    console.error('❌ 获取用户列表失败:', error);
    console.error('❌ 错误详情:', {
      message: error.message,
      status: error.status,
      response: error.response?.data,
      stack: error.stack
    });

    if (error.status === 401 || error.message?.includes('Unauthorized')) {
      ElMessage.error('未授权访问，请重新登录');
    } else if (error.status === 403) {
      ElMessage.error('权限不足，无法访问用户数据');
    } else {
      ElMessage.error(error.message || '获取用户列表失败');
    }

    userList.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

// 搜索功能
const handleSearch = () => {
  pagination.page = 1;
  fetchUserList();
};

const resetSearch = () => {
  searchForm.username = '';
  searchForm.realName = '';
  searchForm.email = '';
  searchForm.status = undefined;
  pagination.page = 1;
  fetchUserList();
};

// 分页操作
const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  pagination.page = 1;
  fetchUserList();
};

const handleCurrentChange = (page: number) => {
  pagination.page = page;
  fetchUserList();
};

// 表格选择
const handleSelectionChange = (selection: User[]) => {
  selectedIds.value = selection.map(item => item.id);
};

// 刷新数据
const refreshData = () => {
  fetchUserList();
};

// CRUD操作
const handleAdd = () => {
  currentUserData.value = null;
  formVisible.value = true;
};

const handleEdit = (row: User) => {
  currentUserData.value = { ...row };
  formVisible.value = true;
};

const handleDelete = async (row: User) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户"${row.username}"吗？删除后不可恢复！`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
    const response = await deleteUserApi(row.id);
    // requestClient 的 defaultResponseInterceptor 会在成功时直接返回 data
    // 失败时会抛出异常，所以能执行到这里说明删除成功
    ElMessage.success('删除成功');
    await fetchUserList();
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
      ElMessage.error(error.message || '删除失败');
    }
  }
};

const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要删除的用户');
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 个用户吗？删除后不可恢复！`,
      '批量删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
    const response = await batchDeleteUserApi(selectedIds.value);
    // requestClient 的 defaultResponseInterceptor 会在成功时直接返回 data
    // 失败时会抛出异常，所以能执行到这里说明批量删除成功
    ElMessage.success('批量删除成功');
    selectedIds.value = [];
    await fetchUserList();
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error);
      ElMessage.error(error.message || '批量删除失败');
    }
  }
};

// 状态切换
const handleStatusToggle = async (row: User, newStatus: number) => {
  // 防止重复请求
  if (statusUpdateMap.has(row.id)) {
    console.log(`🔄 用户 ${row.id} 正在更新状态，跳过重复请求`);
    return;
  }

  const originalStatus = row.status;
  const targetStatus = newStatus;

  console.log(`🔄 切换用户 ${row.id} 状态: ${originalStatus} -> ${targetStatus}`);

  try {
    // 标记正在更新
    statusUpdateMap.set(row.id, true);

    // v-model 已把本地状态改为 targetStatus，这里确保一致
    row.status = targetStatus;

    // 发送请求
    const response = await toggleUserStatusApi(row.id);

    // 更新本地状态
    // 现在返回完整的响应格式: { code: 200, data: { ...用户信息 }, msg: "成功" }
    if (response && response.code === 200 && response.data && response.data.status !== undefined) {
      row.status = response.data.status;
      console.log(`✅ 用户 ${row.id} 状态更新成功`);
      ElMessage.success(`${row.status === 1 ? '启用' : '禁用'}成功`);
    } else {
      // 回滚状态
      row.status = originalStatus;
      ElMessage.error('状态更新失败');
      return;
    }
  } catch (error: any) {
    console.error(`❌ 用户 ${row.id} 状态更新失败:`, error);
    // 回滚状态
    row.status = originalStatus;
    ElMessage.error(error.message || '状态更新失败');
  } finally {
    // 清除更新标记
    statusUpdateMap.delete(row.id);
  }
};

// 重置密码
const handleResetPassword = (row: User) => {
  currentUserData.value = { ...row };
  resetPasswordVisible.value = true;
};

// 表单成功回调
const handleFormSuccess = () => {
  fetchUserList();
};

const handleResetPasswordSuccess = () => {
  ElMessage.success('密码重置成功');
};

// 生命周期
onMounted(() => {
  fetchUserList();
});
</script>

<style scoped lang="scss">
.header-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.search-card {
  margin-bottom: 16px;
  
  .search-form {
    .el-form-item {
      margin-bottom: 0;
    }
  }
}

.table-card {
  .user-table {
    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .user-avatar {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-weight: 600;
      }
      
      .username {
        font-weight: 500;
        color: #303133;
      }
    }

    .email-text,
    .phone-text {
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 12px;
      color: #6b7280;
    }

    .roles-container {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      
      .role-tag {
        margin: 0;
      }
      
      .no-roles {
        color: #909399;
        font-size: 12px;
        font-style: italic;
      }
    }

    .time-text {
      font-size: 12px;
      color: #6b7280;
    }
  }

  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
}

.mr-1 {
  margin-right: 4px;
}
</style>