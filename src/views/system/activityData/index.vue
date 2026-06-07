<template>
  <div class="page-panel">
    <!-- 页面头部 -->
    <div class="page-head">
      <div>
        <h1>活动数据</h1>
        <p>管理排放源活动数据，记录能源消耗、物料使用等原始活动水平数据，支持数据校验与审核。</p>
      </div>
      <div class="btns">
        <el-button @click="handleExport" v-hasPermi="['system:activityData:export']" icon="Download">导出</el-button>
        <el-button type="primary" @click="handleAdd" v-hasPermi="['system:activityData:add']" icon="Plus">新增活动数据</el-button>
      </div>
    </div>

    <div class="panel">
      <!-- 搜索栏 -->
      <div class="search-bar wide" v-show="showSearch">
        <div class="search-item">
          <label>排放源ID</label>
          <el-input v-model="queryParams.sourceId" placeholder="请输入排放源ID" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>数据期间</label>
          <el-input v-model="queryParams.dataPeriod" placeholder="请输入数据期间(YYYY-MM)" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>数据年份</label>
          <el-input v-model="queryParams.dataYear" placeholder="请输入数据年份" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>数据类型</label>
          <el-input v-model="queryParams.dataType" placeholder="原始数据/计算值" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>校验状态</label>
          <el-input v-model="queryParams.verificationStatus" placeholder="0待校验 1已校验 2已退回" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-actions">
          <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          <el-button link type="primary" @click="showSearch = false">
            <el-icon><ArrowUp /></el-icon>
          </el-button>
        </div>
      </div>

      <!-- 工具栏(搜索收起时) -->
      <div class="toolbar" v-show="!showSearch">
        <div class="btns">
          <el-button type="primary" icon="Search" @click="showSearch = true">展开搜索</el-button>
          <el-button type="primary" icon="Plus" @click="handleAdd" v-hasPermi="['system:activityData:add']">新增</el-button>
          <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['system:activityData:remove']"
            >删除</el-button
          >
          <el-button icon="Download" @click="handleExport" v-hasPermi="['system:activityData:export']">导出</el-button>
        </div>
        <span class="select-count" v-if="ids.length > 0">已选 {{ ids.length }} 项</span>
      </div>

      <!-- 数据表格 -->
      <el-table v-loading="loading" :data="activityDataList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="42" align="center" />
        <el-table-column label="排放源ID" align="center" prop="sourceId" />
        <el-table-column label="数据期间" align="center" prop="dataPeriod" />
        <el-table-column label="数据年份" align="center" prop="dataYear" />
        <el-table-column label="活动数据值" align="center" prop="activityValue" />
        <el-table-column label="活动数据单位" align="center" prop="activityUnit" />
        <el-table-column label="数据类型" align="center" prop="dataType" />
        <el-table-column label="数据来源说明" align="center" prop="dataSource" :show-overflow-tooltip="true" />
        <el-table-column label="计算公式" align="center" prop="calculationFormula" :show-overflow-tooltip="true" />
        <el-table-column label="排放量计算结果" align="center" prop="emissionResult" />
        <el-table-column label="校验状态" align="center" prop="verificationStatus">
          <template #default="scope">
            <span class="tag" :class="scope.row.verificationStatus === '0' ? 'ok' : scope.row.verificationStatus === '1' ? 'ok' : 'gray'">
              {{ scope.row.verificationStatus === '0' ? '待校验' : scope.row.verificationStatus === '1' ? '已校验' : '已退回' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="扩展字段" align="center" prop="extendJson" :show-overflow-tooltip="true" />
        <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
        <el-table-column label="操作" align="center" width="150" fixed="right">
          <template #default="scope">
            <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:activityData:edit']">编辑</el-button>
            <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:activityData:remove']">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </div>

    <!-- 侧栏抽屉表单 -->
    <el-drawer v-model="dialog.visible" :title="dialog.title" size="760px" append-to-body :close-on-click-modal="false">
      <el-alert class="mb16" type="info" show-icon :closable="false">
        <template #title>sheet_656 活动数据录入：f001 从排放源主数据选择，f002-f010 和 f018 由服务端校验派生只读展示。</template>
      </el-alert>

      <el-alert v-if="blockingIssues.length" class="mb16" type="error" show-icon :closable="false">
        <template #title>强错误 {{ blockingIssues.length }} 条：必须修正后才能保存或提交。</template>
      </el-alert>
      <el-alert v-if="warningIssues.length" class="mb16" type="warning" show-icon :closable="false">
        <template #title>弱警告 {{ warningIssues.length }} 条：可保存草稿，也可继续提交。</template>
      </el-alert>
      <el-alert v-if="lastValidation && !allIssues.length" class="mb16" type="success" show-icon :closable="false">
        <template #title>服务端校验通过。</template>
      </el-alert>

      <el-form ref="activityDataFormRef" :model="sheetForm" :rules="rules" label-width="150px" class="sheet656-form">
        <div class="section-title">排放源主数据</div>
        <el-row :gutter="16">
          <el-col :xs="24" :sm="12">
            <el-form-item label="f001 排放源识别编号" prop="f001">
              <el-select
                v-model="sheetForm.f001"
                filterable
                clearable
                placeholder="请选择排放源"
                :loading="sourceLoading"
                class="w-full"
                @change="handleSourceChange"
              >
                <el-option v-for="item in emissionSources" :key="item.id" :label="sourceOptionLabel(item)" :value="item.sourceCode" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col v-for="field in derivedDisplayFields" :key="field.code" :xs="24" :sm="12">
            <el-form-item :label="`${field.code} ${field.name}`">
              <el-input :model-value="displayValue(field.code)" readonly />
            </el-form-item>
          </el-col>
        </el-row>

        <div class="section-title">可编辑活动数据</div>
        <el-row :gutter="16">
          <el-col :xs="24" :sm="12">
            <el-form-item label="f011 年度" prop="f011">
              <el-input-number v-model="sheetForm.f011" :min="2000" :max="2100" controls-position="right" class="w-full" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="f012 月份" prop="f012">
              <el-input-number v-model="sheetForm.f012" :min="1" :max="12" controls-position="right" class="w-full" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="f013 日期" prop="f013">
              <el-date-picker v-model="sheetForm.f013" clearable type="date" value-format="YYYY-MM-DD" placeholder="请选择日期" class="w-full" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="f014 活动数据" prop="f014">
              <el-input-number v-model="sheetForm.f014" :min="0" :precision="4" controls-position="right" class="w-full" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="f015 负责部门" prop="f015">
              <el-input v-model="sheetForm.f015" maxlength="64" clearable placeholder="请输入负责部门" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="f016 数据来源" prop="f016">
              <el-input v-model="sheetForm.f016" maxlength="64" clearable placeholder="请输入数据来源" />
            </el-form-item>
          </el-col>
          <el-col :xs="24">
            <el-form-item label="f017 备注" prop="f017">
              <el-input v-model="sheetForm.f017" type="textarea" :rows="3" maxlength="200" show-word-limit placeholder="请输入备注" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div class="validation-panel">
        <div class="section-title">校验结果</div>
        <el-empty v-if="!allIssues.length" description="暂无强错误或弱警告" />
        <el-table v-else :data="allIssues" border size="small">
          <el-table-column label="分区" width="100">
            <template #default="scope">
              <el-tag :type="isBlockingIssue(scope.row) ? 'danger' : 'warning'">
                {{ isBlockingIssue(scope.row) ? '强错误' : '弱警告' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="sourceColumnCode" label="字段" width="110" />
          <el-table-column prop="sourceColumnName" label="列名" width="180" show-overflow-tooltip />
          <el-table-column prop="code" label="错误码" width="180" show-overflow-tooltip />
          <el-table-column prop="message" label="说明" min-width="220" show-overflow-tooltip />
        </el-table>
      </div>

      <template #footer>
        <el-button :loading="validating" icon="CircleCheck" @click="handleValidate">校验</el-button>
        <el-button :loading="buttonLoading" type="success" @click="saveActivityData('draft')">保存草稿</el-button>
        <el-button :loading="buttonLoading" type="primary" @click="saveActivityData('submit')">继续提交</el-button>
        <el-button @click="cancel">取 消</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup name="ActivityData" lang="ts">
import { listActivityData, getActivityData, delActivityData, addActivityData, updateActivityData } from '@/api/system/activityData';
import { ActivityDataVO, ActivityDataQuery, ActivityDataForm } from '@/api/system/activityData/types';
import { listEmissionSource } from '@/api/system/emissionSource';
import { EmissionSourceVO } from '@/api/system/emissionSource/types';
import { validateSheet656Activity } from '@/api/enterprise/sheet656ActivityValidation';
import {
  Sheet656FieldDescriptor,
  Sheet656FieldValue,
  Sheet656ImportValidationRequest,
  Sheet656ImportValidationResult,
  Sheet656ValidationIssue
} from '@/api/enterprise/sheet656ActivityValidation/types';

interface Sheet656Form {
  f001?: string;
  f011?: number;
  f012?: number;
  f013?: string;
  f014?: number;
  f015?: string;
  f016?: string;
  f017?: string;
}

type DerivedValueMap = Record<string, string>;
type SaveMode = 'draft' | 'submit';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

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

const derivedDisplayFields = FIELD_DESCRIPTORS.filter((field) => field.derivedField).map((field) => ({
  code: field.sourceColumnCode,
  name: field.sourceColumnName
}));

const activityDataList = ref<ActivityDataVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const validating = ref(false);
const sourceLoading = ref(false);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const emissionSources = ref<EmissionSourceVO[]>([]);
const lastValidation = ref<Sheet656ImportValidationResult>();
const resolvedDerivedValues = ref<DerivedValueMap>({});

const queryFormRef = ref<ElFormInstance>();
const activityDataFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: ActivityDataForm = {
  id: undefined,
  sourceId: undefined,
  dataPeriod: undefined,
  dataYear: undefined,
  activityValue: undefined,
  activityUnit: undefined,
  dataType: undefined,
  dataSource: undefined,
  calculationFormula: undefined,
  emissionResult: undefined,
  verificationStatus: undefined,
  extendJson: undefined,
  remark: undefined
};

const initSheetFormData: Sheet656Form = {
  f001: undefined,
  f011: undefined,
  f012: undefined,
  f013: undefined,
  f014: undefined,
  f015: undefined,
  f016: undefined,
  f017: undefined
};

const data = reactive<PageData<ActivityDataForm, ActivityDataQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    sourceId: undefined,
    dataPeriod: undefined,
    dataYear: undefined,
    activityValue: undefined,
    activityUnit: undefined,
    dataType: undefined,
    dataSource: undefined,
    calculationFormula: undefined,
    emissionResult: undefined,
    verificationStatus: undefined,
    extendJson: undefined,
    params: {}
  },
  rules: {
    f001: [{ required: true, message: '请选择排放源', trigger: 'change' }],
    f011: [{ required: true, message: '请输入年度', trigger: 'blur' }],
    f012: [{ required: true, message: '请输入月份', trigger: 'blur' }],
    f013: [{ required: true, message: '请选择日期', trigger: 'change' }],
    f014: [{ required: true, message: '请输入活动数据', trigger: 'blur' }],
    f015: [{ required: true, message: '请输入负责部门', trigger: 'blur' }],
    f016: [{ required: true, message: '请输入数据来源', trigger: 'blur' }]
  }
});

const sheetForm = reactive<Sheet656Form>({ ...initSheetFormData });
const { queryParams, form, rules } = toRefs(data);
const selectedSource = computed(() => emissionSources.value.find((item) => item.sourceCode === sheetForm.f001));
const selectedSourceId = computed(() => selectedSource.value?.id);
const headerIssues = computed(() => lastValidation.value?.headerIssues ?? []);
const rowIssues = computed(() => lastValidation.value?.rowResults?.flatMap((row) => row.issues ?? []) ?? []);
const allIssues = computed(() => [...headerIssues.value, ...rowIssues.value]);
const blockingIssues = computed(() => allIssues.value.filter((issue) => isBlockingIssue(issue)));
const warningIssues = computed(() => allIssues.value.filter((issue) => !isBlockingIssue(issue)));

/** 查询活动数据列表 */
const getList = async () => {
  loading.value = true;
  const res = await listActivityData(queryParams.value);
  activityDataList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

const loadEmissionSources = async () => {
  sourceLoading.value = true;
  try {
    const res = await listEmissionSource({ pageNum: 1, pageSize: 500, status: '0' });
    emissionSources.value = (res.rows ?? res.data ?? []) as EmissionSourceVO[];
  } finally {
    sourceLoading.value = false;
  }
};

const sourceOptionLabel = (source: EmissionSourceVO) => `${source.sourceCode} / ${source.sourceName}`;
const isBlockingIssue = (issue: Sheet656ValidationIssue) => issue.severity === 'ERROR';
const valueToString = (value?: string | number) => (value === undefined || value === null ? '' : String(value));

const deriveFromSource = (code: string) => {
  const source = selectedSource.value;
  if (!source) return '';
  const localMap: DerivedValueMap = {
    f005: source.category,
    f006: source.scopeType,
    f007: source.scopeDetail,
    f008: source.description,
    f009: source.sourceName,
    f010: source.remark
  };
  return localMap[code] ?? '';
};

const displayValue = (code: string) => resolvedDerivedValues.value[code] ?? deriveFromSource(code) ?? '';

const resetSheetForm = () => {
  Object.assign(sheetForm, initSheetFormData);
  resolvedDerivedValues.value = {};
  lastValidation.value = undefined;
};

const handleSourceChange = () => {
  resolvedDerivedValues.value = {};
  lastValidation.value = undefined;
};

const buildFieldValues = (derivedValues: DerivedValueMap = {}): Sheet656FieldValue[] => {
  const values: DerivedValueMap = {
    f001: sheetForm.f001 ?? '',
    f011: valueToString(sheetForm.f011),
    f012: valueToString(sheetForm.f012),
    f013: sheetForm.f013 ?? '',
    f014: valueToString(sheetForm.f014),
    f015: sheetForm.f015 ?? '',
    f016: sheetForm.f016 ?? '',
    f017: sheetForm.f017 ?? ''
  };

  for (const field of derivedDisplayFields) {
    values[field.code] = derivedValues[field.code] ?? displayValue(field.code);
  }

  return FIELD_DESCRIPTORS.map((field) => ({
    sourceColumnCode: field.sourceColumnCode,
    sourceColumnName: field.sourceColumnName,
    value: values[field.sourceColumnCode] ?? ''
  }));
};

const buildValidationRequest = (): Sheet656ImportValidationRequest => ({
  headerFields: FIELD_DESCRIPTORS,
  rows: [{ rowNumber: 2, fieldValues: buildFieldValues() }]
});

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
  if (!activityDataFormRef.value) return false;
  return activityDataFormRef.value.validate().catch(() => false);
};

const runServerValidation = async () => {
  validating.value = true;
  try {
    const res = await validateSheet656Activity(buildValidationRequest());
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
    proxy?.$modal.msgError('校验存在强错误');
    return;
  }
  proxy?.$modal.msgSuccess(result.valid ? '校验通过' : '校验完成，存在弱警告');
};

const buildActivityDataPayload = (mode: SaveMode): ActivityDataForm => {
  const month = String(sheetForm.f012).padStart(2, '0');
  const finalFieldValues = buildFieldValues(resolvedDerivedValues.value);
  return {
    id: form.value.id,
    sourceId: selectedSourceId.value,
    dataPeriod: `${sheetForm.f011}-${month}`,
    dataYear: sheetForm.f011,
    activityValue: sheetForm.f014,
    dataType: '原始数据',
    dataSource: sheetForm.f016,
    verificationStatus: mode === 'submit' ? '1' : '0',
    extendJson: JSON.stringify({
      templateCode: 'sheet_656',
      templateName: '天然气活动数据',
      headerFields: FIELD_DESCRIPTORS,
      fieldValues: finalFieldValues,
      validation: lastValidation.value,
      saveMode: mode
    }),
    remark: sheetForm.f017
  };
};

const saveActivityData = async (mode: SaveMode) => {
  const valid = await validateFormFields();
  if (!valid) return;
  if (!selectedSourceId.value) {
    proxy?.$modal.msgWarning('请选择有效的排放源');
    return;
  }

  buttonLoading.value = true;
  try {
    const result = await runServerValidation();
    if (result.blocking) {
      proxy?.$modal.msgError('存在强错误，不能保存或提交');
      return;
    }
    const payload = buildActivityDataPayload(mode);
    if (payload.id) {
      await updateActivityData(payload);
    } else {
      await addActivityData(payload);
    }
    proxy?.$modal.msgSuccess(warningIssues.value.length ? '已保存，存在弱警告请关注' : '操作成功');
    dialog.visible = false;
    await getList();
  } finally {
    buttonLoading.value = false;
  }
};

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
};

