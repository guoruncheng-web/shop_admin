<template>
  <ElDialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑商户' : '新增商户'"
    width="800px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <ElForm
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      class="merchant-form"
    >
      <ElCollapse v-model="activeCollapse">
        <!-- 基础信息 -->
        <ElCollapseItem title="基础信息" name="basic">
          <ElFormItem label="商户编码" prop="merchantCode">
            <ElInput
              v-model="formData.merchantCode"
              placeholder="请输入商户编码（唯一标识）"
              maxlength="50"
              show-word-limit
              :disabled="isEdit"
            />
            <div v-if="isEdit" class="form-tip">
              编辑模式下不允许修改商户编码
            </div>
          </ElFormItem>

          <ElFormItem label="商户名称" prop="merchantName">
            <ElInput
              v-model="formData.merchantName"
              placeholder="请输入商户名称"
              maxlength="100"
              show-word-limit
            />
          </ElFormItem>

          <ElFormItem label="商户类型" prop="merchantType">
            <ElRadioGroup v-model="formData.merchantType">
              <ElRadio :label="1">超级商户（平台）</ElRadio>
              <ElRadio :label="2">普通商户</ElRadio>
            </ElRadioGroup>
          </ElFormItem>

          <ElFormItem label="法人代表" prop="legalPerson">
            <ElInput
              v-model="formData.legalPerson"
              placeholder="请输入法人代表"
              maxlength="50"
            />
          </ElFormItem>

          <ElFormItem label="营业执照号" prop="businessLicense">
            <ElInput
              v-model="formData.businessLicense"
              placeholder="请输入营业执照号"
              maxlength="100"
            />
          </ElFormItem>

          <ElFormItem label="商户描述" prop="description">
            <ElInput
              v-model="formData.description"
              type="textarea"
              :rows="3"
              placeholder="请输入商户描述"
              maxlength="500"
              show-word-limit
            />
          </ElFormItem>
        </ElCollapseItem>

        <!-- 联系信息 -->
        <ElCollapseItem title="联系信息" name="contact">
          <ElFormItem label="联系人姓名" prop="contactName">
            <ElInput
              v-model="formData.contactName"
              placeholder="请输入联系人姓名"
              maxlength="50"
            />
          </ElFormItem>

          <ElFormItem label="联系电话" prop="contactPhone">
            <ElInput
              v-model="formData.contactPhone"
              placeholder="请输入联系电话"
              maxlength="20"
            />
          </ElFormItem>

          <ElFormItem label="联系邮箱" prop="contactEmail">
            <ElInput
              v-model="formData.contactEmail"
              placeholder="请输入联系邮箱"
              maxlength="100"
            />
          </ElFormItem>

          <ElFormItem label="商户地址" prop="address">
            <ElInput
              v-model="formData.address"
              placeholder="请输入商户地址"
              maxlength="255"
            />
          </ElFormItem>
        </ElCollapseItem>

        <!-- 经营信息 -->
        <ElCollapseItem title="经营信息" name="business">
          <ElFormItem label="经营范围" prop="businessScope">
            <ElInput
              v-model="formData.businessScope"
              type="textarea"
              :rows="2"
              placeholder="请输入经营范围"
              maxlength="500"
            />
          </ElFormItem>

          <ElFormItem label="结算账户" prop="settlementAccount">
            <ElInput
              v-model="formData.settlementAccount"
              placeholder="请输入结算账户"
              maxlength="100"
            />
          </ElFormItem>

          <ElFormItem label="结算银行" prop="settlementBank">
            <ElInput
              v-model="formData.settlementBank"
              placeholder="请输入结算银行"
              maxlength="100"
            />
          </ElFormItem>
        </ElCollapseItem>

        <!-- 配额设置 -->
        <ElCollapseItem title="配额设置" name="quota">
          <ElFormItem label="最大商品数量" prop="maxProducts">
            <ElInputNumber
              v-model="formData.maxProducts"
              :min="0"
              :max="999999"
              :step="100"
            />
          </ElFormItem>

          <ElFormItem label="最大管理员数量" prop="maxAdmins">
            <ElInputNumber
              v-model="formData.maxAdmins"
              :min="1"
              :max="1000"
              :step="1"
            />
          </ElFormItem>

          <ElFormItem label="最大存储空间(GB)" prop="maxStorageGB">
            <ElInputNumber
              v-model="maxStorageGB"
              :min="1"
              :max="1000"
              :step="1"
            />
            <div class="form-tip">
              1 GB = 1,073,741,824 字节
            </div>
          </ElFormItem>

          <ElFormItem label="平台抽成比例(%)" prop="commissionRate">
            <ElInputNumber
              v-model="formData.commissionRate"
              :min="0"
              :max="100"
              :step="0.1"
              :precision="2"
            />
          </ElFormItem>
        </ElCollapseItem>
      </ElCollapse>
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
import { ref, reactive, computed, watch, nextTick } from 'vue';
import {
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElRadioGroup,
  ElRadio,
  ElButton,
  ElMessage,
  ElCollapse,
  ElCollapseItem,
  type FormInstance,
  type FormRules
} from 'element-plus';
import type { Merchant, CreateMerchantParams, UpdateMerchantParams } from '#/api/system/merchant';
import { createMerchantApi, updateMerchantApi } from '#/api/system/merchant';

