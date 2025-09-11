<template>
  <div class="menu-detail">
    <h3>{{ props.menuInfo?.name || '菜单详情' }}</h3>
    <el-descriptions :column="2" border>
      <el-descriptions-item label="菜单名称">
        {{ props.menuInfo?.name }}
      </el-descriptions-item>
      <el-descriptions-item label="菜单类型">
        <el-tag
          :type="getTypeColor(props.menuInfo?.type)"
          size="small"
        >
          {{ getTypeText(props.menuInfo?.type) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="路由路径">
        {{ props.menuInfo?.path }}
      </el-descriptions-item>
      <el-descriptions-item label="组件路径">
        {{ props.menuInfo?.component }}
      </el-descriptions-item>
      <el-descriptions-item label="权限标识">
        <el-tag v-if="props.menuInfo?.permission" size="small">
          {{ props.menuInfo?.permission }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="菜单图标">
         {{ props.menuInfo?.icon || '-' }}
       </el-descriptions-item>
      <el-descriptions-item label="排序">
        {{ props.menuInfo?.sort }}
      </el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag
          :type="props.menuInfo?.status === 'enabled' ? 'success' : 'danger'"
          size="small"
        >
          {{ props.menuInfo?.status === 'enabled' ? '启用' : '禁用' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="是否隐藏">
        <el-tag
          :type="props.menuInfo?.isHidden ? 'warning' : 'success'"
          size="small"
        >
          {{ props.menuInfo?.isHidden ? '隐藏' : '显示' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="是否缓存" v-if="props.menuInfo?.type === 'menu'">
        <el-tag
          :type="props.menuInfo?.isKeepAlive ? 'success' : 'info'"
          size="small"
        >
          {{ props.menuInfo?.isKeepAlive ? '缓存' : '不缓存' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="是否固定" v-if="props.menuInfo?.type === 'menu'">
        <el-tag
          :type="props.menuInfo?.isAffix ? 'success' : 'info'"
          size="small"
        >
          {{ props.menuInfo?.isAffix ? '固定' : '不固定' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">
        {{ formatDate(props.menuInfo?.createdAt) }}
      </el-descriptions-item>
      <el-descriptions-item label="更新时间">
        {{ formatDate(props.menuInfo?.updatedAt) }}
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script setup lang="ts">
import { ElDescriptions, ElDescriptionsItem, ElTag } from 'element-plus';
import type { MenuData } from '#/api/system/menu';

interface Props {
  menuInfo?: MenuData | null;
}

const props = defineProps<Props>();

// 获取类型颜色
function getTypeColor(type?: string) {
  switch (type) {
    case 'directory':
      return 'primary';
    case 'menu':
      return 'success';
    case 'button':
      return 'warning';
    default:
      return 'primary';
  }
}

// 获取类型文本
function getTypeText(type?: string) {
  switch (type) {
    case 'directory':
      return '目录';
    case 'menu':
      return '菜单';
    case 'button':
      return '按钮';
    default:
      return '未知';
  }
}

// 格式化日期
function formatDate(date?: string | Date) {
  if (!date) return '-';
  return new Date(date).toLocaleString('zh-CN');
}
</script>

<style scoped>
.menu-detail {
  padding: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  min-height: 32px;
}

.detail-item label {
  width: 100px;
  font-weight: 500;
  color: #666;
  flex-shrink: 0;
}

.detail-item span {
  color: #333;
}

.icon-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-name {
  font-family: monospace;
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}
</style>