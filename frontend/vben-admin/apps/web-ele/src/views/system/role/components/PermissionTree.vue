<template>
  <div class="permission-tree">
    <div class="tree-header">
      <ElSpace>
        <ElButton size="small" @click="expandAll">
          <span class="mr-1">⬇</span>
          展开全部
        </ElButton>
        <ElButton size="small" @click="collapseAll">
          <span class="mr-1">⬆</span>
          收起全部
        </ElButton>
        <ElButton size="small" @click="checkAll">
          <span class="mr-1">☑</span>
          全选
        </ElButton>
        <ElButton size="small" @click="uncheckAll">
          <span class="mr-1">☐</span>
          取消全选
        </ElButton>
      </ElSpace>
    </div>
    
    <ElTree
      ref="treeRef"
      :data="treeData"
      :props="treeProps"
      show-checkbox
      node-key="id"
      :default-checked-keys="checkedKeys"
      :default-expanded-keys="expandedKeys"
      @check="handleCheck"
      class="permission-tree-content"
    >
      <template #default="{ node, data }">
        <div class="tree-node">
          <span class="node-icon">{{ getNodeIcon(data) }}</span>
          <span class="node-label">{{ node.label }}</span>
          <ElTag v-if="data.type" :type="getTagType(data.type)" size="small" class="node-tag">
            {{ getTypeLabel(data.type) }}
          </ElTag>
        </div>
      </template>
    </ElTree>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
// 暂时使用简单的文本图标，避免依赖问题
// import { Icon } from '@iconify/vue';
import {
  ElButton,
  ElSpace,
  ElTag,
  ElTree,
  type TreeInstance,
} from 'element-plus';

interface PermissionNode {
  id: number;
  name: string;
  code: string;
  type: 'menu' | 'button' | 'api';
  parentId?: number;
  children?: PermissionNode[];
}

interface Props {
  permissions: PermissionNode[];
  checkedPermissions?: number[];
}

interface Emits {
  (e: 'update:checkedPermissions', value: number[]): void;
  (e: 'change', checkedKeys: number[], checkedNodes: PermissionNode[]): void;
}

const props = withDefaults(defineProps<Props>(), {
  permissions: () => [],
  checkedPermissions: () => [],
});

const emit = defineEmits<Emits>();

const treeRef = ref<TreeInstance>();

const treeProps = {
  children: 'children',
  label: 'name',
};

// 树形数据 - 直接使用API返回的树形数据，不需要重新构建
const treeData = computed(() => {
  // 如果API返回的数据已经是树形结构，直接使用
  if (props.permissions.length > 0 && props.permissions[0].children) {
    return props.permissions;
  }
  // 如果是扁平数据，则构建树形结构
  return buildTree(props.permissions);
});

// 选中的节点
const checkedKeys = ref<number[]>([]);
const expandedKeys = ref<number[]>([]);

// 监听外部传入的选中权限
watch(
  () => props.checkedPermissions,
  (newVal) => {
    checkedKeys.value = [...newVal];
    nextTick(() => {
      treeRef.value?.setCheckedKeys(newVal);
    });
  },
  { immediate: true }
);

// 监听权限数据变化，自动展开第一层
watch(
  () => props.permissions,
  (newVal) => {
    if (newVal.length > 0) {
      expandedKeys.value = newVal
        .filter(item => !item.parentId)
        .map(item => item.id);
    }
  },
  { immediate: true }
);

/**
 * 构建树形结构
 */
