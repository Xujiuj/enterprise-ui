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
        <el-form-item v-for="field in orderedSearchFields" :key="field.prop" :label="displayLabel(field.label)"> 
          <el-select
            v-if="field.type === 'select'"
            v-model="queryParams[field.prop]"
            :placeholder="field.placeholder ?? `请选择${displayLabel(field.label)}`"
            clearable
            filterable
            :allow-create="Boolean(field.allowCreate)"
            :default-first-option="false"
            :reserve-keyword="false"
            class="w-full"
            :disabled="field.disabled"
            @change="(value: CrudValue) => handleQueryFieldChange(field, value)"
          >
            <el-option v-for="option in fieldOptions(field, queryParams)" :key="String(option.value)" :label="displayLabel(option.label)" :value="option.value" />
          </el-select>
          <component
            v-else
            :is="controlComponent(field)"
            v-bind="controlProps(field)"
            v-model="queryParams[field.prop]"
            @change="(value: CrudValue) => handleQueryFieldChange(field, value)"
            @keyup.enter="handleQuery"
          />
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
        <el-col v-if="canOnlineFill" :span="1.5"> 
          <el-button type="success" plain icon="Grid" @click="openSheetDrawer" v-hasPermi="[`${config.permissionPrefix}:add`]">在线填报</el-button> 
        </el-col> 
        <el-col v-if="canDownloadTemplate" :span="1.5">
          <el-button type="warning" plain icon="Download" @click="handleTemplateDownload" v-hasPermi="[`${config.permissionPrefix}:add`]">模板下载</el-button>
        </el-col>
        <el-col v-if="canImportRows" :span="1.5">
          <el-button :loading="importing" type="info" plain icon="Upload" @click="openImportFile" v-hasPermi="[`${config.permissionPrefix}:add`]">Excel上传</el-button>
          <input ref="importFileRef" class="crud-import-input" type="file" accept=".xlsx" @change="handleImportFileChange" />
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
          :label="displayLabel(column.label)" 
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
        <el-form-item
          v-for="field in visibleFormFields"
          :key="field.prop"
          :label="displayLabel(field.label)" 
          :prop="field.required ? field.prop : undefined"
          :required="field.required"
        >
          <el-select
            v-if="field.type === 'select'"
            v-model="form[field.prop]"
            :placeholder="field.placeholder ?? `请选择${displayLabel(field.label)}`"
            clearable
            filterable
            :allow-create="Boolean(field.allowCreate)"
            :default-first-option="false"
            :reserve-keyword="false"
            class="w-full"
            :disabled="field.disabled"
            @change="(value: CrudValue) => handleFieldChange(field, value)"
          >
            <el-option v-for="option in fieldOptions(field, form)" :key="String(option.value)" :label="displayLabel(option.label)" :value="option.value" />
          </el-select>
          <component
            v-else
            :is="controlComponent(field)"
            v-bind="controlProps(field)"
            v-model="form[field.prop]"
            @change="(value: CrudValue) => handleFieldChange(field, value)"
          />
        </el-form-item>
        <template v-if="showExtensionFieldsInCrudDrawer">
          <el-divider content-position="left">扩展字段</el-divider>
          <el-form-item v-for="field in extensionFields" :key="String(field.id)" :label="displayLabel(field.fieldName || field.fieldCode)"> 
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
          <el-form-item v-for="field in extensionFields" :key="String(field.id)" :label="displayLabel(field.fieldName || field.fieldCode)"> 
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

    <el-drawer v-model="sheetDrawer.visible" :title="`${config.title}在线填报`" size="92%" append-to-body destroy-on-close> 
      <SpreadsheetEditor 
        :title="config.title" 
        :columns="sheetColumns" 
        :rows="sheetRows" 
        :empty-row="sheetEmptyRow" 
        :saving="sheetSaving" 
        :hint="sheetHint" 
        @save="saveSheetRows" 
      /> 
    </el-drawer> 
  </div> 
</template> 