defineOptions({
  name: 'MerchantForm',
});

interface Props {
  visible: boolean;
  merchantData?: Merchant | null;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'success', data: Merchant): void;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  merchantData: null,
});

const emit = defineEmits<Emits>();

// 响应式数据
const formRef = ref<FormInstance>();
const loading = ref(false);
const activeCollapse = ref(['basic', 'contact', 'business', 'quota']);

// 表单数据
const formData = reactive<CreateMerchantParams & UpdateMerchantParams>({
  merchantCode: '',
  merchantName: '',
  merchantType: 2,
  legalPerson: '',
  businessLicense: '',
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  address: '',
  description: '',
  businessScope: '',
  settlementAccount: '',
  settlementBank: '',
  maxProducts: 1000,
  maxAdmins: 10,
  maxStorage: 10737418240, // 10GB
  commissionRate: 0,
});

// 存储空间GB格式
const maxStorageGB = computed({
  get: () => Math.round((formData.maxStorage || 10737418240) / 1073741824),
  set: (val) => {
    formData.maxStorage = val * 1073741824;
  },
});

// 表单验证规则
const formRules: FormRules = {
  merchantCode: [
    { required: true, message: '请输入商户编码', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  merchantName: [
    { required: true, message: '请输入商户名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' },
  ],
  contactEmail: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
  ],
  contactPhone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' },
  ],
};

// 计算属性
const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
});

const isEdit = computed(() => !!props.merchantData?.id);

// 监听商户数据变化
watch(
  () => props.merchantData,
  (newData) => {
    if (newData) {
      // 编辑模式，填充表单数据
      Object.assign(formData, {
        merchantCode: newData.merchantCode,
        merchantName: newData.merchantName,
        merchantType: newData.merchantType,
        legalPerson: newData.legalPerson || '',
        businessLicense: newData.businessLicense || '',
        contactName: newData.contactName || '',
        contactPhone: newData.contactPhone || '',
        contactEmail: newData.contactEmail || '',
        address: newData.address || '',
        description: newData.description || '',
        businessScope: newData.businessScope || '',
        settlementAccount: newData.settlementAccount || '',
        settlementBank: newData.settlementBank || '',
        maxProducts: newData.maxProducts,
        maxAdmins: newData.maxAdmins,
        maxStorage: newData.maxStorage,
        commissionRate: newData.commissionRate,
      });
    }
  },
  { immediate: true }
);

// 方法
const handleClose = () => {
  formRef.value?.resetFields();
  emit('update:visible', false);
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    const valid = await formRef.value.validate();
    if (!valid) return;

    loading.value = true;

    if (isEdit.value && props.merchantData?.id) {
      // 更新商户
      const { merchantCode, merchantType, ...updateData } = formData;
      const response = await updateMerchantApi(props.merchantData.id, updateData);
      ElMessage.success('商户更新成功');
      emit('success', response.data);
    } else {
      // 创建商户
      const response = await createMerchantApi(formData as CreateMerchantParams);
      ElMessage.success('商户创建成功');
      emit('success', response.data);
    }

    handleClose();
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败');
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.merchant-form {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 10px;

  :deep(.el-collapse) {
    border: none;

    .el-collapse-item__header {
      font-weight: 600;
      font-size: 14px;
      color: #303133;
      background-color: #f5f7fa;
      padding: 0 15px;
      border-radius: 4px;
      margin-bottom: 10px;
    }

    .el-collapse-item__content {
      padding: 10px 0;
    }
  }
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
