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

    <!-- 搜索区域（占位，后续可接入） -->
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
            <ElOption label="启用" :value="true" />
            <ElOption label="禁用" :value="false" />
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
        <ElTableColumn prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <ElTag :type="row.status ? 'success' : 'danger'" size="small">
              {{ row.status ? '启用' : '禁用' }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            <span class="time-text">{{ formatTime(row.createdAt) }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <ElSpace>
              <ElButton type="primary" size="small" @click="onEdit(row)">
                <Icon icon="lucide:edit" class="mr-1" />
                编辑
              </ElButton>
              <ElButton type="danger" size="small" @click="onDelete(row)">
                <Icon icon="lucide:trash-2" class="mr-1" />
                删除
              </ElButton>
            </ElSpace>
          </template>
        </ElTableColumn>
      </ElTable>
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
          <ElInput v-model="formModel.code" placeholder="请输入角色编码（英文字母/下划线）" />
        </ElFormItem>
        <ElFormItem label="状态" prop="status">
          <ElSwitch v-model="formModel.status" :active-value="true" :inactive-value="false" />
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
  </Page>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
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

defineOptions({ name: 'SystemRole' });

/** 搜索 */
const searchForm = reactive<{ name?: string; status?: boolean }>({
  name: '',
  status: undefined,
});

/** 列表数据（占位，后续对接 API 替换） */
type Role = { id: number; name: string; code: string; status: boolean; createdAt?: string };
const loading = ref(false);
const tableData = ref<Role[]>([
  { id: 1, name: '超级管理员', code: 'super_admin', status: true, createdAt: '2025-09-10 10:00:00' },
  { id: 2, name: '管理员', code: 'admin', status: true, createdAt: '2025-09-11 12:00:00' },
]);

/** 表单弹窗 */
const dialogVisible = ref(false);
const isEdit = ref(false);
const currentId = ref<number | null>(null);

const formRef = ref<FormInstance>();
const formModel = reactive<Role>({
  id: 0,
  name: '',
  code: '',
  status: true,
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

/** 工具函数 */
const formatTime = (time?: string) => {
  if (!time) return '-';
  return new Date(time).toLocaleString('zh-CN');
};

/** 搜索与重置（占位实现） */
function handleSearch() {
  const { name, status } = searchForm;
  const src = [
    { id: 1, name: '超级管理员', code: 'super_admin', status: true, createdAt: '2025-09-10 10:00:00' },
    { id: 2, name: '管理员', code: 'admin', status: true, createdAt: '2025-09-11 12:00:00' },
  ];
  tableData.value = src.filter((r) => {
    const nameOk = name ? r.name.includes(name) : true;
    const statusOk = typeof status === 'boolean' ? r.status === status : true;
    return nameOk && statusOk;
  });
}
function resetSearch() {
  searchForm.name = '';
  searchForm.status = undefined;
  handleSearch();
}
function reload() {
  handleSearch();
}

/** 新增 */
function onAdd() {
  isEdit.value = false;
  currentId.value = null;
  Object.assign(formModel, { id: 0, name: '', code: '', status: true });
  dialogVisible.value = true;
}

/** 编辑 */
function onEdit(row: Role) {
  isEdit.value = true;
  currentId.value = row.id;
  Object.assign(formModel, { ...row });
  dialogVisible.value = true;
}

/** 删除（占位实现） */
async function onDelete(row: Role) {
  try {
    await ElMessageBox.confirm(`确定删除角色“${row.name}”吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    tableData.value = tableData.value.filter((r) => r.id !== row.id);
    ElMessage.success('删除成功');
  } catch {
    // 取消
  }
}

/** 提交（占位实现，后续对接 API） */
async function onSubmit() {
  try {
    await formRef.value?.validate();
    submitLoading.value = true;

    if (isEdit.value && currentId.value) {
      // TODO: await updateRoleApi(currentId.value, formModel)
      console.log('[角色-编辑] 提交数据:', { ...formModel });
      const idx = tableData.value.findIndex((r) => r.id === currentId.value);
      if (idx > -1) tableData.value[idx] = { ...formModel };
      ElMessage.success('保存成功');
    } else {
      // TODO: const created = await createRoleApi(formModel)
      console.log('[角色-新增] 提交数据:', { ...formModel });
      const newId = Math.max(0, ...tableData.value.map((r) => r.id)) + 1;
      tableData.value.unshift({ ...formModel, id: newId, createdAt: new Date().toISOString() });
      ElMessage.success('创建成功');
    }

    dialogVisible.value = false;
  } catch (e) {
    // 校验失败
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
}

.mr-1 {
  margin-right: 4px;
}
</style>