<script setup name="EnterpriseCrudPage" lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ElDatePicker, ElInput, ElInputNumber, ElMessage, ElMessageBox, ElSelect, ElSwitch, type FormInstance, type FormRules } from 'element-plus'; 
import { listExtensionFields, listExtensionFieldValues, saveExtensionFieldValuesBatch } from '@/api/enterprise/extensionField'; 
import type { ExtensionFieldVO, ExtensionFieldValueForm, ExtensionFieldValueVO } from '@/api/enterprise/extensionField/types'; 
import SpreadsheetEditor from '@/components/SpreadsheetEditor/index.vue'; 
import type { SpreadsheetColumn } from '@/components/SpreadsheetEditor/types'; 
import { useAutoQuery } from '@/hooks/useAutoQuery'; 
import { downloadXlsxTemplate } from '@/utils/xlsxTemplate';

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
  loadOptions?: (model?: CrudRecord) => Promise<SelectOption[]>;
  reloadOnProps?: string[];
  filterOptions?: (options: SelectOption[], model: CrudRecord) => SelectOption[];
  onChange?: (value: CrudValue, form: CrudRecord, option?: SelectOption) => void;
  clearFields?: string[];
  required?: boolean;
  placeholder?: string;
  precision?: number;
  disabled?: boolean;
  hidden?: boolean;
  allowCreate?: boolean;
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
  formatOptions?: boolean;
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
  moduleCode: string;
  ownerTableCode: string;
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
  importRows?: (file: File) => Promise<unknown>;
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
const importFileRef = ref<HTMLInputElement>();
const importing = ref(false);

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
const sheetDrawer = reactive({ 
  visible: false 
}); 
const sheetSaving = ref(false); 
 
