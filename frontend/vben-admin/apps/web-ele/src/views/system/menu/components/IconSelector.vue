<template>
  <div class="icon-selector">
    <ElInput
      v-model="inputValue"
      :placeholder="placeholder"
      :readonly="readonly"
      @click="handleInputClick"
    >
      <template #prepend>
        <div class="icon-preview-wrapper">
          <Icon v-if="inputValue && inputValue.includes(':')" :icon="inputValue" class="icon-preview" />
          <span v-else-if="inputValue" class="icon-preview">{{ inputValue }}</span>
          <span v-else class="icon-preview-placeholder">🎨</span>
        </div>
      </template>
      <template #append>
        <ElButton @click="handleSelectClick" :disabled="disabled">
          选择图标
        </ElButton>
      </template>
    </ElInput>

    <!-- 图标选择弹窗 -->
    <ElDialog
      v-model="dialogVisible"
      title="选择图标"
      width="800px"
      :close-on-click-modal="false"
      class="icon-selector-dialog"
    >
      <div class="icon-selector-content">
        <!-- 搜索框 -->
        <div class="search-section">
          <ElInput
            v-model="searchKeyword"
            placeholder="搜索图标名称..."
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <Icon icon="lucide:search" />
            </template>
          </ElInput>
        </div>

        <!-- 图标分类标签 -->
        <div class="category-tabs">
          <ElTag
            v-for="category in iconCategories"
            :key="category.key"
            :type="selectedCategory === category.key ? 'primary' : 'info'"
            :effect="selectedCategory === category.key ? 'dark' : 'plain'"
            class="category-tag"
            @click="handleCategoryChange(category.key)"
          >
            {{ category.label }} ({{ category.icons.length }})
          </ElTag>
        </div>

        <!-- 图标网格 -->
        <div class="icons-grid" v-loading="loading">
          <div
            v-for="iconName in filteredIcons"
            :key="iconName"
            class="icon-item"
            :class="{ active: selectedIcon === iconName }"
            @click="handleIconSelect(iconName)"
          >
            <div class="icon-wrapper">
              <Icon :icon="iconName" class="icon" />
            </div>
            <div class="icon-name">{{ iconName.split(':')[1] || iconName }}</div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="filteredIcons.length === 0 && !loading" class="empty-state">
          <Icon icon="lucide:search-x" class="empty-icon" />
          <div class="empty-text">未找到匹配的图标</div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="handleCancel">取消</ElButton>
          <ElButton @click="handleClear" v-if="inputValue">清空</ElButton>
          <ElButton type="primary" @click="handleConfirm" :disabled="!selectedIcon">
            确定
          </ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  ElInput,
  ElButton,
  ElDialog,
  ElTag,
  ElMessage
} from 'element-plus';
import { Icon } from '@iconify/vue';

interface Props {
  modelValue?: string;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '请选择图标',
  disabled: false,
  readonly: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'change': [value: string];
}>();

// 响应式数据
const dialogVisible = ref(false);
const searchKeyword = ref('');
const selectedCategory = ref('lucide');
const selectedIcon = ref('');
const loading = ref(false);

// 双向绑定
const inputValue = computed({
  get: () => props.modelValue,
  set: (value: string) => {
    emit('update:modelValue', value);
    emit('change', value);
  }
});

