<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">菜单管理</h1>
    <div class="bg-white rounded-lg shadow p-6">
      <p class="text-gray-600">
        这里是菜单管理页面，用于管理系统菜单配置。
      </p>
      <div class="mt-4">
        <el-button type="primary">新增菜单</el-button>
        <el-button>刷新</el-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineOptions({ name: 'MenuManagement' });

// 这里可以添加菜单管理的具体逻辑
</script>

<style scoped lang="scss">
.header-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.search-card {
  margin-bottom: 16px;
  
  .search-form {
    .el-form-item {
      margin-bottom: 0;
    }
  }
}

.table-card {
  .menu-table {
    /* 名称列：仅文本，去多余间距，便于与树展开箭头对齐 */
    .menu-name-cell {
      display: inline-flex;
      align-items: center;
      gap: 0; /* 移除多余空隙 */
    }
    .menu-name {
      font-weight: 500;
    }

    /* 图标列样式保持 */
    .menu-icon {
      font-size: 18px;
      color: #3b82f6;
      line-height: 1;
      display: inline-block;
    }

    .menu-icon-empty {
      display: inline-block;
      width: 18px;
      height: 18px;
    }

    .path-text,
    .component-text {
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 12px;
      color: #6b7280;
    }

    .sort-number {
      font-weight: 600;
      color: #3b82f6;
    }

    .time-text {
      font-size: 12px;
      color: #6b7280;
    }

    /* 对齐优化：第一列（名称列）留出更舒适的左侧内边距 */
    :deep(.el-table__row) > td:first-child .cell {
      display: inline-flex;
      align-items: center;
      padding-left: 12px; /* 原 0 → 12，更不贴边 */
    }

    /* 调整树缩进与展开图标间距 */
    :deep(.el-table__indent) {
      margin-right: 6px; /* 原 4 → 6 */
    }
    :deep(.el-table__expand-icon) {
      margin-right: 8px;  /* 原 6 → 8，箭头与文本更不拥挤 */
      line-height: 1;
      align-items: center;
      display: inline-flex;
    }
    :deep(.el-table__expand-icon .el-icon) {
      font-size: 14px; /* 稍微小一点更贴合文字 */
    }
  }
}

.mr-1 {
  margin-right: 4px;
}
</style>