const rules = computed<FormRules>(() => { 
  return props.config.formFields.reduce<FormRules>((acc, field) => { 
    if (field.required) { 
      acc[field.prop] = [{ required: true, message: `${displayLabel(field.label)}不能为空`, trigger: field.type === 'select' ? 'change' : 'blur' }]; 
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
  return Boolean(extension?.moduleCode && extension?.ownerTableCode);
});

const showExtensionFieldsInCrudDrawer = computed(() => extensionEnabled.value && !props.config.readonly && extensionFields.value.length > 0);

const showReadonlyExtensionAction = computed(() => extensionEnabled.value && Boolean(props.config.readonly) && extensionFields.value.length > 0);

const showActionColumn = computed(() => !props.config.readonly || (props.config.rowActions?.length ?? 0) > 0 || showReadonlyExtensionAction.value);

const columnOptions = ref<FieldOption[]>( 
  props.config.columns.map((column) => ({ 
    key: column.prop, 
    label: displayLabel(column.label), 
    visible: true, 
    children: [] 
  })) 
);

const syncColumnOptions = () => {
  const visibleByProp = new Map(columnOptions.value.map((item) => [String(item.key), item.visible])); 
  columnOptions.value = props.config.columns.map((column) => ({ 
    key: column.prop, 
    label: displayLabel(column.label), 
    visible: visibleByProp.get(column.prop) ?? true, 
    children: [] 
  })); 
};

const visibleColumns = computed(() => {
  const hiddenKeys = new Set(columnOptions.value.filter((item) => !item.visible).map((item) => String(item.key)));
  return props.config.columns.filter((column) => !hiddenKeys.has(column.prop));
});

const orderedSearchFields = computed<FieldConfig[]>(() => {
  const fieldsByProp = new Map(props.config.searchFields.map((field) => [field.prop, field]));
  const ordered = props.config.columns
    .map((column) => {
      const field = fieldsByProp.get(column.prop);
      return field ? { ...field, label: column.label } : undefined;
    })
    .filter((field): field is FieldConfig => Boolean(field));
  const orderedProps = new Set(ordered.map((field) => field.prop));
  return [...ordered, ...props.config.searchFields.filter((field) => !orderedProps.has(field.prop))];
});

const visibleFormFields = computed(() => props.config.formFields.filter((field) => !field.hidden)); 
const canOnlineFill = computed(() => !props.config.readonly && visibleFormFields.value.length > 0); 
const canDownloadTemplate = computed(() => canOnlineFill.value);
const canImportRows = computed(() => !props.config.readonly && Boolean(props.api.importRows));
const sheetFields = computed(() => visibleFormFields.value); 
const sheetColumns = computed<SpreadsheetColumn[]>(() => 
  sheetFields.value.map((field) => ({ 
    prop: field.prop, 
    label: displayLabel(field.label), 
    type: sheetColumnType(field), 
    required: field.required, 
    readonly: field.disabled, 
    precision: field.precision, 
    width: field.type === 'textarea' ? 220 : 170, 
    options: sheetFieldOptions(field),
    getOptions: field.type === 'select' ? (row) => sheetFieldOptions(field, row) : undefined,
    allowCreate: field.allowCreate,
    clearsOnChange: field.clearFields
  })) 
); 
const sheetEmptyRow = computed(() => 
  props.config.formFields.reduce<CrudRecord>((row, field) => { 
    row[field.prop] = props.config.emptyForm[field.prop]; 
    return row; 
  }, {}) 
); 
const sheetRows = computed(() => [{ ...sheetEmptyRow.value }]); 
const sheetHint = computed(() => `在线填报仅用于新增${props.config.title}。字段、必填项和联动规则与新增表单一致。`); 
 
const resetForm = () => { 
  form.value = { ...props.config.emptyForm }; 
  crudFormRef.value?.resetFields(); 
}; 
 
const shouldKeepOptionForModel = (field: FieldConfig, option: SelectOption, model?: CrudRecord) => {
  if (!model || !field.reloadOnProps?.length) {
    return true;
  }
  const record = optionRecord(option);
  if (!record) {
    return true;
  }
  return field.reloadOnProps.every((prop) => {
    const modelValue = model[prop];
    if (modelValue === undefined || modelValue === null || modelValue === '') {
      return true;
    }
    const recordValue = record[prop];
    return recordValue === undefined || recordValue === null || recordValue === '' || String(recordValue) === String(modelValue);
  });
};

const fieldOptions = (field: FieldConfig, model?: CrudRecord) => {
  const options = dynamicOptions[field.prop] ?? [];
  const scopedOptions = options.filter((option) => shouldKeepOptionForModel(field, option, model));
  return model && field.filterOptions ? field.filterOptions(scopedOptions, model) : scopedOptions;
}; 

const optionRecord = (option?: SelectOption) => option?.record?.record ?? option?.record;

function displayLabel(label?: string) { 
  return String(label ?? '').replace(/^(FK|PK|SK|BK)_/, ''); 
} 

const sheetColumnType = (field: FieldConfig): SpreadsheetColumn['type'] => { 
  if (field.type === 'number') return 'number'; 
  if (field.type === 'select' || field.type === 'switch') return 'select'; 
  if (field.type === 'date') return 'date'; 
  if (field.type === 'month') return 'month'; 
  return 'text'; 
}; 

const sheetFieldOptions = (field: FieldConfig, row?: CrudRecord) => { 
  if (field.type === 'switch') { 
    return [ 
      { label: '是', value: true }, 
      { label: '否', value: false } 
    ]; 
  } 
  return fieldOptions(field, row).map((option) => ({ ...option, label: displayLabel(option.label) })); 
}; 

const templateValidations = computed(() =>
  sheetColumns.value.reduce<Record<string, string[]>>((acc, column) => {
    if (column.type === 'select' && column.options?.length && !column.allowCreate) {
      acc[column.label] = column.options.map((option) => String(option.label ?? option.value ?? '')).filter(Boolean);
    }
    return acc;
  }, {})
);

const loadFieldOptions = async () => {
  const fields = [...orderedSearchFields.value, ...props.config.formFields];
  const uniqueLoaders = new Map<string, (model?: CrudRecord) => Promise<SelectOption[]>>();
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

const refreshDependentOptions = async (fields: FieldConfig[], model: CrudRecord, changedProp: string) => {
  const dependents = fields.filter((field) => field.loadOptions && field.reloadOnProps?.includes(changedProp));
  for (const field of dependents) {
    dynamicOptions[field.prop] = (await field.loadOptions?.(model)) ?? [];
  }
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
  for (const field of orderedSearchFields.value) {
    const value = firstQueryValue(route.query[field.prop]);
    if (value !== undefined && value !== null && value !== '') {
      queryParams[field.prop] = value;
    }
  }
};

const getList = async () => {
  loading.value = true;
  try {
    const res = await props.api.list(normalizedOptionPayload(queryParams, orderedSearchFields.value));
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
  await Promise.all(
    props.config.formFields
      .filter((field) => field.loadOptions && field.reloadOnProps?.length)
      .map(async (field) => {
        dynamicOptions[field.prop] = (await field.loadOptions?.(form.value)) ?? [];
      })
  );
  await loadExtensionValues(id);
  dialog.visible = true;
  dialog.title = `编辑${props.config.title}`;
};

const handleQueryFieldChange = async (field: FieldConfig, _value: CrudValue) => {
  field.clearFields?.forEach((prop) => {
    queryParams[prop] = undefined;
  });
  await refreshDependentOptions(orderedSearchFields.value, queryParams, field.prop);
};

const handleFieldChange = async (field: FieldConfig, value: CrudValue) => { 
  field.clearFields?.forEach((prop) => {
    form.value[prop] = undefined;
  });
  const option = fieldOptions(field, form.value).find((item) => String(item.value ?? '') === String(value ?? '')); 
  field.onChange?.(value, form.value, option);
  await refreshDependentOptions(props.config.formFields, form.value, field.prop);
}; 

const applyFieldChangeToRecord = (field: FieldConfig, target: CrudRecord) => { 
  if (!field.onChange) { 
    return; 
  } 
  const value = target[field.prop]; 
  const option = fieldOptions(field, target).find((item) => String(item.value ?? '') === String(value ?? '')); 
  field.onChange(value, target, option); 
}; 

const normalizeOptionBackedValues = (payload: CrudRecord, fields: FieldConfig[] = props.config.formFields) => {
  fields.forEach((field) => {
    const selected = fieldOptions(field, payload).find((option) => String(option.value ?? '') === String(payload[field.prop] ?? ''));
    const record = optionRecord(selected);
    if (record?.[field.prop] !== undefined && record?.[field.prop] !== null && record?.[field.prop] !== '') {
      payload[field.prop] = record[field.prop];
    }
    field.reloadOnProps?.forEach((prop) => {
      if ((payload[prop] === undefined || payload[prop] === null || payload[prop] === '') && record?.[prop] !== undefined && record?.[prop] !== null) {
        payload[prop] = record[prop];
      }
    });
  });
};

const normalizedOptionPayload = (source: CrudRecord, fields: FieldConfig[]) => {
  const payload = { ...source };
  normalizeOptionBackedValues(payload, fields);
  return payload;
};

const normalizeSheetRow = (row: CrudRecord) => { 
  const payload = { ...props.config.emptyForm, ...row }; 
  props.config.formFields.forEach((field) => applyFieldChangeToRecord(field, payload)); 
  normalizeOptionBackedValues(payload);
  return payload; 
}; 

const openSheetDrawer = () => { 
  sheetDrawer.visible = true; 
}; 

const handleTemplateDownload = async () => {
  await loadFieldOptions();
  downloadXlsxTemplate({
    fileName: `${props.config.title}导入模板.xlsx`,
    sheetName: props.config.title,
    headers: sheetColumns.value.map((column) => column.label),
    validations: templateValidations.value
  });
};

const openImportFile = () => {
  importFileRef.value?.click();
};

const handleImportFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (!file || !props.api.importRows) {
    return;
  }
  importing.value = true;
  try {
    await props.api.importRows(file);
    ElMessage.success('Excel上传成功');
    await getList();
  } finally {
    importing.value = false;
  }
};

const saveSheetRows = async (sheetRowsToSave: CrudRecord[]) => { 
  if (!sheetRowsToSave.length) { 
    ElMessage.warning('没有可保存的数据'); 
    return; 
  } 
  sheetSaving.value = true; 
  try { 
    for (const row of sheetRowsToSave) { 
      await props.api.add(normalizeSheetRow(row)); 
    } 
    ElMessage.success(`在线填报已保存 ${sheetRowsToSave.length} 条`); 
    sheetDrawer.visible = false; 
    await getList(); 
  } finally { 
    sheetSaving.value = false; 
  } 
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
    normalizeOptionBackedValues(form.value);
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
  const label = displayLabel(field.label); 
  const placeholder = field.placeholder ?? (isSelectionField ? `请选择${label}` : `请输入${label}`); 
  if (field.type === 'number') {
    return { placeholder, min: 0, precision: field.precision ?? 2, controlsPosition: 'right', class: 'w-full', disabled: field.disabled };
  }
  if (field.type === 'select') {
    return {
      placeholder,
      clearable: true,
      filterable: true,
      allowCreate: field.allowCreate,
      defaultFirstOption: field.allowCreate,
      class: 'w-full',
      disabled: field.disabled
    };
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
  const label = displayLabel(field.fieldName || field.fieldCode || '扩展字段'); 
  if (String(field.valueType ?? '').toLowerCase() === 'textarea') {
    return { placeholder: `请输入${label}`, type: 'textarea', rows: 3, maxlength: 500, showWordLimit: true };
  }
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
  const optionLabel = column.formatOptions === false ? undefined : dynamicOptions[column.prop]?.find((option) => String(option.value) === key)?.label;
  const displayValue = optionLabel ?? column.valueMap?.[key] ?? trimDecimalZeros(value);
  return displayValue === undefined || displayValue === null || displayValue === '' ? '-' : displayLabel(String(displayValue));
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
  void loadFieldOptions();
  void loadExtensionFields();
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

.crud-import-input {
  display: none;
}
</style>