// 图标分类数据
const iconCategories = ref([
  {
    key: 'lucide',
    label: 'Lucide',
    icons: [
      'lucide:home', 'lucide:user', 'lucide:users', 'lucide:settings', 'lucide:menu',
      'lucide:search', 'lucide:plus', 'lucide:edit', 'lucide:trash-2', 'lucide:eye',
      'lucide:eye-off', 'lucide:lock', 'lucide:unlock', 'lucide:heart', 'lucide:star',
      'lucide:bookmark', 'lucide:folder', 'lucide:file', 'lucide:image', 'lucide:video',
      'lucide:music', 'lucide:download', 'lucide:upload', 'lucide:share', 'lucide:copy',
      'lucide:check', 'lucide:x', 'lucide:alert-circle', 'lucide:info', 'lucide:help-circle',
      'lucide:calendar', 'lucide:clock', 'lucide:mail', 'lucide:phone', 'lucide:map-pin',
      'lucide:globe', 'lucide:wifi', 'lucide:bluetooth', 'lucide:battery', 'lucide:volume-2',
      'lucide:camera', 'lucide:printer', 'lucide:monitor', 'lucide:smartphone', 'lucide:tablet',
      'lucide:laptop', 'lucide:server', 'lucide:database', 'lucide:cloud', 'lucide:shield',
      'lucide:key', 'lucide:credit-card', 'lucide:shopping-cart', 'lucide:package', 'lucide:truck',
      'lucide:plane', 'lucide:car', 'lucide:bike', 'lucide:train', 'lucide:bus',
      'lucide:arrow-up', 'lucide:arrow-down', 'lucide:arrow-left', 'lucide:arrow-right',
      'lucide:chevron-up', 'lucide:chevron-down', 'lucide:chevron-left', 'lucide:chevron-right',
      'lucide:refresh-cw', 'lucide:rotate-ccw', 'lucide:maximize', 'lucide:minimize',
      'lucide:zoom-in', 'lucide:zoom-out', 'lucide:move', 'lucide:resize',
      'lucide:layout-dashboard', 'lucide:layout-grid', 'lucide:layout-list', 'lucide:sidebar',
      'lucide:panel-left', 'lucide:panel-right', 'lucide:columns', 'lucide:rows',
      'lucide:book', 'lucide:bookmark-plus', 'lucide:library', 'lucide:graduation-cap',
      'lucide:award', 'lucide:trophy', 'lucide:medal', 'lucide:target',
      'lucide:activity', 'lucide:trending-up', 'lucide:trending-down', 'lucide:bar-chart',
      'lucide:pie-chart', 'lucide:line-chart', 'lucide:area-chart'
    ]
  },
  {
    key: 'ion',
    label: 'Ionicons',
    icons: [
      'ion:home-outline', 'ion:person-outline', 'ion:people-outline', 'ion:settings-outline',
      'ion:menu-outline', 'ion:search-outline', 'ion:add-outline', 'ion:create-outline',
      'ion:trash-outline', 'ion:eye-outline', 'ion:eye-off-outline', 'ion:lock-closed-outline',
      'ion:lock-open-outline', 'ion:heart-outline', 'ion:star-outline', 'ion:bookmark-outline',
      'ion:folder-outline', 'ion:document-outline', 'ion:image-outline', 'ion:videocam-outline',
      'ion:musical-notes-outline', 'ion:download-outline', 'ion:cloud-upload-outline',
      'ion:share-outline', 'ion:copy-outline', 'ion:checkmark-outline', 'ion:close-outline',
      'ion:alert-circle-outline', 'ion:information-circle-outline', 'ion:help-circle-outline',
      'ion:calendar-outline', 'ion:time-outline', 'ion:mail-outline', 'ion:call-outline',
      'ion:location-outline', 'ion:globe-outline', 'ion:wifi-outline', 'ion:bluetooth-outline',
      'ion:battery-full-outline', 'ion:volume-high-outline', 'ion:camera-outline',
      'ion:print-outline', 'ion:desktop-outline', 'ion:phone-portrait-outline',
      'ion:tablet-portrait-outline', 'ion:laptop-outline', 'ion:server-outline',
      'ion:library-outline', 'ion:cloud-outline', 'ion:shield-outline', 'ion:key-outline',
      'ion:card-outline', 'ion:cart-outline', 'ion:cube-outline', 'ion:car-outline',
      'ion:airplane-outline', 'ion:bicycle-outline', 'ion:train-outline', 'ion:bus-outline',
      'ion:arrow-up-outline', 'ion:arrow-down-outline', 'ion:arrow-back-outline',
      'ion:arrow-forward-outline', 'ion:chevron-up-outline', 'ion:chevron-down-outline',
      'ion:chevron-back-outline', 'ion:chevron-forward-outline', 'ion:refresh-outline',
      'ion:reload-outline', 'ion:expand-outline', 'ion:contract-outline', 'ion:resize-outline',
      'ion:grid-outline', 'ion:list-outline', 'ion:apps-outline', 'ion:layers-outline',
      'ion:book-outline', 'ion:library-outline', 'ion:school-outline', 'ion:trophy-outline',
      'ion:medal-outline', 'ion:ribbon-outline', 'ion:pulse-outline', 'ion:trending-up-outline',
      'ion:trending-down-outline', 'ion:bar-chart-outline', 'ion:pie-chart-outline',
      'ion:stats-chart-outline', 'ion:analytics-outline'
    ]
  },
  {
    key: 'mdi',
    label: 'Material Design',
    icons: [
      'mdi:home', 'mdi:account', 'mdi:account-group', 'mdi:cog', 'mdi:menu',
      'mdi:magnify', 'mdi:plus', 'mdi:pencil', 'mdi:delete', 'mdi:eye',
      'mdi:eye-off', 'mdi:lock', 'mdi:lock-open', 'mdi:heart', 'mdi:star',
      'mdi:bookmark', 'mdi:folder', 'mdi:file', 'mdi:image', 'mdi:video',
      'mdi:music', 'mdi:download', 'mdi:upload', 'mdi:share', 'mdi:content-copy',
      'mdi:check', 'mdi:close', 'mdi:alert-circle', 'mdi:information', 'mdi:help-circle',
      'mdi:calendar', 'mdi:clock', 'mdi:email', 'mdi:phone', 'mdi:map-marker',
      'mdi:earth', 'mdi:wifi', 'mdi:bluetooth', 'mdi:battery', 'mdi:volume-high',
      'mdi:camera', 'mdi:printer', 'mdi:monitor', 'mdi:cellphone', 'mdi:tablet',
      'mdi:laptop', 'mdi:server', 'mdi:database', 'mdi:cloud', 'mdi:shield',
      'mdi:key', 'mdi:credit-card', 'mdi:cart', 'mdi:package-variant', 'mdi:truck',
      'mdi:airplane', 'mdi:car', 'mdi:bike', 'mdi:train', 'mdi:bus',
      'mdi:arrow-up', 'mdi:arrow-down', 'mdi:arrow-left', 'mdi:arrow-right',
      'mdi:chevron-up', 'mdi:chevron-down', 'mdi:chevron-left', 'mdi:chevron-right',
      'mdi:refresh', 'mdi:rotate-left', 'mdi:fullscreen', 'mdi:fullscreen-exit',
      'mdi:magnify-plus', 'mdi:magnify-minus', 'mdi:cursor-move', 'mdi:resize',
      'mdi:view-dashboard', 'mdi:view-grid', 'mdi:view-list', 'mdi:sidebar',
      'mdi:dock-left', 'mdi:dock-right', 'mdi:view-column', 'mdi:table-row',
      'mdi:book', 'mdi:bookmark-plus', 'mdi:library', 'mdi:school',
      'mdi:trophy', 'mdi:medal', 'mdi:ribbon', 'mdi:target',
      'mdi:pulse', 'mdi:trending-up', 'mdi:trending-down', 'mdi:chart-bar',
      'mdi:chart-pie', 'mdi:chart-line', 'mdi:chart-area'
    ]
  }
]);

