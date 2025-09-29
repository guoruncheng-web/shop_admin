<template>
  <div class="permission-tree">
    <div class="tree-actions">
      <ElButton @click="expandAll" size="small" type="primary">展开全部</ElButton>
      <ElButton @click="collapseAll" size="small">收起全部</ElButton>
      <ElButton @click="checkAll" size="small" type="success">全选</ElButton>
      <ElButton @click="uncheckAll" size="small" type="warning">取消全选</ElButton>
    </div>
    
    <ElTree
      ref="treeRef"
      :data="treeData"
      :props="treeProps"
      :default-expanded-keys="expandedKeys"
      :default-checked-keys="checkedKeys"
      :check-strictly="checkStrictly"
      show-checkbox
      node-key="id"
      @check="handleCheck"
    >
      <template #default="{ data }">
        <div class="tree-node">
          <span class="node-label">{{ getNodeLabel(data) }}</span>
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
import { ElTree, ElButton, ElTag } from 'element-plus';

// 原有权限节点接口
interface PermissionNode {
  id: string | number;
  name: string;
  code: string;
  type: string;
  parentId?: string | number;
  children?: PermissionNode[];
}

// 新菜单权限节点接口
interface MenuPermissionNode {
  id: string | number;
  label: string;
  value: string;
  key: string;
  title: string;
  type: number;
  icon?: string;
  disabled?: boolean;
  children?: MenuPermissionNode[];
}

// 统一权限节点类型
type UnifiedPermissionNode = PermissionNode | MenuPermissionNode;

// Props 定义
interface Props {
  permissions: UnifiedPermissionNode[];
  checkedPermissions?: (string | number)[];
  checkStrictly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  permissions: () => [],
  checkedPermissions: () => [],
  checkStrictly: false,
});

// Emits 定义
const emit = defineEmits<{
  change: [checkedKeys: (string | number)[], checkedNodes: UnifiedPermissionNode[]];
}>();

// 响应式数据
const treeRef = ref<InstanceType<typeof ElTree>>();
const expandedKeys = ref<(string | number)[]>([]);
const checkedKeys = ref<(string | number)[]>([]);

// 计算属性
const treeData = computed(() => {
  if (props.permissions.length === 0) return [];
  
  // 检查是否已经是树形结构
  if (props.permissions.length > 0 && props.permissions[0].children) {
    return props.permissions;
  }
  
  // 如果是扁平结构，转换为树形结构
  return buildTree(props.permissions as PermissionNode[]);
});

// 动态适配不同数据格式的属性映射
const treeProps = computed(() => {
  return {
    children: 'children',
    label: 'label', // 我们使用自定义的 getNodeLabel 函数，这里固定为 label
  };
});

// 工具函数
const getNodeLabel = (node: UnifiedPermissionNode): string => {
  if ('label' in node) {
    return node.label;
  }
  return (node as PermissionNode).name || '';
};

const getNodeIcon = (node: UnifiedPermissionNode): string => {
  if ('icon' in node && node.icon) {
    return node.icon;
  }
  
  // 根据类型返回默认图标
  const type = 'type' in node ? node.type : '';
  if (typeof type === 'number') {
    switch (type) {
      case 1: return '📁'; // 目录
      case 2: return '📄'; // 菜单
      case 3: return '🔘'; // 按钮
      default: return '📋';
    }
  } else {
    switch (type) {
      case 'menu': return '📄';
      case 'button': return '🔘';
      case 'directory': return '📁';
      default: return '📋';
    }
  }
};

const getTagType = (type: string | number): string => {
  if (typeof type === 'number') {
    switch (type) {
      case 1: return 'info';    // 目录
      case 2: return 'success'; // 菜单
      case 3: return 'warning'; // 按钮
      default: return 'info';
    }
  } else {
    switch (type) {
      case 'menu': return 'success';
      case 'button': return 'warning';
      case 'directory': return 'info';
      default: return 'info';
    }
  }
};

const getTypeLabel = (type: string | number): string => {
  if (typeof type === 'number') {
    switch (type) {
      case 1: return '目录';
      case 2: return '菜单';
      case 3: return '按钮';
      default: return '未知';
    }
  } else {
    switch (type) {
      case 'menu': return '菜单';
      case 'button': return '按钮';
      case 'directory': return '目录';
      default: return type;
    }
  }
};

