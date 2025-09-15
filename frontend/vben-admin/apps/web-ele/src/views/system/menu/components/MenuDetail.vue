<template>
  <div class="menu-detail">
    <h3>{{ props.menuInfo?.name || '菜单详情' }}</h3>
    <!-- 调试信息（开发环境显示） -->
    <div v-if="isDev" style="background: #f5f5f5; padding: 10px; margin-bottom: 20px; border-radius: 4px;">
      <details>
        <summary style="cursor: pointer; font-weight: bold;">🔍 调试信息</summary>
        <pre style="font-size: 12px; margin-top: 10px;">{{ JSON.stringify(props.menuInfo, null, 2) }}</pre>
      </details>
    </div>
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
      <el-descriptions-item label="权限标识" v-if="props.menuInfo?.type === 3 || props.menuInfo?.type === 'button'">
        <el-tag v-if="getPermissionValue(props.menuInfo)" size="small">
          {{ getPermissionValue(props.menuInfo) }}
        </el-tag>
        <span v-else style="color: #999;">-</span>
      </el-descriptions-item>
      <el-descriptions-item label="菜单图标">
         {{ props.menuInfo?.icon || '-' }}
       </el-descriptions-item>
      <el-descriptions-item label="排序">
        {{ getSortValue(props.menuInfo) }}
      </el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag
          :type="getStatusType(props.menuInfo?.status)"
          size="small"
        >
          {{ getStatusText(props.menuInfo?.status) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="是否隐藏">
        <el-tag
          :type="getHiddenType(props.menuInfo)"
          size="small"
        >
          {{ getHiddenText(props.menuInfo) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="是否缓存" v-if="props.menuInfo?.type === 2 || props.menuInfo?.type === 'menu'">
        <el-tag
          :type="getCacheType(props.menuInfo)"
          size="small"
        >
          {{ getCacheText(props.menuInfo) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="是否固定" v-if="props.menuInfo?.type === 2 || props.menuInfo?.type === 'menu'">
        <el-tag
          :type="getAffixType(props.menuInfo)"
          size="small"
        >
          {{ getAffixText(props.menuInfo) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">
        {{ formatDate(props.menuInfo?.createdAt) }}
      </el-descriptions-item>
      <el-descriptions-item label="更新时间">
        {{ formatDate(props.menuInfo?.updatedAt) }}
      </el-descriptions-item>
      <el-descriptions-item label="创建者">
        {{ getCreatorInfo(props.menuInfo) }}
      </el-descriptions-item>
      <el-descriptions-item label="更新者">
        {{ getUpdaterInfo(props.menuInfo) }}
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

// 开发环境检测
const isDev = import.meta.env.DEV;

// 获取类型颜色
function getTypeColor(type?: string | number) {
  const typeValue = String(type);
  switch (typeValue) {
    case '1':
    case 'directory':
      return 'primary';
    case '2':
    case 'menu':
      return 'success';
    case '3':
    case 'button':
      return 'warning';
    default:
      return 'primary';
  }
}

// 获取类型文本
function getTypeText(type?: string | number) {
  const typeValue = String(type);
  switch (typeValue) {
    case '1':
    case 'directory':
      return '目录';
    case '2':
    case 'menu':
      return '菜单';
    case '3':
    case 'button':
      return '按钮';
    default:
      return '未知';
  }
}

// 获取权限标识值
function getPermissionValue(menuInfo?: MenuData | null) {
  if (!menuInfo) return '';
  // 兼容不同字段名：permission 或 buttonKey
  return (menuInfo as any).permission || (menuInfo as any).buttonKey || '';
}

// 获取排序值
function getSortValue(menuInfo?: MenuData | null) {
  if (!menuInfo) return 0;
  // 兼容不同字段名：sort 或 orderNum
  return (menuInfo as any).sort ?? (menuInfo as any).orderNum ?? 0;
}

// 获取固定状态类型
function getAffixType(menuInfo?: MenuData | null) {
  if (!menuInfo) return 'info';
  // 兼容不同字段名：affixTab (1=固定, 0=不固定) 或 isAffix (true=固定, false=不固定)
  const isAffix = (menuInfo as any).affixTab === 1 || (menuInfo as any).isAffix === true;
  return isAffix ? 'success' : 'info';
}

// 获取固定状态文本
function getAffixText(menuInfo?: MenuData | null) {
  if (!menuInfo) return '不固定';
  // 兼容不同字段名：affixTab (1=固定, 0=不固定) 或 isAffix (true=固定, false=不固定)
  const isAffix = (menuInfo as any).affixTab === 1 || (menuInfo as any).isAffix === true;
  return isAffix ? '固定' : '不固定';
}

// 获取缓存状态类型
function getCacheType(menuInfo?: MenuData | null) {
  if (!menuInfo) return 'info';
  // 兼容不同字段名：keepAlive (1=缓存, 0=不缓存) 或 isKeepAlive (true=缓存, false=不缓存)
  const isKeepAlive = (menuInfo as any).keepAlive === 1 || (menuInfo as any).isKeepAlive === true;
  return isKeepAlive ? 'success' : 'info';
}

// 获取缓存状态文本
function getCacheText(menuInfo?: MenuData | null) {
  if (!menuInfo) return '不缓存';
  // 兼容不同字段名：keepAlive (1=缓存, 0=不缓存) 或 isKeepAlive (true=缓存, false=不缓存)
  const isKeepAlive = (menuInfo as any).keepAlive === 1 || (menuInfo as any).isKeepAlive === true;
  return isKeepAlive ? '缓存' : '不缓存';
}

// 获取隐藏状态类型
function getHiddenType(menuInfo?: MenuData | null) {
  if (!menuInfo) return 'success';
  // 兼容不同字段名：hideInMenu (1=隐藏, 0=显示) 或 isHidden (true=隐藏, false=显示)
  const isHidden = (menuInfo as any).hideInMenu === 1 || (menuInfo as any).isHidden === true;
  return isHidden ? 'warning' : 'success';
}

// 获取隐藏状态文本
function getHiddenText(menuInfo?: MenuData | null) {
  if (!menuInfo) return '显示';
  // 兼容不同字段名：hideInMenu (1=隐藏, 0=显示) 或 isHidden (true=隐藏, false=显示)
  const isHidden = (menuInfo as any).hideInMenu === 1 || (menuInfo as any).isHidden === true;
  return isHidden ? '隐藏' : '显示';
}

// 获取状态类型
function getStatusType(status?: boolean | number | string) {
  if (status === true || status === 1 || status === '1' || status === 'enabled') {
    return 'success';
  }
  return 'danger';
}

// 获取状态文本
function getStatusText(status?: boolean | number | string) {
  if (status === true || status === 1 || status === '1' || status === 'enabled') {
    return '启用';
  }
  return '禁用';
}

// 格式化日期
function formatDate(date?: string | Date) {
  if (!date) return '-';
  return new Date(date).toLocaleString('zh-CN');
}

// 获取创建者信息
function getCreatorInfo(menuInfo?: MenuData | null) {
  if (!menuInfo) return '-';
  const createdByName = (menuInfo as any).createdByName;
  const createdBy = (menuInfo as any).createdBy;
  
  if (createdByName) {
    return createdBy ? `${createdByName} (ID: ${createdBy})` : createdByName;
  }
  return createdBy ? `用户ID: ${createdBy}` : '-';
}

// 获取更新者信息
function getUpdaterInfo(menuInfo?: MenuData | null) {
  if (!menuInfo) return '-';
  const updatedByName = (menuInfo as any).updatedByName;
  const updatedBy = (menuInfo as any).updatedBy;
  
  if (updatedByName) {
    return updatedBy ? `${updatedByName} (ID: ${updatedBy})` : updatedByName;
  }
  return updatedBy ? `用户ID: ${updatedBy}` : '-';
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