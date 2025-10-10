<template>
  <div class="merchant-management-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">商户管理</h1>
      <p class="page-description">
        管理平台商户信息，包括商户的增删改查、状态管理和认证管理。创建商户时会自动生成超级管理员账号。
      </p>
    </div>

    <!-- 搜索和操作区域 -->
    <div class="search-section">
      <ElCard class="search-card">
        <div class="search-form">
          <ElForm :model="searchForm" inline class="search-form-inline">
            <ElFormItem label="商户编码">
              <ElInput
                v-model="searchForm.merchantCode"
                placeholder="请输入商户编码"
                clearable
                style="width: 200px"
                @keyup.enter="handleSearch"
              />
            </ElFormItem>
            <ElFormItem label="商户名称">
              <ElInput
                v-model="searchForm.merchantName"
                placeholder="请输入商户名称"
                clearable
                style="width: 200px"
                @keyup.enter="handleSearch"
              />
            </ElFormItem>
            <ElFormItem label="商户类型">
              <ElSelect
                v-model="searchForm.merchantType"
                placeholder="请选择类型"
                clearable
                style="width: 150px"
              >
                <ElOption label="超级商户" :value="1" />
                <ElOption label="普通商户" :value="2" />
              </ElSelect>
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
                <ElOption label="冻结" :value="2" />
              </ElSelect>
            </ElFormItem>
            <ElFormItem label="认证状态">
              <ElSelect
                v-model="searchForm.certificationStatus"
                placeholder="请选择认证状态"
                clearable
                style="width: 150px"
              >
                <ElOption label="未认证" :value="0" />
                <ElOption label="审核中" :value="1" />
                <ElOption label="已认证" :value="2" />
                <ElOption label="认证失败" :value="3" />
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
            ➕ 新增商户
          </ElButton>
          <ElButton @click="handleRefresh" :loading="loading">
            🔄 刷新
          </ElButton>
        </div>
      </ElCard>
    </div>

    <!-- 商户列表 -->
    <div class="table-section">
      <ElCard class="table-card">
        <ElTable
          v-loading="loading"
          :data="merchantList"
          stripe
          border
          style="width: 100%"
        >
          <ElTableColumn prop="id" label="ID" width="80" align="center" />

          <ElTableColumn label="商户信息" min-width="200">
            <template #default="{ row }">
              <div class="merchant-info-cell">
                <div class="merchant-name">{{ row.merchantName }}</div>
                <div class="merchant-code">{{ row.merchantCode }}</div>
              </div>
            </template>
          </ElTableColumn>

          <ElTableColumn label="商户类型" width="120" align="center">
            <template #default="{ row }">
              <ElTag :type="row.merchantType === 1 ? 'danger' : 'primary'" size="small">
                {{ getMerchantTypeLabel(row.merchantType) }}
              </ElTag>
            </template>
          </ElTableColumn>

          <ElTableColumn label="联系信息" min-width="180">
            <template #default="{ row }">
              <div class="contact-info">
                <div v-if="row.contactName" class="contact-item">
                  👤 {{ row.contactName }}
                </div>
                <div v-if="row.contactPhone" class="contact-item">
                  📱 {{ row.contactPhone }}
                </div>
                <div v-if="row.contactEmail" class="contact-item">
                  📧 {{ row.contactEmail }}
                </div>
              </div>
            </template>
          </ElTableColumn>

          <ElTableColumn label="配额信息" width="140">
            <template #default="{ row }">
              <div class="quota-info">
                <div class="quota-item">商品: {{ row.maxProducts }}</div>
                <div class="quota-item">管理员: {{ row.maxAdmins }}</div>
                <div class="quota-item">
                  存储: {{ formatStorage(row.maxStorage) }}
                </div>
              </div>
            </template>
          </ElTableColumn>

          <ElTableColumn label="状态" width="100" align="center">
            <template #default="{ row }">
              <ElTag :type="getStatusType(row.status)" size="small">
                {{ getStatusLabel(row.status) }}
              </ElTag>
            </template>
          </ElTableColumn>

          <ElTableColumn label="认证状态" width="100" align="center">
            <template #default="{ row }">
              <ElTag :type="getCertificationStatusType(row.certificationStatus)" size="small">
                {{ getCertificationStatusLabel(row.certificationStatus) }}
              </ElTag>
            </template>
          </ElTableColumn>

          <ElTableColumn prop="createdAt" label="创建时间" width="160">
            <template #default="{ row }">
              {{ formatDateTime(row.createdAt) }}
            </template>
          </ElTableColumn>

          <ElTableColumn label="操作" width="280" align="center" fixed="right">
            <template #default="{ row }">
              <div class="action-buttons-cell">
                <ElButton type="primary" size="small" @click="handleEdit(row)">
                  编辑
                </ElButton>
                <ElButton
                  :type="row.status === 1 ? 'warning' : 'success'"
                  size="small"
                  @click="handleToggleStatus(row)"
                >
                  {{ row.status === 1 ? '禁用' : '启用' }}
                </ElButton>
                <ElDropdown @command="(command) => handleDropdownCommand(command, row)">
                  <ElButton size="small">
                    更多 ▼
                  </ElButton>
                  <template #dropdown>
                    <ElDropdownMenu>
                      <ElDropdownItem command="certification">
                        认证管理
                      </ElDropdownItem>
                      <ElDropdownItem command="statistics">
                        统计信息
                      </ElDropdownItem>
                      <ElDropdownItem command="regenerateKeys">
                        重新生成密钥
                      </ElDropdownItem>
                      <ElDropdownItem command="delete" divided>
                        删除商户
                      </ElDropdownItem>
                    </ElDropdownMenu>
                  </template>
                </ElDropdown>
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

    <!-- 商户表单对话框 -->
    <MerchantForm
      v-model:visible="merchantFormVisible"
      :merchant-data="currentMerchant"
      @success="handleFormSuccess"
    />

    <!-- 管理员凭证展示对话框 -->
    <AdminCredentialsDialog
      v-model:visible="credentialsDialogVisible"
      :merchant-data="newMerchantData"
    />

    <!-- 认证状态管理对话框 -->
    <ElDialog
      v-model="certificationDialogVisible"
      title="认证状态管理"
      width="500px"
    >
      <ElForm label-width="100px">
        <ElFormItem label="当前状态">
          <ElTag :type="getCertificationStatusType(currentMerchant?.certificationStatus || 0)">
            {{ getCertificationStatusLabel(currentMerchant?.certificationStatus || 0) }}
          </ElTag>
        </ElFormItem>
        <ElFormItem label="更新状态">
          <ElRadioGroup v-model="newCertificationStatus">
            <ElRadio :label="0">未认证</ElRadio>
            <ElRadio :label="1">审核中</ElRadio>
            <ElRadio :label="2">已认证</ElRadio>
            <ElRadio :label="3">认证失败</ElRadio>
          </ElRadioGroup>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="certificationDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleUpdateCertification">确定</ElButton>
      </template>
    </ElDialog>

    <!-- 统计信息对话框 -->
    <ElDialog
      v-model="statisticsDialogVisible"
      title="商户统计信息"
      width="600px"
    >
      <div v-loading="statisticsLoading" class="statistics-container">
        <ElDescriptions :column="2" border>
          <ElDescriptionsItem label="商户名称">
            {{ merchantStatistics?.merchantName }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="商户ID">
            {{ merchantStatistics?.merchantId }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="账户余额">
            ¥{{ merchantStatistics?.balance }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="冻结金额">
            ¥{{ merchantStatistics?.frozenBalance }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="累计销售额">
            ¥{{ merchantStatistics?.totalSales }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="当前商品数">
            {{ merchantStatistics?.currentProducts }} / {{ merchantStatistics?.maxProducts }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="当前管理员数">
            {{ merchantStatistics?.currentAdmins }} / {{ merchantStatistics?.maxAdmins }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="已用存储空间">
            {{ formatStorage(merchantStatistics?.usedStorage || 0) }} /
            {{ formatStorage(merchantStatistics?.maxStorage || 0) }}
          </ElDescriptionsItem>
        </ElDescriptions>
      </div>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
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
  ElTag,
  ElPagination,
  ElMessage,
  ElMessageBox,
  ElDialog,
  ElRadioGroup,
  ElRadio,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElDescriptions,
  ElDescriptionsItem,
} from 'element-plus';
import type {
  Merchant,
  QueryMerchantParams,
  MerchantStatistics,
} from '#/api/system/merchant';
import {
  getMerchantListApi,
  deleteMerchantApi,
  updateMerchantStatusApi,
  updateMerchantCertificationApi,
  getMerchantStatisticsApi,
  regenerateMerchantKeysApi,
} from '#/api/system/merchant';
import MerchantForm from './components/MerchantForm.vue';
import AdminCredentialsDialog from './components/AdminCredentialsDialog.vue';

defineOptions({ name: 'MerchantManagement' });

// 响应式数据
const loading = ref(false);
const merchantList = ref<Merchant[]>([]);
const currentMerchant = ref<Merchant | null>(null);
const newMerchantData = ref<Merchant | null>(null);
const merchantFormVisible = ref(false);
const credentialsDialogVisible = ref(false);
const certificationDialogVisible = ref(false);
const statisticsDialogVisible = ref(false);
const newCertificationStatus = ref(0);
const merchantStatistics = ref<MerchantStatistics | null>(null);
const statisticsLoading = ref(false);

// 搜索表单
const searchForm = reactive<QueryMerchantParams>({
  merchantCode: '',
  merchantName: '',
  merchantType: undefined,
  status: undefined,
  certificationStatus: undefined,
});

// 分页数据
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

// 加载商户列表
const loadMerchantList = async () => {
  try {
    loading.value = true;
    const params: QueryMerchantParams = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm,
    };

    const response = await getMerchantListApi(params);
    merchantList.value = response.data.items;
    pagination.total = response.data.total;
  } catch (error: any) {
    ElMessage.error(error.message || '加载商户列表失败');
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  pagination.page = 1;
  loadMerchantList();
};

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    merchantCode: '',
    merchantName: '',
    merchantType: undefined,
    status: undefined,
    certificationStatus: undefined,
  });
  handleSearch();
};

// 刷新
const handleRefresh = () => {
  loadMerchantList();
};

// 新增商户
const handleAdd = () => {
  currentMerchant.value = null;
  merchantFormVisible.value = true;
};

// 编辑商户
const handleEdit = (row: Merchant) => {
  currentMerchant.value = row;
  merchantFormVisible.value = true;
};

// 表单提交成功
const handleFormSuccess = (data: Merchant) => {
  // 如果有superAdmin字段，说明是新创建的商户，需要显示凭证
  if (data.superAdmin) {
    newMerchantData.value = data;
    credentialsDialogVisible.value = true;
  }
  loadMerchantList();
};

// 切换状态
const handleToggleStatus = async (row: Merchant) => {
  try {
    const newStatus = row.status === 1 ? 0 : 1;
    const statusText = newStatus === 1 ? '启用' : '禁用';

    await ElMessageBox.confirm(
      `确定要${statusText}商户"${row.merchantName}"吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    await updateMerchantStatusApi(row.id, newStatus);
    ElMessage.success(`${statusText}成功`);
    loadMerchantList();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败');
    }
  }
};

// 下拉菜单命令
const handleDropdownCommand = (command: string, row: Merchant) => {
  currentMerchant.value = row;

  switch (command) {
    case 'certification':
      newCertificationStatus.value = row.certificationStatus;
      certificationDialogVisible.value = true;
      break;
    case 'statistics':
      handleShowStatistics(row);
      break;
    case 'regenerateKeys':
      handleRegenerateKeys(row);
      break;
    case 'delete':
      handleDelete(row);
      break;
  }
};

// 更新认证状态
const handleUpdateCertification = async () => {
  if (!currentMerchant.value) return;

  try {
    await updateMerchantCertificationApi(
      currentMerchant.value.id,
      newCertificationStatus.value
    );
    ElMessage.success('认证状态更新成功');
    certificationDialogVisible.value = false;
    loadMerchantList();
  } catch (error: any) {
    ElMessage.error(error.message || '更新失败');
  }
};

// 显示统计信息
const handleShowStatistics = async (row: Merchant) => {
  try {
    statisticsLoading.value = true;
    statisticsDialogVisible.value = true;
    merchantStatistics.value = await getMerchantStatisticsApi(row.id);
  } catch (error: any) {
    ElMessage.error(error.message || '获取统计信息失败');
  } finally {
    statisticsLoading.value = false;
  }
};

// 重新生成密钥
const handleRegenerateKeys = async (row: Merchant) => {
  try {
    await ElMessageBox.confirm(
      `确定要重新生成商户"${row.merchantName}"的API密钥吗？旧密钥将立即失效！`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    const keys = await regenerateMerchantKeysApi(row.id);
    await ElMessageBox.alert(
      `新的API密钥：\nAPI Key: ${keys.apiKey}\nAPI Secret: ${keys.apiSecret}\n\n请务必保存这些密钥，关闭后将无法再次查看！`,
      '新密钥已生成',
      {
        confirmButtonText: '我已保存',
        type: 'success',
      }
    );
    loadMerchantList();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败');
    }
  }
};

// 删除商户
const handleDelete = async (row: Merchant) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除商户"${row.merchantName}"吗？此操作不可恢复！`,
      '警告',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'error',
      }
    );

    await deleteMerchantApi(row.id);
    ElMessage.success('删除成功');
    loadMerchantList();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败');
    }
  }
};

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  pagination.page = 1;
  loadMerchantList();
};

