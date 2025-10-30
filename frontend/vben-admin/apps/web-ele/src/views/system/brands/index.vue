<template>
  <div class="brands-management-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">品牌管理</h1>
      <p class="page-description">管理商品品牌信息，包括品牌的增删改查、状态管理和认证管理</p>
    </div>

    <!-- 搜索和操作区域 -->
    <div class="search-section">
      <ElCard class="search-card">
        <div class="search-form">
          <ElForm :model="searchForm" inline class="search-form-inline">
            <ElFormItem label="商户">
              <ElSelect
                v-model="searchForm.merchantId"
                placeholder="请选择商户"
                clearable
                filterable
                style="width: 200px"
              >
                <ElOption
                  v-for="merchant in merchantList"
                  :key="merchant.id"
                  :label="merchant.merchantName"
                  :value="merchant.id"
                />
              </ElSelect>
            </ElFormItem>
            <ElFormItem label="品牌名称">
              <ElInput
                v-model="searchForm.name"
                placeholder="请输入品牌名称"
                clearable
                style="width: 200px"
                @keyup.enter="handleSearch"
              />
            </ElFormItem>
            <ElFormItem label="是否热门">
              <ElSelect
                v-model="searchForm.isHot"
                placeholder="请选择"
                clearable
                style="width: 120px"
              >
                <ElOption label="是" :value="1" />
                <ElOption label="否" :value="0" />
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
              </ElSelect>
            </ElFormItem>
            <ElFormItem label="认证状态">
              <ElSelect
                v-model="searchForm.isAuth"
                placeholder="请选择认证状态"
                clearable
                style="width: 120px"
              >
                <ElOption label="已认证" :value="1" />
                <ElOption label="未认证" :value="0" />
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
            ➕ 新增品牌
          </ElButton>
          <ElButton
            type="success"
            :disabled="selectedIds.length === 0"
            @click="handleBatchAuth(1)"
          >
            ✓ 批量认证 ({{ selectedIds.length }})
          </ElButton>
          <ElButton
            type="warning"
            :disabled="selectedIds.length === 0"
            @click="handleBatchAuth(0)"
          >
            ✗ 批量取消认证 ({{ selectedIds.length }})
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

    <!-- 品牌列表 -->
    <div class="table-section">
      <ElCard class="table-card">
        <ElTable
          v-loading="loading"
          :data="brandList"
          stripe
          border
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <ElTableColumn type="selection" width="55" align="center" />
          <ElTableColumn prop="id" label="品牌ID" width="80" align="center" />

          <ElTableColumn label="品牌名称" min-width="150">
            <template #default="scope">
              <div v-if="scope && scope.row" class="brand-info-cell">
                <ElImage
                  v-if="scope.row.iconUrl"
                  :src="scope.row.iconUrl"
                  style="width: 40px; height: 40px; border-radius: 4px; margin-right: 10px;"
                  fit="cover"
                />
                <span class="brand-name">{{ scope.row.name }}</span>
              </div>
            </template>
          </ElTableColumn>

          <ElTableColumn label="所属商户" width="150">
            <template #default="scope">
              <div v-if="scope && scope.row && scope.row.merchant">
                <div>{{ scope.row.merchant.name }}</div>
                <div class="text-gray-400 text-xs">ID: {{ scope.row.merchant.id }}</div>
              </div>
              <span v-else class="text-gray-400">-</span>
            </template>
          </ElTableColumn>

          <ElTableColumn label="是否热门" width="100" align="center">
            <template #default="scope">
              <ElTag v-if="scope && scope.row" :type="scope.row.isHot ? 'danger' : 'info'" size="small">
                {{ scope.row.isHot ? '热门' : '普通' }}
              </ElTag>
            </template>
          </ElTableColumn>

          <ElTableColumn label="品牌图标" width="100" align="center">
            <template #default="scope">
              <ElImage
                v-if="scope && scope.row && scope.row.iconUrl"
                :src="scope.row.iconUrl"
                style="width: 50px; height: 50px; border-radius: 4px;"
                fit="cover"
                :preview-src-list="[scope.row.iconUrl]"
              />
              <span v-else class="text-gray-400">-</span>
            </template>
          </ElTableColumn>

          <ElTableColumn label="品牌标签" min-width="150">
            <template #default="scope">
              <div v-if="scope && scope.row && scope.row.label && scope.row.label.length > 0" class="label-tags">
                <ElTag
                  v-for="(tag, index) in scope.row.label"
                  :key="index"
                  size="small"
                  style="margin-right: 5px;"
                >
                  {{ getLabelText(tag) }}
                </ElTag>
              </div>
              <span v-else class="text-gray-400">-</span>
            </template>
          </ElTableColumn>

          <ElTableColumn label="创建者" width="120">
            <template #default="scope">
              <span v-if="scope && scope.row && scope.row.creatorInfo">{{ scope.row.creatorInfo.username }}</span>
              <span v-else class="text-gray-400">-</span>
            </template>
          </ElTableColumn>

          <ElTableColumn label="状态" width="100" align="center">
            <template #default="scope">
              <ElSwitch
                v-if="scope && scope.row"
                v-model="scope.row.status"
                :active-value="1"
                :inactive-value="0"
                @change="handleStatusChange(scope.row)"
              />
            </template>
          </ElTableColumn>

          <ElTableColumn label="认证状态" width="100" align="center">
            <template #default="scope">
              <ElTag v-if="scope && scope.row" :type="scope.row.isAuth ? 'success' : 'warning'" size="small">
                {{ scope.row.isAuth ? '已认证' : '未认证' }}
              </ElTag>
            </template>
          </ElTableColumn>

          <ElTableColumn label="创建时间" width="180">
            <template #default="scope">
              <span v-if="scope && scope.row">{{ formatDateTime(scope.row.createTime) }}</span>
            </template>
          </ElTableColumn>

          <ElTableColumn label="更新时间" width="180">
            <template #default="scope">
              <span v-if="scope && scope.row">{{ formatDateTime(scope.row.updateTime) }}</span>
            </template>
          </ElTableColumn>

          <ElTableColumn label="操作" width="180" align="center" fixed="right">
            <template #default="scope">
              <div v-if="scope && scope.row">
                <ElButton
                  type="primary"
                  size="small"
                  link
                  @click="handleEdit(scope.row)"
                >
                  编辑
                </ElButton>
                <ElButton
                  type="danger"
                  size="small"
                  link
                  @click="handleDelete(scope.row)"
                >
                  删除
                </ElButton>
              </div>
            </template>
          </ElTableColumn>
        </ElTable>

        <!-- 分页器 -->
        <div class="pagination-container">
          <ElPagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.limit"
            :total="pagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </ElCard>
    </div>

    <!-- 新增/编辑品牌对话框 -->
    <ElDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <ElForm
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <ElFormItem label="品牌名称" prop="name">
          <ElInput
            v-model="formData.name"
            placeholder="请输入品牌名称"
            clearable
          />
        </ElFormItem>

        <ElFormItem label="品牌图标" prop="iconUrl">
          <ElUpload
            class="icon-uploader"
            action="#"
            :show-file-list="false"
            :http-request="handleIconUpload"
            :before-upload="beforeIconUpload"
            accept="image/*"
          >
            <img v-if="formData.iconUrl" :src="formData.iconUrl" class="icon-image" />
            <div v-else class="icon-uploader-placeholder">
              <span style="font-size: 28px">+</span>
              <div class="icon-uploader-text">上传图标</div>
            </div>
          </ElUpload>
          <div class="form-tip">
            支持 JPG、PNG 格式，建议尺寸 200x200，最大 2MB
          </div>
        </ElFormItem>

        <ElFormItem label="是否热门" prop="isHot">
          <ElRadioGroup v-model="formData.isHot">
            <ElRadio :value="1">是</ElRadio>
            <ElRadio :value="0">否</ElRadio>
          </ElRadioGroup>
        </ElFormItem>

        <ElFormItem label="品牌标签" prop="label">
          <ElSelect
            v-model="formData.label"
            multiple
            placeholder="请选择品牌标签"
            style="width: 100%"
          >
            <ElOption label="新品牌" value="news" />
            <ElOption label="推荐" value="recommend" />
            <ElOption label="热销" value="hot" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem label="状态" prop="status">
          <ElRadioGroup v-model="formData.status">
            <ElRadio :value="1">启用</ElRadio>
            <ElRadio :value="0">禁用</ElRadio>
          </ElRadioGroup>
        </ElFormItem>
      </ElForm>

      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit" :loading="submitLoading">
          确定
        </ElButton>
      </template>
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
  ElSwitch,
  ElImage,
  ElUpload,
  type FormInstance,
  type FormRules,
  type UploadRequestOptions,
} from 'element-plus';
import { uploadImageApi } from '#/api/common/upload';
import {
  getBrandList,
  createBrand,
  updateBrand,
  deleteBrand,
  batchAuthBrand,
  type Brand,
  type BrandQueryParams,
  type CreateBrandParams,
  type UpdateBrandParams,
} from '#/api/system/brands';
import { getAllMerchantsForSelectApi, type Merchant } from '#/api/system/merchant';

