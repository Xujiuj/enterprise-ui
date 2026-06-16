<template>
  <div class="p-2 enterprise-activity-entry">
    <el-card shadow="never" class="mb-3">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="88px">
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
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <template #header>
        <div class="table-head">
          <span>活动数据录入</span>
          <div class="head-actions">
            <el-button v-hasPermi="['enterprise:activityImport:import']" icon="Upload" @click="openUploadDialog">Excel 上传</el-button>
            <el-button v-hasPermi="['enterprise:activityImport:import']" type="primary" icon="Plus" @click="openCreateDrawer">新增</el-button>
          </div>
        </div>
      </template>

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
    </el-card>

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
              <el-select v-model="form.dataSource" class="w-full" clearable filterable :disabled="formDrawer.readonly">
                <el-option v-for="option in dataSourceOptions" :key="option.value" :label="option.label" :value="option.value" />
              </el-select>
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
  </div>
</template>

<script setup name="EnterpriseActivityEntry" lang="ts">
import { UploadFilled } from '@element-plus/icons-vue';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage, type FormInstance, type FormRules, type UploadRawFile } from 'element-plus';
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

type DerivedValueMap = Record<string, string>;

const route = useRoute();

const FIELD_DESCRIPTORS: Sheet656FieldDescriptor[] = [
  {
    fieldOrder: 1,
    sourceColumnCode: 'f001',
    sourceColumnName: 'PK_排放源识别编号',
    sourceRequired: false,
    rowValueRequired: true,
    derivedField: false
  },
  { fieldOrder: 2, sourceColumnCode: 'f002', sourceColumnName: 'FK_公司编号', sourceRequired: false, rowValueRequired: false, derivedField: true },
  { fieldOrder: 3, sourceColumnCode: 'f003', sourceColumnName: '公司名称', sourceRequired: false, rowValueRequired: false, derivedField: true },
  { fieldOrder: 4, sourceColumnCode: 'f004', sourceColumnName: '工厂', sourceRequired: false, rowValueRequired: false, derivedField: true },
  { fieldOrder: 5, sourceColumnCode: 'f005', sourceColumnName: 'FK_排放源分类', sourceRequired: false, rowValueRequired: false, derivedField: true },
  { fieldOrder: 6, sourceColumnCode: 'f006', sourceColumnName: '范围', sourceRequired: false, rowValueRequired: false, derivedField: true },
  { fieldOrder: 7, sourceColumnCode: 'f007', sourceColumnName: '范围子类别', sourceRequired: false, rowValueRequired: false, derivedField: true },
  { fieldOrder: 8, sourceColumnCode: 'f008', sourceColumnName: '排放源识别', sourceRequired: false, rowValueRequired: false, derivedField: true },
  { fieldOrder: 9, sourceColumnCode: 'f009', sourceColumnName: '排放源', sourceRequired: false, rowValueRequired: false, derivedField: true },
  { fieldOrder: 10, sourceColumnCode: 'f010', sourceColumnName: '单位', sourceRequired: false, rowValueRequired: false, derivedField: true },
  { fieldOrder: 11, sourceColumnCode: 'f011', sourceColumnName: '年度', sourceRequired: false, rowValueRequired: true, derivedField: false },
  { fieldOrder: 12, sourceColumnCode: 'f012', sourceColumnName: '月份', sourceRequired: false, rowValueRequired: true, derivedField: false },
  { fieldOrder: 13, sourceColumnCode: 'f013', sourceColumnName: '日期', sourceRequired: false, rowValueRequired: true, derivedField: false },
  { fieldOrder: 14, sourceColumnCode: 'f014', sourceColumnName: '活动数据', sourceRequired: false, rowValueRequired: true, derivedField: false },
  { fieldOrder: 15, sourceColumnCode: 'f015', sourceColumnName: '负责部门', sourceRequired: false, rowValueRequired: true, derivedField: false },
  { fieldOrder: 16, sourceColumnCode: 'f016', sourceColumnName: '数据来源', sourceRequired: false, rowValueRequired: true, derivedField: false },
  { fieldOrder: 17, sourceColumnCode: 'f017', sourceColumnName: '备注', sourceRequired: false, rowValueRequired: false, derivedField: false },
  { fieldOrder: 18, sourceColumnCode: 'f018', sourceColumnName: 'FK_排放因子', sourceRequired: false, rowValueRequired: false, derivedField: true }
];

const queryFormRef = ref<FormInstance>();
const activityFormRef = ref<FormInstance>();
const listLoading = ref(false);
const sourceLoading = ref(false);
const validating = ref(false);
const saving = ref(false);
const uploadParsing = ref(false);
const uploadImporting = ref(false);
const total = ref(0);
const activityList = ref<ActivityDataVO[]>([]);
const emissionSources = ref<EmissionSourceVO[]>([]);
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

const dataSourceOptions = [
  { label: '发票/结算单', value: 'invoice' },
  { label: '仪表/计量系统', value: 'meter' },
  { label: 'ERP/MES 系统', value: 'erp_mes' },
  { label: '台账记录', value: 'ledger' },
  { label: '供应商证明', value: 'supplier_evidence' },
  { label: '其他原始凭证', value: 'other_evidence' }
];

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
const valueToString = (value?: string | number) => (value === undefined || value === null ? '' : String(value));
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

  return FIELD_DESCRIPTORS.map((field) => ({
    sourceColumnCode: field.sourceColumnCode,
    sourceColumnName: field.sourceColumnName,
    value: values[field.sourceColumnCode] ?? ''
  }));
};

const buildManualValidationRequest = (): Sheet656ImportValidationRequest => ({
  headerFields: cloneFieldDescriptors(FIELD_DESCRIPTORS),
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
  await loadEmissionSources();
  await loadActivities();
});
</script>

<style scoped lang="scss">
.enterprise-activity-entry {
  .query-source {
    width: 260px;
  }

  .query-month,
  .query-status {
    width: 160px;
  }

  .table-head,
  .head-actions,
  .drawer-footer,
  .dialog-footer {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .table-head {
    justify-content: space-between;
  }

  .drawer-footer,
  .dialog-footer {
    justify-content: flex-end;
  }
}
</style>