const handleCurrentChange = (page: number) => {
  pagination.page = page;
  loadMerchantList();
};

// 工具函数
const getMerchantTypeLabel = (type: number) => {
  return type === 1 ? '超级商户' : '普通商户';
};

const getStatusLabel = (status: number) => {
  const labels: Record<number, string> = {
    0: '禁用',
    1: '启用',
    2: '冻结',
  };
  return labels[status] || '未知';
};

const getStatusType = (status: number) => {
  const types: Record<number, 'success' | 'danger' | 'warning' | 'info'> = {
    0: 'danger',
    1: 'success',
    2: 'warning',
  };
  return types[status] || 'info';
};

const getCertificationStatusLabel = (status: number) => {
  const labels: Record<number, string> = {
    0: '未认证',
    1: '审核中',
    2: '已认证',
    3: '认证失败',
  };
  return labels[status] || '未知';
};

const getCertificationStatusType = (status: number) => {
  const types: Record<number, 'success' | 'danger' | 'warning' | 'info'> = {
    0: 'info',
    1: 'warning',
    2: 'success',
    3: 'danger',
  };
  return types[status] || 'info';
};

const formatStorage = (bytes: number) => {
  if (!bytes || bytes === 0) return '0 GB';
  const gb = bytes / 1073741824;
  return `${gb.toFixed(2)} GB`;
};

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-';
  return dateStr.replace('T', ' ').split('.')[0];
};

