<template>
  <div class="p-4">
    <div class="bg-white rounded-lg shadow-sm">
      <!-- 搜索区域 -->
      <div class="p-4 border-b border-gray-200">
        <el-form :model="searchForm" inline class="search-form">
          <el-form-item label="用户名">
            <el-input
              v-model="searchForm.username"
              placeholder="请输入用户名"
              clearable
              class="w-48"
            />
          </el-form-item>
          <el-form-item label="真实姓名">
            <el-input
              v-model="searchForm.realName"
              placeholder="请输入真实姓名"
              clearable
              class="w-48"
            />
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input
              v-model="searchForm.email"
              placeholder="请输入邮箱"
              clearable
              class="w-48"
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable class="w-32">
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              搜索
            </el-button>
            <el-button @click="handleReset">
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 操作区域 -->
      <div class="p-4 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <div>
            <el-button type="primary" @click="handleAdd">
              新增用户
            </el-button>
            <el-button 
              type="danger" 
              :disabled="selectedIds.length === 0"
              @click="handleBatchDelete"
            >
              批量删除
            </el-button>
          </div>
          <div class="text-sm text-gray-500">
            共 {{ pagination.total }} 条记录
          </div>
        </div>
      </div>

      <!-- 表格区域 -->
      <div class="p-4">
        <el-table
          v-loading="loading"
          :data="tableData"
          @selection-change="handleSelectionChange"
          class="w-full"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="username" label="用户名" min-width="120" />
          <el-table-column prop="realName" label="真实姓名" min-width="120" />
          <el-table-column prop="email" label="邮箱" min-width="180" />
          <el-table-column prop="phone" label="手机号" min-width="130" />
          <el-table-column label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
                {{ row.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" min-width="160">
            <template #default="{ row }">
              {{ formatDateTime(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button size="small" @click="handleEdit(row)">
                编辑
              </el-button>
              <el-button size="small" type="warning" @click="handleResetPassword(row)">
                重置密码
              </el-button>
              <el-button size="small" type="danger" @click="handleDelete(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="flex justify-center mt-4">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="fetchUserList"
            @current-change="fetchUserList"
          />
        </div>
      </div>
    </div>

    <!-- 用户表单对话框 -->
    <UserFormDialog
      v-model:visible="formDialogVisible"
      :user-data="currentUser"
      :is-edit="isEdit"
      @success="handleDialogSuccess"
    />

    <!-- 重置密码对话框 -->
    <ResetPasswordDialog
      v-model:visible="resetPasswordVisible"
      :user-data="currentUser"
      @success="handleDialogSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { 
  User, 
  QueryUserParams,
  UserListResult
} from '#/api/system/user';
import { 
  getUserListApi, 
  deleteUserApi, 
  batchDeleteUsersApi 
} from '#/api/system/user';
import UserFormDialog from './components/UserFormDialog.vue';
import ResetPasswordDialog from './components/ResetPasswordDialog.vue';

// 响应式数据
const loading = ref(false);
const tableData = ref<User[]>([]);
const selectedIds = ref<number[]>([]);
const formDialogVisible = ref(false);
const resetPasswordVisible = ref(false);
const isEdit = ref(false);
const currentUser = ref<User | null>(null);

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
  pageSize: 10,
  total: 0,
});

// 获取用户列表
const fetchUserList = async () => {
  try {
    loading.value = true;
    const params = {
      ...searchForm,
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
    
    // 过滤空值
    const filteredParams: any = {};
    Object.keys(params).forEach(key => {
      const value = params[key as keyof typeof params];
      if (value !== '' && value !== undefined && value !== null) {
        filteredParams[key] = value;
      }
    });

    console.log('🔍 请求参数:', filteredParams);
    const response = await getUserListApi(filteredParams);
    console.log('🔍 用户列表API响应:', response);
    
    // 安全处理响应数据
    if (response) {
      // 处理标准分页格式
      if (response.list && Array.isArray(response.list)) {
        tableData.value = response.list;
        pagination.total = response.total || 0;
      }
      // 处理直接数组格式
      else if (Array.isArray(response)) {
        tableData.value = response;
        pagination.total = response.length;
      }
      // 处理嵌套data格式
      else if (response.data) {
        if (response.data.list && Array.isArray(response.data.list)) {
          tableData.value = response.data.list;
          pagination.total = response.data.total || 0;
        } else if (Array.isArray(response.data)) {
          tableData.value = response.data;
          pagination.total = response.data.length;
        }
      }
      // 默认情况
      else {
        tableData.value = [];
        pagination.total = 0;
      }
    } else {
      tableData.value = [];
      pagination.total = 0;
    }
  } catch (error) {
    console.error('获取用户列表失败:', error);
    ElMessage.error('获取用户列表失败');
    tableData.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

// 格式化日期时间
const formatDateTime = (dateTime: string | Date) => {
  if (!dateTime) return '-';
  const date = new Date(dateTime);
  return date.toLocaleString('zh-CN');
};

// 搜索
const handleSearch = () => {
  pagination.page = 1;
  fetchUserList();
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
  fetchUserList();
};

// 新增用户
const handleAdd = () => {
  currentUser.value = null;
  isEdit.value = false;
  formDialogVisible.value = true;
};

// 编辑用户
const handleEdit = (user: User) => {
  currentUser.value = user;
  isEdit.value = true;
  formDialogVisible.value = true;
};

// 删除用户
const handleDelete = async (user: User) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${user.realName}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    await deleteUserApi(user.id);
    ElMessage.success('删除成功');
    fetchUserList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除用户失败:', error);
      ElMessage.error('删除用户失败');
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
      `确定要删除选中的 ${selectedIds.value.length} 个用户吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    await batchDeleteUsersApi(selectedIds.value);
    ElMessage.success('批量删除成功');
    selectedIds.value = [];
    fetchUserList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error);
      ElMessage.error('批量删除失败');
    }
  }
};

// 重置密码
const handleResetPassword = (user: User) => {
  currentUser.value = user;
  resetPasswordVisible.value = true;
};

// 表格选择变化
const handleSelectionChange = (selection: User[]) => {
  selectedIds.value = selection.map(user => user.id);
};

// 对话框成功回调
const handleDialogSuccess = () => {
  formDialogVisible.value = false;
  resetPasswordVisible.value = false;
  fetchUserList();
};

// 页面加载时获取数据
onMounted(() => {
  fetchUserList();
});
</script>

<style lang="scss" scoped>
.search-form {
  .el-form-item {
    margin-bottom: 0;
  }
}
</style>