<template>
  <div class="p-2 enterprise-crud-page page-panel">
    <section class="page-head">
      <div>
        <h1>{{ config.title }}</h1>
        <p v-if="config.description">{{ config.description }}</p>
      </div>
    </section>

    <section class="panel">
      <el-form v-show="showSearch" :model="queryParams" inline label-width="96px" class="crud-search">
        <el-form-item v-for="field in config.searchFields" :key="field.prop" :label="field.label">
          <component :is="controlComponent(field)" v-bind="controlProps(field)" v-model="queryParams[field.prop]" @keyup.enter="handleQuery">
            <template v-if="field.type === 'select'">
              <el-option v-for="option in fieldOptions(field)" :key="String(option.value)" :label="option.label" :value="option.value" />
            </template>
          </component>
        </el-form-item>
        <div class="search-actions">
          <right-toolbar v-model:showSearch="showSearch" :columns="columnOptions" :gutter="0" @query-table="getList" />
        </div>
      </el-form>
      <div v-show="!showSearch" class="search-bar search-bar-collapsed">
        <div class="search-actions">
          <right-toolbar v-model:showSearch="showSearch" :columns="columnOptions" :gutter="0" @query-table="getList" />
        </div>
      </div>

      <el-row :gutter="10" class="mb-3">
        <el-col :span="1.5">
          <el-button v-if="!config.readonly" type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="[`${config.permissionPrefix}:add`]"
            >新增</el-button
          >
        </el-col>
        <el-col v-if="!config.readonly" :span="1.5">
          <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="[`${config.permissionPrefix}:remove`]"
            >删除</el-button
          >
        </el-col>
        <el-col :span="1.5">
          <slot name="toolbar-actions" :refresh="getList" :loading="loading" />
        </el-col>
      </el-row>

      <el-table v-loading="loading" :data="rows" @selection-change="handleSelectionChange">
        <el-table-column v-if="!config.readonly" type="selection" width="48" align="center" />
        <el-table-column
          v-for="column in visibleColumns"
          :key="column.prop"
          :label="column.label"
          :prop="column.prop"
          :width="column.width"
          :min-width="column.minWidth"
          :show-overflow-tooltip="column.showOverflow ?? true"
        >
          <template #default="scope">
            <el-tag v-if="column.type === 'tag'" :type="resolveTagType(column, scope.row[column.prop])">
              {{ formatValue(column, scope.row[column.prop]) }}
            </el-tag>
            <el-switch v-else-if="column.type === 'switch'" :model-value="Boolean(scope.row[column.prop])" disabled />
            <span v-else>{{ formatValue(column, scope.row[column.prop]) }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="showActionColumn" label="操作" align="center" :width="actionColumnWidth" fixed="right">
          <template #default="scope">
            <el-button
              v-if="!config.readonly"
              link
              type="primary"
              icon="Edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="[`${config.permissionPrefix}:edit`]"
              >编辑</el-button
            >
            <el-button
              v-if="!config.readonly"
              link
              type="danger"
              icon="Delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="[`${config.permissionPrefix}:remove`]"
              >删除</el-button
            >
            <template v-for="action in props.config.rowActions ?? []" :key="action.key">
              <el-button
                v-if="isRowActionVisible(action, scope.row)"
                link
                :type="resolveActionType(action)"
                :icon="action.icon"
                :disabled="action.disabled?.(scope.row) ?? false"
                @click="action.handler(scope.row)"
                v-hasPermi="[action.permission]"
              >
                {{ action.label }}
              </el-button>
            </template>
            <el-button
              v-if="showReadonlyExtensionAction"
              link
              type="primary"
              icon="EditPen"
              @click="handleExtensionUpdate(scope.row)"
              v-hasPermi="['enterprise:extensionFieldValue:edit']"
            >
              扩展字段
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </section>

    <el-drawer v-model="dialog.visible" :title="dialog.title" size="620px" append-to-body>
      <el-form ref="crudFormRef" :model="form" :rules="rules" label-width="132px">
        <el-form-item v-for="field in config.formFields" :key="field.prop" :label="field.label" :prop="field.required ? field.prop : undefined">
          <component
            :is="controlComponent(field)"
            v-bind="controlProps(field)"
            v-model="form[field.prop]"
            @change="(value: CrudValue) => handleFieldChange(field, value)"
          >
            <template v-if="field.type === 'select'">
              <el-option v-for="option in fieldOptions(field)" :key="String(option.value)" :label="option.label" :value="option.value" />
            </template>
          </component>
        </el-form-item>
        <template v-if="showExtensionFieldsInCrudDrawer">
          <el-divider content-position="left">扩展字段</el-divider>
          <el-form-item v-for="field in extensionFields" :key="String(field.id)" :label="field.fieldName || field.fieldCode">
            <component
              :is="extensionControlComponent(field)"
              v-bind="extensionControlProps(field)"
              v-model="extensionValues[extensionFieldKey(field)]"
            />
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <el-button :loading="buttonLoading" type="primary" @click="submitForm">确定</el-button>
        <el-button @click="cancel">取消</el-button>
      </template>
    </el-drawer>

    <el-drawer v-model="extensionDialog.visible" :title="extensionDialog.title" size="560px" append-to-body>
      <el-form label-width="132px">
        <template v-if="extensionFields.length > 0">
          <el-form-item v-for="field in extensionFields" :key="String(field.id)" :label="field.fieldName || field.fieldCode">
            <component
              :is="extensionControlComponent(field)"
              v-bind="extensionControlProps(field)"
              v-model="extensionValues[extensionFieldKey(field)]"
            />
          </el-form-item>
        </template>
        <el-empty v-else description="暂无可维护的扩展字段" />
      </el-form>
      <template #footer>
        <el-button :loading="extensionSaving" type="primary" @click="submitExtensionValues">保存</el-button>
        <el-button @click="cancelExtensionDialog">取消</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup name="EnterpriseCrudPage" lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ElDatePicker, ElInput, ElInputNumber, ElMessage, ElMessageBox, ElSelect, ElSwitch, type FormInstance, type FormRules } from 'element-plus';
