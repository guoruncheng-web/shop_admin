<template>
  <el-dialog
    :model-value="visible"
    :title="isEdit ? '编辑菜单' : '新增菜单'"
    width="600px"
    :close-on-click-modal="false"
    @update:model-value="handleClose"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      class="menu-form"
    >
      <el-form-item label="上级菜单" prop="parent_id">
        <el-tree-select
          v-model="formData.parent_id"
          :data="menuTreeOptions"
          :props="{ label: 'name', value: 'id', children: 'children' }"
          placeholder="请选择上级菜单"
          check-strictly
          :render-after-expand="false"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="权限类型" prop="type">
        <el-radio-group v-model="formData.type">
          <el-radio :label="1">菜单权限</el-radio>
          <el-radio :label="2">路由权限</el-radio>
          <el-radio :label="3">按钮权限</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="权限名称" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="请输入权限名称"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="权限标识" prop="code">
        <el-input
          v-model="formData.code"
          placeholder="请输入权限标识，如：system:menu:list"
          maxlength="100"
          show-word-limit
        />
      </el-form-item>

      <el-form-item
        v-if="formData.type === 1 || formData.type === 2"
        label="路由路径"
        prop="path"
      >
        <el-input
          v-model="formData.path"
          placeholder="请输入路由路径，如：/system/menu"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <el-form-item
        v-if="formData.type === 1 || formData.type === 2"
        label="组件路径"
        prop="component"
      >
        <el-input
          v-model="formData.component"
          placeholder="请输入组件路径，如：system/menu/index"
          maxlength="200"
          show-word-limit
        />

      </el-form-item>

      <el-form-item
        v-if="formData.type === 1"
        label="菜单图标"
        prop="icon"
      >
        <div class="icon-input-wrapper">
          <el-input
            v-model="formData.icon"
            placeholder="请输入图标名称，如：lucide:menu"
            maxlength="50"
            show-word-limit
          >
            <template #prepend>
              <Icon
                v-if="formData.icon"
                :icon="formData.icon"
                class="icon-preview"
              />
              <Icon
                v-else
                icon="lucide:image"
                class="icon-preview"
              />
            </template>
          </el-input>
        </div>

      </el-form-item>

      <el-form-item label="排序" prop="sort_order">
        <el-input-number
          v-model="formData.sort_order"
          :min="0"
          :max="9999"
          placeholder="排序值"
          style="width: 200px"
        />

      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio :label="true">启用</el-radio>
          <el-radio :label="false">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          :loading="loading"
          @click="handleSubmit"
        >
          {{ isEdit ? '更新' : '创建' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { Icon } from '@iconify/vue';
import type { MenuPermission, MenuFormData } from '#/api/system/menu';
import { createMenuApi, updateMenuApi, checkMenuCodeApi } from '#/api/system/menu';

// Props
interface Props {
  visible: boolean;
  menuData?: MenuPermission | null;
  menuTreeOptions: MenuPermission[];
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  menuData: null,
  menuTreeOptions: () => [],
});

// Emits
const emit = defineEmits<{
  'update:visible': [value: boolean];
  'success': [];
}>();

// Refs
const formRef = ref<FormInstance>();
const loading = ref(false);

// Computed
const isEdit = computed(() => !!props.menuData?.id);

// Form data
const formData = reactive<MenuFormData>({
  parent_id: 0,
  name: '',
  code: '',
  type: 1,
  path: '',
  component: '',
  icon: '',
  sort_order: 0,
  status: true, // 后端使用布尔值
});

// Form rules
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入权限名称', trigger: 'blur' },
    { min: 2, max: 50, message: '权限名称长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  code: [
    { required: true, message: '请输入权限标识', trigger: 'blur' },
    { min: 2, max: 100, message: '权限标识长度在 2 到 100 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z][a-zA-Z0-9_:]*$/, message: '权限标识只能包含字母、数字、下划线和冒号，且以字母开头', trigger: 'blur' },
    {
      validator: async (rule, value, callback) => {
        if (!value) return callback();
        try {
          const isUnique = await checkMenuCodeApi(value, formData.id);
          if (!isUnique) {
            callback(new Error('权限标识已存在'));
          } else {
            callback();
          }
        } catch (error) {
          console.warn('权限标识验证失败:', error);
          callback(); // 验证失败时不阻止提交
        }
      },
      trigger: 'blur',
    },
  ],
  type: [
    { required: true, message: '请选择权限类型', trigger: 'change' },
  ],
  path: [
    {
      validator: (rule, value, callback) => {
        if ((formData.type === 1 || formData.type === 2) && !value) {
          callback(new Error('菜单权限和路由权限必须配置路由路径'));
        } else if (value && !value.startsWith('/')) {
          callback(new Error('路由路径必须以 / 开头'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
  component: [
    {
      validator: (rule, value, callback) => {
        if ((formData.type === 1 || formData.type === 2) && !value) {
          callback(new Error('菜单权限和路由权限必须配置组件路径'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
  sort_order: [
    { required: true, message: '请输入排序值', trigger: 'blur' },
    { type: 'number', min: 0, max: 9999, message: '排序值必须在 0 到 9999 之间', trigger: 'blur' },
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' },
  ],
};

// Watch props
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      initForm();
    }
  },
);

watch(
  () => props.menuData,
  (newVal) => {
    if (newVal && props.visible) {
      initForm();
    }
  },
);

// Watch form type change
watch(
  () => formData.type,
  (newType) => {
    // 当权限类型改变时，清空相关字段
    if (newType === 3) {
      // 按钮权限不需要路径和组件
      formData.path = '';
      formData.component = '';
      formData.icon = '';
    }
  },
);

// Methods
const initForm = () => {
  if (props.menuData) {
    // 编辑模式
    Object.assign(formData, {
      id: props.menuData.id,
      parent_id: props.menuData.parent_id,
      name: props.menuData.name,
      code: props.menuData.code,
      type: props.menuData.type,
      path: props.menuData.path || '',
      component: props.menuData.component || '',
      icon: props.menuData.icon || '',
      sort_order: props.menuData.sort_order,
      status: props.menuData.status,
    });
  } else {
    // 新增模式
    Object.assign(formData, {
      parent_id: 0,
      name: '',
      code: '',
      type: 1,
      path: '',
      component: '',
      icon: '',
      sort_order: 0,
      status: true,
    });
  }

  // 清除表单验证
  nextTick(() => {
    formRef.value?.clearValidate();
  });
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    loading.value = true;

    if (isEdit.value) {
      await updateMenuApi(formData.id!, formData);
      ElMessage.success('菜单更新成功');
    } else {
      await createMenuApi(formData);
      ElMessage.success('菜单创建成功');
    }

    emit('success');
    handleClose();
  } catch (error: any) {
    console.error('提交失败:', error);
    ElMessage.error(error.message || '操作失败');
  } finally {
    loading.value = false;
  }
};

const handleClose = () => {
  emit('update:visible', false);
};
</script>

<style scoped>
.menu-form {
  padding: 0 20px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
}

.icon-input-wrapper {
  width: 100%;
}

.icon-preview {
  width: 16px;
  height: 16px;
  color: #606266;
}

.dialog-footer {
  text-align: right;
}

:deep(.el-tree-select) {
  width: 100%;
}

:deep(.el-input-group__prepend) {
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>