// 计算属性
const currentCategoryIcons = computed(() => {
  const category = iconCategories.value.find(cat => cat.key === selectedCategory.value);
  return category ? category.icons : [];
});

const filteredIcons = computed(() => {
  let icons = currentCategoryIcons.value;
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    icons = icons.filter(icon => 
      icon.toLowerCase().includes(keyword) ||
      icon.split(':')[1]?.toLowerCase().includes(keyword)
    );
  }
  
  return icons;
});

// 方法
const handleInputClick = () => {
  if (!props.readonly && !props.disabled) {
    handleSelectClick();
  }
};

const handleSelectClick = () => {
  if (props.disabled) return;
  
  dialogVisible.value = true;
  selectedIcon.value = props.modelValue || '';
  
  // 如果当前有值，尝试切换到对应的分类
  if (props.modelValue) {
    const prefix = props.modelValue.split(':')[0];
    if (iconCategories.value.some(cat => cat.key === prefix)) {
      selectedCategory.value = prefix;
    }
  }
};

const handleSearch = () => {
  // 搜索逻辑已在计算属性中处理
};

const handleCategoryChange = (categoryKey: string) => {
  selectedCategory.value = categoryKey;
  searchKeyword.value = '';
};

const handleIconSelect = (iconName: string) => {
  selectedIcon.value = iconName;
};

