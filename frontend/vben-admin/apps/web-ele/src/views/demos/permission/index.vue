<template>
  <div class="permission-demo">
    <VbenCard title="权限指令演示" class="mb-4">
      <div class="space-y-4">
        <!-- 基础权限检查 -->
        <div>
          <h3 class="text-lg font-semibold mb-2">基础权限检查</h3>
          <div class="space-x-2">
            <el-button v-permission="'btn:add'" type="primary">
              添加按钮 (需要 btn:add 权限)
            </el-button>
            <el-button v-permission="'btn:edit'" type="success">
              编辑按钮 (需要 btn:edit 权限)
            </el-button>
            <el-button v-permission="'btn:delete'" type="danger">
              删除按钮 (需要 btn:delete 权限)
            </el-button>
            <el-button v-permission="'btn:export'" type="warning">
              导出按钮 (需要 btn:export 权限)
            </el-button>
          </div>
        </div>

        <!-- 权限码检查 -->
        <div>
          <h3 class="text-lg font-semibold mb-2">权限码检查</h3>
          <div class="space-x-2">
            <el-button v-permission:code="'system:user:add'" type="primary">
              用户添加 (需要 system:user:add 权限码)
            </el-button>
            <el-button v-permission:code="'system:user:edit'" type="success">
              用户编辑 (需要 system:user:edit 权限码)
            </el-button>
            <el-button v-permission:code="'system:user:delete'" type="danger">
              用户删除 (需要 system:user:delete 权限码)
            </el-button>
          </div>
        </div>

        <!-- 按钮权限检查 -->
        <div>
          <h3 class="text-lg font-semibold mb-2">按钮权限检查</h3>
          <div class="space-x-2">
            <el-button v-permission:button="'add'" type="primary">
              添加 (需要 add 按钮权限)
            </el-button>
            <el-button v-permission:button="'edit'" type="success">
              编辑 (需要 edit 按钮权限)
            </el-button>
            <el-button v-permission:button="'delete'" type="danger">
              删除 (需要 delete 按钮权限)
            </el-button>
          </div>
        </div>

        <!-- 多权限检查 -->
        <div>
          <h3 class="text-lg font-semibold mb-2">多权限检查 (任一权限满足即显示)</h3>
          <div class="space-x-2">
            <el-button v-permission="['btn:add', 'btn:edit']" type="primary">
              添加或编辑 (需要 btn:add 或 btn:edit 权限)
            </el-button>
            <el-button v-permission="['system:admin', 'system:manager']" type="success">
              管理员功能 (需要管理员或经理权限)
            </el-button>
          </div>
        </div>

        <!-- 其他元素权限控制 */
        <div>
          <h3 class="text-lg font-semibold mb-2">其他元素权限控制</h3>
          <div class="space-y-2">
            <div v-permission="'btn:view_sensitive'" class="p-4 bg-red-50 border border-red-200 rounded">
              敏感信息区域 (需要 btn:view_sensitive 权限)
            </div>
            <el-alert v-permission="'btn:system_alert'" 
                     title="系统通知" 
                     description="这是一个需要特殊权限才能看到的通知"
                     type="info" />
          </div>
        </div>
      </div>
    </VbenCard>

    <!-- 权限状态显示 -->
    <VbenCard title="当前权限状态" class="mb-4">
      <div class="space-y-4">
        <div>
          <h4 class="font-semibold mb-2">当前用户权限码:</h4>
          <div class="flex flex-wrap gap-2">
            <el-tag 
              v-for="code in userCodes" 
              :key="code" 
              type="info" 
              size="small">
              {{ code }}
            </el-tag>
            <el-tag v-if="!userCodes?.length" type="warning" size="small">
              暂无权限码
            </el-tag>
          </div>
        </div>

        <div>
          <h4 class="font-semibold mb-2">当前按钮权限:</h4>
          <div class="flex flex-wrap gap-2">
            <el-tag 
              v-for="button in buttonPermissions" 
              :key="button" 
              type="success" 
              size="small">
              {{ button }}
            </el-tag>
            <el-tag v-if="!buttonPermissions?.length" type="warning" size="small">
              暂无按钮权限
            </el-tag>
          </div>
        </div>
      </div>
    </VbenCard>

    <!-- 使用方法说明 -->
    <VbenCard title="使用方法">
      <div class="space-y-4">
        <div>
          <h4 class="font-semibold mb-2">基础用法:</h4>
          <pre class="bg-gray-100 p-4 rounded text-sm overflow-x-auto"><code>&lt;!-- 单个权限检查 --&gt;
&lt;el-button v-permission="'btn:add'"&gt;添加&lt;/el-button&gt;

&lt;!-- 多个权限检查 (任一满足即显示) --&gt;
&lt;el-button v-permission="['btn:add', 'btn:edit']"&gt;添加或编辑&lt;/el-button&gt;

&lt;!-- 权限码检查 --&gt;
&lt;el-button v-permission:code="'system:user:add'"&gt;用户添加&lt;/el-button&gt;

&lt;!-- 按钮权限检查 --&gt;
&lt;el-button v-permission:button="'add'"&gt;添加&lt;/el-button&gt;</code></pre>
        </div>

        <div>
          <h4 class="font-semibold mb-2">在组合式API中使用:</h4>
          <pre class="bg-gray-100 p-4 rounded text-sm overflow-x-auto"><code>import { usePermission } from '@/directives/permission';

const { hasPermission, checkButtonPermission, checkCodePermission } = usePermission();

// 检查权限
const canAdd = hasPermission('btn:add');
const canEdit = checkButtonPermission('edit');
const canDelete = checkCodePermission('system:user:delete');</code></pre>
        </div>
      </div>
    </VbenCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAccessStore, useUserStore } from '@vben/stores';
import { VbenCard } from '@vben/common-ui';
import { usePermission } from '../directives/permission';

defineOptions({
  name: 'PermissionDemo',
});

const accessStore = useAccessStore();
const userStore = useUserStore();
const { hasPermission, checkButtonPermission, checkCodePermission } = usePermission();

// 获取当前用户的权限码
const userCodes = computed(() => accessStore.accessCodes || []);

// 从用户菜单中提取按钮权限
const buttonPermissions = computed(() => {
  const menus = userStore.userInfo?.menus || [];
  const permissions: string[] = [];
  
  function extractButtons(menuList: any[]) {
    for (const menu of menuList) {
      if (menu.type === 3 && menu.status) {
        const buttonPermission = menu.buttonKey || menu.permission || menu.code;
        if (buttonPermission) {
          permissions.push(buttonPermission);
        }
      }
      if (menu.children && Array.isArray(menu.children)) {
        extractButtons(menu.children);
      }
    }
  }
  
  extractButtons(menus);
  return permissions;
});

// 测试权限检查功能
console.log('权限测试:', {
  hasAddPermission: hasPermission('btn:add'),
  hasEditPermission: hasPermission('btn:edit'), 
  hasDeletePermission: hasPermission('btn:delete'),
  buttonAddPermission: checkButtonPermission('add'),
  codePermission: checkCodePermission('system:user:add'),
});
</script>

<style scoped>
.permission-demo {
  padding: 16px;
}
</style>