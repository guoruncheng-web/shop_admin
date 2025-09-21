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
const permissions = ref<Permission[]>([]);
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
    
    // 调用真实API获取权限树形数据
    const { getPermissionTreeApi } = await import('#/api/system/permission');
    const data = await getPermissionTreeApi();
    
    console.log('获取到的权限数据:', data);
    permissions.value = data;
    
  } catch (error: any) {
    console.error('获取权限列表失败:', error);
    ElMessage.error(error.message || '获取权限列表失败');
    
    // 如果API调用失败，使用模拟数据作为降级方案
    const mockPermissions: Permission[] = [
      {
        id: 1,
        name: '系统管理',
        code: 'system',
        type: 'menu',
        children: [
          {
            id: 11,
            name: '用户管理',
            code: 'system:user',
            type: 'menu',
            parentId: 1,
            children: [
              { id: 111, name: '查看用户', code: 'system:user:view', type: 'button', parentId: 11 },
              { id: 112, name: '新增用户', code: 'system:user:add', type: 'button', parentId: 11 },
              { id: 113, name: '编辑用户', code: 'system:user:edit', type: 'button', parentId: 11 },
              { id: 114, name: '删除用户', code: 'system:user:delete', type: 'button', parentId: 11 },
            ]
          },
          {
            id: 12,
            name: '角色管理',
            code: 'system:role',
            type: 'menu',
            parentId: 1,
            children: [
              { id: 121, name: '查看角色', code: 'system:role:view', type: 'button', parentId: 12 },
              { id: 122, name: '新增角色', code: 'system:role:add', type: 'button', parentId: 12 },
              { id: 123, name: '编辑角色', code: 'system:role:edit', type: 'button', parentId: 12 },
              { id: 124, name: '删除角色', code: 'system:role:delete', type: 'button', parentId: 12 },
              { id: 125, name: '分配权限', code: 'system:role:permission', type: 'button', parentId: 12 },
            ]
          }
        ]
      },
      {
        id: 2,
        name: '商品管理',
        code: 'product',
        type: 'menu',
        children: [
          {
            id: 21,
            name: '商品列表',
            code: 'product:list',
            type: 'menu',
            parentId: 2,
            children: [
              { id: 211, name: '查看商品', code: 'product:view', type: 'button', parentId: 21 },
              { id: 212, name: '新增商品', code: 'product:add', type: 'button', parentId: 21 },
              { id: 213, name: '编辑商品', code: 'product:edit', type: 'button', parentId: 21 },
              { id: 214, name: '删除商品', code: 'product:delete', type: 'button', parentId: 21 },
            ]
          }
        ]
      }
    ];
    permissions.value = mockPermissions;
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
    // 调用真实API获取角色权限
    const { getRolePermissionsApi } = await import('#/api/system/permission');
    const rolePermissions = await getRolePermissionsApi(props.roleId);
    checkedPermissions.value = rolePermissions.map(p => p.id);
    
  } catch (error: any) {
    console.error('获取角色权限失败:', error);
    ElMessage.error(error.message || '获取角色权限失败');
    
    // 如果API调用失败，使用模拟数据作为降级方案
    const mockRolePermissions = [1, 11, 111, 112, 113, 12, 121, 122, 123];
    checkedPermissions.value = mockRolePermissions;
  }
}

/**
 * 权限选择变化
 */
function handlePermissionChange(checkedKeys: number[], checkedNodes: Permission[]) {
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
    
    const selectedPermissions = permissionTreeRef.value?.getCheckedKeys() || [];
    
    console.log('分配权限:', {
      roleId: props.roleId,
      permissionIds: selectedPermissions,
    });
    
    // 调用真实API分配权限
    const { assignRolePermissionsApi } = await import('#/api/system/permission');
    await assignRolePermissionsApi(props.roleId, selectedPermissions);
    
    ElMessage.success('权限分配成功');
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