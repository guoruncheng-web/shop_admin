3其他<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">用户管理</h1>
    <div class="bg-white rounded-lg shadow p-6">
      <p class="text-gray-600">
        这里是用户管理页面，用于管理系统用户信息。
      </p>
      <div class="mt-4">
        <el-button type="primary">新增用户</el-button>
        <el-button>刷新</el-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineOptions({ name: 'UserManagement' });

// 这里可以添加用户管理的具体逻辑
</script>
