<template>
  <Page title="角色管理" description="管理系统角色，支持角色的新增、编辑与删除">
    <!-- 操作栏 -->
    <div class="header-actions">
      <ElButton type="primary" @click="onAdd">
        <Icon icon="lucide:plus" class="mr-1" />
        新增角色
      </ElButton>
      <ElButton @click="reload">
        <Icon icon="lucide:refresh-cw" class="mr-1" />
        刷新
      </ElButton>
    </div>

    <!-- 搜索区域 -->
    <ElCard class="search-card">
      <ElForm :model="searchForm" inline class="search-form">
        <ElFormItem label="角色名称">
          <ElInput
            v-model="searchForm.name"
            placeholder="请输入角色名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </ElFormItem>
        <ElFormItem label="状态">
          <ElSelect v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 140px">
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

    <!-- 列表 -->
    <ElCard class="table-card">
      <ElTable
        :data="tableData"
        v-loading="loading"
        border
        stripe
      >
        <ElTableColumn prop="name" label="角色名称" min-width="200" />
        <ElTableColumn prop="code" label="角色编码" min-width="160">
          <template #default="{ row }">
            <ElTag type="info" size="small">{{ row.code }}</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <ElTableColumn prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <ElTag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            <span class="time-text">{{ formatTime(row.createdAt) }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <ElSpace>
              <ElButton type="primary" size="small" @click="onEdit(row)">
                <Icon icon="lucide:edit" class="mr-1" />
                编辑
              </ElButton>
              <ElButton type="info" size="small" @click="onAssignPermission(row)">
                <Icon icon="lucide:shield-check" class="mr-1" />
                分配权限
              </ElButton>
              <ElButton 
                :type="row.status === 1 ? 'warning' : 'success'" 
                size="small" 
                @click="onToggleStatus(row)"
              >
                <Icon :icon="row.status === 1 ? 'lucide:eye-off' : 'lucide:eye'" class="mr-1" />
                {{ row.status === 1 ? '禁用' : '启用' }}
              </ElButton>
              <ElButton type="danger" size="small" @click="onDelete(row)">
                <Icon icon="lucide:trash-2" class="mr-1" />
                删除
              </ElButton>
            </ElSpace>
          </template>
        </ElTableColumn>
      </ElTable>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <ElPagination
          v-model:current-page="searchForm.page"
          v-model:page-size="searchForm.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </ElCard>

    <!-- 角色表单弹窗 -->
    <ElDialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑角色' : '新增角色'"
      width="520px"
      destroy-on-close
    >
      <ElForm ref="formRef" :model="formModel" :rules="formRules" label-width="84px">
        <ElFormItem label="角色名称" prop="name">
          <ElInput v-model="formModel.name" placeholder="请输入角色名称" />
        </ElFormItem>
        <ElFormItem label="角色编码" prop="code">
          <ElInput 
            v-model="formModel.code" 
            placeholder="请输入角色编码（英文字母/下划线）"
            :disabled="isEdit"
          />
        </ElFormItem>
        <ElFormItem label="角色描述" prop="description">
          <ElInput 
            v-model="formModel.description" 
            type="textarea" 
            :rows="3"
            placeholder="请输入角色描述（可选）" 
          />
        </ElFormItem>
        <ElFormItem label="状态" prop="status">
          <ElSwitch v-model="formModel.status" :active-value="1" :inactive-value="0" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElSpace>
          <ElButton @click="dialogVisible = false">取消</ElButton>
          <ElButton type="primary" :loading="submitLoading" @click="onSubmit">
            {{ isEdit ? '保存' : '创建' }}
          </ElButton>
        </ElSpace>
      </template>
    </ElDialog>

    <!-- 权限分配弹窗 -->
    <RolePermissionDialog
      v-model:visible="permissionDialogVisible"
      :role-id="currentPermissionRoleId"
      :role-name="currentPermissionRoleName"
      @success="handlePermissionSuccess"
    />
  </Page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { Page } from '@vben/common-ui';
import { Icon } from '@iconify/vue';
import {
  ElButton,
  ElCard,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElMessageBox,
  ElPagination,
  ElSelect,
  ElOption,
  ElSpace,
  ElSwitch,
  ElTable,
  ElTableColumn,
  ElTag,
  type FormInstance,
  type FormRules,
} from 'element-plus';
import {
  getRoleListApi,
  createRoleApi,
  updateRoleApi,
  deleteRoleApi,
  toggleRoleStatusApi,
  type Role,
  type CreateRoleParams,
  type UpdateRoleParams,
  type QueryRoleParams,
} from '#/api/system/role';
import RolePermissionDialog from './components/RolePermissionDialog.vue';

defineOptions({ name: 'SystemRole' });

/** 搜索 */
const searchForm = reactive<QueryRoleParams>({
  name: '',
  status: undefined,
  page: 1,
  pageSize: 10,
});

/** 列表数据 */
const loading = ref(false);
const tableData = ref<Role[]>([]);
const total = ref(0);

/** 表单弹窗 */
const dialogVisible = ref(false);
const isEdit = ref(false);
const currentId = ref<number | null>(null);

const formRef = ref<FormInstance>();
const formModel = reactive<CreateRoleParams>({
  name: '',
  code: '',
  description: '',
  status: 1,
});

const formRules: FormRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度应为 2-20 个字符', trigger: 'blur' },
  ],
  code: [
    { required: true, message: '请输入角色编码', trigger: 'blur' },
    { pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/, message: '仅字母、数字、下划线，且不得以数字开头', trigger: 'blur' },
  ],
};