// 响应式数据
const loading = ref(false);
const submitLoading = ref(false);
const uploadLoading = ref(false);
const brandList = ref<Brand[]>([]);
const merchantList = ref<Merchant[]>([]);
const selectedIds = ref<number[]>([]);
const dialogVisible = ref(false);
const dialogTitle = ref('新增品牌');
const isEdit = ref(false);
const currentEditId = ref<number | null>(null);

// 搜索表单
const searchForm = reactive<BrandQueryParams>({
  page: 1,
  limit: 10,
  name: '',
  merchantId: undefined,
  status: undefined,
  isAuth: undefined,
  isHot: undefined,
});

// 分页数据
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
});

// 表单数据
const formData = reactive<CreateBrandParams>({
  name: '',
  iconUrl: '',
  status: 1,
  isAuth: 0,
  isHot: 0,
  label: [],
});

// 表单引用
const formRef = ref<FormInstance>();

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入品牌名称', trigger: 'blur' },
    { min: 2, max: 50, message: '品牌名称长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  iconUrl: [
    { required: true, message: '请输入品牌图标URL', trigger: 'blur' },
  ],
};

// 标签文本映射
const getLabelText = (label: string) => {
  const labelMap: Record<string, string> = {
    news: '新品牌',
    recommend: '推荐',
    hot: '热销',
  };
  return labelMap[label] || label;
};