function buildTree(permissions: PermissionNode[]): PermissionNode[] {
  const map = new Map<number, PermissionNode>();
  const roots: PermissionNode[] = [];

  // 创建映射
  permissions.forEach(item => {
    map.set(item.id, { ...item, children: [] });
  });

  // 构建树形结构
  permissions.forEach(item => {
    const node = map.get(item.id)!;
    if (item.parentId && map.has(item.parentId)) {
      const parent = map.get(item.parentId)!;
      if (!parent.children) parent.children = [];
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

/**
 * 获取节点图标
 */
function getNodeIcon(data: PermissionNode): string {
  switch (data.type) {
    case 'menu':
      return '📁';
    case 'button':
      return '🔘';
    case 'api':
      return '🔗';
    default:
      return '⚪';
  }
}

/**
 * 获取标签类型
 */
function getTagType(type: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' {
  switch (type) {
    case 'menu':
      return 'primary';
    case 'button':
      return 'success';
    case 'api':
      return 'warning';
    default:
      return 'info';
  }
}

/**
 * 获取类型标签
 */
function getTypeLabel(type: string): string {
  switch (type) {
    case 'menu':
      return '菜单';
    case 'button':
      return '按钮';
    case 'api':
      return '接口';
    default:
      return '未知';
  }
}

/**
 * 处理节点选中
 */
function handleCheck(data: PermissionNode, checked: any) {
  const checkedKeys = checked.checkedKeys as number[];
  const checkedNodes = checked.checkedNodes as PermissionNode[];
  
  emit('update:checkedPermissions', checkedKeys);
  emit('change', checkedKeys, checkedNodes);
}

/**
 * 展开全部
 */
function expandAll() {
  const allKeys = getAllNodeKeys(treeData.value);
  expandedKeys.value = allKeys;
  nextTick(() => {
    allKeys.forEach(key => {
      treeRef.value?.store.nodesMap[key]?.expand();
    });
  });
}

/**
 * 收起全部
 */
function collapseAll() {
  expandedKeys.value = [];
  nextTick(() => {
    const allKeys = getAllNodeKeys(treeData.value);
    allKeys.forEach(key => {
      treeRef.value?.store.nodesMap[key]?.collapse();
    });
  });
}

/**
 * 全选
 */
function checkAll() {
  const allKeys = getAllNodeKeys(treeData.value);
  checkedKeys.value = allKeys;
  nextTick(() => {
    treeRef.value?.setCheckedKeys(allKeys);
  });
  emit('update:checkedPermissions', allKeys);
}

/**
 * 取消全选
 */
function uncheckAll() {
  checkedKeys.value = [];
  nextTick(() => {
    treeRef.value?.setCheckedKeys([]);
  });
  emit('update:checkedPermissions', []);
}

/**
 * 获取所有节点的key
 */
function getAllNodeKeys(nodes: PermissionNode[]): number[] {
  const keys: number[] = [];
  
  function traverse(nodeList: PermissionNode[]) {
    nodeList.forEach(node => {
      keys.push(node.id);
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    });
  }
  
  traverse(nodes);
  return keys;
}

/**
 * 获取选中的权限ID
 */
function getCheckedKeys(): number[] {
  return treeRef.value?.getCheckedKeys() as number[] || [];
}

/**
 * 获取选中的权限节点
 */
function getCheckedNodes(): PermissionNode[] {
  return treeRef.value?.getCheckedNodes() as PermissionNode[] || [];
}

// 暴露方法给父组件
defineExpose({
  getCheckedKeys,
  getCheckedNodes,
  expandAll,
  collapseAll,
  checkAll,
  uncheckAll,
});
</script>

<style scoped lang="scss">
.permission-tree {
  .tree-header {
    padding: 12px 0;
    border-bottom: 1px solid #e5e7eb;
    margin-bottom: 12px;
  }

  .permission-tree-content {
    max-height: 400px;
    overflow-y: auto;

    .tree-node {
      display: flex;
      align-items: center;
      gap: 6px;
      flex: 1;

      .node-icon {
        font-size: 14px;
        color: #6b7280;
      }

      .node-label {
        flex: 1;
        font-size: 14px;
      }

      .node-tag {
        margin-left: auto;
      }
    }
  }
}

.mr-1 {
  margin-right: 4px;
}
</style>