// 页面加载
onMounted(() => {
  loadMerchantList();
});
</script>

<style lang="scss" scoped>
.merchant-management-page {
  padding: 20px;

  .page-header {
    margin-bottom: 20px;

    .page-title {
      font-size: 24px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 10px 0;
    }

    .page-description {
      font-size: 14px;
      color: #909399;
      margin: 0;
    }
  }

  .search-section {
    margin-bottom: 20px;

    .search-card {
      .search-form {
        margin-bottom: 15px;

        .search-form-inline {
          :deep(.el-form-item) {
            margin-bottom: 10px;
          }
        }
      }

      .action-buttons {
        display: flex;
        gap: 10px;
      }
    }
  }

  .table-section {
    .table-card {
      .merchant-info-cell {
        .merchant-name {
          font-weight: 500;
          color: #303133;
          margin-bottom: 4px;
        }

        .merchant-code {
          font-size: 12px;
          color: #909399;
        }
      }

      .contact-info,
      .quota-info {
        .contact-item,
        .quota-item {
          font-size: 12px;
          color: #606266;
          line-height: 1.6;
        }
      }

      .action-buttons-cell {
        display: flex;
        gap: 5px;
        justify-content: center;
        flex-wrap: wrap;
      }

      .pagination-wrapper {
        display: flex;
        justify-content: flex-end;
        margin-top: 20px;
      }
    }
  }

  .statistics-container {
    min-height: 200px;
  }
}
</style>
