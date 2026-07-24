<template>
  <div v-loading="loading" class="dynamic-page-host">
    <enterprise-crud-page v-if="schema && crudConfig && crudApi" :key="schema.moduleCode" :config="crudConfig" :api="crudApi" />
    <el-result v-else-if="errorMessage" icon="error" title="页面加载失败" :sub-title="errorMessage" />
  </div>
</template>

<script setup lang="ts" name="EnterpriseDynamicPage">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import EnterpriseCrudPage from '@/views/enterprise/components/EnterpriseCrudPage.vue';
import {
  addDynamicRecord,
  deleteDynamicRecord,
  getDynamicRecord,
  getDynamicSchema,
  importDynamicRecords,
  listDynamicRecords,
  updateDynamicRecord
} from '@/api/enterprise/dynamicModule';
import type { DynamicFieldDefinition, DynamicModuleSchema } from '@/api/enterprise/dynamicModule/types';

const route = useRoute();
const loading = ref(false);
const errorMessage = ref('');
const schema = ref<DynamicModuleSchema>();

const unwrapData = <T,>(response: unknown): T => {
  const payload = response as { data?: T };
  return payload?.data ?? (response as T);
};

const moduleCode = computed(() => String(route.query.moduleCode ?? ''));

const controlType = (field: DynamicFieldDefinition) => {
  if (field.uiType === 'number' || field.valueType === 'number') return 'number';
  if (field.uiType === 'date' || field.valueType === 'date') return 'date';
  if (field.uiType === 'switch' || field.valueType === 'boolean') return 'switch';
  if (field.uiType === 'textarea') return 'textarea';
  return 'input';
};

const toFieldConfig = (field: DynamicFieldDefinition) => ({
  prop: field.fieldCode,
  label: field.fieldName,
  type: controlType(field),
  required: field.required,
  precision: field.valueType === 'number' ? (field.scale ?? 2) : undefined
});

const crudConfig = computed(() => {
  if (!schema.value) return undefined;
  const emptyForm = schema.value.fields.reduce<Record<string, unknown>>((result, field) => {
    result[field.fieldCode] = field.valueType === 'boolean' ? false : undefined;
    return result;
  }, {});
  return {
    title: schema.value.moduleName,
    description: schema.value.sheetName ? '由 Excel 工作表“' + schema.value.sheetName + '”生成' : 'Excel 动态管理页面',
    permissionPrefix: schema.value.permissionPrefix,
    columns: schema.value.fields
      .filter((field) => field.listVisible)
      .map((field) => ({
        prop: field.fieldCode,
        label: field.fieldName,
        type: field.valueType === 'boolean' ? 'switch' : undefined,
        minWidth: field.uiType === 'textarea' ? 220 : 140
      })),
    searchFields: schema.value.fields.filter((field) => field.searchable).map(toFieldConfig),
    formFields: schema.value.fields.filter((field) => field.formVisible).map(toFieldConfig),
    emptyForm
  };
});

const crudApi = computed(() => {
  const code = schema.value?.moduleCode;
  if (!code) return undefined;
  return {
    list: (query?: Record<string, any>) => listDynamicRecords(code, query),
    get: (id: string | number) => getDynamicRecord(code, id),
    add: (data: Record<string, any>) => addDynamicRecord(code, data),
    update: (data: Record<string, any>) => updateDynamicRecord(code, data),
    remove: (ids: string | number | Array<string | number>) => deleteDynamicRecord(code, ids),
    importRows: (file: File) => importDynamicRecords(code, file)
  };
});

const loadSchema = async () => {
  if (!moduleCode.value) {
    schema.value = undefined;
    errorMessage.value = '菜单缺少 moduleCode 参数';
    return;
  }
  loading.value = true;
  errorMessage.value = '';
  try {
    schema.value = unwrapData<DynamicModuleSchema>(await getDynamicSchema(moduleCode.value));
  } catch (error) {
    schema.value = undefined;
    errorMessage.value = error instanceof Error ? error.message : '无法读取动态页面配置';
  } finally {
    loading.value = false;
  }
};

watch(moduleCode, loadSchema, { immediate: true });
</script>

<style scoped>
.dynamic-page-host {
  min-height: 320px;
}
</style>
