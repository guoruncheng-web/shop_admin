<template>
  <ElDialog
    v-model="dialogVisible"
    title="🔑 商户超级管理员凭证"
    width="600px"
    :close-on-click-modal="false"
  >
    <ElAlert
      title="重要提示"
      type="warning"
      :closable="false"
      show-icon
      style="margin-bottom: 20px;"
    >
      <p>此密码仅在创建时显示一次，请务必妥善保存！</p>
      <p>数据库中存储的是加密后的密码，无法再次获取明文密码。</p>
    </ElAlert>

    <div class="credentials-container">
      <div class="merchant-info">
        <h3>商户信息</h3>
        <div class="info-item">
          <span class="label">商户名称：</span>
          <span class="value">{{ merchantData?.merchantName }}</span>
        </div>
        <div class="info-item">
          <span class="label">商户编码：</span>
          <span class="value">{{ merchantData?.merchantCode }}</span>
        </div>
        <div class="info-item">
          <span class="label">商户ID：</span>
          <span class="value">{{ merchantData?.id }}</span>
        </div>
      </div>

      <ElDivider />

      <div class="admin-credentials">
        <h3>超级管理员账号</h3>

        <div class="credential-item">
          <div class="credential-label">
            👤 用户名
          </div>
          <div class="credential-value">
            <ElInput
              :model-value="merchantData?.superAdmin?.username"
              readonly
            >
              <template #append>
                <ElButton @click="copyToClipboard(merchantData?.superAdmin?.username || '', '用户名')">
                  复制
                </ElButton>
              </template>
            </ElInput>
          </div>
        </div>

        <div class="credential-item">
          <div class="credential-label">
            <Lock style="margin-right: 5px;" />
            密码
          </div>
          <div class="credential-value">
            <ElInput
              :model-value="merchantData?.superAdmin?.password"
              :type="showPassword ? 'text' : 'password'"
              readonly
            >
              <template #append>
                <ElButton @click="showPassword = !showPassword" style="margin-right: 5px;">
                  {{ showPassword ? '隐藏' : '显示' }}
                </ElButton>
                <ElButton @click="copyToClipboard(merchantData?.superAdmin?.password || '', '密码')">
                  复制
                </ElButton>
              </template>
            </ElInput>
          </div>
        </div>

        <div class="credential-item">
          <div class="credential-label">
            <Message style="margin-right: 5px;" />
            邮箱
          </div>
          <div class="credential-value">
            <ElInput
              :model-value="merchantData?.superAdmin?.email"
              readonly
            >
              <template #append>
                <ElButton @click="copyToClipboard(merchantData?.superAdmin?.email || '', '邮箱')">
                  复制
                </ElButton>
              </template>
            </ElInput>
          </div>
        </div>
      </div>

      <ElDivider />

      <div class="tips">
        <h4>使用说明</h4>
        <ul>
          <li>使用上述用户名和密码可以登录商户管理后台</li>
          <li>超级管理员拥有该商户的所有管理权限</li>
          <li>超级管理员可以创建其他管理员账号</li>
          <li>建议登录后立即修改密码</li>
        </ul>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <ElButton type="primary" @click="handleClose">
          我已保存
        </ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  ElDialog,
  ElAlert,
  ElDivider,
  ElInput,
  ElButton,
  ElMessage,
} from 'element-plus';
import type { Merchant } from '#/api/system/merchant';

defineOptions({
  name: 'AdminCredentialsDialog',
});

interface Props {
  visible: boolean;
  merchantData?: Merchant | null;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  merchantData: null,
});

const emit = defineEmits<Emits>();

// 响应式数据
const showPassword = ref(false);

// 计算属性
const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
});

// 方法
const handleClose = () => {
  showPassword.value = false;
  emit('update:visible', false);
};

const copyToClipboard = async (text: string, label: string) => {
  try {
    await navigator.clipboard.writeText(text);
    ElMessage.success(`${label}已复制到剪贴板`);
  } catch (error) {
    // 如果 clipboard API 不可用，使用备用方法
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      ElMessage.success(`${label}已复制到剪贴板`);
    } catch (err) {
      ElMessage.error('复制失败，请手动复制');
    }
    document.body.removeChild(textarea);
  }
};
</script>

<style lang="scss" scoped>
.credentials-container {
  .merchant-info,
  .admin-credentials {
    margin-bottom: 20px;

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
    }
  }

  .info-item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    font-size: 14px;

    .label {
      color: #909399;
      min-width: 90px;
    }

    .value {
      color: #303133;
      font-weight: 500;
    }
  }

  .credential-item {
    margin-bottom: 20px;

    .credential-label {
      font-size: 14px;
      color: #606266;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      font-weight: 500;
    }

    .credential-value {
      :deep(.el-input-group__append) {
        padding: 0;

        .el-button {
          border-radius: 0;
          border-left: 1px solid var(--el-input-border-color, var(--el-border-color));
        }
      }
    }
  }

  .tips {
    background-color: #f5f7fa;
    padding: 15px;
    border-radius: 4px;

    h4 {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 10px;
    }

    ul {
      margin: 0;
      padding-left: 20px;

      li {
        color: #606266;
        font-size: 13px;
        line-height: 1.8;
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: center;
}
</style>