/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  resetSheetForm();
  activityDataFormRef.value?.resetFields();
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

/** 多选框选中数据 */
const handleSelectionChange = (selection: ActivityDataVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '新增 sheet_656 活动数据';
  loadEmissionSources();
};

/** 修改按钮操作 */
const handleUpdate = async (row?: ActivityDataVO) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getActivityData(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改 sheet_656 活动数据';
  await loadEmissionSources();
};

/** 保留旧入口，抽屉 footer 使用 saveActivityData */
const submitForm = () => {
  saveActivityData('submit');
};

/** 删除按钮操作 */
const handleDelete = async (row?: ActivityDataVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除活动数据编号为"' + _ids + '"的数据项？').finally(() => (loading.value = false));
  await delActivityData(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'system/activityData/export',
    {
      ...queryParams.value
    },
    `activityData_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
  loadEmissionSources();
});
</script>

<style scoped lang="scss">
.sheet656-form {
  .section-title {
    margin: 6px 0 14px;
    padding-left: 8px;
    border-left: 3px solid var(--el-color-primary);
    font-size: 15px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .section-title:not(:first-child) {
    margin-top: 18px;
  }
}

.validation-panel {
  margin-top: 8px;

  .section-title {
    margin: 6px 0 14px;
    padding-left: 8px;
    border-left: 3px solid var(--el-color-primary);
    font-size: 15px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}

.mb16 {
  margin-bottom: 16px;
}
</style>
