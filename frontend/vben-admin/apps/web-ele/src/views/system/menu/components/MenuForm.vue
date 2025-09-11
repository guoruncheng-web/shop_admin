<template>
  <el-form
    ref="formRef"
    :model="localFormData"
    :rules="formRules"
    label-width="100px"
  >
    <el-form-item label="菜单名称" prop="name">
      <el-input v-model="localFormData.name" placeholder="请输入菜单名称" />
    </el-form-item>
    
    <el-form-item label="菜单类型" prop="type">
      <el-select v-model="localFormData.type" placeholder="请选择菜单类型">
        <el-option label="目录" value="directory" />
        <el-option label="菜单" value="menu" />
        <el-option label="按钮" value="button" />
      </el-select>
    </el-form-item>
    
    <el-form-item label="父级菜单" prop="parentId">
      <el-tree-select
        v-model="localFormData.parentId"
        :data="menuOptions"
        :props="{ label: 'name', value: 'id', children: 'children' }"
        placeholder="请选择父级菜单"
        check-strictly
        clearable
      />
    </el-form-item>
    
    <el-form-item label="路由路径" prop="path" v-if="localFormData.type !== 'button'">
      <el-input v-model="localFormData.path" placeholder="请输入路由路径" />
    </el-form-item>
    
    <el-form-item label="组件路径" prop="component" v-if="localFormData.type === 'menu'">
      <el-input v-model="localFormData.component" placeholder="请输入组件路径" />
    </el-form-item>
    
    <el-form-item label="权限标识" prop="permission">
      <el-input v-model="localFormData.permission" placeholder="请输入权限标识" />
    </el-form-item>
    
    <el-form-item label="菜单图标" prop="icon">
      <el-input v-model="localFormData.icon" placeholder="请输入图标名称" />
    </el-form-item>
    
    <el-form-item label="排序" prop="sort">
      <el-input-number v-model="localFormData.sort" :min="0" />
    </el-form-item>
    
    <el-form-item label="状态" prop="status">
      <el-switch
        v-model="localFormData.status"
        active-text="启用"
        inactive-text="禁用"
        :active-value="true"
        :inactive-value="false"
      />
    </el-form-item>
    
    <el-form-item label="是否隐藏" prop="isHidden" v-if="localFormData.type !== 'button'">
      <el-switch
        v-model="localFormData.isHidden"
        active-text="隐藏"
        inactive-text="显示"
        :active-value="true"
        :inactive-value="false"
      />
    </el-form-item>
    
    <el-form-item label="是否缓存" prop="isKeepAlive" v-if="localFormData.type === 'menu'">
      <el-switch
        v-model="localFormData.isKeepAlive"
        active-text="缓存"
        inactive-text="不缓存"
        :active-value="true"
        :inactive-value="false"
      />
    </el-form-item>
    
    <el-form-item label="备注" prop="remark">
      <el-input
        v-model="localFormData.remark"
        type="textarea"
        :rows="3"
        placeholder="请输入备注"
      />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import {
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElTreeSelect,
  ElInputNumber,
  ElSwitch,
  type FormInstance,
  type FormRules
} from 'element-plus';
import type { MenuData, CreateMenuDto, UpdateMenuDto } from '#/api/system/menu';

interface Props {
  formData?: MenuData | null;
  menuOptions?: MenuData[];
  loading?: boolean;
}

interface Emits {
  submit: [data: CreateMenuDto | UpdateMenuDto];
}

const props = withDefaults(defineProps<Props>(), {
  formData: null,
  menuOptions: () => [],
  loading: false
});

const emit = defineEmits<Emits>();

const formRef = ref<FormInstance>();

// 本地表单数据
const localFormData = reactive<CreateMenuDto>({
  name: '',
  type: 'menu',
  parentId: null,
  path: '',
  component: '',
  permission: '',
  icon: '',
  sort: 0,
  status: true,
  isHidden: false,
  isKeepAlive: true,
  isAffix: false,
  remark: ''
});

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入菜单名称', trigger: 'blur' },
    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择菜单类型', trigger: 'change' }
  ],
  path: [
    { required: true, message: '请输入路由路径', trigger: 'blur' }
  ],
  component: [
    { required: true, message: '请输入组件路径', trigger: 'blur' }
  ],
  permission: [
    { required: true, message: '请输入权限标识', trigger: 'blur' }
  ],
  sort: [
    { required: true, message: '请输入排序', trigger: 'blur' },
    { type: 'number', min: 0, message: '排序必须大于等于0', trigger: 'blur' }
  ]
};

// 监听外部数据变化
watch(
  () => props.formData,
  (newData) => {
    if (newData) {
      Object.assign(localFormData, {
        name: newData.name || '',
        type: newData.type || 'menu',
        parentId: newData.parentId || null,
        path: newData.path || '',
        component: newData.component || '',
        permission: newData.permission || '',
        icon: newData.icon || '',
        sort: newData.sort || 0,
        status: newData.status !== false,
        isHidden: newData.isHidden || false,
        isKeepAlive: newData.isKeepAlive !== false,
        isAffix: newData.isAffix || false,
        remark: newData.remark || ''
      });
    } else {
      // 重置表单
      Object.assign(localFormData, {
        name: '',
        type: 'menu',
        parentId: null,
        path: '',
        component: '',
        permission: '',
        icon: '',
        sort: 0,
        status: true,
        isHidden: false,
        isKeepAlive: true,
        isAffix: false,
        remark: ''
      });
    }
  },
  { immediate: true }
);

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    emit('submit', { ...localFormData });
  } catch (error) {
    console.error('表单验证失败:', error);
  }
};

// 重置表单
const handleReset = () => {
  if (!formRef.value) return;
  formRef.value.resetFields();
};

// 暴露方法给父组件
defineExpose({
  handleSubmit,
  handleReset,
  validate: () => formRef.value?.validate(),
  resetFields: () => formRef.value?.resetFields()
});
</script>

<style scoped>
.el-form {
  max-width: 600px;
}
</style>