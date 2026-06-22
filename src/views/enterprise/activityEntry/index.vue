<template>
  <div class="enterprise-activity-entry">
    <section class="panel search-panel">
      <el-form v-show="showSearch" ref="queryFormRef" :model="queryParams" :inline="true" label-width="88px" class="search-bar wide activity-search">
        <el-form-item label="排放源" prop="emissionSourceId">
          <el-select v-model="queryParams.emissionSourceId" clearable filterable :loading="sourceLoading" class="query-source">
            <el-option v-for="source in emissionSources" :key="source.id" :label="sourceLabel(source)" :value="source.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="活动期间" prop="activityPeriod">
          <el-date-picker v-model="queryParams.activityPeriod" type="month" value-format="YYYY-MM" class="query-month" />
        </el-form-item>
        <el-form-item label="数据状态" prop="dataStatus">
          <el-select v-model="queryParams.dataStatus" clearable class="query-status">
            <el-option label="草稿" value="draft" />
            <el-option label="已提交" value="submitted" />
          </el-select>
        </el-form-item>
          <div class="search-actions">
            <right-toolbar v-model:showSearch="showSearch" :gutter="0" @query-table="loadActivities" />
          </div>
      </el-form>
      <div class="search-bar search-bar-collapsed" v-show="!showSearch">
        <div class="search-actions">
          <right-toolbar v-model:showSearch="showSearch" :gutter="0" @query-table="loadActivities" />
        </div>
      </div>
    </section>

    <section class="panel">
      <div class="toolbar">
        <div class="head-actions">
          <el-button v-hasPermi="['enterprise:activityImport:import']" icon="Download" @click="downloadImportTemplate">下载模板</el-button>
          <el-button v-hasPermi="['enterprise:activityImport:import']" icon="Upload" @click="openUploadDialog">Excel 上传</el-button>
          <el-button v-hasPermi="['enterprise:activityImport:import']" icon="Grid" @click="openSheetDrawer">在线填报</el-button>
          <el-button v-hasPermi="['enterprise:activityImport:import']" type="primary" icon="Plus" @click="openCreateDrawer">新增</el-button>
        </div>
      </div>

      <el-table v-loading="listLoading" :data="activityList" border>
        <el-table-column label="排放源" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">
            {{ activitySourceName(row) }}
          </template>
        </el-table-column>
        <el-table-column prop="activityPeriod" label="活动期间" width="120" />
        <el-table-column prop="activityValue" label="活动数据" width="140" align="right" />
        <el-table-column prop="activityUnit" label="单位" width="110" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="row.dataStatus === 'submitted' ? 'success' : 'info'">
              {{ row.dataStatus === 'submitted' ? '已提交' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="calculatedEmission" label="计算排放量" width="140" align="right" />
        <el-table-column prop="remark" label="备注" min-width="180" show-overflow-tooltip />
        <el-table-column prop="updateTime" label="更新时间" width="170" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" icon="View" @click="openDetailDrawer(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :total="total"
        @pagination="loadActivities"
      />
    </section>

    <el-drawer v-model="formDrawer.open" :title="formDrawer.title" size="680px" append-to-body destroy-on-close>
      <el-form ref="activityFormRef" :model="form" :rules="rules" label-width="112px">
        <el-row :gutter="16">
          <el-col :xs="24" :sm="12">
            <el-form-item label="排放源" prop="sourceCode">
              <el-select v-model="form.sourceCode" class="w-full" clearable filterable :loading="sourceLoading" :disabled="formDrawer.readonly">
                <el-option v-for="source in emissionSources" :key="source.id" :label="sourceLabel(source)" :value="source.sourceCode" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="活动期间" prop="activityPeriod">
              <el-date-picker v-model="form.activityPeriod" type="month" value-format="YYYY-MM" class="w-full" :disabled="formDrawer.readonly" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="日期" prop="date">
              <el-date-picker v-model="form.date" type="date" value-format="YYYY-MM-DD" class="w-full" :disabled="formDrawer.readonly" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="活动数据" prop="activityValue">
              <el-input-number
                v-model="form.activityValue"
                :min="0"
                :precision="4"
                controls-position="right"
                class="w-full"
                :disabled="formDrawer.readonly"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="活动单位">
              <el-input v-model="derivedActivityUnit" disabled />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="负责部门" prop="responsibleDept">
              <el-input v-model="form.responsibleDept" maxlength="64" clearable :disabled="formDrawer.readonly" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="数据来源" prop="dataSource">
              <el-input v-model="form.dataSource" maxlength="64" clearable :disabled="formDrawer.readonly" />
            </el-form-item>
          </el-col>
          <el-col :xs="24">
            <el-form-item label="备注">
              <el-input v-model="form.remark" type="textarea" :rows="3" maxlength="200" show-word-limit :disabled="formDrawer.readonly" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <el-alert v-if="manualBlockingIssues.length" class="mb-3" type="error" show-icon :closable="false">
        <template #title>存在 {{ manualBlockingIssues.length }} 条错误，请修正后保存。</template>
      </el-alert>
      <el-alert v-else-if="manualWarningIssues.length" class="mb-3" type="warning" show-icon :closable="false">
        <template #title>存在 {{ manualWarningIssues.length }} 条警告，保存后请复核。</template>
      </el-alert>

      <el-table v-if="manualIssues.length" :data="manualIssues" size="small" border class="mb-3" max-height="220">
        <el-table-column label="级别" width="82">
          <template #default="{ row }">
            <el-tag size="small" :type="isBlockingIssue(row) ? 'danger' : 'warning'">
              {{ isBlockingIssue(row) ? '错误' : '警告' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sourceColumnName" label="字段" width="120" />
        <el-table-column prop="message" label="说明" show-overflow-tooltip />
      </el-table>

      <template #footer>
        <div class="drawer-footer">
          <el-button @click="formDrawer.open = false">关闭</el-button>
          <el-button v-if="!formDrawer.readonly" icon="CircleCheck" :loading="validating" @click="handleValidate">校验</el-button>
          <el-button
            v-if="!formDrawer.readonly"
            v-hasPermi="['enterprise:activityImport:import']"
            type="primary"
            icon="Check"
            :loading="saving"
            @click="saveActivity"
          >
            保存
          </el-button>
        </div>
      </template>
    </el-drawer>

    <el-dialog v-model="uploadDialog.open" title="Excel 上传" width="820px" append-to-body destroy-on-close>
      <el-upload drag action="#" accept=".xlsx" :auto-upload="false" :show-file-list="false" :before-upload="parseUploadedFile">
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">拖拽 Excel 文件到此处，或点击选择 `.xlsx` 文件</div>
      </el-upload>

      <el-descriptions v-if="uploadFileName" class="mt-4" :column="3" border>
        <el-descriptions-item label="文件名">{{ uploadFileName }}</el-descriptions-item>
        <el-descriptions-item label="解析行数">{{ parsedUploadRowCount }}</el-descriptions-item>
        <el-descriptions-item label="校验状态">{{ uploadStatusText }}</el-descriptions-item>
      </el-descriptions>

      <el-alert v-if="uploadBlockingIssues.length" class="mt-4" type="error" show-icon :closable="false">
        <template #title>上传文件存在 {{ uploadBlockingIssues.length }} 条错误，不能导入。</template>
      </el-alert>
      <el-alert v-else-if="uploadWarningIssues.length" class="mt-4" type="warning" show-icon :closable="false">
        <template #title>上传文件存在 {{ uploadWarningIssues.length }} 条警告，允许导入但需复核。</template>
      </el-alert>
      <el-alert v-else-if="uploadValidation && parsedUploadRowCount" class="mt-4" type="success" show-icon :closable="false">
        <template #title>上传文件已通过校验。</template>
      </el-alert>

      <el-table v-if="uploadIssues.length" class="mt-4" :data="uploadIssues" size="small" border max-height="280">
        <el-table-column label="级别" width="82">
          <template #default="{ row }">
            <el-tag size="small" :type="isBlockingIssue(row) ? 'danger' : 'warning'">
              {{ isBlockingIssue(row) ? '错误' : '警告' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="rowNumber" label="行号" width="72" />
        <el-table-column prop="sourceColumnName" label="字段" width="120" />
        <el-table-column prop="message" label="说明" show-overflow-tooltip />
      </el-table>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="uploadDialog.open = false">关闭</el-button>
          <el-button
            v-hasPermi="['enterprise:activityImport:import']"
            type="primary"
            icon="Upload"
            :loading="uploadImporting"
            :disabled="!canImportUploadedRows"
            @click="importUploadedRows"
          >
            导入
          </el-button>
        </div>
      </template>
    </el-dialog>

    <el-drawer v-model="sheetDrawer.open" title="排放活动数据在线填报" size="94%" append-to-body destroy-on-close>
      <div class="sheet-source-panel">
        <div class="sheet-source-copy">
          <strong>{{ selectedActivitySheet?.sheetName ?? '未加载客户模板' }}</strong>
          <span>{{ activitySheetSourceText }}</span>
        </div>
        <el-select
          v-model="selectedSheetId"
          class="sheet-source-select"
          filterable
          :loading="templateFieldLoading"
          placeholder="选择客户活动数据表"
          @change="handleActivitySheetChange"
        >
          <el-option
            v-for="sheet in activityTemplateSheets"
            :key="String(sheet.id)"
            :label="activitySheetOptionLabel(sheet)"
            :value="sheet.id"
          />
        </el-select>
      </div>
      <SpreadsheetEditor
        :title="selectedActivitySheet?.sheetName ?? '排放活动数据'"
        :columns="sheetColumns"
        :rows="sheetRows"
        :empty-row="sheetEmptyRow"
        :saving="sheetSaving"
        :hint="activitySheetHint"
        @save="saveSheetRows"
      />
    </el-drawer>
  </div>
</template>

<script setup name="EnterpriseActivityEntry" lang="ts">
import { UploadFilled } from '@element-plus/icons-vue';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage, type FormInstance, type FormRules, type UploadRawFile } from 'element-plus';
import { useAutoQuery } from '@/hooks/useAutoQuery';
import { downloadXlsxTemplate } from '@/utils/xlsxTemplate';
import SpreadsheetEditor from '@/components/SpreadsheetEditor/index.vue';
import type { SpreadsheetColumn } from '@/components/SpreadsheetEditor/types';
import { listTemplateField } from '@/api/enterprise/templateField';
import type { TemplateFieldVO } from '@/api/enterprise/templateField/types';
import { listTemplateSheet } from '@/api/enterprise/templateSheet';
import type { TemplateSheetVO } from '@/api/enterprise/templateSheet/types';
import {
  importLocalSheet656Activity,
  listLocalActivityData,
  listLocalEmissionSource,
  parseLocalSheet656ActivityFile,
  saveLocalSheet656Activity,
  validateLocalSheet656Activity
} from '@/api/enterprise/activityEntry';
import type { ActivityDataQuery, ActivityDataVO } from '@/api/enterprise/activityData/types';
import type { EmissionSourceVO } from '@/api/enterprise/emissionSource/types';
import type {
  Sheet656FieldDescriptor,
  Sheet656FieldValue,
  Sheet656ImportValidationRequest,
  Sheet656ImportValidationResult,
  Sheet656ValidationIssue
} from '@/api/enterprise/sheet656ActivityValidation/types';

interface ActivityEntryForm {
  sourceCode?: string;
  activityPeriod?: string;
  date?: string;
  activityValue?: number;
  responsibleDept?: string;
  dataSource?: string;
  remark?: string;
}

type DerivedValueMap = Record<string, string | number | undefined>;

const route = useRoute();

const queryFormRef = ref<FormInstance>();
const activityFormRef = ref<FormInstance>();
const listLoading = ref(false);
const showSearch = ref(true);
const sourceLoading = ref(false);
const validating = ref(false);
const saving = ref(false);
const uploadParsing = ref(false);
const uploadImporting = ref(false);
const templateFieldLoading = ref(false);
const total = ref(0);
const activityList = ref<ActivityDataVO[]>([]);
const emissionSources = ref<EmissionSourceVO[]>([]);
const activityTemplateSheets = ref<TemplateSheetVO[]>([]);
const templateFields = ref<TemplateFieldVO[]>([]);
const selectedSheetId = ref<string | number>();
const manualValidation = ref<Sheet656ImportValidationResult>();
const uploadValidation = ref<Sheet656ImportValidationResult>();
const manualResolvedDerivedValues = ref<DerivedValueMap>({});
const parsedUploadRequest = ref<Sheet656ImportValidationRequest>();
const uploadFileName = ref('');

const formDrawer = reactive({
  open: false,
  title: '新增活动数据',
  readonly: false
});

const uploadDialog = reactive({
  open: false
});
const sheetDrawer = reactive({
  open: false
});
const sheetSaving = ref(false);

const queryParams = reactive<ActivityDataQuery>({
  pageNum: 1,
  pageSize: 10,
  emissionSourceId: undefined,
  activityPeriod: undefined,
  dataStatus: undefined
});

const form = reactive<ActivityEntryForm>({
  sourceCode: undefined,
  activityPeriod: undefined,
  date: undefined,
  activityValue: undefined,
  responsibleDept: undefined,
  dataSource: undefined,
  remark: undefined
});

const isActivityRequiredField = (fieldName: string) => ['PK_排放源识别编号', '年度', '月份', '日期', '活动数据', '负责部门', '数据来源'].includes(fieldName);
const isActivityDerivedField = (fieldName: string) =>
  ['FK_公司编号', '公司名称', '工厂', 'FK_排放源分类', '范围', '范围子类别', '排放源识别', '排放源', '单位', 'FK_排放因子'].includes(fieldName);
const templateFieldDescriptors = computed<Sheet656FieldDescriptor[]>(() =>
  templateFields.value
    .slice()
    .sort((a, b) => Number(a.fieldOrder ?? 0) - Number(b.fieldOrder ?? 0))
    .map((field, index) => {
      const sourceColumnCode = field.targetColumnCode || `f${String(index + 1).padStart(3, '0')}`;
      const sourceColumnName = field.originalFieldName || sourceColumnCode;
      return {
        fieldOrder: Number(field.fieldOrder ?? index + 1),
        sourceColumnCode,
        sourceColumnName,
        sourceRequired: field.requiredFlag === true,
        rowValueRequired: isActivityRequiredField(sourceColumnName),
        derivedField: isActivityDerivedField(sourceColumnName)
      };
    })
);
const activeFieldDescriptors = computed<Sheet656FieldDescriptor[]>(() => templateFieldDescriptors.value);
const selectedActivitySheet = computed(() => activityTemplateSheets.value.find((sheet) => String(sheet.id) === String(selectedSheetId.value)));
const activitySheetSourceText = computed(() => {
  const sheet = selectedActivitySheet.value;
  if (!sheet) return '字段来源：企业端模板字段接口，当前未匹配到活动数据 Sheet。';
  return `字段来源：${sheet.sourceGroup ?? '-'} / ${sheet.sheetName ?? '-'}，${sheet.fieldCount ?? activeFieldDescriptors.value.length} 个字段`;
});
const activitySheetHint = computed(() =>
  selectedActivitySheet.value
    ? '字段来自客户资料模板接口。维度字段通过排放源下拉选择，保存前调用服务端校验并自动带出公司、分类、单位和因子。'
    : '未加载到客户活动数据字段，请确认企业端模板种子已导入。'
);
const sheetColumns = computed<SpreadsheetColumn[]>(() =>
  activeFieldDescriptors.value.map((field) => {
    if (field.sourceColumnCode === 'f001') {
      return {
        prop: field.sourceColumnCode,
        label: field.sourceColumnName,
        type: 'select',
        required: true,
        width: 230,
        options: emissionSources.value.map((source) => ({ label: sourceLabel(source), value: source.sourceCode }))
      };
    }
    if (field.sourceColumnCode === 'f011' || field.sourceColumnCode === 'f012' || field.sourceColumnCode === 'f014') {
      return {
        prop: field.sourceColumnCode,
        label: field.sourceColumnName,
        type: 'number',
        required: field.rowValueRequired,
        precision: field.sourceColumnCode === 'f014' ? 4 : 0,
        width: 140
      };
    }
    if (field.sourceColumnCode === 'f013') {
      return {
        prop: field.sourceColumnCode,
        label: field.sourceColumnName,
        type: 'date',
        required: field.rowValueRequired,
        width: 150
      };
    }
    if (field.sourceColumnCode === 'f016') {
      return {
        prop: field.sourceColumnCode,
        label: field.sourceColumnName,
        required: true,
        width: 170
      };
    }
    return {
      prop: field.sourceColumnCode,
      label: field.sourceColumnName,
      required: field.rowValueRequired,
      width: field.derivedField ? 170 : 160
    };
  })
);
const sheetRows = computed(() =>
  activityList.value.map((row) => {
    const source = row.emissionSourceId ? sourceById.value.get(String(row.emissionSourceId)) : undefined;
    const { year, month } = splitPeriod(row.activityPeriod);
    return {
      f001: source?.sourceCode,
      f010: row.activityUnit,
      f011: year ? Number(year) : undefined,
      f012: month ? Number(month) : undefined,
      f013: row.activityPeriod ? `${row.activityPeriod}-01` : undefined,
      f014: row.activityValue,
      f017: row.remark
    };
  })
);
const sheetEmptyRow = computed(() =>
  activeFieldDescriptors.value.reduce<Record<string, string | number | undefined>>((row, field) => {
    row[field.sourceColumnCode] = undefined;
    return row;
  }, {})
);

const rules: FormRules<ActivityEntryForm> = {
  sourceCode: [{ required: true, message: '请选择排放源', trigger: 'change' }],
  activityPeriod: [{ required: true, message: '请选择活动期间', trigger: 'change' }],
  date: [{ required: true, message: '请选择日期', trigger: 'change' }],
  activityValue: [{ required: true, message: '请输入活动数据', trigger: 'blur' }],
  responsibleDept: [{ required: true, message: '请输入负责部门', trigger: 'blur' }],
  dataSource: [{ required: true, message: '请选择数据来源', trigger: 'change' }]
};

const selectedSource = computed(() => emissionSources.value.find((source) => source.sourceCode === form.sourceCode));
const sourceById = computed(() => {
  const map = new Map<string, EmissionSourceVO>();
  emissionSources.value.forEach((source) => map.set(String(source.id), source));
  return map;
});
const manualIssues = computed(() => collectIssues(manualValidation.value));
const manualBlockingIssues = computed(() => manualIssues.value.filter((issue) => isBlockingIssue(issue)));
const manualWarningIssues = computed(() => manualIssues.value.filter((issue) => !isBlockingIssue(issue)));
const uploadIssues = computed(() => collectIssues(uploadValidation.value));
const uploadBlockingIssues = computed(() => uploadIssues.value.filter((issue) => isBlockingIssue(issue)));
const uploadWarningIssues = computed(() => uploadIssues.value.filter((issue) => !isBlockingIssue(issue)));
const parsedUploadRowCount = computed(() => parsedUploadRequest.value?.rows?.length ?? 0);
const canImportUploadedRows = computed(
  () =>
    parsedUploadRowCount.value > 0 && !!uploadValidation.value && !uploadValidation.value.blocking && !uploadParsing.value && !uploadImporting.value
);
const derivedActivityUnit = computed(() => manualResolvedDerivedValues.value.f010 ?? '');
const uploadStatusText = computed(() => {
  if (uploadParsing.value) return '解析中';
  if (!uploadValidation.value) return '待解析';
  if (uploadValidation.value.blocking) return '存在错误';
  return parsedUploadRowCount.value > 0 ? '可导入' : '无可导入数据';
});

const sourceLabel = (source: EmissionSourceVO) => [source.sourceCode, source.sourceName].filter(Boolean).join(' / ');
const isBlockingIssue = (issue: Sheet656ValidationIssue) => issue.severity === 'ERROR';
const valueToString = (value?: string | number | boolean | null) => (value === undefined || value === null ? '' : String(value));
const firstQueryValue = (value: unknown) => (Array.isArray(value) ? value[0] : value);
const splitPeriod = (period?: string) => {
  const [year, month] = (period ?? '').split('-');
  return { year, month };
};

const activitySourceName = (row: ActivityDataVO) => {
  const source = row.emissionSourceId ? sourceById.value.get(String(row.emissionSourceId)) : undefined;
  return source ? sourceLabel(source) : row.emissionSourceId || '-';
};

const collectIssues = (result?: Sheet656ImportValidationResult): Sheet656ValidationIssue[] => [
  ...(result?.headerIssues ?? []),
  ...(result?.rowResults?.flatMap((row) => row.issues ?? []) ?? [])
];

const cloneFieldDescriptors = (fields: Sheet656FieldDescriptor[] = []): Sheet656FieldDescriptor[] => fields.map((field) => ({ ...field }));

const cloneFieldValues = (fieldValues: Sheet656FieldValue[] = []): Sheet656FieldValue[] => fieldValues.map((fieldValue) => ({ ...fieldValue }));

const cloneImportValidationRequest = (request: Sheet656ImportValidationRequest): Sheet656ImportValidationRequest => ({
  headerFields: cloneFieldDescriptors(request.headerFields ?? []),
  rows: (request.rows ?? []).map((row) => ({
    rowNumber: row.rowNumber,
    fieldValues: cloneFieldValues(row.fieldValues ?? [])
  }))
});

const buildFieldValues = (): Sheet656FieldValue[] => {
  const { year, month } = splitPeriod(form.activityPeriod);
  const values: DerivedValueMap = {
    f001: form.sourceCode ?? '',
    f011: year,
    f012: month,
    f013: form.date ?? '',
    f014: valueToString(form.activityValue),
    f015: form.responsibleDept ?? '',
    f016: form.dataSource ?? '',
    f017: form.remark ?? '',
    ...manualResolvedDerivedValues.value
  };

  return activeFieldDescriptors.value.map((field) => ({
    sourceColumnCode: field.sourceColumnCode,
    sourceColumnName: field.sourceColumnName,
    value: values[field.sourceColumnCode] ?? ''
  }));
};

const buildManualValidationRequest = (): Sheet656ImportValidationRequest => ({
  headerFields: cloneFieldDescriptors(activeFieldDescriptors.value),
  rows: [
    {
      rowNumber: 2,
      fieldValues: buildFieldValues()
    }
  ]
});

const applyRouteQuery = () => {
  const sourceCode = firstQueryValue(route.query.emissionSourceCode);
  if (typeof sourceCode === 'string' && sourceCode) {
    form.sourceCode = sourceCode;
  }
  const activityPeriod = firstQueryValue(route.query.activityPeriod);
  if (typeof activityPeriod === 'string' && activityPeriod) {
    form.activityPeriod = activityPeriod;
    queryParams.activityPeriod = activityPeriod;
  }
};

const clearManualValidation = () => {
  manualValidation.value = undefined;
  manualResolvedDerivedValues.value = {};
};

const resetForm = () => {
  Object.assign(form, {
    sourceCode: undefined,
    activityPeriod: undefined,
    date: undefined,
    activityValue: undefined,
    responsibleDept: undefined,
    dataSource: undefined,
    remark: undefined
  });
  clearManualValidation();
  activityFormRef.value?.clearValidate();
};

const openCreateDrawer = () => {
  resetForm();
  applyRouteQuery();
  formDrawer.title = '新增活动数据';
  formDrawer.readonly = false;
  formDrawer.open = true;
};

const openDetailDrawer = (row: ActivityDataVO) => {
  const source = row.emissionSourceId ? sourceById.value.get(String(row.emissionSourceId)) : undefined;
  resetForm();
  Object.assign(form, {
    sourceCode: source?.sourceCode,
    activityPeriod: row.activityPeriod,
    date: row.activityPeriod ? `${row.activityPeriod}-01` : undefined,
    activityValue: row.activityValue,
    remark: row.remark
  });
  manualResolvedDerivedValues.value = {
    f010: row.activityUnit ?? ''
  };
  formDrawer.title = '查看活动数据';
  formDrawer.readonly = true;
  formDrawer.open = true;
};

const openUploadDialog = () => {
  uploadDialog.open = true;
};

const openSheetDrawer = () => {
  sheetDrawer.open = true;
};

const downloadImportTemplate = () => {
  downloadXlsxTemplate({
    fileName: `${selectedActivitySheet.value?.sheetName ?? 'activity'}_template_${new Date().getTime()}.xlsx`,
    sheetName: selectedActivitySheet.value?.sheetName ?? 'activity',
    headers: activeFieldDescriptors.value.map((field) => field.sourceColumnName)
  });
};

const applyManualResolvedDerivedValues = (result: Sheet656ImportValidationResult) => {
  const resolved = result.rowResults?.[0]?.resolvedDerivedFieldValues ?? [];
  manualResolvedDerivedValues.value = resolved.reduce<DerivedValueMap>((acc, field) => {
    if (field.sourceColumnCode) {
      acc[field.sourceColumnCode] = field.value ?? '';
    }
    return acc;
  }, {});
};

const validateFormFields = async () => {
  if (!activityFormRef.value) return false;
  return activityFormRef.value.validate().catch(() => false);
};

const runManualServerValidation = async (request: Sheet656ImportValidationRequest = buildManualValidationRequest()) => {
  validating.value = true;
  try {
    const res = await validateLocalSheet656Activity(request);
    manualValidation.value = res.data;
    applyManualResolvedDerivedValues(res.data);
    return res.data;
  } finally {
    validating.value = false;
  }
};

const runUploadServerValidation = async (request: Sheet656ImportValidationRequest) => {
  const res = await validateLocalSheet656Activity(request);
  uploadValidation.value = res.data;
  return res.data;
};

const handleValidate = async () => {
  const valid = await validateFormFields();
  if (!valid) return;
  const result = await runManualServerValidation(buildManualValidationRequest());
  if (result.blocking) {
    ElMessage.error('校验存在错误');
    return;
  }
  ElMessage.success(result.valid ? '校验通过' : '校验完成，存在警告');
};

const saveActivity = async () => {
  const valid = await validateFormFields();
  if (!valid) return;
  if (!selectedSource.value) {
    ElMessage.warning('请选择有效的排放源');
    return;
  }

  saving.value = true;
  try {
    const request = buildManualValidationRequest();
    const result = await runManualServerValidation(request);
    if (result.blocking) {
      ElMessage.error('存在错误，不能保存');
      return;
    }

    const saveRes = await saveLocalSheet656Activity(request.rows[0]);
    if (saveRes.data?.validationResult) {
      manualValidation.value = saveRes.data.validationResult;
      applyManualResolvedDerivedValues(saveRes.data.validationResult);
    }

    const persisted = saveRes.data?.persisted === true || (saveRes.data?.persistedRowCount ?? 0) > 0;
    if (!persisted) {
      ElMessage.warning('保存未持久化，请根据校验结果复核后重试');
      return;
    }

    ElMessage.success(manualWarningIssues.value.length ? '已保存，存在警告请复核' : '保存成功');
    formDrawer.open = false;
    await loadActivities();
  } finally {
    saving.value = false;
  }
};

const parseUploadedFile = async (file: UploadRawFile) => {
  if (!file.name.toLowerCase().endsWith('.xlsx')) {
    ElMessage.warning('请选择 .xlsx 文件');
    return false;
  }

  uploadParsing.value = true;
  uploadFileName.value = file.name;
  parsedUploadRequest.value = undefined;
  uploadValidation.value = undefined;
  try {
    const parseRes = await parseLocalSheet656ActivityFile(file);
    parsedUploadRequest.value = cloneImportValidationRequest(parseRes.data);
    const validation = await runUploadServerValidation(parsedUploadRequest.value);
    if (parsedUploadRowCount.value === 0) {
      ElMessage.warning('文件解析完成，但没有可导入的数据行');
      return false;
    }
    if (validation.blocking) {
      ElMessage.error('上传文件校验存在错误');
      return false;
    }
    ElMessage.success(validation.valid ? '上传文件校验通过' : '文件校验完成，存在警告');
  } catch {
    parsedUploadRequest.value = undefined;
    uploadValidation.value = undefined;
    return false;
  } finally {
    uploadParsing.value = false;
  }
  return false;
};

const importUploadedRows = async () => {
  if (!parsedUploadRequest.value) {
    return;
  }

  uploadImporting.value = true;
  try {
    const request = cloneImportValidationRequest(parsedUploadRequest.value);
    const validation = await runUploadServerValidation(request);
    if (validation.blocking) {
      ElMessage.error('上传文件存在错误，不能导入');
      return;
    }

    const importRes = await importLocalSheet656Activity(request);
    if (importRes.data?.validationResult) {
      uploadValidation.value = importRes.data.validationResult;
    }

    const persisted = importRes.data?.persisted === true || (importRes.data?.persistedRowCount ?? 0) > 0;
    if (!persisted) {
      ElMessage.warning('上传文件未持久化，请根据校验结果复核后重试');
      return;
    }

    ElMessage.success(uploadWarningIssues.value.length ? '上传文件已导入，存在警告请复核' : '上传文件导入成功');
    uploadDialog.open = false;
    await loadActivities();
  } finally {
    uploadImporting.value = false;
  }
};

const buildSheetRowRequest = (rows: Record<string, any>[]): Sheet656ImportValidationRequest => ({
  headerFields: cloneFieldDescriptors(activeFieldDescriptors.value),
  rows: rows.map((row, index) => ({
    rowNumber: index + 2,
    fieldValues: activeFieldDescriptors.value.map((field) => ({
      sourceColumnCode: field.sourceColumnCode,
      sourceColumnName: field.sourceColumnName,
      value: valueToString(row[field.sourceColumnCode])
    }))
  }))
});

const saveSheetRows = async (rows: Record<string, any>[]) => {
  sheetSaving.value = true;
  try {
    const request = buildSheetRowRequest(rows);
    const validation = await validateLocalSheet656Activity(request);
    if (validation.data?.blocking) {
      ElMessage.error('在线填报存在错误，不能保存');
      return;
    }
    for (const row of request.rows) {
      const saveRes = await saveLocalSheet656Activity(row);
      if (saveRes.data?.validationResult?.blocking) {
        ElMessage.error(`第 ${row.rowNumber} 行保存失败，请按校验结果修正`);
        return;
      }
    }
    ElMessage.success('在线填报已保存');
    sheetDrawer.open = false;
    await loadActivities();
  } finally {
    sheetSaving.value = false;
  }
};

const activitySheetOptionLabel = (sheet: TemplateSheetVO) => `${sheet.sheetName ?? sheet.targetTableCode} (${sheet.fieldCount ?? 0}字段)`;

const handleActivitySheetChange = async () => {
  await loadTemplateFields();
};

const loadActivityTemplateSheets = async () => {
  templateFieldLoading.value = true;
  try {
    const res = await listTemplateSheet({ templateVersionId: 1 });
    const rows = ((res as any).rows ?? res.data ?? []) as TemplateSheetVO[];
    activityTemplateSheets.value = rows
      .filter((sheet) => sheet.moduleCode === '03-活动数据' && sheet.allowExtension !== false && Number(sheet.fieldCount ?? 0) > 0)
      .sort((a, b) => String(a.sheetName ?? '').localeCompare(String(b.sheetName ?? ''), 'zh-Hans-CN'));
    if (!activityTemplateSheets.value.some((sheet) => String(sheet.id) === String(selectedSheetId.value))) {
      selectedSheetId.value = activityTemplateSheets.value[0]?.id;
    }
    await loadTemplateFields();
  } finally {
    templateFieldLoading.value = false;
  }
};

const loadTemplateFields = async () => {
  if (!selectedSheetId.value) {
    templateFields.value = [];
    return;
  }
  const res = await listTemplateField({ sheetId: selectedSheetId.value });
  templateFields.value = ((res as any).rows ?? res.data ?? []) as TemplateFieldVO[];
};

const loadEmissionSources = async () => {
  sourceLoading.value = true;
  try {
    const res = await listLocalEmissionSource({ pageNum: 1, pageSize: 500, enabledFlag: true });
    emissionSources.value = (res.rows ?? res.data ?? []) as EmissionSourceVO[];
  } finally {
    sourceLoading.value = false;
  }
};

const loadActivities = async () => {
  listLoading.value = true;
  try {
    const res = await listLocalActivityData(queryParams);
    activityList.value = (res.rows ?? res.data ?? []) as ActivityDataVO[];
    total.value = res.total ?? activityList.value.length;
  } finally {
    listLoading.value = false;
  }
};

const handleQuery = () => {
  queryParams.pageNum = 1;
  loadActivities();
};

const resetQuery = () => {
  queryFormRef.value?.resetFields();
  queryParams.pageNum = 1;
  loadActivities();
};

watch(
  () => [form.sourceCode, form.activityPeriod, form.date, form.activityValue, form.responsibleDept, form.dataSource, form.remark],
  () => {
    if (!formDrawer.readonly) {
      clearManualValidation();
    }
  }
);

watch(selectedSource, (source) => {
  if (!source || form.responsibleDept || formDrawer.readonly) {
    return;
  }
  const derivedDept =
    (source as EmissionSourceVO & { responsibleDept?: string; deptName?: string }).responsibleDept ||
    (source as EmissionSourceVO & { deptName?: string }).deptName;
  if (derivedDept) {
    form.responsibleDept = derivedDept;
  }
});

onMounted(async () => {
  applyRouteQuery();
  await loadActivityTemplateSheets();
  await loadEmissionSources();
  await loadActivities();
});

useAutoQuery(queryParams, () => handleQuery());
</script>

<style scoped lang="scss">
.enterprise-activity-entry {
  .query-source {
    width: 260px;
  }

  .query-month,
  .query-status {
    width: 220px;
  }

  .sheet-source-panel {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
    padding: 12px;
    border: 1px solid var(--carbon-soft-line);
    border-radius: 8px;
    background: var(--carbon-panel);
  }

  .sheet-source-copy {
    display: grid;
    gap: 4px;
    min-width: 0;
  }

  .sheet-source-copy strong {
    color: var(--carbon-ink);
  }

  .sheet-source-copy span {
    color: var(--carbon-muted);
    font-size: 13px;
  }

  .sheet-source-select {
    width: 320px;
    max-width: 42vw;
  }

  .head-actions,
  .drawer-footer,
  .dialog-footer {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .drawer-footer,
  .dialog-footer {
    justify-content: flex-end;
  }
}
</style>
