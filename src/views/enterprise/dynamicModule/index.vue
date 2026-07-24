<template>
  <div class="p-2 page-panel dynamic-module-page">
    <section class="page-head">
      <div>
        <h1>Excel 页面生成</h1>
      </div>
    </section>

    <section class="panel upload-panel">
      <el-upload ref="uploadRef" drag :auto-upload="false" :limit="1" accept=".xlsx" :on-change="handleFileChange" :on-remove="handleFileRemove">
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">拖入 Excel，或<em>选择文件</em></div>
      </el-upload>
      <div class="panel-actions">
        <el-button
          type="primary"
          icon="View"
          :loading="previewLoading"
          :disabled="!selectedFile"
          v-hasPermi="['enterprise:dynamicModule:preview']"
          @click="handlePreview"
        >
          解析预览
        </el-button>
        <span v-if="selectedFile" class="file-meta">{{ selectedFile.name }}</span>
      </div>
    </section>

    <section v-if="preview" class="panel definition-panel">
      <div class="section-toolbar">
        <div>
          <h2>页面配置</h2>
          <span>{{ selectedSheetCount }} 个页面待生成</span>
        </div>
        <el-button
          type="success"
          icon="MagicStick"
          :loading="generateLoading"
          :disabled="selectedSheetCount === 0"
          v-hasPermi="['enterprise:dynamicModule:generate']"
          @click="handleGenerate"
        >
          生成并集成
        </el-button>
      </div>

      <el-tabs v-model="activeSheet">
        <el-tab-pane v-for="sheet in preview.sheets" :key="sheet.sheetNo" :name="String(sheet.sheetNo)">
          <template #label>
            <span class="sheet-tab-label">
              <el-checkbox v-model="sheet.selected" @click.stop />
              {{ sheet.sheetName }}
              <el-tag size="small" effect="plain">{{ sheet.rowCount }} 行</el-tag>
            </span>
          </template>

          <el-form :model="sheet" label-width="96px" class="sheet-config-form">
            <el-row :gutter="16">
              <el-col :xs="24" :md="12">
                <el-form-item label="页面名称" required>
                  <el-input v-model="sheet.moduleName" maxlength="100" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :md="12">
                <el-form-item label="模块编码" required>
                  <el-input v-model="sheet.moduleCode" maxlength="49" @input="sheet.moduleCode = normalizeCode(sheet.moduleCode)" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>

          <el-table :data="sheet.fields" border row-key="fieldCode" class="field-table">
            <el-table-column type="index" width="52" align="center" />
            <el-table-column label="显示名称" min-width="150">
              <template #default="scope">
                <el-input v-model="scope.row.fieldName" maxlength="120" />
              </template>
            </el-table-column>
            <el-table-column label="字段编码" min-width="150">
              <template #default="scope">
                <el-input v-model="scope.row.fieldCode" maxlength="64" @input="scope.row.fieldCode = normalizeCode(scope.row.fieldCode)" />
              </template>
            </el-table-column>
            <el-table-column label="数据类型" width="130">
              <template #default="scope">
                <el-select v-model="scope.row.valueType" @change="syncUiType(scope.row)">
                  <el-option v-for="item in valueTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="表单控件" width="130">
              <template #default="scope">
                <el-select v-model="scope.row.uiType">
                  <el-option v-for="item in uiTypeOptions(scope.row.valueType)" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="必填" width="72" align="center">
              <template #default="scope"><el-switch v-model="scope.row.required" /></template>
            </el-table-column>
            <el-table-column label="查询" width="72" align="center">
              <template #default="scope"><el-switch v-model="scope.row.searchable" /></template>
            </el-table-column>
            <el-table-column label="列表" width="72" align="center">
              <template #default="scope"><el-switch v-model="scope.row.listVisible" /></template>
            </el-table-column>
            <el-table-column label="表单" width="72" align="center">
              <template #default="scope"><el-switch v-model="scope.row.formVisible" /></template>
            </el-table-column>
          </el-table>

          <el-collapse v-if="sheet.sampleRows.length" class="sample-collapse">
            <el-collapse-item title="数据预览" name="sample">
              <el-table :data="sheet.sampleRows" max-height="280" border>
                <el-table-column
                  v-for="field in sheet.fields"
                  :key="field.fieldCode"
                  :prop="field.fieldCode"
                  :label="field.fieldName"
                  min-width="140"
                  show-overflow-tooltip
                />
              </el-table>
            </el-collapse-item>
          </el-collapse>
        </el-tab-pane>
      </el-tabs>
    </section>

    <section class="panel modules-panel">
      <div class="section-toolbar">
        <div>
          <h2>已生成页面</h2>
          <span>{{ modules.length }} 个</span>
        </div>
        <el-button icon="Refresh" circle title="刷新" :loading="modulesLoading" @click="loadModules" />
      </div>
      <el-table v-loading="modulesLoading" :data="modules">
        <el-table-column label="页面名称" prop="moduleName" min-width="180" />
        <el-table-column label="模块编码" prop="moduleCode" min-width="180" />
        <el-table-column label="数据表" prop="tableName" min-width="220" />
        <el-table-column label="来源工作表" prop="sheetName" min-width="160" />
        <el-table-column label="状态" width="90" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === '0' ? 'success' : 'info'">{{ scope.row.status === '0' ? '启用' : '停用' }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </section>
  </div>
</template>

