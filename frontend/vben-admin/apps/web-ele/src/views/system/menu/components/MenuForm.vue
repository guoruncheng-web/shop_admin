<template>
  <ElDialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑菜单' : '新增菜单'"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <ElForm
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      class="menu-form"
    >
      <ElFormItem label="上级菜单" prop="parent_id">
        <ElTreeSelect
          v-model="formData.parent_id"
          :data="menuTreeOptions"
          :props="{ label: 'name', value: 'id', children: 'children' }"
          placeholder="请选择上级菜单"
          check-strictly
          :render-after-expand="false"
          style="width: 100%"
        />
      </ElFormItem>

      <ElFormItem label="菜单类型" prop="type">
        <ElRadioGroup v-model="formData.type" :disabled="isEdit">
          <ElRadio :label="1">目录</ElRadio>
          <ElRadio :label="2">菜单</ElRadio>
          <ElRadio :label="3">按钮</ElRadio>
        </ElRadioGroup>
        <div v-if="isEdit" class="form-tip">
          编辑模式下不允许修改菜单类型
        </div>
      </ElFormItem>

      <ElFormItem label="菜单名称" prop="name">
        <ElInput
          v-model="formData.name"
          placeholder="请输入菜单名称"
          maxlength="50"
          show-word-limit
        />
      </ElFormItem>

      <ElFormItem 
        v-if="formData.type === 3"
        label="权限标识" 
        prop="code"
      >
        <ElInput
          v-model="formData.code"
          placeholder="请输入权限标识，如：system:menu:add"
          maxlength="100"
          show-word-limit
        />
        <div class="form-tip">
          按钮权限需要配置权限标识用于前端权限控制
        </div>
      </ElFormItem>

      <ElFormItem
        v-if="formData.type === 1 || formData.type === 2"
        label="路由路径"
        prop="path"
      >
        <ElInput
          v-model="formData.path"
          placeholder="请输入路由路径，如：/system/menu"
          maxlength="200"
          show-word-limit
        />
      </ElFormItem>

      <ElFormItem
        v-if="formData.type === 2"
        label="组件路径"
        prop="component"
      >
        <ElInput
          v-model="formData.component"
          placeholder="请输入组件路径，如：system/menu/index"
          maxlength="200"
          show-word-limit
        />
        <div class="form-tip">
          目录类型会自动使用 BasicLayout，无需手动配置组件路径
        </div>
      </ElFormItem>

      <ElFormItem
        v-if="formData.type === 1 || formData.type === 2"
        label="菜单图标"
        prop="icon"
      >
        <div class="icon-input-wrapper">
          <ElInput
            v-model="formData.icon"
            placeholder="请输入图标名称，如：lucide:menu"
            maxlength="50"
            show-word-limit
          >
            <template #prepend>
              <span v-if="formData.icon" class="icon-preview">🎨</span>
              <span v-else class="icon-preview">📷</span>
            </template>
          </ElInput>
        </div>
        <div class="form-tip">
          目录和菜单可以配置图标，按钮不需要图标
        </div>
      </ElFormItem>

      <ElFormItem label="排序" prop="sort_order">
        <ElInputNumber
          v-model="formData.sort_order"
          :min="0"
          :max="9999"
          placeholder="排序值"
          style="width: 200px"
        />
      </ElFormItem>

      <ElFormItem label="状态" prop="status">
        <ElRadioGroup v-model="formData.status">
          <ElRadio :label="true">启用</ElRadio>
          <ElRadio :label="false">禁用</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
    </ElForm>

    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="handleClose">取消</ElButton>
        <ElButton
          type="primary"
          :loading="loading"
          @click="handleSubmit"
        >
          {{ isEdit ? '更新' : '创建' }}
        </ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
defineOptions({
  name: 'MenuForm',
});

import { ref, reactive, computed, watch, nextTick } from 'vue';
import { 
  ElDialog,
  ElForm,
  ElFormItem,
  ElTreeSelect,
  ElRadioGroup,
  ElRadio,
  ElInput,
  ElInputNumber,
  ElButton,
  ElMessage,
  type FormInstance, 
  type FormRules 
} from 'element-plus';
import type { MenuPermission, MenuFormData } from '#/api/system/menu';
import { createMenuApi, updateMenuApi } from '#/api/system/menu';

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

/** v-model:visible 双向绑定封装 */
const dialogVisible = computed({
  get: () => props.visible,
  set: (val: boolean) => emit('update:visible', val),
});

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
    { required: true, message: '请输入菜单名称', trigger: 'blur' },
    { min: 2, max: 50, message: '菜单名称长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  code: [
    {
      validator: (rule, value, callback) => {
        // 只有按钮类型才需要权限标识
        if (formData.type === 3) {
          if (!value) {
            callback(new Error('按钮权限必须配置权限标识'));
            return;
          }
          if (value.length < 2 || value.length > 100) {
            callback(new Error('权限标识长度在 2 到 100 个字符'));
            return;
          }
          if (!/^[a-zA-Z][a-zA-Z0-9_:]*$/.test(value)) {
            callback(new Error('权限标识只能包含字母、数字、下划线和冒号，且以字母开头'));
            return;
          }
        }
        callback();
      },
      trigger: 'blur',
    },
  ],
  type: [
    { required: true, message: '请选择菜单类型', trigger: 'change' },
  ],
  path: [
    {
      validator: (rule, value, callback) => {
        if ((formData.type === 1 || formData.type === 2) && !value) {
          callback(new Error('目录和菜单必须配置路由路径'));
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
        if (formData.type === 2 && !value) {
          callback(new Error('菜单类型必须配置组件路径'));
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
    // 当菜单类型改变时，清空相关字段
    if (newType === 3) {
      // 按钮类型不需要路径、组件和图标
      formData.path = '';
      formData.component = '';
      formData.icon = '';
    } else if (newType === 1) {
      // 目录类型不需要组件路径（后端会自动设置为 BasicLayout）
      formData.component = '';
      formData.code = '';
    } else if (newType === 2) {
      // 菜单类型不需要权限标识
      formData.code = '';
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