import { listExtensionFields, listExtensionFieldValues, saveExtensionFieldValuesBatch } from '@/api/enterprise/extensionField';
import type { ExtensionFieldVO, ExtensionFieldValueForm, ExtensionFieldValueVO } from '@/api/enterprise/extensionField/types';
import { useAutoQuery } from '@/hooks/useAutoQuery';

type CrudValue = string | number | boolean | undefined | null;
type CrudRecord = Record<string, any>;

interface SelectOption {
  label: string;
  value: string | number | boolean;
  record?: CrudRecord;
}

interface FieldConfig {
  prop: string;
  label: string;
  type?: string;
  loadOptions?: () => Promise<SelectOption[]>;
  onChange?: (value: CrudValue, form: CrudRecord, option?: SelectOption) => void;
  required?: boolean;
  placeholder?: string;
  precision?: number;
  disabled?: boolean;
}

interface ColumnConfig {
  prop: string;
  label: string;
  width?: number | string;
  minWidth?: number | string;
  type?: string;
  showOverflow?: boolean;
  valueMap?: Record<string, string>;
  tagMap?: Record<string, string>;
}

interface RowActionConfig {
  key: string;
  label: string;
  permission: string;
  type?: string;
  icon?: string;
  disabled?: (row: CrudRecord) => boolean;
  visible?: (row: CrudRecord) => boolean;
  handler: (row: CrudRecord) => void | Promise<void>;
}

interface ExtensionConfig {
  moduleCode: 'activity_data' | 'green_electricity' | 'intensity_denominator';
  ownerTableCode: 'ce_activity_data' | 'ce_green_power_certificate' | 'ce_intensity_denominator_fact';
}

interface CrudConfig {
  title: string;
  description?: string;
  permissionPrefix: string;
  columns: ColumnConfig[];
  searchFields: FieldConfig[];
  formFields: FieldConfig[];
  emptyForm: CrudRecord;
  readonly?: boolean;
  rowActions?: RowActionConfig[];
  extension?: ExtensionConfig;
}

interface PageResponse {
  rows?: CrudRecord[];
  data?: CrudRecord[];
  total?: number | string;
}

interface CrudApi {
  list: (query?: CrudRecord) => Promise<PageResponse>;
  get: (id: string | number) => Promise<unknown>;
  add: (data: CrudRecord) => Promise<unknown>;
  update: (data: CrudRecord) => Promise<unknown>;
  remove: (id: string | number | Array<string | number>) => Promise<unknown>;
}