<script setup lang="ts" name="EnterpriseDynamicModule">
import { computed, onMounted, ref } from 'vue';
import type { UploadFile, UploadInstance, UploadUserFile } from 'element-plus';
import { ElMessage } from 'element-plus';
import { generateDynamicModules, listDynamicModules, previewDynamicWorkbook } from '@/api/enterprise/dynamicModule';
import type {
  DynamicFieldDefinition,
  DynamicGenerateResult,
  DynamicModuleSchema,
  DynamicValueType,
  DynamicWorkbookPreview
} from '@/api/enterprise/dynamicModule/types';

const uploadRef = ref<UploadInstance>();
const selectedFile = ref<File>();
const preview = ref<DynamicWorkbookPreview>();
const activeSheet = ref('0');
const previewLoading = ref(false);
const generateLoading = ref(false);
const modulesLoading = ref(false);
const modules = ref<DynamicModuleSchema[]>([]);

const valueTypeOptions = [
  { label: '文本', value: 'text' },
  { label: '数字', value: 'number' },
  { label: '日期', value: 'date' },
  { label: '是/否', value: 'boolean' }
];

const selectedSheetCount = computed(() => preview.value?.sheets.filter((sheet) => sheet.selected).length ?? 0);

const unwrapData = <T,>(response: unknown): T => {
  const payload = response as { data?: T };
  return payload?.data ?? (response as T);
};

const normalizeCode = (value: string) =>
  String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+/, '')
    .slice(0, 49);

const uiTypeOptions = (valueType: DynamicValueType) => {
  if (valueType === 'number') return [{ label: '数字输入', value: 'number' }];
  if (valueType === 'date') return [{ label: '日期选择', value: 'date' }];
  if (valueType === 'boolean') return [{ label: '开关', value: 'switch' }];
  return [
    { label: '单行输入', value: 'input' },
    { label: '多行输入', value: 'textarea' }
  ];
};

const syncUiType = (field: DynamicFieldDefinition) => {
  field.uiType = uiTypeOptions(field.valueType)[0].value as DynamicFieldDefinition['uiType'];
};

const handleFileChange = (uploadFile: UploadFile) => {
  selectedFile.value = uploadFile.raw;
  preview.value = undefined;
};

const handleFileRemove = () => {
  selectedFile.value = undefined;
  preview.value = undefined;
};

const handlePreview = async () => {
  if (!selectedFile.value) return;
  previewLoading.value = true;
  try {
    preview.value = unwrapData<DynamicWorkbookPreview>(await previewDynamicWorkbook(selectedFile.value));
    activeSheet.value = String(preview.value.sheets[0]?.sheetNo ?? '0');
    ElMessage.success('Excel 解析完成');
  } finally {
    previewLoading.value = false;
  }
};

const validateDefinitions = () => {
  const selected = preview.value?.sheets.filter((sheet) => sheet.selected) ?? [];
  const moduleCodes = new Set<string>();
  for (const sheet of selected) {
    if (!sheet.moduleName.trim()) throw new Error('页面名称不能为空');
    if (!/^[a-z][a-z0-9_]{1,48}$/.test(sheet.moduleCode)) throw new Error('模块编码格式不正确：' + sheet.moduleCode);
    if (moduleCodes.has(sheet.moduleCode)) throw new Error('模块编码重复：' + sheet.moduleCode);
    moduleCodes.add(sheet.moduleCode);
    const fieldCodes = new Set<string>();
    for (const field of sheet.fields) {
      if (!field.fieldName.trim()) throw new Error('字段显示名称不能为空');
      if (field.required && !field.formVisible) throw new Error('必填字段必须显示在表单中：' + field.fieldName);
      if (!/^[a-z][a-z0-9_]{1,63}$/.test(field.fieldCode)) throw new Error('字段编码格式不正确：' + field.fieldCode);
      if (fieldCodes.has(field.fieldCode)) throw new Error('字段编码重复：' + field.fieldCode);
      fieldCodes.add(field.fieldCode);
    }
  }
};

const handleGenerate = async () => {
  if (!selectedFile.value || !preview.value) return;
  try {
    validateDefinitions();
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '页面配置不完整');
    return;
  }
  generateLoading.value = true;
  try {
    const result = unwrapData<DynamicGenerateResult>(await generateDynamicModules(selectedFile.value, { sheets: preview.value.sheets }));
    ElMessage.success('已生成 ' + result.modules.length + ' 个管理页面，正在刷新菜单');
    await loadModules();
    window.setTimeout(() => window.location.reload(), 800);
  } finally {
    generateLoading.value = false;
  }
};

const loadModules = async () => {
  modulesLoading.value = true;
  try {
    modules.value = unwrapData<DynamicModuleSchema[]>(await listDynamicModules()) ?? [];
  } finally {
    modulesLoading.value = false;
  }
};

onMounted(loadModules);
</script>

<style scoped>
.dynamic-module-page {
  display: grid;
  gap: 12px;
}

.upload-panel {
  display: grid;
  grid-template-columns: minmax(320px, 680px) 1fr;
  gap: 18px;
  align-items: end;
}

.panel-actions,
.section-toolbar,
.sheet-tab-label {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-toolbar {
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-toolbar h2 {
  margin: 0 10px 0 0;
  display: inline;
  font-size: 17px;
}

.section-toolbar span,
.file-meta {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.sheet-config-form {
  max-width: 980px;
}

.field-table,
.sample-collapse {
  margin-top: 10px;
}

@media (max-width: 900px) {
  .upload-panel {
    grid-template-columns: 1fr;
  }
}
</style>
