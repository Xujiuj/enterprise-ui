<template>
  <div class="p-2 enterprise-activity-page">
    <el-row :gutter="16">
      <el-col :xs="24" :lg="14">
        <el-card shadow="never">
          <template #header>
            <div class="card-head">
              <div>
                <span>sheet_656 活动录入</span>
                <p>先走企业端校验接口，校验通过后再写入本地活动数据。</p>
              </div>
              <el-button type="primary" icon="CircleCheck" :loading="validating" @click="handleValidate">服务端校验</el-button>
            </div>
          </template>

          <el-alert v-if="blockingIssues.length" class="mb-4" type="error" show-icon :closable="false">
            <template #title>存在 {{ blockingIssues.length }} 条强错误，不能保存。</template>
          </el-alert>
          <el-alert v-else-if="warningIssues.length" class="mb-4" type="warning" show-icon :closable="false">
            <template #title>存在 {{ warningIssues.length }} 条弱警告，允许保存但需复核。</template>
          </el-alert>
          <el-alert v-else-if="lastValidation" class="mb-4" type="success" show-icon :closable="false">
            <template #title>服务端校验通过。</template>
          </el-alert>

          <el-form ref="activityFormRef" :model="form" :rules="rules" label-width="150px">
            <el-row :gutter="16">
              <el-col :xs="24" :sm="12">
                <el-form-item label="排放源" prop="sourceCode">
                  <el-select
                    v-model="form.sourceCode"
                    class="w-full"
                    clearable
                    filterable
                    :loading="sourceLoading"
                    placeholder="选择本地排放源"
                    @change="handleSourceChange"
                  >
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
              <el-col :xs="24" :sm="12">
                <el-form-item label="保存状态" prop="saveMode">
                  <el-segmented v-model="form.saveMode" :options="saveModeOptions" />
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
            <el-button type="primary" icon="Upload" :loading="saving" @click="saveActivity">保存到本地活动数据</el-button>
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
            <el-table-column prop="dataPeriod" label="期间" width="90" />
            <el-table-column prop="activityValue" label="活动数据" width="110" />
            <el-table-column prop="dataSource" label="来源" show-overflow-tooltip />
            <el-table-column label="状态" width="90">
              <template #default="scope">
                <el-tag size="small" :type="scope.row.verificationStatus === '1' ? 'success' : 'info'">
                  {{ scope.row.verificationStatus === '1' ? '已校验' : '草稿' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <el-card shadow="never">
          <template #header>
            <span>校验结果</span>
          </template>
          <el-empty v-if="!allIssues.length" description="暂无错误或警告" />
          <el-table v-else :data="allIssues" size="small" border>
            <el-table-column label="级别" width="82">
              <template #default="scope">
                <el-tag size="small" :type="isBlockingIssue(scope.row) ? 'danger' : 'warning'">
                  {{ isBlockingIssue(scope.row) ? '强错误' : '弱警告' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="sourceColumnCode" label="字段" width="86" />
            <el-table-column prop="message" label="说明" show-overflow-tooltip />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="EnterpriseActivityEntry" lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import {
  createLocalActivityData,
  listLocalActivityData,
  listLocalEmissionSource,
  validateLocalSheet656Activity
} from '@/api/enterprise/activityEntry';
import type { ActivityDataForm, ActivityDataVO } from '@/api/system/activityData/types';
import type { EmissionSourceVO } from '@/api/system/emissionSource/types';
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
  saveMode: 'draft' | 'submit';
}

type DerivedValueMap = Record<string, string>;

const FIELD_DESCRIPTORS: Sheet656FieldDescriptor[] = [
  { fieldOrder: 1, sourceColumnCode: 'f001', sourceColumnName: 'PK_排放源识别编号', sourceRequired: false, rowValueRequired: true, derivedField: false },
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
const sourceLoading = ref(false);
const listLoading = ref(false);
const emissionSources = ref<EmissionSourceVO[]>([]);
const recentActivities = ref<ActivityDataVO[]>([]);
const lastValidation = ref<Sheet656ImportValidationResult>();
const resolvedDerivedValues = ref<DerivedValueMap>({});

const form = reactive<ActivityEntryForm>({
  sourceCode: undefined,
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
  date: undefined,
  activityValue: undefined,
  responsibleDept: undefined,
  dataSource: undefined,
  remark: undefined,
  saveMode: 'draft'
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

const saveModeOptions = [
  { label: '草稿', value: 'draft' },
  { label: '提交', value: 'submit' }
];

const selectedSource = computed(() => emissionSources.value.find((source) => source.sourceCode === form.sourceCode));
const headerIssues = computed(() => lastValidation.value?.headerIssues ?? []);
const rowIssues = computed(() => lastValidation.value?.rowResults?.flatMap((row) => row.issues ?? []) ?? []);
const allIssues = computed(() => [...headerIssues.value, ...rowIssues.value]);
const blockingIssues = computed(() => allIssues.value.filter((issue) => isBlockingIssue(issue)));
const warningIssues = computed(() => allIssues.value.filter((issue) => !isBlockingIssue(issue)));

const sourceLabel = (source: EmissionSourceVO) => `${source.sourceCode} / ${source.sourceName}`;
const isBlockingIssue = (issue: Sheet656ValidationIssue) => issue.severity === 'ERROR';
const valueToString = (value?: string | number) => (value === undefined || value === null ? '' : String(value));

const handleSourceChange = () => {
  lastValidation.value = undefined;
  resolvedDerivedValues.value = {};
};

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
    ...resolvedDerivedValues.value
  };

  return FIELD_DESCRIPTORS.map((field) => ({
    sourceColumnCode: field.sourceColumnCode,
    sourceColumnName: field.sourceColumnName,
    value: values[field.sourceColumnCode] ?? ''
  }));
};

const buildValidationRequest = (): Sheet656ImportValidationRequest => ({
  headerFields: FIELD_DESCRIPTORS,
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
    lastValidation.value = undefined;
  }
);

const applyResolvedDerivedValues = (result: Sheet656ImportValidationResult) => {
  const resolved = result.rowResults?.[0]?.resolvedDerivedFieldValues ?? [];
  resolvedDerivedValues.value = resolved.reduce<DerivedValueMap>((acc, field) => {
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

const runServerValidation = async () => {
  validating.value = true;
  try {
    const res = await validateLocalSheet656Activity(buildValidationRequest());
    lastValidation.value = res.data;
    applyResolvedDerivedValues(res.data);
    return res.data;
  } finally {
    validating.value = false;
  }
};

const handleValidate = async () => {
  const valid = await validateFormFields();
  if (!valid) return;
  const result = await runServerValidation();
  if (result.blocking) {
    ElMessage.error('服务端校验存在强错误');
    return;
  }
  ElMessage.success(result.valid ? '服务端校验通过' : '校验完成，存在弱警告');
};

const buildActivityPayload = (): ActivityDataForm => {
  const month = String(form.month).padStart(2, '0');
  return {
    sourceId: selectedSource.value?.id,
    dataPeriod: `${form.year}-${month}`,
    dataYear: form.year,
    activityValue: form.activityValue,
    dataType: '原始数据',
    dataSource: form.dataSource,
    verificationStatus: form.saveMode === 'submit' ? '1' : '0',
    extendJson: JSON.stringify({
      templateCode: 'sheet_656',
      headerFields: FIELD_DESCRIPTORS,
      fieldValues: buildFieldValues(),
      validation: lastValidation.value,
      saveMode: form.saveMode
    }),
    remark: form.remark
  };
};

const saveActivity = async () => {
  const valid = await validateFormFields();
  if (!valid) return;
  if (!selectedSource.value?.id) {
    ElMessage.warning('请选择有效的本地排放源');
    return;
  }

  saving.value = true;
  try {
    const result = await runServerValidation();
    if (result.blocking) {
      ElMessage.error('存在强错误，不能保存');
      return;
    }
    await createLocalActivityData(buildActivityPayload());
    ElMessage.success(warningIssues.value.length ? '已保存，存在弱警告请复核' : '保存成功');
    await loadRecentActivities();
  } finally {
    saving.value = false;
  }
};

const resetForm = () => {
  activityFormRef.value?.resetFields();
  form.saveMode = 'draft';
  lastValidation.value = undefined;
  resolvedDerivedValues.value = {};
};

const loadEmissionSources = async () => {
  sourceLoading.value = true;
  try {
    const res = await listLocalEmissionSource({ pageNum: 1, pageSize: 500, status: '0' });
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
