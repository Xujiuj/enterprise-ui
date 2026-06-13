<template>
  <div class="p-2 enterprise-activity-page">
    <el-row :gutter="16">
      <el-col :xs="24" :lg="14">
        <el-card shadow="never" class="mb-4">
          <template #header>
            <div class="card-head">
              <div>
                <span>sheet_656 Excel 上传导入</span>
                <p>上传 `.xlsx` 后先走服务端解析和校验，无强错误时再批量写入企业端活动数据。</p>
              </div>
              <el-button
                v-hasPermi="['enterprise:activityImport:import']"
                type="primary"
                icon="Upload"
                :loading="uploadImporting"
                :disabled="!canImportUploadedRows"
                @click="importUploadedRows"
              >
                导入上传文件
              </el-button>
            </div>
          </template>

          <el-upload drag action="#" accept=".xlsx" :auto-upload="false" :show-file-list="false" :before-upload="parseUploadedFile">
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">拖拽 sheet_656 Excel 到此处，或点击选择 `.xlsx` 文件</div>
          </el-upload>

          <el-descriptions v-if="uploadFileName" class="mt-4" :column="3" border>
            <el-descriptions-item label="文件名">{{ uploadFileName }}</el-descriptions-item>
            <el-descriptions-item label="解析行数">{{ parsedUploadRowCount }}</el-descriptions-item>
            <el-descriptions-item label="解析状态">
              {{ uploadParsing ? '解析中' : uploadValidation ? (uploadValidation.blocking ? '存在强错误' : '可导入') : '待解析' }}
            </el-descriptions-item>
          </el-descriptions>

          <el-alert v-if="uploadBlockingIssues.length" class="mt-4" type="error" show-icon :closable="false">
            <template #title>上传文件存在 {{ uploadBlockingIssues.length }} 条强错误，不能导入。</template>
          </el-alert>
          <el-alert v-else-if="uploadWarningIssues.length" class="mt-4" type="warning" show-icon :closable="false">
            <template #title>上传文件存在 {{ uploadWarningIssues.length }} 条弱警告，允许导入但需复核。</template>
          </el-alert>
          <el-alert v-else-if="uploadValidation && parsedUploadRowCount" class="mt-4" type="success" show-icon :closable="false">
            <template #title>上传文件已通过服务端校验，可执行导入。</template>
          </el-alert>
          <el-alert v-else-if="uploadValidation" class="mt-4" type="info" show-icon :closable="false">
            <template #title>文件解析成功，但没有可导入的数据行。</template>
          </el-alert>

          <el-table v-if="uploadIssues.length" class="mt-4" :data="uploadIssues" size="small" border max-height="260">
            <el-table-column label="级别" width="82">
              <template #default="scope">
                <el-tag size="small" :type="isBlockingIssue(scope.row) ? 'danger' : 'warning'">
                  {{ isBlockingIssue(scope.row) ? '强错误' : '弱警告' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="rowNumber" label="行号" width="72" />
            <el-table-column prop="sourceColumnCode" label="字段" width="86" />
            <el-table-column prop="message" label="说明" show-overflow-tooltip />
          </el-table>
        </el-card>

        <el-card shadow="never">
          <template #header>
            <div class="card-head">
              <div>
                <span>sheet_656 手工活动录入</span>
                <p>先走企业端校验接口，校验通过后再写入本地活动数据。</p>
              </div>
              <el-button
                v-hasPermi="['enterprise:activityImportValidation:validate']"
                type="primary"
                icon="CircleCheck"
                :loading="validating"
                @click="handleValidate"
              >
                服务端校验
              </el-button>
            </div>
          </template>

          <el-alert v-if="manualBlockingIssues.length" class="mb-4" type="error" show-icon :closable="false">
            <template #title>存在 {{ manualBlockingIssues.length }} 条强错误，不能保存。</template>
          </el-alert>
          <el-alert v-else-if="manualWarningIssues.length" class="mb-4" type="warning" show-icon :closable="false">
            <template #title>存在 {{ manualWarningIssues.length }} 条弱警告，允许保存但需复核。</template>
          </el-alert>
          <el-alert v-else-if="manualValidation" class="mb-4" type="success" show-icon :closable="false">
            <template #title>服务端校验通过。</template>
          </el-alert>

          <el-form ref="activityFormRef" :model="form" :rules="rules" label-width="150px">
            <el-row :gutter="16">
              <el-col :xs="24" :sm="12">
                <el-form-item label="排放源" prop="sourceCode">
                  <el-select v-model="form.sourceCode" class="w-full" clearable filterable :loading="sourceLoading" placeholder="选择本地排放源">
                    <el-option v-for="source in emissionSources" :key="source.id" :label="sourceLabel(source)" :value="source.sourceCode" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="年度" prop="year">
                  <el-input-number v-model="form.year" :min="2000" :max="2100" controls-position="right" class="w-full" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="月份" prop="month">
                  <el-input-number v-model="form.month" :min="1" :max="12" controls-position="right" class="w-full" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="日期" prop="date">
                  <el-date-picker v-model="form.date" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" class="w-full" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="活动数据" prop="activityValue">
                  <el-input-number v-model="form.activityValue" :min="0" :precision="4" controls-position="right" class="w-full" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="负责部门" prop="responsibleDept">
                  <el-input v-model="form.responsibleDept" maxlength="64" clearable />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="数据来源" prop="dataSource">
                  <el-input v-model="form.dataSource" maxlength="64" clearable />
                </el-form-item>
              </el-col>
              <el-col :xs="24">
                <el-form-item label="备注">
                  <el-input v-model="form.remark" type="textarea" :rows="3" maxlength="200" show-word-limit />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>

          <div class="action-row">
            <el-button icon="Refresh" @click="resetForm">重置</el-button>
            <el-button v-hasPermi="['enterprise:activity:save']" type="primary" icon="Upload" :loading="saving" @click="saveActivity"
              >保存到本地活动数据</el-button
            >
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="10">
        <el-card shadow="never" class="mb-4">
          <template #header>
            <div class="card-head compact">
              <span>最近活动数据</span>
              <el-button link type="primary" icon="Refresh" :loading="listLoading" @click="loadRecentActivities">刷新</el-button>
            </div>
          </template>
          <el-table v-loading="listLoading" :data="recentActivities" size="small" height="230">
            <el-table-column prop="activityPeriod" label="期间" width="90" />
            <el-table-column prop="activityValue" label="活动数据" width="110" />
            <el-table-column prop="activityUnit" label="单位" width="80" />
            <el-table-column prop="remark" label="备注" show-overflow-tooltip />
            <el-table-column label="状态" width="90">
              <template #default="scope">
                <el-tag size="small" :type="scope.row.dataStatus === 'submitted' ? 'success' : 'info'">
                  {{ scope.row.dataStatus === 'submitted' ? '已提交' : '草稿' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <el-card shadow="never">
          <template #header>
            <span>手工校验结果</span>
          </template>
          <el-empty v-if="!manualIssues.length" description="暂无错误或警告" />
          <el-table v-else :data="manualIssues" size="small" border>
            <el-table-column label="级别" width="82">
              <template #default="scope">
                <el-tag size="small" :type="isBlockingIssue(scope.row) ? 'danger' : 'warning'">
                  {{ isBlockingIssue(scope.row) ? '强错误' : '弱警告' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="rowNumber" label="行号" width="72" />
            <el-table-column prop="sourceColumnCode" label="字段" width="86" />
            <el-table-column prop="message" label="说明" show-overflow-tooltip />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
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
import type { ActivityDataVO } from '@/api/enterprise/activityData/types';
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
  year?: number;
  month?: number;
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

const activityFormRef = ref<FormInstance>();
const validating = ref(false);
const saving = ref(false);
const uploadParsing = ref(false);
const uploadImporting = ref(false);
const sourceLoading = ref(false);
const listLoading = ref(false);
const emissionSources = ref<EmissionSourceVO[]>([]);
const recentActivities = ref<ActivityDataVO[]>([]);
const manualValidation = ref<Sheet656ImportValidationResult>();
const uploadValidation = ref<Sheet656ImportValidationResult>();
const manualResolvedDerivedValues = ref<DerivedValueMap>({});
const parsedUploadRequest = ref<Sheet656ImportValidationRequest>();
const uploadFileName = ref('');

const form = reactive<ActivityEntryForm>({
  sourceCode: undefined,
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
  date: undefined,
  activityValue: undefined,
  responsibleDept: undefined,
  dataSource: undefined,
  remark: undefined
});

const rules: FormRules<ActivityEntryForm> = {
  sourceCode: [{ required: true, message: '请选择排放源', trigger: 'change' }],
  year: [{ required: true, message: '请输入年度', trigger: 'blur' }],
  month: [{ required: true, message: '请输入月份', trigger: 'blur' }],
  date: [{ required: true, message: '请选择日期', trigger: 'change' }],
  activityValue: [{ required: true, message: '请输入活动数据', trigger: 'blur' }],
  responsibleDept: [{ required: true, message: '请输入负责部门', trigger: 'blur' }],
  dataSource: [{ required: true, message: '请输入数据来源', trigger: 'blur' }]
};

const selectedSource = computed(() => emissionSources.value.find((source) => source.sourceCode === form.sourceCode));
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

const sourceLabel = (source: EmissionSourceVO) => `${source.sourceCode} / ${source.sourceName}`;
const isBlockingIssue = (issue: Sheet656ValidationIssue) => issue.severity === 'ERROR';
const valueToString = (value?: string | number) => (value === undefined || value === null ? '' : String(value));
const firstQueryValue = (value: unknown) => (Array.isArray(value) ? value[0] : value);

const applyRouteQuery = () => {
  const sourceCode = firstQueryValue(route.query.emissionSourceCode);
  if (typeof sourceCode === 'string' && sourceCode) {
    form.sourceCode = sourceCode;
  }
  const activityPeriod = firstQueryValue(route.query.activityPeriod);
  if (typeof activityPeriod === 'string') {
    const [year, month] = activityPeriod.split('-').map((part) => Number(part));
    if (Number.isInteger(year) && year > 0) {
      form.year = year;
    }
    if (Number.isInteger(month) && month >= 1 && month <= 12) {
      form.month = month;
    }
  }
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
  const values: DerivedValueMap = {
    f001: form.sourceCode ?? '',
    f011: valueToString(form.year),
    f012: valueToString(form.month),
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

watch(
  () => [form.sourceCode, form.year, form.month, form.date, form.activityValue, form.responsibleDept, form.dataSource, form.remark],
  () => {
    manualValidation.value = undefined;
    manualResolvedDerivedValues.value = {};
  }
);

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
    ElMessage.error('服务端校验存在强错误');
    return;
  }
  ElMessage.success(result.valid ? '服务端校验通过' : '校验完成，存在弱警告');
};

const saveActivity = async () => {
  const valid = await validateFormFields();
  if (!valid) return;
  if (!selectedSource.value) {
    ElMessage.warning('请选择有效的本地排放源');
    return;
  }

  saving.value = true;
  try {
    const request = buildManualValidationRequest();
    const result = await runManualServerValidation(request);
    if (result.blocking) {
      ElMessage.error('存在强错误，不能保存');
      return;
    }

    const saveRes = await saveLocalSheet656Activity(request.rows[0]);
    if (saveRes.data?.validationResult) {
      manualValidation.value = saveRes.data.validationResult;
      applyManualResolvedDerivedValues(saveRes.data.validationResult);
    }

    const persisted = saveRes.data?.persisted === true || (saveRes.data?.persistedRowCount ?? 0) > 0;
    if (!persisted) {
      ElMessage.warning('导入未持久化，请根据校验结果复核后重试');
      return;
    }

    ElMessage.success(manualWarningIssues.value.length ? '已保存，存在弱警告请复核' : '保存成功');
    await loadRecentActivities();
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
      ElMessage.error('上传文件校验存在强错误');
      return false;
    }
    ElMessage.success(validation.valid ? '上传文件校验通过' : '文件校验完成，存在弱警告');
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
      ElMessage.error('上传文件存在强错误，不能导入');
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

    ElMessage.success(uploadWarningIssues.value.length ? '上传文件已导入，存在弱警告请复核' : '上传文件导入成功');
    await loadRecentActivities();
  } finally {
    uploadImporting.value = false;
  }
};

const resetForm = () => {
  activityFormRef.value?.resetFields();
  manualValidation.value = undefined;
  manualResolvedDerivedValues.value = {};
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

const loadRecentActivities = async () => {
  listLoading.value = true;
  try {
    const res = await listLocalActivityData({ pageNum: 1, pageSize: 10 });
    recentActivities.value = (res.rows ?? res.data ?? []) as ActivityDataVO[];
  } finally {
    listLoading.value = false;
  }
};

onMounted(() => {
  applyRouteQuery();
  loadEmissionSources();
  loadRecentActivities();
});
</script>

<style scoped lang="scss">
.enterprise-activity-page {
  .card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;

    p {
      margin: 4px 0 0;
      color: var(--el-text-color-secondary);
      font-size: 13px;
    }
  }

  .compact {
    min-height: 32px;
  }

  .action-row {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
}
</style>