const handleConfirm = () => {
  if (selectedIcon.value) {
    inputValue.value = selectedIcon.value;
    ElMessage.success('图标选择成功');
  }
  dialogVisible.value = false;
};

const handleCancel = () => {
  dialogVisible.value = false;
  selectedIcon.value = '';
};

const handleClear = () => {
  inputValue.value = '';
  selectedIcon.value = '';
  dialogVisible.value = false;
  ElMessage.success('图标已清空');
};

// 监听弹窗关闭，重置搜索
watch(dialogVisible, (newVal) => {
  if (!newVal) {
    searchKeyword.value = '';
  }
});
</script>

<style scoped>
.icon-selector {
  width: 100%;
}

.icon-preview-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.icon-preview {
  font-size: 16px;
  color: #409eff;
}

.icon-preview-placeholder {
  font-size: 16px;
  color: #c0c4cc;
}

.icon-selector-content {
  max-height: 700px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 8px;
}

.search-section {
  margin-bottom: 20px;
}

.category-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.category-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.category-tag:hover {
  transform: translateY(-1px);
}

.icons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
  max-height: 450px;
  overflow-y: auto;
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background-color: #fafafa;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 12px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background-color: #ffffff;
  cursor: pointer;
  transition: all 0.3s;
  min-height: 90px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.icon-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
  transform: translateY(-2px);
}

.icon-item.active {
  border-color: #409eff;
  background-color: #ecf5ff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin-bottom: 10px;
  border-radius: 6px;
  background-color: #f8f9fa;
  transition: all 0.3s;
}

.icon-item:hover .icon-wrapper {
  background-color: #e3f2fd;
}

.icon-item.active .icon-wrapper {
  background-color: #e3f2fd;
}

.icon {
  font-size: 28px;
  color: #606266;
  transition: all 0.3s;
}

.icon-item:hover .icon {
  color: #409eff;
  transform: scale(1.1);
}

.icon-item.active .icon {
  color: #409eff;
  transform: scale(1.1);
}

.icon-name {
  font-size: 13px;
  color: #909399;
  text-align: center;
  word-break: break-all;
  line-height: 1.3;
  font-weight: 400;
}

.icon-item:hover .icon-name {
  color: #409eff;
}

.icon-item.active .icon-name {
  color: #409eff;
  font-weight: 500;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #909399;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  font-size: 14px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
  margin-top: 16px;
}

/* 滚动条样式 */
.icons-grid::-webkit-scrollbar {
  width: 6px;
}

.icons-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.icons-grid::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.icons-grid::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .icon-selector-dialog :deep(.el-dialog) {
    width: 95% !important;
    margin: 5vh auto;
  }
  
  .icons-grid {
    grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
    gap: 6px;
  }
  
  .icon-item {
    padding: 8px 4px;
    min-height: 60px;
  }
  
  .icon-wrapper {
    width: 24px;
    height: 24px;
    margin-bottom: 4px;
  }
  
  .icon {
    font-size: 18px;
  }
  
  .icon-name {
    font-size: 10px;
  }
}
</style>