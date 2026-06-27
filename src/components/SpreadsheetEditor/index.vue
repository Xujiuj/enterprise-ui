<template>
  <div class="spreadsheet-editor">
    <div class="spreadsheet-toolbar">
      <div class="spreadsheet-summary">
        <strong>{{ title }}</strong>
        <span>{{ rowCountText }}</span>
        <el-tag v-if="errorCount" type="danger" size="small">{{ errorCount }} 个错误</el-tag>
        <el-tag v-else type="success" size="small">可保存</el-tag>
      </div>
      <div class="spreadsheet-actions">
        <el-radio-group v-model="editorMode" size="small">
          <el-radio-button value="table">表格编辑</el-radio-button>
          <el-radio-button value="sheet">Excel 编辑</el-radio-button>
        </el-radio-group>
        <el-button icon="Refresh" @click="reloadWorkbook">重载表格</el-button>
        <el-button type="primary" icon="Check" :loading="saving" :disabled="!canSave" @click="emitSave">保存表格</el-button>
      </div>
    </div>

    <el-alert v-if="hint" class="spreadsheet-hint" type="info" :closable="false" show-icon>
      <template #title>{{ hint }}</template>
    </el-alert>

    <div v-show="editorMode === 'sheet'" class="univer-shell">
      <div ref="containerRef" class="univer-container" />
      <div v-if="loading" class="univer-loading">正在加载在线 Excel 编辑器...</div>
    </div>

    <div v-show="editorMode === 'table'" class="table-editor-shell">
      <el-table :data="cachedRows" border height="620">
        <el-table-column label="序号" type="index" width="62" align="center" fixed />
        <el-table-column
          v-for="column in columns"
          :key="column.prop"
          :label="column.required ? `${column.label} *` : column.label"
          :min-width="column.width ?? 160"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <el-select
              v-if="column.type === 'select' && !column.readonly"
              v-model="row[column.prop]"
              filterable
              clearable
              class="cell-control"
            >
              <el-option v-for="option in column.options ?? []" :key="String(option.value)" :label="option.label" :value="option.value" />
            </el-select>
            <el-input-number
              v-else-if="column.type === 'number' && !column.readonly"
              v-model="row[column.prop]"
              :min="column.min"
              :precision="column.precision"
              controls-position="right"
              class="cell-control"
            />
            <el-date-picker
              v-else-if="(column.type === 'date' || column.type === 'month') && !column.readonly"
              v-model="row[column.prop]"
              :value-format="column.type === 'month' ? 'YYYY-MM' : 'YYYY-MM-DD'"
              :type="column.type === 'month' ? 'month' : 'date'"
              class="cell-control"
            />
            <el-input v-else v-model="row[column.prop]" :disabled="column.readonly" class="cell-control" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="82" fixed="right" align="center">
          <template #default="{ $index }">
            <el-button link type="danger" icon="Delete" @click="removeRow($index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="table-row-add">
        <el-button circle icon="Plus" @click="addRow" />
      </div>
    </div>

    <div v-if="errorCount" class="spreadsheet-errors">
      <div v-for="error in flatErrors" :key="error" class="spreadsheet-error">{{ error }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, markRaw, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';
import { ElMessage } from 'element-plus';
import type { SpreadsheetColumn, SpreadsheetValue } from './types';
import { loadUniverSheetsCore } from './univerLoader';

type UniverApi = {
  createWorkbook: (data: Record<string, any>) => unknown;
};

type UniverInstance = {
  dispose: () => void;
};

type UniverWorkbook = {
  save: () => Record<string, any>;
  getActiveSheet: () => UniverWorksheet | null;
};

type UniverWorksheet = {
  insertRowsAfter: (afterPosition: number, howMany: number) => UniverWorksheet;
};

type SpreadsheetRow = Record<string, any> & {
  id?: string | number;
};

const props = withDefaults(
  defineProps<{
    title: string;
    columns: SpreadsheetColumn[];
    rows: Record<string, any>[];
    emptyRow: Record<string, any>;
    saving?: boolean;
    hint?: string;
    allowEmptySave?: boolean;
  }>(),
  {
    saving: false,
    hint: '',
    allowEmptySave: false
  }
);

const emit = defineEmits<{
  save: [rows: Record<string, any>[]];
}>();

const containerRef = ref<HTMLDivElement>();
const loading = ref(false);
const workbookRef = shallowRef<UniverWorkbook>();
const univerRef = shallowRef<UniverInstance>();
const cachedRows = ref<SpreadsheetRow[]>([]);
const validationErrors = ref<Map<number, Record<string, string>>>(new Map());
const editorMode = ref<'table' | 'sheet'>('table');
let workbookSeed = 1;
const rowIdProp = '__row_id';

const visibleRowCount = computed(() => Math.max(cachedRows.value.length + 10, 30));
const rowCountText = computed(() => `${cachedRows.value.length} 行业务数据`);
const errorCount = computed(() => {
  let count = 0;
  validationErrors.value.forEach((rowErrors) => {
    count += Object.keys(rowErrors).length;
  });
  return count;
});
const flatErrors = computed(() => {
  const errors: string[] = [];
  validationErrors.value.forEach((rowErrors, rowIndex) => {
    Object.values(rowErrors).forEach((message) => errors.push(`第 ${rowIndex + 2} 行：${message}`));
  });
  return errors.slice(0, 6);
});
const canSave = computed(() => !props.saving && !loading.value);

const isBlank = (value: unknown) => value === undefined || value === null || value === '';
const toCellValue = (value: unknown): SpreadsheetValue => (value === undefined || value === null ? '' : (value as SpreadsheetValue));

const normalizeValue = (column: SpreadsheetColumn, value: SpreadsheetValue) => {
  if (isBlank(value)) {
    return undefined;
  }
  if (column.type === 'number') {
    return Number(value);
  }
  return typeof value === 'string' ? value.trim() : value;
};

const cloneRows = () => (props.rows ?? []).map((row) => ({ ...props.emptyRow, ...row }));

const rowHasValue = (row: SpreadsheetRow) =>
  props.columns.some((column) => {
    const value = row[column.prop];
    return !isBlank(value);
  });

const compactRows = (rows: SpreadsheetRow[]) => rows.filter(rowHasValue);

const buildWorkbookData = () => {
  const sheetId = `sheet-${workbookSeed}`;
  const cellData: Record<number, Record<number, { v: SpreadsheetValue; s?: string }>> = {};
  cellData[0] = {};
  props.columns.forEach((column, columnIndex) => {
    cellData[0][columnIndex] = { v: column.required ? `${column.label} *` : column.label, s: 'header' };
  });
  cachedRows.value.forEach((row, rowIndex) => {
    const sheetRowIndex = rowIndex + 1;
    cellData[sheetRowIndex] = {};
    props.columns.forEach((column, columnIndex) => {
      cellData[sheetRowIndex][columnIndex] = { v: toCellValue(row[column.prop]) };
    });
    cellData[sheetRowIndex][props.columns.length] = { v: toCellValue(row.id) };
  });
  cellData[0][props.columns.length] = { v: rowIdProp };

  return {
    id: `online-workbook-${workbookSeed++}`,
    name: props.title,
    appVersion: '3.0.0-alpha',
    locale: 'zhCN',
    styles: {
      header: {
        bg: { rgb: '#e8f5ee' },
        cl: { rgb: '#173b2b' },
        bl: 1
      }
    },
    sheetOrder: [sheetId],
    sheets: {
      [sheetId]: {
        id: sheetId,
        name: props.title,
        rowCount: visibleRowCount.value,
        columnCount: Math.max(props.columns.length + 1, 12),
        freeze: { xSplit: 0, ySplit: 1, startRow: 1, startColumn: 0 },
        cellData,
        columnData: props.columns.reduce<Record<number, { w: number }>>(
          (data, column, index) => {
            data[index] = { w: column.width ?? 160 };
            return data;
          },
          { [props.columns.length]: { w: 0 } }
        )
      }
    }
  };
};

const disposeWorkbook = () => {
  workbookRef.value = undefined;
  univerRef.value?.dispose();
  univerRef.value = undefined;
  if (containerRef.value) {
    containerRef.value.innerHTML = '';
  }
};

const initWorkbook = async () => {
  if (!containerRef.value) return;
  loading.value = true;
  validationErrors.value = new Map();
  disposeWorkbook();
  await nextTick();
  const { Univer, LocaleType, FUniver, UniverSheetsCorePreset, zhCN } = await loadUniverSheetsCore();
  const univer = new Univer({
    locale: LocaleType.ZH_CN,
    locales: {
      [LocaleType.ZH_CN]: zhCN.default
    }
  });
  UniverSheetsCorePreset({
    container: containerRef.value,
    header: false,
    toolbar: true,
    footer: true,
    formulaBar: true,
    contextMenu: true
  }).plugins.forEach((plugin) => {
    if (Array.isArray(plugin)) {
      univer.registerPlugin(plugin[0], plugin[1]);
    } else {
      univer.registerPlugin(plugin);
    }
  });
  const univerAPI = FUniver.newAPI(univer) as UniverApi;
  univerRef.value = markRaw(univer) as UniverInstance;
  const workbook = univerAPI.createWorkbook(buildWorkbookData()) as UniverWorkbook;
  workbookRef.value = markRaw(workbook);
  loading.value = false;
};

const reloadWorkbook = () => {
  cachedRows.value = cloneRows();
  void initWorkbook();
};

const addRow = () => {
  if (editorMode.value === 'table') {
    cachedRows.value = [...cachedRows.value, { ...props.emptyRow }];
    return;
  }
  const worksheet = workbookRef.value?.getActiveSheet();
  if (!worksheet) {
    ElMessage.warning('在线 Excel 尚未加载完成');
    return;
  }
  worksheet.insertRowsAfter(visibleRowCount.value - 1, 1);
};

const removeRow = (index: number) => {
  cachedRows.value.splice(index, 1);
};

const getFirstSheet = () => {
  const snapshot = workbookRef.value?.save();
  if (!snapshot) return undefined;
  const sheetId = snapshot.sheetOrder?.[0];
  return sheetId ? snapshot.sheets?.[sheetId] : undefined;
};

const extractRows = () => {
  const sheet = getFirstSheet();
  const cellData = sheet?.cellData ?? {};
  const maxRowIndex = Math.max(
    0,
    ...Object.keys(cellData)
      .map((key) => Number(key))
      .filter((key) => Number.isFinite(key))
  );
  const rows: SpreadsheetRow[] = [];
  for (let rowIndex = 1; rowIndex <= maxRowIndex; rowIndex += 1) {
    const sourceRow = cellData[rowIndex] ?? {};
    const row: SpreadsheetRow = { ...props.emptyRow };
    const rowId = sourceRow[props.columns.length]?.v;
    if (!isBlank(rowId)) {
      row.id = rowId;
    }
    let hasValue = false;
    props.columns.forEach((column, columnIndex) => {
      const value = normalizeValue(column, sourceRow[columnIndex]?.v);
      row[column.prop] = value;
      if (!isBlank(value)) {
        hasValue = true;
      }
    });
    if (hasValue) {
      rows.push(row);
    }
  }
  return rows;
};

const validateRows = (rows: SpreadsheetRow[]) => {
  const errors = new Map<number, Record<string, string>>();
  rows.forEach((row, rowIndex) => {
    const rowErrors: Record<string, string> = {};
    props.columns.forEach((column) => {
      const value = row[column.prop];
      if (column.required && isBlank(value)) {
        rowErrors[column.prop] = `${column.label}不能为空`;
      } else if (column.type === 'number' && !isBlank(value) && !Number.isFinite(Number(value))) {
        rowErrors[column.prop] = `${column.label}必须是数字`;
      } else if (column.type === 'select' && !isBlank(value) && column.options?.length) {
        const valid = column.options.some((option) => option.value === value || String(option.value) === String(value));
        if (!valid) {
          rowErrors[column.prop] = `${column.label}不在可选范围内`;
        }
      }
    });
    if (Object.keys(rowErrors).length) {
      errors.set(rowIndex, rowErrors);
    }
  });
  validationErrors.value = errors;
  return errors.size === 0;
};

const emitSave = () => {
  const rows = editorMode.value === 'table' ? compactRows(cachedRows.value) : extractRows();
  if (!rows.length) {
    if (props.allowEmptySave) {
      emit('save', []);
      return;
    }
    ElMessage.warning('没有可保存的数据');
    return;
  }
  if (!validateRows(rows)) {
    ElMessage.warning('请先修正表格错误');
    return;
  }
  emit('save', rows);
};

watch(
  () => props.rows,
  () => {
    cachedRows.value = cloneRows();
    void initWorkbook();
  },
  { deep: true }
);

onMounted(() => {
  cachedRows.value = cloneRows();
  void initWorkbook();
});

onBeforeUnmount(() => {
  disposeWorkbook();
});
</script>

<style scoped lang="scss">
.spreadsheet-editor {
  border: 1px solid var(--carbon-soft-line);
  border-radius: 8px;
  background: var(--carbon-panel);
}

.spreadsheet-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border-bottom: 1px solid var(--carbon-soft-line);
}

.spreadsheet-summary,
.spreadsheet-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.spreadsheet-summary strong {
  color: var(--carbon-ink);
}

.spreadsheet-summary span {
  color: var(--carbon-muted);
}

.spreadsheet-hint {
  margin: 12px;
}

.univer-shell {
  position: relative;
  height: 620px;
  min-height: 420px;
}

.univer-container {
  width: 100%;
  height: 100%;
}

.univer-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--carbon-panel) 88%, transparent);
  color: var(--carbon-muted);
}

.spreadsheet-errors {
  display: grid;
  gap: 4px;
  padding: 10px 12px 12px;
  border-top: 1px solid var(--carbon-soft-line);
}

.spreadsheet-error {
  color: var(--el-color-danger);
  font-size: 12px;
  line-height: 1.4;
}

.table-row-add {
  display: flex;
  justify-content: center;
  padding: 10px 0;
  border: 1px solid var(--carbon-soft-line);
  border-top: 0;
}
</style>