const props = defineProps<{
  config: CrudConfig;
  api: CrudApi;
}>();

const route = useRoute();
const loading = ref(false);
const buttonLoading = ref(false);
const showSearch = ref(true);
const rows = ref<CrudRecord[]>([]);
const total = ref(0);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const crudFormRef = ref<FormInstance>();

const queryParams = reactive<CrudRecord>({
  pageNum: 1,
  pageSize: 10
});

const form = ref<CrudRecord>({});
const dynamicOptions = reactive<Record<string, SelectOption[]>>({});
const dialog = reactive({
  visible: false,
  title: ''
});
const extensionFields = ref<ExtensionFieldVO[]>([]);
const extensionValueRows = ref<Record<string, ExtensionFieldValueVO>>({});
const extensionValues = reactive<Record<string, any>>({});
const extensionSaving = ref(false);
const extensionOwnerId = ref<string | number>();
const extensionDialog = reactive({
  visible: false,
  title: ''
});

const allowedExtensionModules = ['activity_data', 'green_electricity', 'intensity_denominator'];

const rules = computed<FormRules>(() => {
  return props.config.formFields.reduce<FormRules>((acc, field) => {
    if (field.required) {
      acc[field.prop] = [{ required: true, message: `${field.label}不能为空`, trigger: field.type === 'select' ? 'change' : 'blur' }];
    }
    return acc;
  }, {});
});

const actionColumnWidth = computed(() => {
  const actionCount = (props.config.readonly ? 0 : 2) + (props.config.rowActions?.length ?? 0) + (showReadonlyExtensionAction.value ? 1 : 0);
  return Math.max(150, actionCount * 72);
});

const extensionEnabled = computed(() => {
  const extension = props.config.extension;
  return Boolean(extension && allowedExtensionModules.includes(extension.moduleCode));
});

const showExtensionFieldsInCrudDrawer = computed(() => extensionEnabled.value && !props.config.readonly && extensionFields.value.length > 0);

const showReadonlyExtensionAction = computed(() => extensionEnabled.value && Boolean(props.config.readonly) && extensionFields.value.length > 0);

const showActionColumn = computed(() => !props.config.readonly || (props.config.rowActions?.length ?? 0) > 0 || showReadonlyExtensionAction.value);

const columnOptions = ref<FieldOption[]>(
  props.config.columns.map((column) => ({
    key: column.prop,
    label: column.label,
    visible: true,
    children: []
  }))
);

const syncColumnOptions = () => {
  const visibleByProp = new Map(columnOptions.value.map((item) => [String(item.key), item.visible]));
  columnOptions.value = props.config.columns.map((column) => ({
    key: column.prop,
    label: column.label,
    visible: visibleByProp.get(column.prop) ?? true,
    children: []
  }));
};

const visibleColumns = computed(() => {
  const hiddenKeys = new Set(columnOptions.value.filter((item) => !item.visible).map((item) => String(item.key)));
  return props.config.columns.filter((column) => !hiddenKeys.has(column.prop));
});

const resetForm = () => {
  form.value = { ...props.config.emptyForm };
  crudFormRef.value?.resetFields();
};

const fieldOptions = (field: FieldConfig) => dynamicOptions[field.prop] ?? [];

const loadFieldOptions = async () => {
  const fields = [...props.config.searchFields, ...props.config.formFields];
  const uniqueLoaders = new Map<string, () => Promise<SelectOption[]>>();
  fields.forEach((field) => {
    if (field.loadOptions) {
      uniqueLoaders.set(field.prop, field.loadOptions);
    }
  });
  await Promise.all(
    Array.from(uniqueLoaders.entries()).map(async ([prop, loader]) => {
      dynamicOptions[prop] = await loader();
    })
  );
};

const resetExtensionValues = () => {
  Object.keys(extensionValues).forEach((key) => delete extensionValues[key]);
  extensionValueRows.value = {};
  extensionOwnerId.value = undefined;
};

const firstQueryValue = (value: unknown) => {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
};

const applyRouteQueryParams = () => {
  for (const field of props.config.searchFields) {
    const value = firstQueryValue(route.query[field.prop]);
    if (value !== undefined && value !== null && value !== '') {
      queryParams[field.prop] = value;
    }
  }
};

const getList = async () => {
  loading.value = true;
  try {
    const res = await props.api.list(queryParams);
    rows.value = res.rows ?? res.data ?? [];
    total.value = Number(res.total ?? rows.value.length);
  } finally {
    loading.value = false;
  }
};

