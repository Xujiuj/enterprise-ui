<template>
  <div class="enterprise-activity-entry">
    <section class="panel search-panel">
      <el-form v-show="showSearch" ref="queryFormRef" :model="queryParams" :inline="true" label-width="88px" class="search-bar wide activity-search">
        <el-form-item label="排放源" prop="emissionSourceName">
          <el-select v-model="queryParams.emissionSourceName" clearable filterable :loading="sourceLoading" class="query-source">
            <el-option v-for="option in emissionSourceNameOptions" :key="option.value" :label="option.label" :value="option.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="公司" prop="companyName">
          <el-select v-model="queryParams.companyName" clearable filterable class="query-medium">
            <el-option v-for="option in companyOptions" :key="String(option.value)" :label="option.label" :value="option.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="工厂" prop="factoryName">
          <el-select v-model="queryParams.factoryName" clearable filterable class="query-medium">
            <el-option v-for="option in factoryOptions" :key="String(option.value)" :label="option.label" :value="option.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="排放源分类" prop="sourceCategoryKey">
          <el-select v-model="queryParams.sourceCategoryKey" clearable filterable class="query-medium">
            <el-option v-for="option in sourceCategoryOptions" :key="String(option.value)" :label="option.label" :value="option.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="活动期间">
          <el-date-picker v-model="selectedQueryPeriod" type="month" value-format="YYYY-MM" class="query-month" @change="handleQueryPeriodChange" />
        </el-form-item>
        <el-form-item label="负责部门" prop="responsibleDept">
          <el-select v-model="queryParams.responsibleDept" clearable filterable class="query-medium">
            <el-option v-for="option in deptOptions" :key="String(option.value)" :label="option.label" :value="option.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="数据来源" prop="dataSource">
          <el-select v-model="queryParams.dataSource" clearable filterable class="query-medium">
            <el-option v-for="option in dataSourceOptions" :key="String(option.value)" :label="option.label" :value="option.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="数据状态" prop="dataStatus">
          <el-select v-model="queryParams.dataStatus" clearable class="query-status">
            <el-option v-for="option in activityDataStatusOptions" :key="String(option.value)" :label="option.label" :value="option.value" />
          </el-select>
        </el-form-item>
        <div class="search-actions">
          <right-toolbar v-model:showSearch="showSearch" :columns="activityColumnOptions" :gutter="0" @query-table="loadActivities" />
        </div>
      </el-form>
      <div class="search-bar search-bar-collapsed" v-show="!showSearch">
        <div class="search-actions">
          <right-toolbar v-model:showSearch="showSearch" :columns="activityColumnOptions" :gutter="0" @query-table="loadActivities" />
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
        <el-table-column
          v-for="column in visibleActivityTableColumns"
          :key="column.prop"
          :prop="column.prop"
          :label="column.label"
          :width="column.width"
          :min-width="column.minWidth"
          :align="column.align"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            {{ formatActivityCell(row, column.prop) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="170" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" icon="View" @click="openDetailDrawer(row)">查看</el-button>
            <el-button link type="primary" icon="Edit" @click="openEditDrawer(row)" v-hasPermi="['enterprise:activityImport:import']">编辑</el-button>
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
          <el-col :xs="24">
            <el-form-item label="排放源" prop="sourceIdentificationCode">
              <el-select
                v-model="form.sourceIdentificationCode"
                class="w-full"
                clearable
                filterable
                :loading="sourceLoading"
                :disabled="formDrawer.readonly"
                placeholder="请选择排放源（选择后自动填充相关信息）"
                @change="handleSourceSelect"
              >
                <el-option v-for="option in allSourceOptions" :key="option.value" :label="option.label" :value="option.value">
                  <div class="source-option">
                    <span class="source-option-name">{{ option.label }}</span>
                    <span class="source-option-info">{{ option.info }}</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="公司名称">
              <el-input :model-value="form.sourceCompanyName || derivedFieldValue('f003')" disabled />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="工厂">
              <el-input :model-value="form.sourceFactoryName || derivedFieldValue('f004')" disabled />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="排放源分类">
              <el-input :model-value="form.sourceCategoryKey || derivedFieldValue('f005')" disabled />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="范围">
              <el-input :model-value="form.scopeName || derivedFieldValue('f006')" disabled />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="范围子类别">
              <el-input :model-value="form.scopeSubcategory || derivedFieldValue('f007')" disabled />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="排放源识别">
              <el-input :model-value="form.sourceIdentificationName || derivedFieldValue('f008')" disabled />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="排放源名称">
              <el-input :model-value="derivedFieldValue('f009')" disabled />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="活动期间" prop="selectedPeriod">
              <el-date-picker v-model="form.selectedPeriod" type="month" value-format="YYYY-MM" class="w-full" :disabled="formDrawer.readonly" />
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
                :precision="2"
                controls-position="right"
                class="w-full"
                :disabled="formDrawer.readonly"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="单位">
              <el-input :model-value="derivedActivityUnit" disabled />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="适用因子">
              <el-input :model-value="derivedFieldValue('f018')" disabled />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="负责部门" prop="responsibleDept">
              <el-select v-model="form.responsibleDept" clearable filterable class="w-full" :disabled="formDrawer.readonly">
                <el-option v-for="option in deptOptions" :key="String(option.value)" :label="option.label" :value="option.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="数据来源" prop="dataSource">
              <el-select v-model="form.dataSource" clearable filterable class="w-full" :disabled="formDrawer.readonly">
                <el-option v-for="option in dataSourceOptions" :key="String(option.value)" :label="option.label" :value="option.value" />
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
      <el-upload drag action="#" accept=".xlsx" :auto-upload="false" :show-file-list="false" :on-change="parseUploadedFile">
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
      <SpreadsheetEditor
        title="sheet_656"
        :columns="sheetColumns"
        :rows="sheetRows"
        :empty-row="sheetEmptyRow"
        :saving="sheetSaving"
        hint="字段名称严格保持 sheet_656 原始表头。维度字段通过排放源下拉选择，保存前会调用服务端校验并自动带出公司、分类、单位和因子。"
        @save="saveSheetRows"
      />
    </el-drawer>
  </div>
</template>

<script setup name="EnterpriseActivityEntry" lang="ts">
import { UploadFilled } from '@element-plus/icons-vue';
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage, type FormInstance, type FormRules, type UploadFile, type UploadRawFile } from 'element-plus';
import { useAutoQuery } from '@/hooks/useAutoQuery';
import { downloadXlsxTemplate } from '@/utils/xlsxTemplate';
import SpreadsheetEditor from '@/components/SpreadsheetEditor/index.vue';
import type { SpreadsheetColumn } from '@/components/SpreadsheetEditor/types';
import {
  importLocalSheet656Activity,
  listLocalActivityData,
  listLocalEmissionSource,
  parseLocalSheet656ActivityFile,
  saveLocalSheet656Activity,
  validateLocalSheet656Activity
} from '@/api/enterprise/activityEntry';
import {
  loadActivityDataStatusOptions,
  loadCompanyNameOptions,
  loadDataSourceOptions,
  loadFactoryNameOptions,
  loadResponsibleDeptOptions,
  loadSourceCategoryOptions,
  type SelectOption
} from '@/utils/enterpriseFieldOptions';
import type { ActivityDataQuery, ActivityDataVO } from '@/api/enterprise/activityData/types';
import type { EmissionSourceVO } from '@/api/enterprise/emissionSource/types';
import type {
  Sheet656FieldDescriptor,
  Sheet656FieldValue,
  Sheet656ImportValidationRequest,
  Sheet656ImportValidationResult,
  Sheet656ValidationIssue
} from '@/api/enterprise/sheet656ActivityValidation/types';
import {
  filteredEmissionSourceOptions,
  sourceOptionLabel,
  uniqueEmissionSourceNameOptions,
  uniqueSourceFieldOptions,
  type EmissionSourceHierarchyFilters
} from './options';

interface ActivityEntryForm {
  sourceCompanyName?: string;
  sourceFactoryName?: string;
  sourceCategoryKey?: string;
  scopeName?: string;
  scopeSubcategory?: string;
  sourceIdentificationName?: string;
  sourceIdentificationCode?: string;
  selectedPeriod?: string;
  date?: string;
  activityValue?: number;
  responsibleDept?: string;
  dataSource?: string;
  remark?: string;
}

type DerivedValueMap = Record<string, string>;
type SourceHierarchyFormField =
  | 'sourceCompanyName'
  | 'sourceFactoryName'
  | 'sourceCategoryKey'
  | 'scopeName'
  | 'scopeSubcategory'
  | 'sourceIdentificationName';
type ActivityTableColumn = {
  prop: keyof ActivityDataVO;
  label: string;
  width?: number;
  minWidth?: number;
  align?: 'left' | 'center' | 'right';
};

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
const showSearch = ref(true);
const sourceLoading = ref(false);
const validating = ref(false);
const saving = ref(false);
const uploadParsing = ref(false);
const uploadImporting = ref(false);
const total = ref(0);
const activityList = ref<ActivityDataVO[]>([]);
const emissionSources = ref<EmissionSourceVO[]>([]);
const companyOptions = ref<SelectOption[]>([]);
const factoryOptions = ref<SelectOption[]>([]);
const sourceCategoryOptions = ref<SelectOption[]>([]);
const deptOptions = ref<SelectOption[]>([]);
const dataSourceOptions = ref<SelectOption[]>([]);
const activityDataStatusOptions = ref<SelectOption[]>([]);
const manualValidation = ref<Sheet656ImportValidationResult>();
const uploadValidation = ref<Sheet656ImportValidationResult>();
const manualResolvedDerivedValues = ref<DerivedValueMap>({});
const parsedUploadRequest = ref<Sheet656ImportValidationRequest>();
const uploadFileName = ref('');
const selectedQueryPeriod = ref('');
const initializingForm = ref(false);
const emissionSourceNameOptions = computed(() => uniqueEmissionSourceNameOptions(emissionSources.value));
const sourceCompanyOptions = computed(() => uniqueSourceFieldOptions(emissionSources.value, 'companyName'));
const sourceFactoryOptions = computed(() =>
  uniqueSourceFieldOptions(emissionSources.value, 'factoryName', {
    companyName: form.sourceCompanyName
  })
);
const sourceCategoryCascadeOptions = computed(() =>
  uniqueSourceFieldOptions(emissionSources.value, 'sourceCategoryKey', {
    companyName: form.sourceCompanyName,
    factoryName: form.sourceFactoryName
  })
);
const sourceScopeOptions = computed(() =>
  uniqueSourceFieldOptions(emissionSources.value, 'scopeName', {
    companyName: form.sourceCompanyName,
    factoryName: form.sourceFactoryName,
    sourceCategoryKey: form.sourceCategoryKey
  })
);
const sourceScopeSubcategoryOptions = computed(() =>
  uniqueSourceFieldOptions(emissionSources.value, 'scopeSubcategory', {
    companyName: form.sourceCompanyName,
    factoryName: form.sourceFactoryName,
    sourceCategoryKey: form.sourceCategoryKey,
    scopeName: form.scopeName
  })
);
const sourceIdentificationNameOptions = computed(() =>
  uniqueSourceFieldOptions(emissionSources.value, 'sourceIdentificationName', sourceHierarchyFilters(true))
);
const sourceLeafOptions = computed(() => filteredEmissionSourceOptions(emissionSources.value, sourceHierarchyFilters()));

const allSourceOptions = computed(() =>
  emissionSources.value
    .filter((source) => source.enabledFlag !== false)
    .map((source) => ({
      label: sourceOptionLabel(source),
      value: source.sourceIdentificationCode || '',
      info: `${source.companyName || ''} / ${source.factoryName || ''} / ${source.sourceCategoryKey || ''}`
    }))
    .filter((option) => option.value)
);

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
  sourceIdentificationCode: undefined,
  emissionSourceName: undefined,
  companyCode: undefined,
  companyName: undefined,
  factoryName: undefined,
  sourceCategoryKey: undefined,
  responsibleDept: undefined,
  dataSource: undefined,
  activityYear: undefined,
  activityMonth: undefined,
  dataStatus: undefined
});