// 格式化日期时间
const formatDateTime = (dateTime: string | undefined) => {
  if (!dateTime) return '-';
  return new Date(dateTime).toLocaleString('zh-CN');
};

// 加载商户列表
const loadMerchantList = async () => {
  try {
    const response = await getAllMerchantsForSelectApi();
    if (response && response.code === 200) {
      merchantList.value = response.data || [];
    }
  } catch (error: any) {
    console.error('加载商户列表错误:', error);
    ElMessage.error(error.message || '加载商户列表失败');
  }
};

// 加载品牌列表
const loadBrandList = async () => {
  loading.value = true;
  try {
    const params: BrandQueryParams = {
      page: pagination.page,
      limit: pagination.limit,
      ...searchForm,
    };

    const response = await getBrandList(params);
    console.log('品牌列表响应:', response);
    if (response.code === 200) {
      brandList.value = response.data.list || [];
      pagination.total = response.data.total || 0;
      pagination.page = response.data.page || 1;
      pagination.limit = response.data.limit || 10;
    } else {
      ElMessage.error(response.message || '加载品牌列表失败');
    }
  } catch (error: any) {
    console.error('加载品牌列表错误:', error);
    ElMessage.error(error.message || '加载品牌列表失败');
    brandList.value = [];
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  pagination.page = 1;
  loadBrandList();
};

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    name: '',
    merchantId: undefined,
    status: undefined,
    isAuth: undefined,
    isHot: undefined,
  });
  pagination.page = 1;
  loadBrandList();
};

// 刷新
const handleRefresh = () => {
  loadBrandList();
};

// 新增
const handleAdd = () => {
  isEdit.value = false;
  dialogTitle.value = '新增品牌';
  currentEditId.value = null;
  Object.assign(formData, {
    name: '',
    iconUrl: '',
    status: 1,
    isAuth: 0,
    isHot: 0,
    label: [],
  });
  dialogVisible.value = true;
};