const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
};

const resetQuery = () => {
  Object.keys(queryParams).forEach((key) => {
    if (!['pageNum', 'pageSize'].includes(key)) {
      queryParams[key] = undefined;
    }
  });
  handleQuery();
};

const handleSelectionChange = (selection: CrudRecord[]) => {
  ids.value = selection.map((item) => item.id).filter(Boolean);
  single.value = selection.length !== 1;
  multiple.value = selection.length === 0;
};

const handleAdd = () => {
  resetForm();
  resetExtensionValues();
  dialog.visible = true;
  dialog.title = `新增${props.config.title}`;
};

const unwrapData = <T,>(response: unknown): T => {
  const payload = response as { data?: T };
  return payload.data ?? (response as T);
};

const handleUpdate = async (row: CrudRecord) => {
  resetForm();
  const id = row.id ?? ids.value[0];
  const res = await props.api.get(id);
  form.value = unwrapData<CrudRecord>(res);
  await loadExtensionValues(id);
  dialog.visible = true;
  dialog.title = `编辑${props.config.title}`;
};

const handleFieldChange = (field: FieldConfig, value: CrudValue) => {
  if (!field.onChange) {
    return;
  }
  const option = fieldOptions(field).find((item) => item.value === value);
  field.onChange(value, form.value, option);
};

const resolveSavedRecordId = (response: unknown, fallback?: string | number) => {
  const payload = response as { data?: unknown; id?: string | number };
  const data = payload?.data;
  if (typeof data === 'string' || typeof data === 'number') {
    return data;
  }
  if (data && typeof data === 'object' && 'id' in data) {
    return (data as { id?: string | number }).id;
  }
  return payload?.id ?? fallback;
};

const submitForm = async () => {
  await crudFormRef.value?.validate();
  buttonLoading.value = true;
  try {
    let savedId = form.value.id as string | number | undefined;
    if (form.value.id) {
      await props.api.update(form.value);
      await saveExtensionValuesAfterMainRecordSaved(savedId);
      ElMessage.success('修改成功');
    } else {
      const response = await props.api.add(form.value);
      savedId = resolveSavedRecordId(response, savedId);
      await saveExtensionValuesAfterMainRecordSaved(savedId);
      ElMessage.success('新增成功');
    }
    dialog.visible = false;
    await getList();
  } finally {
    buttonLoading.value = false;
  }
};

const handleDelete = async (row?: CrudRecord) => {
  const targetIds = row?.id ?? ids.value;
  await ElMessageBox.confirm(`是否确认删除编号为“${targetIds}”的数据项？`, '系统提示', { type: 'warning' });
  await props.api.remove(targetIds);
  ElMessage.success('删除成功');
  await getList();
};

const handleExtensionUpdate = async (row: CrudRecord) => {
  resetExtensionValues();
  await loadExtensionValues(row.id);
  extensionDialog.title = `${props.config.title}扩展字段`;
  extensionDialog.visible = true;
};

const isRowActionVisible = (action: RowActionConfig, row: CrudRecord) => {
  return action.visible ? action.visible(row) : true;
};

const cancel = () => {
  dialog.visible = false;
  resetForm();
  resetExtensionValues();
};

const cancelExtensionDialog = () => {
  extensionDialog.visible = false;
  resetExtensionValues();
};

const controlComponent = (field: FieldConfig) => {
  if (field.type === 'number') {
    return ElInputNumber;
  }
  if (field.type === 'select') {
    return ElSelect;
  }
  if (field.type === 'date') {
    return ElDatePicker;
  }
  if (field.type === 'month') {
    return ElDatePicker;
  }
  if (field.type === 'textarea') {
    return ElInput;
  }
  if (field.type === 'switch') {
    return ElSwitch;
  }
  return ElInput;
};

