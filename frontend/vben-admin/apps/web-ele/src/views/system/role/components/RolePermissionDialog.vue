<template>
  <ElDialog
    :model-value="visible"
    :title="`分配权限 - ${roleName}`"
    width="800px"
    destroy-on-close
    @update:model-value="handleClose"
    @close="handleClose"
  >
    <div class="permission-dialog-content">
      <ElAlert
        title="权限说明"
        type="info"
        :closable="false"
        show-icon
        class="mb-4"
      >
        <template #default>
          <div class="permission-tips">
            <p>• <strong>菜单权限</strong>：控制用户可以访问的页面菜单</p>
            <p>• <strong>按钮权限</strong>：控制页面内的操作按钮显示</p>
            <p>• <strong>接口权限</strong>：控制后端API接口的访问权限</p>
          </div>
        </template>
      </ElAlert>

      <ElCard class="permission-card">
        <template #header>
          <div class="card-header">
            <span>权限列表</span>
            <ElSpace>
              <ElTag type="primary" size="small">
                已选择: {{ selectedCount }} 项
              </ElTag>
              <ElButton size="small" @click="refreshPermissions">
                <span class="mr-1">🔄</span>
                刷新
              </ElButton>
            </ElSpace>
          </div>
        </template>

        <div v-loading="loading" class="permission-content">
          <PermissionTree
            ref="permissionTreeRef"
            :permissions="permissions"
            :checked-permissions="checkedPermissions"
            @change="handlePermissionChange"
          />
        </div>
      </ElCard>
    </div>

    <template #footer>
      <ElSpace>
        <ElButton @click="handleClose">取消</ElButton>
        <ElButton type="primary" :loading="submitLoading" @click="handleSubmit">
          保存权限
        </ElButton>
      </ElSpace>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
// 暂时使用简单的文本图标，避免依赖问题
// import { Icon } from '@iconify/vue';
import {
  ElAlert,
  ElButton,
  ElCard,
  ElDialog,
  ElMessage,
  ElSpace,
  ElTag,
} from 'element-plus';
import PermissionTree from './PermissionTree.vue';

// 使用新的菜单权限节点类型
interface MenuPermissionNode {
  id: number;
  label: string;
  value: number;
  key: string;
  title: string;
  type: number;
  icon?: string;
  disabled?: boolean;
  children?: MenuPermissionNode[];
}

// 兼容旧版本Permission类型
interface Permission {
  id: number;
  name: string;
  code: string;
  type: 'menu' | 'button' | 'api';
  parentId?: number;
  children?: Permission[];
}

interface Props {
  visible: boolean;
  roleId?: number;
  roleName?: string;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'success'): void;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  roleId: undefined,
  roleName: '',
});

const emit = defineEmits<Emits>();

const permissionTreeRef = ref();
const loading = ref(false);
const submitLoading = ref(false);

// 权限数据
const permissions = ref<MenuPermissionNode[]>([]);
const checkedPermissions = ref<number[]>([]);

// 选中数量
const selectedCount = computed(() => checkedPermissions.value.length);

// 监听弹窗显示状态
watch(
  () => props.visible,
  (newVal) => {
    if (newVal && props.roleId) {
      fetchPermissions();
      fetchRolePermissions();
    }
  }
);

/**
 * 获取所有权限列表
 */
async function fetchPermissions() {
  try {
    loading.value = true;

    // 调用新的菜单权限树API
    const { getMenuPermissionTreeApi } = await import('#/api/system/permission');
    const data = await getMenuPermissionTreeApi();

    console.log('获取到的菜单权限数据:', data);
    permissions.value = data;
    
  } catch (error: any) {
    console.error('获取权限列表失败:', error);
    ElMessage.error(error.message || '获取权限列表失败');

    // 不使用模拟数据，直接显示错误
    permissions.value = [];
  } finally {
    loading.value = false;
  }
}

/**
 * 获取角色已有权限
 */
async function fetchRolePermissions() {
  if (!props.roleId) return;

  try {
    // 调用新的角色菜单权限API
    const { getRoleSelectedMenuIdsApi } = await import('#/api/system/permission');
    const roleMenuIds = await getRoleSelectedMenuIdsApi(props.roleId);
    checkedPermissions.value = roleMenuIds;
    
  } catch (error: any) {
    console.error('获取角色权限失败:', error);
    ElMessage.error(error.message || '获取角色权限失败');

    // 不使用模拟数据，直接显示错误
    checkedPermissions.value = [];
  }
}

/**
 * 权限选择变化
 */
function handlePermissionChange(checkedKeys: number[], checkedNodes: MenuPermissionNode[]) {
  checkedPermissions.value = checkedKeys;
}

/**
 * 刷新权限列表
 */
function refreshPermissions() {
  fetchPermissions();
}

/**
 * 提交权限分配
 */
async function handleSubmit() {
  if (!props.roleId) return;

  try {
    submitLoading.value = true;

    const selectedMenuIds = permissionTreeRef.value?.getCheckedKeys() || [];

    console.log('分配菜单权限:', {
      roleId: props.roleId,
      menuIds: selectedMenuIds,
    });

    // 调用新的保存角色菜单权限API
    const { saveRoleMenuPermissionsApi } = await import('#/api/system/permission');
    await saveRoleMenuPermissionsApi(props.roleId, selectedMenuIds);

    ElMessage.success('菜单权限分配成功');
    emit('success');
    handleClose();
    
  } catch (error: any) {
    console.error('分配权限失败:', error);
    ElMessage.error(error.message || '分配权限失败');
  } finally {
    submitLoading.value = false;
  }
}

/**
 * 关闭弹窗
 */
function handleClose() {
  emit('update:visible', false);
}
</script>

<style scoped lang="scss">
.permission-dialog-content {
  .permission-tips {
    p {
      margin: 4px 0;
      font-size: 13px;
      line-height: 1.5;
    }
  }

  .permission-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .permission-content {
      min-height: 300px;
    }
  }
}

.mb-4 {
  margin-bottom: 16px;
}

.mr-1 {
  margin-right: 4px;
}
</style>