// 构建树形结构
const buildTree = (flatData: PermissionNode[]): PermissionNode[] => {
  const map = new Map<string | number, PermissionNode>();
  const roots: PermissionNode[] = [];

  // 创建映射
  flatData.forEach(item => {
    map.set(item.id, { ...item, children: [] });
  });

  // 构建树形结构
  flatData.forEach(item => {
    const node = map.get(item.id);
    if (node) {
      if (item.parentId && map.has(item.parentId)) {
        const parent = map.get(item.parentId);
        if (parent && parent.children) {
          parent.children.push(node);
        }
      } else {
        roots.push(node);
      }
    }
  });

  return roots;
};

// 事件处理
const handleCheck = (data: UnifiedPermissionNode, checked: any) => {
  const checkedNodes = treeRef.value?.getCheckedNodes() || [];
  const checkedKeys = treeRef.value?.getCheckedKeys() || [];
  emit('change', checkedKeys as (string | number)[], checkedNodes);
};

// 树操作方法
const expandAll = () => {
  const allKeys: (string | number)[] = [];
  const collectKeys = (nodes: UnifiedPermissionNode[]) => {
    nodes.forEach(node => {
      allKeys.push(node.id);
      if (node.children && node.children.length > 0) {
        collectKeys(node.children);
      }
    });
  };
  collectKeys(treeData.value);
  expandedKeys.value = allKeys;
  
  nextTick(() => {
    allKeys.forEach(key => {
      treeRef.value?.store.nodesMap[key]?.expand();
    });
  });
};

const collapseAll = () => {
  expandedKeys.value = [];
  nextTick(() => {
    const allKeys: (string | number)[] = [];
    const collectKeys = (nodes: UnifiedPermissionNode[]) => {
      nodes.forEach(node => {
        allKeys.push(node.id);
        if (node.children && node.children.length > 0) {
          collectKeys(node.children);
        }
      });
    };
    collectKeys(treeData.value);
    
    allKeys.forEach(key => {
      treeRef.value?.store.nodesMap[key]?.collapse();
    });
  });
};

const checkAll = () => {
  const allKeys: (string | number)[] = [];
  const collectKeys = (nodes: UnifiedPermissionNode[]) => {
    nodes.forEach(node => {
      allKeys.push(node.id);
      if (node.children && node.children.length > 0) {
        collectKeys(node.children);
      }
    });
  };
  collectKeys(treeData.value);
  
  nextTick(() => {
    treeRef.value?.setCheckedKeys(allKeys);
    const checkedNodes = treeRef.value?.getCheckedNodes() || [];
    emit('change', allKeys, checkedNodes);
  });
};

const uncheckAll = () => {
  nextTick(() => {
    treeRef.value?.setCheckedKeys([]);
    emit('change', [], []);
  });
};

// 监听权限数据变化，自动展开第一层
watch(
  () => props.permissions,
  (newVal) => {
    if (newVal.length > 0) {
      // 新格式数据没有 parentId，直接展开第一层
      const isNewFormat = 'label' in newVal[0] && 'value' in newVal[0];
      if (isNewFormat) {
        expandedKeys.value = newVal.map(item => item.id);
      } else {
        // 旧格式数据过滤 parentId
        const oldFormatData = newVal as PermissionNode[];
        expandedKeys.value = oldFormatData
          .filter(item => !item.parentId)
          .map(item => item.id);
      }
    }
  },
  { immediate: true }
);

// 监听选中的权限变化
watch(
  () => props.checkedPermissions,
  (newVal) => {
    if (newVal && newVal.length > 0) {
      checkedKeys.value = [...newVal];
      nextTick(() => {
        treeRef.value?.setCheckedKeys(newVal);
      });
    }
  },
  { immediate: true }
);

// 暴露方法给父组件
defineExpose({
  getCheckedKeys: () => treeRef.value?.getCheckedKeys() || [],
  getCheckedNodes: () => treeRef.value?.getCheckedNodes() || [],
  setCheckedKeys: (keys: (string | number)[]) => treeRef.value?.setCheckedKeys(keys),
  expandAll,
  collapseAll,
  checkAll,
  uncheckAll,
});
</script>

<style scoped>
.permission-tree {
  width: 100%;
}

.tree-actions {
  margin-bottom: 16px;
  display: flex;
  gap: 8px;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.node-icon {
  font-size: 16px;
}

.node-label {
  flex: 1;
  font-size: 14px;
}

.node-tag {
  margin-left: auto;
}

:deep(.el-tree-node__content) {
  height: 32px;
  display: flex;
  align-items: center;
}

:deep(.el-tree-node__expand-icon) {
  padding: 6px;
}

:deep(.el-checkbox) {
  margin-right: 8px;
}
</style>