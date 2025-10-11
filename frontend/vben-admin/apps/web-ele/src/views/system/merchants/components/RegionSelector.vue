<template>
  <div class="region-selector">
    <ElFormItem label="省份" :prop="propPrefix + 'provinceCode'" :required="required">
      <ElSelect
        v-model="localValue.provinceCode"
        placeholder="请选择省份"
        clearable
        filterable
        @change="handleProvinceChange"
        style="width: 100%"
      >
        <ElOption
          v-for="province in provinces"
          :key="province.code"
          :label="province.name"
          :value="province.code"
        />
      </ElSelect>
    </ElFormItem>

    <ElFormItem label="城市" :prop="propPrefix + 'cityCode'" :required="required">
      <ElSelect
        v-model="localValue.cityCode"
        placeholder="请选择城市"
        clearable
        filterable
        :disabled="!localValue.provinceCode"
        @change="handleCityChange"
        style="width: 100%"
      >
        <ElOption
          v-for="city in cities"
          :key="city.code"
          :label="city.name"
          :value="city.code"
        />
      </ElSelect>
    </ElFormItem>

    <ElFormItem label="区/县" :prop="propPrefix + 'districtCode'" :required="required">
      <ElSelect
        v-model="localValue.districtCode"
        placeholder="请选择区/县"
        clearable
        filterable
        :disabled="!localValue.cityCode"
        @change="handleDistrictChange"
        style="width: 100%"
      >
        <ElOption
          v-for="district in districts"
          :key="district.code"
          :label="district.name"
          :value="district.code"
        />
      </ElSelect>
    </ElFormItem>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue';
import { ElFormItem, ElSelect, ElOption } from 'element-plus';
import { regionData, codeToText } from 'element-china-area-data';

interface RegionValue {
  provinceCode: string;
  provinceName: string;
  cityCode: string;
  cityName: string;
  districtCode: string;
  districtName: string;
}

interface Props {
  modelValue?: RegionValue;
  propPrefix?: string;
  required?: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: RegionValue): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({
    provinceCode: '',
    provinceName: '',
    cityCode: '',
    cityName: '',
    districtCode: '',
    districtName: '',
  }),
  propPrefix: '',
  required: false,
});

const emit = defineEmits<Emits>();

// 本地值
const localValue = reactive<RegionValue>({
  provinceCode: props.modelValue?.provinceCode || '',
  provinceName: props.modelValue?.provinceName || '',
  cityCode: props.modelValue?.cityCode || '',
  cityName: props.modelValue?.cityName || '',
  districtCode: props.modelValue?.districtCode || '',
  districtName: props.modelValue?.districtName || '',
});

// 省市区数据
const provinces = computed(() => {
  return regionData.map((item: any) => ({
    code: item.value,
    name: item.label,
  }));
});

const cities = computed(() => {
  if (!localValue.provinceCode) return [];
  const province = regionData.find((item: any) => item.value === localValue.provinceCode);
  if (!province || !province.children) return [];
  return province.children.map((item: any) => ({
    code: item.value,
    name: item.label,
  }));
});

const districts = computed(() => {
  if (!localValue.cityCode) return [];
  const province = regionData.find((item: any) => item.value === localValue.provinceCode);
  if (!province || !province.children) return [];
  const city = province.children.find((item: any) => item.value === localValue.cityCode);
  if (!city || !city.children) return [];
  return city.children.map((item: any) => ({
    code: item.value,
    name: item.label,
  }));
});

// 处理省份变化
const handleProvinceChange = (value: string) => {
  localValue.provinceCode = value;
  localValue.provinceName = codeToText[value] || '';
  localValue.cityCode = '';
  localValue.cityName = '';
  localValue.districtCode = '';
  localValue.districtName = '';
  emitValue();
};

// 处理城市变化
const handleCityChange = (value: string) => {
  localValue.cityCode = value;
  localValue.cityName = codeToText[value] || '';
  localValue.districtCode = '';
  localValue.districtName = '';
  emitValue();
};

// 处理区/县变化
const handleDistrictChange = (value: string) => {
  localValue.districtCode = value;
  localValue.districtName = codeToText[value] || '';
  emitValue();
};

// 触发值变化
const emitValue = () => {
  emit('update:modelValue', { ...localValue });
};

// 监听外部值变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      Object.assign(localValue, newValue);
    }
  },
  { deep: true }
);
</script>

<style lang="scss" scoped>
.region-selector {
  :deep(.el-form-item) {
    margin-bottom: 18px;
  }
}
</style>