const controlProps = (field: FieldConfig) => {
  const isSelectionField = field.type === 'select' || field.type === 'date';
  const placeholder = field.placeholder ?? (isSelectionField ? `请选择${field.label}` : `请输入${field.label}`);
  if (field.type === 'number') {
    return { placeholder, min: 0, precision: field.precision ?? 2, controlsPosition: 'right', class: 'w-full', disabled: field.disabled };
  }
  if (field.type === 'select') {
    return { placeholder, clearable: true, filterable: true, class: 'w-full', disabled: field.disabled };
  }
  if (field.type === 'date') {
    return { placeholder, type: 'date', valueFormat: 'YYYY-MM-DD', class: 'w-full', disabled: field.disabled };
  }
  if (field.type === 'month') {
    return { placeholder, type: 'month', valueFormat: 'YYYY-MM', class: 'w-full', disabled: field.disabled };
  }
  if (field.type === 'textarea') {
    return { placeholder, type: 'textarea', rows: 3, maxlength: 300, showWordLimit: true, disabled: field.disabled };
  }
  if (field.type === 'switch') {
    return { activeValue: true, inactiveValue: false, disabled: field.disabled };
  }
  return { placeholder, clearable: true, class: 'w-full', disabled: field.disabled };
};

const extensionFieldKey = (field: ExtensionFieldVO) => String(field.id);

const extensionValueProp = (field: ExtensionFieldVO): keyof ExtensionFieldValueForm => {
  const valueType = String(field.valueType ?? 'text').toLowerCase();
  if (['number', 'decimal', 'numeric', 'integer'].includes(valueType)) {
    return 'decimalValue';
  }
  if (valueType === 'date') {
    return 'dateValue';
  }
  if (['boolean', 'bool'].includes(valueType)) {
    return 'booleanValue';
  }
  return 'textValue';
};

const extensionControlComponent = (field: ExtensionFieldVO) => {
  const prop = extensionValueProp(field);
  if (prop === 'decimalValue') {
    return ElInputNumber;
  }
  if (prop === 'dateValue') {
    return ElDatePicker;
  }
  if (prop === 'booleanValue') {
    return ElSwitch;
  }
  return ElInput;
};

const extensionControlProps = (field: ExtensionFieldVO) => {
  const label = field.fieldName || field.fieldCode || '扩展字段';
  const prop = extensionValueProp(field);
  if (prop === 'decimalValue') {
    return { placeholder: `请输入${label}`, min: 0, precision: 4, controlsPosition: 'right', class: 'w-full' };
  }
  if (prop === 'dateValue') {
    return { placeholder: `请选择${label}`, type: 'date', valueFormat: 'YYYY-MM-DD', class: 'w-full' };
  }
  if (prop === 'booleanValue') {
    return { activeValue: true, inactiveValue: false };
  }
  return { placeholder: `请输入${label}`, clearable: true };
};

const normalizeExtensionValue = (field: ExtensionFieldVO, value: unknown) => {
  const prop = extensionValueProp(field);
  if (value === undefined || value === null || value === '') {
    return null;
  }
  if (prop === 'decimalValue') {
    return Number(value);
  }
  if (prop === 'booleanValue') {
    return Boolean(value);
  }
  return value as string;
};

const hasExtensionValue = (field: ExtensionFieldVO, value: unknown, existing?: ExtensionFieldValueVO) => {
  if (existing?.id) {
    return true;
  }
  if (extensionValueProp(field) === 'booleanValue') {
    return value === true;
  }
  return value !== undefined && value !== null && value !== '';
};

const loadExtensionFields = async () => {
  if (!extensionEnabled.value || !props.config.extension) {
    extensionFields.value = [];
    return;
  }
  const res = await listExtensionFields({
    moduleCode: props.config.extension.moduleCode,
    enabledFlag: true,
    pageNum: 1,
    pageSize: 200
  });
  extensionFields.value = (res.rows ?? res.data ?? []).filter((field) => field.enabledFlag !== false && field.id != null);
};

const loadExtensionValues = async (ownerId?: string | number) => {
  resetExtensionValues();
  if (!extensionEnabled.value || !props.config.extension || !ownerId) {
    return;
  }
  extensionOwnerId.value = ownerId;
  const res = await listExtensionFieldValues({
    ownerTableCode: props.config.extension.ownerTableCode,
    ownerRecordId: ownerId,
    pageNum: 1,
    pageSize: 200
  });
  const rows = res.rows ?? res.data ?? [];
  extensionValueRows.value = rows.reduce<Record<string, ExtensionFieldValueVO>>((acc, item) => {
    if (item.extensionFieldId != null) {
      acc[String(item.extensionFieldId)] = item;
    }
    return acc;
  }, {});
  for (const field of extensionFields.value) {
    const key = extensionFieldKey(field);
    const row = extensionValueRows.value[key];
    if (row) {
      extensionValues[key] = row[extensionValueProp(field)];
    }
  }
};

