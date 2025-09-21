<template>
  <Page title="角色管理测试" description="测试角色管理功能的各个组件">
    <div class="test-container">
      <!-- 测试按钮区域 -->
      <ElCard class="test-card">
        <template #header>
          <span>功能测试</span>
        </template>
        
        <ElSpace wrap>
          <ElButton type="primary" @click="testRoleList">
            测试角色列表
          </ElButton>
          <ElButton type="success" @click="testPermissionTree">
            测试权限树
          </ElButton>
          <ElButton type="info" @click="testPermissionDialog">
            测试权限分配弹窗
          </ElButton>
          <ElButton type="warning" @click="testCreateRole">
            测试创建角色
          </ElButton>
        </ElSpace>
      </ElCard>

      <!-- 测试结果显示区域 -->
      <ElCard class="test-card">
        <template #header>
          <span>测试结果</span>
        </template>
        
        <div class="test-results">
          <div v-for="(result, index) in testResults" :key="index" class="test-result-item">
            <ElTag :type="result.success ? 'success' : 'danger'" class="result-tag">
              {{ result.success ? '✅' : '❌' }}
            </ElTag>
            <span class="result-text">{{ result.message }}</span>
            <span class="result-time">{{ result.time }}</span>
          </div>
        </div>
      </ElCard>

      <!-- 权限树测试区域 -->
      <ElCard v-if="showPermissionTree" class="test-card">
        <template #header>
          <div class="card-header">
            <span>权限树测试</span>
            <ElButton size="small" @click="showPermissionTree = false">关闭</ElButton>
          </div>
        </template>
        
        <PermissionTree
          :permissions="mockPermissions"
          :checked-permissions="checkedPermissions"
          @change="handlePermissionChange"
        />
      </ElCard>

      <!-- 权限分配弹窗 -->
      <RolePermissionDialog
        :visible="permissionDialogVisible"
        :role-id="testRoleId"
        :role-name="testRoleName"
        @update:visible="permissionDialogVisible = $event"
        @success="handlePermissionSuccess"
      />
    </div>
  </Page>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { Page } from '@vben/common-ui';
import {
  ElButton,
  ElCard,
  ElMessage,
  ElSpace,
  ElTag,
} from 'element-plus';
import PermissionTree from './components/PermissionTree.vue';
import RolePermissionDialog from './components/RolePermissionDialog.vue';
import {
  getRoleListApi,
  createRoleApi,
  type CreateRoleParams,
} from '#/api/system/role';

defineOptions({ name: 'RoleTest' });

// 测试结果
interface TestResult {
  success: boolean;
  message: string;
  time: string;
}

const testResults = ref<TestResult[]>([]);

// 权限树测试
const showPermissionTree = ref(false);
const checkedPermissions = ref<number[]>([1, 11, 111]);

// 权限分配弹窗测试
const permissionDialogVisible = ref(false);
const testRoleId = ref(1);
const testRoleName = ref('测试角色');

// 模拟权限数据
const mockPermissions = [
  {
    id: 1,
    name: '系统管理',
    code: 'system',
    type: 'menu' as const,
    children: [
      {
        id: 11,
        name: '用户管理',
        code: 'system:user',
        type: 'menu' as const,
        parentId: 1,
        children: [
          { id: 111, name: '查看用户', code: 'system:user:view', type: 'button' as const, parentId: 11 },
          { id: 112, name: '新增用户', code: 'system:user:add', type: 'button' as const, parentId: 11 },
          { id: 113, name: '编辑用户', code: 'system:user:edit', type: 'button' as const, parentId: 11 },
        ]
      },
      {
        id: 12,
        name: '角色管理',
        code: 'system:role',
        type: 'menu' as const,
        parentId: 1,
        children: [
          { id: 121, name: '查看角色', code: 'system:role:view', type: 'button' as const, parentId: 12 },
          { id: 122, name: '新增角色', code: 'system:role:add', type: 'button' as const, parentId: 12 },
        ]
      }
    ]
  },
  {
    id: 2,
    name: '商品管理',
    code: 'product',
    type: 'menu' as const,
    children: [
      {
        id: 21,
        name: '商品列表',
        code: 'product:list',
        type: 'menu' as const,
        parentId: 2,
        children: [
          { id: 211, name: '查看商品', code: 'product:view', type: 'button' as const, parentId: 21 },
          { id: 212, name: '新增商品', code: 'product:add', type: 'button' as const, parentId: 21 },
        ]
      }
    ]
  }
];

/**
 * 添加测试结果
 */
function addTestResult(success: boolean, message: string) {
  testResults.value.unshift({
    success,
    message,
    time: new Date().toLocaleTimeString(),
  });
  
  // 只保留最近10条结果
  if (testResults.value.length > 10) {
    testResults.value = testResults.value.slice(0, 10);
  }
}

/**
 * 测试角色列表
 */
async function testRoleList() {
  try {
    const data = await getRoleListApi({ page: 1, pageSize: 10 });
    addTestResult(true, `角色列表获取成功，共 ${data.total} 条数据`);
    ElMessage.success('角色列表测试通过');
  } catch (error: any) {
    addTestResult(false, `角色列表获取失败：${error.message}`);
    ElMessage.error('角色列表测试失败');
  }
}

/**
 * 测试权限树
 */
function testPermissionTree() {
  showPermissionTree.value = true;
  addTestResult(true, '权限树组件显示成功');
  ElMessage.success('权限树测试启动');
}

/**
 * 测试权限分配弹窗
 */
function testPermissionDialog() {
  permissionDialogVisible.value = true;
  addTestResult(true, '权限分配弹窗打开成功');
  ElMessage.success('权限分配弹窗测试启动');
}

/**
 * 测试创建角色
 */
async function testCreateRole() {
  const testRole: CreateRoleParams = {
    name: `测试角色_${Date.now()}`,
    code: `test_role_${Date.now()}`,
    description: '这是一个测试角色',
    status: 1,
  };

  try {
    const result = await createRoleApi(testRole);
    addTestResult(true, `角色创建成功：${result.name} (ID: ${result.id})`);
    ElMessage.success('角色创建测试通过');
  } catch (error: any) {
    addTestResult(false, `角色创建失败：${error.message}`);
    ElMessage.error('角色创建测试失败');
  }
}

/**
 * 权限选择变化
 */
function handlePermissionChange(checkedKeys: number[], checkedNodes: any[]) {
  checkedPermissions.value = checkedKeys;
  addTestResult(true, `权限选择变化：选中 ${checkedKeys.length} 个权限`);
}

/**
 * 权限分配成功
 */
function handlePermissionSuccess() {
  addTestResult(true, '权限分配操作成功');
  ElMessage.success('权限分配测试通过');
}
</script>

<style scoped lang="scss">
.test-container {
  .test-card {
    margin-bottom: 16px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .test-results {
    max-height: 300px;
    overflow-y: auto;

    .test-result-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .result-tag {
        flex-shrink: 0;
      }

      .result-text {
        flex: 1;
        font-size: 14px;
      }

      .result-time {
        flex-shrink: 0;
        font-size: 12px;
        color: #999;
      }
    }
  }
}
</style>