const submitLoading = ref(false);

/** 权限分配弹窗 */
const permissionDialogVisible = ref(false);
const currentPermissionRoleId = ref<number>();
const currentPermissionRoleName = ref<string>('');

/** 工具函数 */
const formatTime = (time?: string) => {
  if (!time) return '-';
  return new Date(time).toLocaleString('zh-CN');
};

/** 获取角色列表 */
async function fetchRoleList() {
  try {
    loading.value = true;
    const data = await getRoleListApi(searchForm);
    console.log('角色列表数据:', data);
    
    tableData.value = data.list || [];
    total.value = data.total || 0;
  } catch (error: any) {
    console.error('获取角色列表失败:', error);
    ElMessage.error(error.message || '获取角色列表失败');
    tableData.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

/** 搜索与重置 */
function handleSearch() {
  searchForm.page = 1;
  fetchRoleList();
}

function resetSearch() {
  searchForm.name = '';
  searchForm.status = undefined;
  searchForm.page = 1;
  fetchRoleList();
}

function reload() {
  fetchRoleList();
}

/** 分页处理 */
function handleSizeChange(size: number) {
  searchForm.pageSize = size;
  searchForm.page = 1;
  fetchRoleList();
}

function handleCurrentChange(page: number) {
  searchForm.page = page;
  fetchRoleList();
}

// 页面加载时获取数据
onMounted(() => {
  fetchRoleList();
});

/** 新增 */
function onAdd() {
  isEdit.value = false;
  currentId.value = null;
  Object.assign(formModel, {
    name: '',
    code: '',
    description: '',
    status: 1,
  });
  dialogVisible.value = true;
}

/** 编辑 */
function onEdit(row: Role) {
  isEdit.value = true;
  currentId.value = row.id;
  Object.assign(formModel, {
    name: row.name,
    code: row.code,
    description: row.description || '',
    status: row.status,
  });
  dialogVisible.value = true;
}

/** 分配权限 */
function onAssignPermission(row: Role) {
  currentPermissionRoleId.value = row.id;
  currentPermissionRoleName.value = row.name;
  permissionDialogVisible.value = true;
}

/** 权限分配成功回调 */
function handlePermissionSuccess() {
  ElMessage.success('权限分配成功');
  // 可以在这里刷新列表或更新相关状态
}

/** 切换状态 */
async function onToggleStatus(row: Role) {
  try {
    const action = row.status === 1 ? '禁用' : '启用';
    await ElMessageBox.confirm(
      `确定${action}角色"${row.name}"吗？`,
      '状态切换确认',
      {
        confirmButtonText: `确定${action}`,
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    const updatedRole = await toggleRoleStatusApi(row.id);
    ElMessage.success(`${action}成功`);
    
    // 更新本地数据
    const index = tableData.value.findIndex(item => item.id === row.id);
    if (index > -1) {
      tableData.value[index] = updatedRole;
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('切换角色状态失败:', error);
      ElMessage.error(error.message || '切换角色状态失败');
    }
  }
}

/** 删除角色 */
async function onDelete(row: Role) {
  try {
    await ElMessageBox.confirm(
      `确定删除角色"${row.name}"吗？删除后不可恢复！`, 
      '删除确认', 
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: false,
      }
    );
    
    await deleteRoleApi(row.id);
    ElMessage.success('删除成功');
    
    // 重新加载列表
    await fetchRoleList();
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除角色失败:', error);
      ElMessage.error(error.message || '删除角色失败');
    }
  }
}

/** 提交表单 */
async function onSubmit() {
  try {
    await formRef.value?.validate();
    submitLoading.value = true;

    if (isEdit.value && currentId.value) {
      // 编辑角色
      const updatedRole = await updateRoleApi(currentId.value, formModel);
      ElMessage.success('保存成功');
      
      // 更新本地数据
      const index = tableData.value.findIndex(item => item.id === currentId.value);
      if (index > -1) {
        tableData.value[index] = updatedRole;
      }
    } else {
      // 新增角色
      await createRoleApi(formModel);
      ElMessage.success('创建成功');
      
      // 重新加载列表
      await fetchRoleList();
    }

    dialogVisible.value = false;
  } catch (error: any) {
    console.error('提交失败:', error);
    ElMessage.error(error.message || '操作失败');
  } finally {
    submitLoading.value = false;
  }
}
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
  .time-text {
    font-size: 12px;
    color: #6b7280;
  }

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }
}

.mr-1 {
  margin-right: 4px;
}
</style>