// 编辑
const handleEdit = (row: Brand) => {
  isEdit.value = true;
  dialogTitle.value = '编辑品牌';
  currentEditId.value = row.id;
  Object.assign(formData, {
    name: row.name,
    iconUrl: row.iconUrl,
    status: row.status,
    isAuth: row.isAuth,
    isHot: row.isHot,
    label: row.label || [],
  });
  dialogVisible.value = true;
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true;
      try {
        if (isEdit.value && currentEditId.value) {
          const params: UpdateBrandParams = {
            name: formData.name,
            iconUrl: formData.iconUrl,
            status: formData.status,
            isAuth: formData.isAuth,
            isHot: formData.isHot,
            label: formData.label,
          };
          await updateBrand(currentEditId.value, params);
          ElMessage.success('编辑品牌成功');
        } else {
          await createBrand(formData);
          ElMessage.success('新增品牌成功');
        }
        dialogVisible.value = false;
        loadBrandList();
      } catch (error: any) {
        ElMessage.error(error.message || '操作失败');
      } finally {
        submitLoading.value = false;
      }
    }
  });
};

// 删除
const handleDelete = async (row: Brand) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除品牌"${row.name}"吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    await deleteBrand(row.id);
    ElMessage.success('删除成功');
    loadBrandList();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败');
    }
  }
};

// 批量删除
const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要删除的品牌');
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 个品牌吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    // 逐个删除
    for (const id of selectedIds.value) {
      await deleteBrand(id);
    }

    ElMessage.success('批量删除成功');
    selectedIds.value = [];
    loadBrandList();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '批量删除失败');
    }
  }
};

// 批量认证
const handleBatchAuth = async (isAuth: number) => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要操作的品牌');
    return;
  }

  try {
    await batchAuthBrand({
      ids: selectedIds.value,
      isAuth,
    });
    ElMessage.success(`批量${isAuth ? '认证' : '取消认证'}成功`);
    selectedIds.value = [];
    loadBrandList();
  } catch (error: any) {
    ElMessage.error(error.message || '批量操作失败');
  }
};

// 状态变更
const handleStatusChange = async (row: Brand) => {
  try {
    await updateBrand(row.id, { status: row.status });
    ElMessage.success('状态更新成功');
  } catch (error: any) {
    ElMessage.error(error.message || '状态更新失败');
    // 恢复原状态
    row.status = row.status === 1 ? 0 : 1;
  }
};

// 选择变更
const handleSelectionChange = (selection: Brand[]) => {
  selectedIds.value = selection.map((item) => item.id);
};

// 分页大小变更
const handleSizeChange = (size: number) => {
  pagination.limit = size;
  loadBrandList();
};

// 当前页变更
const handleCurrentChange = (page: number) => {
  pagination.page = page;
  loadBrandList();
};

// 对话框关闭
const handleDialogClose = () => {
  formRef.value?.resetFields();
};

// 图标上传前验证
const beforeIconUpload = (file: File) => {
  const isImage = file.type.startsWith('image/');
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isImage) {
    ElMessage.error('只能上传图片文件！');
    return false;
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB！');
    return false;
  }
  return true;
};

// 图标上传处理
const handleIconUpload = async (options: UploadRequestOptions) => {
  const { file } = options;

  try {
    uploadLoading.value = true;
    const result = await uploadImageApi(file as File);
    formData.iconUrl = result.url;
    ElMessage.success('图标上传成功');
  } catch (error: any) {
    ElMessage.error(error.message || '图标上传失败');
  } finally {
    uploadLoading.value = false;
  }
};

// 组件挂载时加载数据
onMounted(() => {
  loadMerchantList();
  loadBrandList();
});
</script>

<style lang="scss" scoped>
.brands-management-page {
  padding: 20px;

  .page-header {
    margin-bottom: 20px;

    .page-title {
      font-size: 24px;
      font-weight: bold;
      margin: 0 0 8px;
      color: #303133;
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
        margin-bottom: 16px;
      }

      .action-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }
    }
  }

  .table-section {
    .brand-info-cell {
      display: flex;
      align-items: center;

      .brand-name {
        font-weight: 500;
      }
    }

    .label-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }

    .pagination-container {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
    }
  }

  .icon-uploader {
    :deep(.el-upload) {
      border: 1px dashed #d9d9d9;
      border-radius: 6px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: all 0.3s;

      &:hover {
        border-color: #409eff;
      }
    }

    .icon-image {
      width: 148px;
      height: 148px;
      display: block;
      object-fit: cover;
    }

    .icon-uploader-placeholder {
      width: 148px;
      height: 148px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #8c939d;
      font-size: 28px;
      background-color: #fafafa;
    }

    .icon-uploader-text {
      font-size: 14px;
      margin-top: 8px;
    }
  }

  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 8px;
    line-height: 1.5;
  }
}
</style>