const form = reactive<ActivityEntryForm>({
  sourceCompanyName: undefined,
  sourceFactoryName: undefined,
  sourceCategoryKey: undefined,
  scopeName: undefined,
  scopeSubcategory: undefined,
  sourceIdentificationName: undefined,
  sourceIdentificationCode: undefined,
  selectedPeriod: undefined,
  date: undefined,
  activityValue: undefined,
  responsibleDept: undefined,
  dataSource: undefined,
  remark: undefined
});

const activityTableColumns: ActivityTableColumn[] = [
  { prop: 'companyName', label: '公司名称', minWidth: 180 },
  { prop: 'factoryName', label: '工厂', minWidth: 150 },
  { prop: 'scopeName', label: '核算范围', width: 110 },
  { prop: 'scopeSubcategory', label: '范围子类别', minWidth: 190 },
  { prop: 'sourceIdentificationName', label: '排放源识别', minWidth: 170 },
  { prop: 'emissionSourceName', label: '排放源', minWidth: 160 },
  { prop: 'activityUnit', label: '单位', width: 100 },
  { prop: 'activityYear', label: '年度', width: 90, align: 'center' },
  { prop: 'activityMonth', label: '月份', width: 80, align: 'center' },
  { prop: 'activityDate', label: '日期', width: 120 },
  { prop: 'activityValue', label: '活动数据', width: 130, align: 'right' },
  { prop: 'responsibleDept', label: '负责部门', width: 130 },
  { prop: 'dataSource', label: '数据来源', width: 130 },
  { prop: 'sourceRemark', label: '备注', minWidth: 160 }
];
const activityColumnOptions = ref<FieldOption[]>(
  activityTableColumns.map((column) => ({
    key: String(column.prop),
    label: column.label,
    visible: true,
    children: []
  }))
);
const visibleActivityTableColumns = computed(() => {
  const hiddenKeys = new Set(activityColumnOptions.value.filter((item) => !item.visible).map((item) => String(item.key)));
  return activityTableColumns.filter((column) => !hiddenKeys.has(String(column.prop)));
});
const sheetColumns = computed<SpreadsheetColumn[]>(() =>
  FIELD_DESCRIPTORS.map((field) => {
    if (field.sourceColumnCode === 'f001') {
      return {
        prop: field.sourceColumnCode,
        label: field.sourceColumnName,
        type: 'select',
        required: true,
        width: 230,
        options: emissionSources.value.map((source) => ({ label: sourceOptionLabel(source), value: source.sourceIdentificationCode }))
      };
    }
    if (field.sourceColumnCode === 'f011' || field.sourceColumnCode === 'f012' || field.sourceColumnCode === 'f014') {
      return {
        prop: field.sourceColumnCode,
        label: field.sourceColumnName,
        type: 'number',
        required: field.rowValueRequired,
        precision: field.sourceColumnCode === 'f014' ? 2 : 0,
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
    if (field.sourceColumnCode === 'f015') {
      return {
        prop: field.sourceColumnCode,
        label: field.sourceColumnName,
        type: 'select',
        required: field.rowValueRequired,
        options: deptOptions.value,
        width: 170
      };
    }
    if (field.sourceColumnCode === 'f016') {
      return {
        prop: field.sourceColumnCode,
        label: field.sourceColumnName,
        type: 'select',
        required: field.rowValueRequired,
        options: dataSourceOptions.value,
        width: 160
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
  activityList.value.map((row) => ({
    f001: row.sourceIdentificationCode,
    f002: row.companyCode,
    f003: row.companyName,
    f004: row.factoryName,
    f005: row.sourceCategoryKey,
    f006: row.scopeName,
    f007: row.scopeSubcategory,
    f008: row.sourceIdentificationName,
    f009: row.emissionSourceName,
    f010: row.activityUnit,
    f011: row.activityYear,
    f012: row.activityMonth,
    f013: row.activityDate,
    f014: roundToTwoDecimal(row.activityValue),
    f015: row.responsibleDept,
    f016: row.dataSource,
    f017: row.sourceRemark,
    f018: row.factorKey
  }))
);
const sheetEmptyRow = computed(() =>
  FIELD_DESCRIPTORS.reduce<Record<string, string | number | undefined>>((row, field) => {
    row[field.sourceColumnCode] = undefined;
    return row;
  }, {})
);

const rules: FormRules<ActivityEntryForm> = {
  sourceIdentificationCode: [{ required: true, message: '请选择排放源', trigger: 'change' }],
  selectedPeriod: [{ required: true, message: '请选择活动期间', trigger: 'change' }],
  date: [{ required: true, message: '请选择日期', trigger: 'change' }],
  activityValue: [{ required: true, message: '请输入活动数据', trigger: 'blur' }],
  responsibleDept: [{ required: true, message: '请选择负责部门', trigger: 'change' }],
  dataSource: [{ required: true, message: '请选择数据来源', trigger: 'change' }]
};

const selectedSource = computed(() => emissionSources.value.find((source) => source.sourceIdentificationCode === form.sourceIdentificationCode));
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
const derivedActivityUnit = computed(() => derivedFieldValue('f010'));
const uploadStatusText = computed(() => {
  if (uploadParsing.value) return '解析中';
  if (!uploadValidation.value) return '待解析';
  if (uploadValidation.value.blocking) return '存在错误';
  return parsedUploadRowCount.value > 0 ? '可导入' : '无可导入数据';
});

const isBlockingIssue = (issue: Sheet656ValidationIssue) => issue.severity === 'ERROR';
const valueToString = (value?: string | number) => (value === undefined || value === null ? '' : String(value));
const roundToTwoDecimal = (value?: string | number) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? Number(numberValue.toFixed(2)) : undefined;
};
const formatDecimal2 = (value?: string | number) => {
  const rounded = roundToTwoDecimal(value);
  return rounded === undefined ? '-' : rounded.toFixed(2);
};
const formatActivityCell = (row: ActivityDataVO, prop: keyof ActivityDataVO) => {
  const value = row[prop];
  if (prop === 'activityValue') {
    return formatDecimal2(value as string | number | undefined);
  }
  return value === undefined || value === null || value === '' ? '-' : String(value);
};
const firstQueryValue = (value: unknown) => (Array.isArray(value) ? value[0] : value);
const splitPeriod = (period?: string) => {
  const [year, month] = (period ?? '').split('-');
  return { year, month };
};

const sourceHierarchyFilters = (excludeIdentificationName = false): EmissionSourceHierarchyFilters => ({
  companyName: form.sourceCompanyName,
  factoryName: form.sourceFactoryName,
  sourceCategoryKey: form.sourceCategoryKey,
  scopeName: form.scopeName,
  scopeSubcategory: form.scopeSubcategory,
  ...(excludeIdentificationName ? {} : { sourceIdentificationName: form.sourceIdentificationName })
});

const applySourceHierarchy = (source: EmissionSourceVO | undefined) => {
  form.sourceCompanyName = source?.companyName;
  form.sourceFactoryName = source?.factoryName;
  form.sourceCategoryKey = source?.sourceCategoryKey;
  form.scopeName = source?.scopeName;
  form.scopeSubcategory = source?.scopeSubcategory;
  form.sourceIdentificationName = source?.sourceIdentificationName;
};

const handleSourceSelect = (sourceIdentificationCode: string) => {
  const source = emissionSources.value.find((s) => s.sourceIdentificationCode === sourceIdentificationCode);
  if (source) {
    applySourceHierarchy(source);
    if (!form.responsibleDept && source.responsibleDept) {
      form.responsibleDept = source.responsibleDept;
    }
  }
  clearManualValidation();
};

const clearSourceHierarchyAfter = (field: SourceHierarchyFormField) => {
  const order: SourceHierarchyFormField[] = [
    'sourceCompanyName',
    'sourceFactoryName',
    'sourceCategoryKey',
    'scopeName',
    'scopeSubcategory',
    'sourceIdentificationName'
  ];
  const index = order.indexOf(field);
  order.slice(index + 1).forEach((key) => {
    form[key] = undefined;
  });
  form.sourceIdentificationCode = undefined;
  clearManualValidation();
};

const joinPeriod = (year?: number, month?: number) => {
  if (!year || !month) {
    return '';
  }
  return `${year}-${String(month).padStart(2, '0')}`;
};

const applyPeriodToQuery = (period?: string) => {
  const { year, month } = splitPeriod(period);
  queryParams.activityYear = year ? Number(year) : undefined;
  queryParams.activityMonth = month ? Number(month) : undefined;
};

const handleQueryPeriodChange = (period?: string) => {
  applyPeriodToQuery(period);
  handleQuery();
};

const fieldValueFromSource = (source: EmissionSourceVO | undefined, code: string) => {
  if (!source) return '';
  const values: DerivedValueMap = {
    f002: source.companyCode ?? '',
    f003: source.companyName ?? '',
    f004: source.factoryName ?? '',
    f005: source.sourceCategoryKey ?? '',
    f006: source.scopeName ?? '',
    f007: source.scopeSubcategory ?? '',
    f008: source.sourceIdentificationName ?? '',
    f009: source.emissionSourceName ?? '',
    f018: source.factorKey ?? ''
  };
  return values[code] ?? '';
};

const derivedFieldValue = (code: string) => {
  return manualResolvedDerivedValues.value[code] ?? fieldValueFromSource(selectedSource.value, code);
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
  const { year, month } = splitPeriod(form.selectedPeriod);
  const values: DerivedValueMap = {
    f001: form.sourceIdentificationCode ?? '',
    f011: year,
    f012: month,
    f013: form.date ?? '',
    f014: valueToString(roundToTwoDecimal(form.activityValue)),
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
  const sourceIdentificationCode = firstQueryValue(route.query.sourceIdentificationCode);
  if (typeof sourceIdentificationCode === 'string' && sourceIdentificationCode) {
    form.sourceIdentificationCode = sourceIdentificationCode;
    queryParams.sourceIdentificationCode = sourceIdentificationCode;
  }
  const selectedPeriod = firstQueryValue(route.query.selectedPeriod);
  if (typeof selectedPeriod === 'string' && selectedPeriod) {
    form.selectedPeriod = selectedPeriod;
    selectedQueryPeriod.value = selectedPeriod;
    applyPeriodToQuery(selectedPeriod);
  }
};

const clearManualValidation = (options: { keepDerivedValues?: boolean } = {}) => {
  manualValidation.value = undefined;
  if (!options.keepDerivedValues) {
    manualResolvedDerivedValues.value = {};
  }
};

const resetForm = () => {
  Object.assign(form, {
    sourceCompanyName: undefined,
    sourceFactoryName: undefined,
    sourceCategoryKey: undefined,
    scopeName: undefined,
    scopeSubcategory: undefined,
    sourceIdentificationName: undefined,
    sourceIdentificationCode: undefined,
    selectedPeriod: undefined,
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
  initializingForm.value = true;
  resetForm();
  Object.assign(form, {
    sourceCompanyName: row.companyName,
    sourceFactoryName: row.factoryName,
    sourceCategoryKey: row.sourceCategoryKey,
    scopeName: row.scopeName,
    scopeSubcategory: row.scopeSubcategory,
    sourceIdentificationName: row.sourceIdentificationName,
    sourceIdentificationCode: row.sourceIdentificationCode,
    selectedPeriod: joinPeriod(row.activityYear, row.activityMonth),
    date: row.activityDate,
    activityValue: roundToTwoDecimal(row.activityValue),
    responsibleDept: row.responsibleDept,
    dataSource: row.dataSource,
    remark: row.sourceRemark ?? row.remark
  });
  manualResolvedDerivedValues.value = {
    f002: row.companyCode ?? '',
    f003: row.companyName ?? '',
    f004: row.factoryName ?? '',
    f005: row.sourceCategoryKey ?? '',
    f006: row.scopeName ?? '',
    f007: row.scopeSubcategory ?? '',
    f008: row.sourceIdentificationName ?? '',
    f009: row.emissionSourceName ?? '',
    f010: row.activityUnit ?? '',
    f018: row.factorKey ?? ''
  };
  formDrawer.title = '查看活动数据';
  formDrawer.readonly = true;
  formDrawer.open = true;
  nextTick(() => {
    initializingForm.value = false;
  });
};

const openEditDrawer = (row: ActivityDataVO) => {
  openDetailDrawer(row);
  formDrawer.title = '编辑活动数据';
  formDrawer.readonly = false;
};

const openUploadDialog = () => {
  uploadDialog.open = true;
};

const openSheetDrawer = () => {
  sheetDrawer.open = true;
};

const downloadImportTemplate = () => {
  downloadXlsxTemplate({
    fileName: `sheet_656_activity_template_${new Date().getTime()}.xlsx`,
    sheetName: 'sheet_656',
    headers: FIELD_DESCRIPTORS.map((field) => field.sourceColumnName)
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

const parseUploadedFile = async (uploadFile: UploadFile | UploadRawFile) => {
  const file = 'raw' in uploadFile ? uploadFile.raw : uploadFile;
  if (!file) return false;
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
  headerFields: cloneFieldDescriptors(FIELD_DESCRIPTORS),
  rows: rows.map((row, index) => ({
    rowNumber: index + 2,
    fieldValues: FIELD_DESCRIPTORS.map((field) => ({
      sourceColumnCode: field.sourceColumnCode,
      sourceColumnName: field.sourceColumnName,
      value: valueToString(field.sourceColumnCode === 'f014' ? roundToTwoDecimal(row[field.sourceColumnCode]) : row[field.sourceColumnCode])
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
    total.value = Number(res.total ?? activityList.value.length);
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
  selectedQueryPeriod.value = '';
  applyPeriodToQuery(undefined);
  queryParams.pageNum = 1;
  loadActivities();
};

const loadControlledOptions = async () => {
  const [companies, factories, sourceCategories, departments, dataSources, dataStatuses] = await Promise.all([
    loadCompanyNameOptions(),
    loadFactoryNameOptions(),
    loadSourceCategoryOptions(),
    loadResponsibleDeptOptions(),
    loadDataSourceOptions(),
    loadActivityDataStatusOptions()
  ]);
  companyOptions.value = companies;
  factoryOptions.value = factories;
  sourceCategoryOptions.value = sourceCategories;
  deptOptions.value = departments;
  dataSourceOptions.value = dataSources;
  activityDataStatusOptions.value = dataStatuses;
};

watch(
  () => form.sourceIdentificationCode,
  () => {
    if (!formDrawer.readonly && !initializingForm.value) {
      clearManualValidation();
    }
  }
);

watch(
  () => [form.selectedPeriod, form.date, form.activityValue, form.responsibleDept, form.dataSource, form.remark],
  () => {
    if (!formDrawer.readonly && !initializingForm.value) {
      clearManualValidation({ keepDerivedValues: true });
    }
  }
);

watch(selectedSource, (source) => {
  if (source) {
    applySourceHierarchy(source);
  }
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
  await Promise.all([loadEmissionSources(), loadControlledOptions()]);
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
  .query-status,
  .query-medium {
    width: 220px;
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

  .source-option {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .source-option-name {
      font-weight: 500;
    }

    .source-option-info {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }
}
</style>