const buildExtensionPayload = (field: ExtensionFieldVO, ownerId: string | number, existing?: ExtensionFieldValueVO): ExtensionFieldValueForm => {
  const prop = extensionValueProp(field);
  return {
    id: existing?.id,
    ownerTableCode: props.config.extension?.ownerTableCode,
    ownerRecordId: ownerId,
    extensionFieldId: field.id,
    textValue: null,
    decimalValue: null,
    dateValue: null,
    booleanValue: null,
    [prop]: normalizeExtensionValue(field, extensionValues[extensionFieldKey(field)])
  };
};

const saveExtensionValues = async (ownerId?: string | number) => {
  if (!extensionEnabled.value || !ownerId) {
    return;
  }
  const payloads = extensionFields.value
    .map((field) => {
      const key = extensionFieldKey(field);
      const existing = extensionValueRows.value[key];
      if (!hasExtensionValue(field, extensionValues[key], existing)) {
        return undefined;
      }
      return buildExtensionPayload(field, ownerId, existing);
    })
    .filter((payload): payload is ExtensionFieldValueForm => Boolean(payload));
  if (payloads.length > 0) {
    await saveExtensionFieldValuesBatch(payloads);
  }
};

const saveExtensionValuesAfterMainRecordSaved = async (ownerId?: string | number) => {
  try {
    await saveExtensionValues(ownerId);
  } catch (error) {
    await getList();
    ElMessage.warning('主记录已保存，扩展字段保存失败，请重新打开记录核对后保存。');
    throw error;
  }
};

const submitExtensionValues = async () => {
  extensionSaving.value = true;
  try {
    await saveExtensionValues(extensionOwnerId.value);
    ElMessage.success('扩展字段已保存');
    extensionDialog.visible = false;
  } finally {
    extensionSaving.value = false;
  }
};

const trimDecimalZeros = (value: CrudValue) => {
  if (value === undefined || value === null || value === '') {
    return value;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(Number(value.toFixed(10))) : value;
  }
  if (typeof value !== 'string') {
    return value;
  }
  const text = value.trim();
  if (!/^-?\d+(\.\d+)?$/.test(text)) {
    return value;
  }
  if (!text.includes('.')) {
    return value;
  }
  return text.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '');
};

const formatValue = (column: ColumnConfig, value: CrudValue) => {
  const key = String(value ?? '');
  const optionLabel = dynamicOptions[column.prop]?.find((option) => String(option.value) === key)?.label;
  return optionLabel ?? column.valueMap?.[key] ?? trimDecimalZeros(value) ?? '-';
};

const resolveTagType = (column: ColumnConfig, value: CrudValue): any => {
  return column.tagMap?.[String(value ?? '')] ?? 'info';
};

const resolveActionType = (action: RowActionConfig): any => {
  return action.type ?? 'primary';
};

onMounted(async () => {
  syncColumnOptions();
  resetForm();
  applyRouteQueryParams();
  await loadFieldOptions();
  await loadExtensionFields();
  getList();
});

watch(
  () => props.config.columns,
  () => syncColumnOptions(),
  { deep: true }
);

useAutoQuery(queryParams, () => handleQuery());

defineExpose({
  refresh: getList
});
</script>

<style scoped>
.crud-search {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 14px;
  margin-bottom: 12px;
  padding: 14px 16px;
  border: 1px solid var(--carbon-soft-line);
  border-radius: 8px;
  background: linear-gradient(180deg, var(--carbon-panel-soft), var(--carbon-panel));
}

.crud-search :deep(.el-form-item) {
  display: flex;
  flex: 1 1 260px;
  max-width: 340px;
  margin-right: 0;
  margin-bottom: 0;
}

.crud-search :deep(.el-form-item:last-child) {
  flex: 0 0 auto;
  max-width: none;
}

.crud-search :deep(.el-form-item__content) {
  min-width: 0;
  width: 100%;
}

.crud-search :deep(.el-input),
.crud-search :deep(.el-select),
.crud-search :deep(.el-date-editor),
.crud-search :deep(.el-input-number) {
  width: 100%;
  min-width: 0;
}

.w-full {
  width: 100%;
}
</style>
