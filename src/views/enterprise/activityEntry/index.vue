<template>
  <div class="enterprise-activity-entry">
    <section class="panel search-panel">
      <el-form v-show="showSearch" ref="queryFormRef" :model="queryParams" :inline="true" label-width="88px" class="search-bar wide activity-search">
        <el-form-item label="排放源" prop="emissionSourceName">
          <el-select v-model="queryParams.emissionSourceName" clearable filterable :loading="sourceLoading" class="query-source">
            <el-option v-for="option in emissionSourceNameOptions" :key="String(option.value)" :label="option.label" :value="option.value" />
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
          <el-button
            v-hasPermi="['enterprise:activityDataRaw:edit']"
            icon="CircleCheck"
            :disabled="!selectedActivityIds.length"
            @click="submitSelectedActivities"
          >
            提交选中
          </el-button>
          <el-button
            v-hasPermi="['enterprise:activityDataRaw:edit']"
            icon="Finished"
            :disabled="!activityList.length"
            @click="submitCurrentPageActivities"
          >
            提交本页
          </el-button>
          <el-button
            v-hasPermi="['enterprise:activityDataRaw:remove']"
            type="danger"
            plain
            icon="Delete"
            :disabled="!selectedActivityIds.length"
            @click="deleteSelectedActivities"
          >
            删除选中
          </el-button>
        </div>
      </div>

      <el-table v-loading="listLoading" :data="activityList" border @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="48" align="center" />
        <el-table-column label="序号" width="72" align="center">
          <template #default="{ $index }">
            {{ (Number(queryParams.pageNum || 1) - 1) * Number(queryParams.pageSize || 10) + $index + 1 }}
          </template>
        </el-table-column>
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
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" icon="View" @click="openDetailDrawer(row)">查看</el-button>
            <el-button link type="primary" icon="Edit" @click="openEditDrawer(row)" v-hasPermi="['enterprise:activityImport:import']">编辑</el-button>
            <el-button link type="success" icon="CircleCheck" @click="submitActivity(row)" v-hasPermi="['enterprise:activityDataRaw:edit']"
              >提交</el-button
            >
            <el-button link type="danger" icon="Delete" @click="deleteActivity(row)" v-hasPermi="['enterprise:activityDataRaw:remove']"
              >删除</el-button
            >
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
            <el-form-item label="公司" prop="sourceCompanyName">
              <el-select
                v-model="form.sourceCompanyName"
                class="w-full"
                clearable
                filterable
                :loading="sourceCompanyLoading"
                :disabled="formDrawer.readonly"
                placeholder="请选择公司"
                @change="handleCompanyChange"
              >
                <el-option v-for="option in sourceCompanyOptions" :key="String(option.value)" :label="option.label" :value="option.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="工厂" prop="sourceFactoryName">
              <el-select
                v-model="form.sourceFactoryName"
                class="w-full"
                clearable
                filterable
                :loading="sourceFactoryLoading"
                :disabled="formDrawer.readonly || !form.sourceCompanyName"
                placeholder="请选择工厂"
                @change="handleFactoryChange"
              >
                <el-option v-for="option in sourceFactoryOptions" :key="String(option.value)" :label="option.label" :value="option.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="范围" prop="scopeName">
              <el-select
                v-model="form.scopeName"
                class="w-full"
                clearable
                filterable
                :loading="sourceScopeLoading"
                :disabled="formDrawer.readonly || !form.sourceFactoryName"
                placeholder="请选择范围"
                @change="handleScopeChange"
              >
                <el-option v-for="option in sourceScopeOptions" :key="String(option.value)" :label="option.label" :value="option.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="范围子类别" prop="scopeSubcategory">
              <el-select
                v-model="form.scopeSubcategory"
                class="w-full"
                clearable
                filterable
                :loading="sourceSubcategoryLoading"
                :disabled="formDrawer.readonly || !form.scopeName"
                placeholder="请选择范围子类别"
                @change="handleSubcategoryChange"
              >
                <el-option v-for="option in sourceSubcategoryOptions" :key="String(option.value)" :label="option.label" :value="option.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="排放源识别" prop="sourceIdentificationName">
              <el-select
                v-model="form.sourceIdentificationName"
                class="w-full"
                clearable
                filterable
                :loading="sourceIdentificationLoading"
                :disabled="formDrawer.readonly || !form.scopeSubcategory"
                placeholder="请选择排放源识别"
                @change="handleSourceIdentificationChange"
              >
                <el-option v-for="option in sourceIdentificationOptions" :key="String(option.value)" :label="option.label" :value="option.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="排放源" prop="emissionSourceName">
              <el-select
                v-model="form.emissionSourceName"
                class="w-full"
                clearable
                filterable
                :loading="sourceNameLoading"
                :disabled="formDrawer.readonly || !form.scopeSubcategory"
                placeholder="请选择排放源"
                @change="handleSourceNameChange"
              >
                <el-option
                  v-for="option in sourceNameOptions"
                  :key="String(option.value)"
                  :label="formatSourceOptionLabel(option)"
                  :value="option.value"
                />
              </el-select>
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
        </el-row>
      </el-form>

      <el-alert v-if="selectedSourceMasterIssue" class="mb-3" type="error" show-icon :closable="false">
        <template #title>{{ selectedSourceMasterIssue }}</template>
      </el-alert>

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
        <el-table-column prop="fieldName" label="字段" width="120" />
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
            :disabled="Boolean(selectedSourceMasterIssue)"
            @click="saveActivity()"
          >
            保存
          </el-button>
          <el-button
            v-if="!formDrawer.readonly && form.id"
            v-hasPermi="['enterprise:activityDataRaw:edit']"
            type="success"
            icon="CircleCheck"
            :loading="saving"
            :disabled="Boolean(selectedSourceMasterIssue)"
            @click="saveActivity({ submitAfterSave: true })"
          >
            保存并提交
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
        <el-table-column prop="fieldName" label="字段" width="120" />
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
        title="emission_activity"
        :columns="sheetColumns"
        :rows="sheetRows"
        :empty-row="sheetEmptyRow"
        :saving="sheetSaving"
        allow-empty-save
        hint="在线填报仅用于新增活动数据；字段按 Source(A) 活动数据表头展示，年度、月份、日期、活动数据、负责部门和数据来源必须填写。"
        @save="saveSheetRows"
      />
    </el-drawer>
  </div>
</template>

<script setup name="EnterpriseActivityEntry" lang="ts">
import { UploadFilled } from '@element-plus/icons-vue';
import { computed, nextTick, onActivated, onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules, type UploadFile, type UploadRawFile } from 'element-plus';
import { useAutoQuery } from '@/hooks/useAutoQuery';
import { downloadXlsxTemplate } from '@/utils/xlsxTemplate';
import SpreadsheetEditor from '@/components/SpreadsheetEditor/index.vue';
import { loadUniverSheetsCore } from '@/components/SpreadsheetEditor/univerLoader';
import type { SpreadsheetColumn } from '@/components/SpreadsheetEditor/types';
import {
  importLocalEmissionActivity,
  listLocalEmissionActivityFields,
  listLocalActivityData,
  parseLocalEmissionActivityFile,
  saveLocalEmissionActivity,
  validateLocalEmissionActivity
} from '@/api/enterprise/activityEntry';
import {
  loadActivityDataStatusOptions,
  loadActivityEntryEmissionSourceNameOptions,
  loadActivityEntrySourceCompanyOptions,
  loadActivityEntrySourceFactoryOptions,
  loadActivityEntrySourceIdentificationOptions,
  loadActivityEntrySourceScopeOptions,
  loadActivityEntrySourceSubcategoryOptions,
  loadCompanyNameOptions,
  loadDataSourceOptions,
  loadFactoryNameOptions,
  loadResponsibleDeptOptions,
  loadSourceCategoryOptions,
  type SelectOption
} from '@/utils/enterpriseFieldOptions';
import type { ActivityDataQuery, ActivityDataVO } from '@/api/enterprise/activityData/types';
import { delActivityData, updateActivityData, updateActivityDataStatus } from '@/api/enterprise/activityData';
import type {
  EmissionActivityFieldDescriptor,
  EmissionActivityFieldValue,
  EmissionActivityImportValidationRequest,
  EmissionActivityImportValidationResult,
  EmissionActivityResolvedRow,
  EmissionActivityValidationIssue
} from '@/api/enterprise/emissionActivityValidation/types';

interface ActivityEntryForm {
  id?: string | number;
  sourceCompanyName?: string;
  sourceFactoryName?: string;
  sourceCategoryKey?: string;
  scopeName?: string;
  scopeSubcategory?: string;
  sourceIdentificationName?: string;
  sourceIdentificationCode?: string;
  emissionSourceName?: string;
  factorKey?: string;
  activityUnit?: string;
  selectedPeriod?: string;
  date?: string;
  activityValue?: number;
  responsibleDept?: string;
  dataSource?: string;
  dataStatus?: string;
  remark?: string;
}

type DerivedValueMap = Record<string, string>;
type ActivityTableColumn = {
  prop: keyof ActivityDataVO;
  label: string;
  width?: number;
  minWidth?: number;
  align?: 'left' | 'center' | 'right';
};

const route = useRoute();

const ALL_FIELD_DESCRIPTORS: EmissionActivityFieldDescriptor[] = [
  {
    fieldOrder: 1,
    fieldCode: 'sourceIdentificationCode',
    fieldName: 'PK_排放源识别编号',
    sourceRequired: false,
    rowValueRequired: false,
    derivedField: false
  },
  { fieldOrder: 2, fieldCode: 'companyCode', fieldName: 'FK_公司编号', sourceRequired: false, rowValueRequired: false, derivedField: false },
  { fieldOrder: 3, fieldCode: 'companyName', fieldName: '公司名称', sourceRequired: false, rowValueRequired: true, derivedField: false },
  { fieldOrder: 4, fieldCode: 'factoryName', fieldName: '工厂', sourceRequired: false, rowValueRequired: true, derivedField: false },
  { fieldOrder: 5, fieldCode: 'sourceCategoryKey', fieldName: 'FK_排放源分类', sourceRequired: false, rowValueRequired: false, derivedField: false },
  { fieldOrder: 6, fieldCode: 'scopeName', fieldName: '范围', sourceRequired: false, rowValueRequired: true, derivedField: false },
  { fieldOrder: 7, fieldCode: 'scopeSubcategory', fieldName: '范围子类别', sourceRequired: false, rowValueRequired: true, derivedField: false },
  {
    fieldOrder: 8,
    fieldCode: 'sourceIdentificationName',
    fieldName: '排放源识别',
    sourceRequired: false,
    rowValueRequired: true,
    derivedField: false
  },
  { fieldOrder: 9, fieldCode: 'emissionSourceName', fieldName: '排放源', sourceRequired: false, rowValueRequired: true, derivedField: false },
  { fieldOrder: 10, fieldCode: 'activityUnit', fieldName: '单位', sourceRequired: false, rowValueRequired: false, derivedField: false },
  { fieldOrder: 11, fieldCode: 'activityYear', fieldName: '年度', sourceRequired: false, rowValueRequired: true, derivedField: false },
  { fieldOrder: 12, fieldCode: 'activityMonth', fieldName: '月份', sourceRequired: false, rowValueRequired: true, derivedField: false },
  { fieldOrder: 13, fieldCode: 'activityDate', fieldName: '日期', sourceRequired: false, rowValueRequired: true, derivedField: false },
  { fieldOrder: 14, fieldCode: 'activityValue', fieldName: '活动数据', sourceRequired: false, rowValueRequired: true, derivedField: false },
  { fieldOrder: 15, fieldCode: 'responsibleDept', fieldName: '负责部门', sourceRequired: false, rowValueRequired: true, derivedField: false },
  { fieldOrder: 16, fieldCode: 'dataSource', fieldName: '数据来源', sourceRequired: false, rowValueRequired: true, derivedField: false },
  { fieldOrder: 17, fieldCode: 'sourceRemark', fieldName: '备注', sourceRequired: false, rowValueRequired: false, derivedField: false },
  { fieldOrder: 18, fieldCode: 'factorKey', fieldName: 'FK_排放因子', sourceRequired: false, rowValueRequired: false, derivedField: false }
];
const FALLBACK_ENTRY_FIELD_DESCRIPTORS: EmissionActivityFieldDescriptor[] = [...ALL_FIELD_DESCRIPTORS];

const queryFormRef = ref<FormInstance>();
const activityFormRef = ref<FormInstance>();
const listLoading = ref(false);
const showSearch = ref(true);
const sourceLoading = ref(false);
const sourceCompanyLoading = ref(false);
const sourceFactoryLoading = ref(false);
const sourceScopeLoading = ref(false);
const sourceSubcategoryLoading = ref(false);
const sourceIdentificationLoading = ref(false);
const sourceNameLoading = ref(false);
const validating = ref(false);
const saving = ref(false);
const uploadParsing = ref(false);
const uploadImporting = ref(false);
const total = ref(0);
const activityList = ref<ActivityDataVO[]>([]);
const selectedActivities = ref<ActivityDataVO[]>([]);
const companyOptions = ref<SelectOption[]>([]);
const factoryOptions = ref<SelectOption[]>([]);
const sourceCategoryOptions = ref<SelectOption[]>([]);
const deptOptions = ref<SelectOption[]>([]);
const dataSourceOptions = ref<SelectOption[]>([]);
const activityDataStatusOptions = ref<SelectOption[]>([]);
const emissionSourceNameOptions = ref<SelectOption[]>([]);
const sourceCompanyOptions = ref<SelectOption[]>([]);
const sourceFactoryOptions = ref<SelectOption[]>([]);
const sourceScopeOptions = ref<SelectOption[]>([]);
const sourceSubcategoryOptions = ref<SelectOption[]>([]);
const sourceIdentificationOptions = ref<SelectOption[]>([]);
const sourceNameOptions = ref<SelectOption[]>([]);
const allSourceFactoryOptions = ref<SelectOption[]>([]);
const allSourceScopeOptions = ref<SelectOption[]>([]);
const allSourceSubcategoryOptions = ref<SelectOption[]>([]);
const allSourceIdentificationOptions = ref<SelectOption[]>([]);
const entryFieldDescriptors = ref<EmissionActivityFieldDescriptor[]>(FALLBACK_ENTRY_FIELD_DESCRIPTORS);
const manualValidation = ref<EmissionActivityImportValidationResult>();
const uploadValidation = ref<EmissionActivityImportValidationResult>();
const manualResolvedDerivedValues = ref<DerivedValueMap>({});
const resolvedSource = ref<EmissionActivityResolvedRow>();
const parsedUploadRequest = ref<EmissionActivityImportValidationRequest>();
const uploadFileName = ref('');
const selectedQueryPeriod = ref('');
const initializingForm = ref(false);
const hasMounted = ref(false);
const latestActivityRequestId = ref(0);
const latestCascadeRequestId = ref(0);
const selectedActivityIds = computed(() =>
  selectedActivities.value.map((row) => row.id).filter((id): id is string | number => id !== undefined && id !== null)
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
  id: undefined,
  sourceCompanyName: undefined,
  sourceFactoryName: undefined,
  sourceCategoryKey: undefined,
  scopeName: undefined,
  scopeSubcategory: undefined,
  sourceIdentificationName: undefined,
  sourceIdentificationCode: undefined,
  emissionSourceName: undefined,
  factorKey: undefined,
  activityUnit: undefined,
  selectedPeriod: undefined,
  date: undefined,
  activityValue: undefined,
  responsibleDept: undefined,
  dataSource: undefined,
  dataStatus: undefined,
  remark: undefined
});

const activityTableColumns: ActivityTableColumn[] = [
  { prop: 'sourceIdentificationCode', label: 'PK_排放源识别编号', minWidth: 180 },
  { prop: 'companyCode', label: 'FK_公司编号', minWidth: 130 },
  { prop: 'companyName', label: '公司名称', minWidth: 180 },
  { prop: 'factoryName', label: '工厂', minWidth: 150 },
  { prop: 'sourceCategoryKey', label: 'FK_排放源分类', minWidth: 150 },
  { prop: 'scopeName', label: '范围', width: 110 },
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
  { prop: 'sourceRemark', label: '备注', minWidth: 160 },
  { prop: 'factorKey', label: 'FK_排放因子', minWidth: 130 },
  { prop: 'dataStatus', label: '数据状态', width: 110 }
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
  entryFieldDescriptors.value.map((field) => {
    if (field.fieldCode === 'companyName') {
      return {
        prop: field.fieldCode,
        label: field.fieldName,
        type: 'select',
        required: true,
        width: 180,
        options: sourceCompanyOptions.value,
        clearsOnChange: ['factoryName', 'scopeName', 'scopeSubcategory', 'sourceIdentificationName', 'emissionSourceName']
      };
    }
    if (field.fieldCode === 'factoryName') {
      return {
        prop: field.fieldCode,
        label: field.fieldName,
        type: 'select',
        required: true,
        width: 170,
        options: allSourceFactoryOptions.value,
        getOptions: (row) => sheetFactoryOptions(row),
        clearsOnChange: ['scopeName', 'scopeSubcategory', 'sourceIdentificationName', 'emissionSourceName']
      };
    }
    if (field.fieldCode === 'scopeName') {
      return {
        prop: field.fieldCode,
        label: field.fieldName,
        type: 'select',
        required: true,
        width: 140,
        options: allSourceScopeOptions.value,
        getOptions: (row) => sheetScopeOptions(row),
        clearsOnChange: ['scopeSubcategory', 'sourceIdentificationName', 'emissionSourceName']
      };
    }
    if (field.fieldCode === 'scopeSubcategory') {
      return {
        prop: field.fieldCode,
        label: field.fieldName,
        type: 'select',
        required: true,
        width: 190,
        options: allSourceSubcategoryOptions.value,
        getOptions: (row) => sheetSubcategoryOptions(row),
        clearsOnChange: ['sourceIdentificationName', 'emissionSourceName']
      };
    }
    if (field.fieldCode === 'sourceIdentificationName') {
      return {
        prop: field.fieldCode,
        label: field.fieldName,
        type: 'select',
        required: field.rowValueRequired,
        width: 190,
        options: allSourceIdentificationOptions.value,
        getOptions: (row) => sheetSourceIdentificationOptions(row),
        clearsOnChange: ['emissionSourceName']
      };
    }
    if (field.fieldCode === 'emissionSourceName') {
      return {
        prop: field.fieldCode,
        label: field.fieldName,
        type: 'select',
        required: true,
        width: 190,
        options: emissionSourceNameOptions.value,
        getOptions: (row) => sheetEmissionSourceNameOptions(row),
        fillProps: ['companyName', 'factoryName', 'scopeName', 'scopeSubcategory', 'sourceIdentificationName', 'emissionSourceName']
      };
    }
    if (field.fieldCode === 'activityYear') {
      return {
        prop: field.fieldCode,
        label: field.fieldName,
        type: 'number',
        required: field.rowValueRequired,
        precision: 0,
        width: 110
      };
    }
    if (field.fieldCode === 'activityMonth') {
      return {
        prop: field.fieldCode,
        label: field.fieldName,
        type: 'number',
        required: field.rowValueRequired,
        precision: 0,
        width: 100
      };
    }
    if (field.fieldCode === 'activityValue') {
      return {
        prop: field.fieldCode,
        label: field.fieldName,
        type: 'number',
        required: field.rowValueRequired,
        precision: 2,
        width: 140
      };
    }
    if (field.fieldCode === 'activityDate') {
      return {
        prop: field.fieldCode,
        label: field.fieldName,
        type: 'date',
        required: field.rowValueRequired,
        width: 150
      };
    }
    if (field.fieldCode === 'responsibleDept') {
      return {
        prop: field.fieldCode,
        label: field.fieldName,
        type: 'select',
        required: field.rowValueRequired,
        options: deptOptions.value,
        width: 170
      };
    }
    if (field.fieldCode === 'dataSource') {
      return {
        prop: field.fieldCode,
        label: field.fieldName,
        type: 'select',
        required: field.rowValueRequired,
        options: dataSourceOptions.value,
        width: 160
      };
    }
    return {
      prop: field.fieldCode,
      label: field.fieldName,
      required: field.rowValueRequired,
      readonly: field.derivedField,
      width: field.derivedField ? 170 : 160
    };
  })
);
const sheetEmptyRow = computed(() =>
  entryFieldDescriptors.value.reduce<Record<string, string | number | undefined>>((row, field) => {
    row[field.fieldCode] = undefined;
    return row;
  }, {})
);
const sheetRows = computed(() => [{ ...sheetEmptyRow.value }]);

const rules: FormRules<ActivityEntryForm> = {
  sourceCompanyName: [{ required: true, message: '请选择公司', trigger: 'change' }],
  sourceFactoryName: [{ required: true, message: '请选择工厂', trigger: 'change' }],
  scopeName: [{ required: true, message: '请选择范围', trigger: 'change' }],
  scopeSubcategory: [{ required: true, message: '请选择范围子类别', trigger: 'change' }],
  sourceIdentificationName: [{ required: true, message: '请选择排放源识别', trigger: 'change' }],
  emissionSourceName: [{ required: true, message: '请选择排放源', trigger: 'change' }],
  selectedPeriod: [{ required: true, message: '请选择活动期间', trigger: 'change' }],
  date: [{ required: true, message: '请选择日期', trigger: 'change' }],
  activityValue: [{ required: true, message: '请输入活动数据', trigger: 'blur' }],
  responsibleDept: [{ required: true, message: '请选择负责部门', trigger: 'change' }],
  dataSource: [{ required: true, message: '请选择数据来源', trigger: 'change' }]
};

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
const uploadStatusText = computed(() => {
  if (uploadParsing.value) return '解析中';
  if (!uploadValidation.value) return '待解析';
  if (uploadValidation.value.blocking) return '存在错误';
  return parsedUploadRowCount.value > 0 ? '可导入' : '无可导入数据';
});

const isBlockingIssue = (issue: EmissionActivityValidationIssue) => issue.severity === 'ERROR';
const valueToString = (value?: string | number) => (value === undefined || value === null ? '' : String(value));
const sameOptionValue = (left: unknown, right: unknown) => String(left ?? '') === String(right ?? '');
const optionRecord = (option?: SelectOption) => option?.record?.record ?? option?.record;
const filterOptionsByRecord = (options: SelectOption[], filters: Record<string, unknown>) =>
  options.filter((option) =>
    Object.entries(filters).every(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return true;
      }
      return sameOptionValue(optionRecord(option)?.[key], value);
    })
  );
const sheetFactoryOptions = (row: Record<string, any>) => filterOptionsByRecord(allSourceFactoryOptions.value, { companyName: row.companyName });
const sheetScopeOptions = (row: Record<string, any>) =>
  filterOptionsByRecord(allSourceScopeOptions.value, { companyName: row.companyName, factoryName: row.factoryName });
const sheetSubcategoryOptions = (row: Record<string, any>) =>
  filterOptionsByRecord(allSourceSubcategoryOptions.value, {
    companyName: row.companyName,
    factoryName: row.factoryName,
    scopeName: row.scopeName
  });
const sheetSourceIdentificationOptions = (row: Record<string, any>) =>
  filterOptionsByRecord(allSourceIdentificationOptions.value, {
    companyName: row.companyName,
    factoryName: row.factoryName,
    scopeName: row.scopeName,
    scopeSubcategory: row.scopeSubcategory
  });
const sheetEmissionSourceNameOptions = (row: Record<string, any>) =>
  filterOptionsByRecord(emissionSourceNameOptions.value, {
    companyName: row.companyName,
    factoryName: row.factoryName,
    scopeName: row.scopeName,
    scopeSubcategory: row.scopeSubcategory,
    sourceIdentificationName: row.sourceIdentificationName
  });
const sourceOptionByValue = (options: SelectOption[], value: unknown) => options.find((option) => sameOptionValue(option.value, value));
const selectedSourceOption = computed(() => sourceOptionByValue(sourceNameOptions.value, form.emissionSourceName));
const selectedSourceRecord = computed(() => optionRecord(selectedSourceOption.value));
const selectedSourceMasterIssue = computed(() => {
  if (!form.emissionSourceName || formDrawer.readonly) return '';
  const record = selectedSourceRecord.value;
  if (!record) return '';
  if (!record.sourceUnit) {
    return `排放源“${form.emissionSourceName}”关联的 201 排放因子缺少排放源单位/因子单位，请先补齐因子单位后再录入活动数据。`;
  }
  if (!record.sourceIdentificationCode) {
    return `排放源“${form.emissionSourceName}”在 104 排放源识别中缺少排放源编号，请先补齐主数据。`;
  }
  if (!record.factorKey) {
    return `排放源“${form.emissionSourceName}”在 104 排放源识别中缺少适用因子，请先补齐主数据。`;
  }
  return '';
});
const formatSourceOptionLabel = (option: SelectOption) => {
  const record = optionRecord(option);
  if (record && !record.sourceUnit) {
    return `${option.label}（201缺单位）`;
  }
  return option.label;
};
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
  if (prop === 'dataStatus') {
    return activityDataStatusOptions.value.find((option) => option.value === value)?.label ?? value ?? '-';
  }
  return value === undefined || value === null || value === '' ? '-' : String(value);
};
const firstQueryValue = (value: unknown) => (Array.isArray(value) ? value[0] : value);
const splitPeriod = (period?: string) => {
  const [year, month] = (period ?? '').split('-');
  return { year, month };
};

const clearResolvedSourceFields = () => {
  resolvedSource.value = undefined;
  form.sourceIdentificationCode = undefined;
  form.activityUnit = undefined;
  form.factorKey = undefined;
};

const resetSourceCascadeOptions = (level: 'factory' | 'scope' | 'subcategory' | 'identification' | 'emissionSourceName') => {
  if (level === 'factory') {
    sourceFactoryOptions.value = [];
  }
  if (level === 'factory' || level === 'scope') {
    sourceScopeOptions.value = [];
  }
  if (level === 'factory' || level === 'scope' || level === 'subcategory') {
    sourceSubcategoryOptions.value = [];
  }
  if (level === 'factory' || level === 'scope' || level === 'subcategory' || level === 'identification') {
    sourceIdentificationOptions.value = [];
  }
  if (level === 'factory' || level === 'scope' || level === 'subcategory' || level === 'identification' || level === 'emissionSourceName') {
    sourceNameOptions.value = [];
  }
};

const nextCascadeRequestId = () => {
  latestCascadeRequestId.value += 1;
  return latestCascadeRequestId.value;
};

const isLatestCascadeRequest = (requestId: number) => requestId === latestCascadeRequestId.value;

const loadSourceCompanyOptions = async () => {
  sourceCompanyLoading.value = true;
  try {
    sourceCompanyOptions.value = await loadActivityEntrySourceCompanyOptions();
  } finally {
    sourceCompanyLoading.value = false;
  }
};

const loadSourceFactoryOptions = async (requestId = latestCascadeRequestId.value) => {
  if (!form.sourceCompanyName) {
    resetSourceCascadeOptions('factory');
    return;
  }
  sourceFactoryLoading.value = true;
  try {
    const options = await loadActivityEntrySourceFactoryOptions({ companyName: form.sourceCompanyName });
    if (isLatestCascadeRequest(requestId)) {
      sourceFactoryOptions.value = options;
    }
  } finally {
    if (isLatestCascadeRequest(requestId)) {
      sourceFactoryLoading.value = false;
    }
  }
};

const loadSourceScopeOptions = async (requestId = latestCascadeRequestId.value) => {
  if (!form.sourceCompanyName || !form.sourceFactoryName) {
    resetSourceCascadeOptions('scope');
    return;
  }
  sourceScopeLoading.value = true;
  try {
    const options = await loadActivityEntrySourceScopeOptions({
      companyName: form.sourceCompanyName,
      factoryName: form.sourceFactoryName
    });
    if (isLatestCascadeRequest(requestId)) {
      sourceScopeOptions.value = options;
    }
  } finally {
    if (isLatestCascadeRequest(requestId)) {
      sourceScopeLoading.value = false;
    }
  }
};

const loadSourceSubcategoryOptions = async (requestId = latestCascadeRequestId.value) => {
  if (!form.sourceCompanyName || !form.sourceFactoryName || !form.scopeName) {
    resetSourceCascadeOptions('subcategory');
    return;
  }
  sourceSubcategoryLoading.value = true;
  try {
    const options = await loadActivityEntrySourceSubcategoryOptions({
      companyName: form.sourceCompanyName,
      factoryName: form.sourceFactoryName,
      scopeName: form.scopeName
    });
    if (isLatestCascadeRequest(requestId)) {
      sourceSubcategoryOptions.value = options;
    }
  } finally {
    if (isLatestCascadeRequest(requestId)) {
      sourceSubcategoryLoading.value = false;
    }
  }
};

const loadSourceNameOptions = async (requestId = latestCascadeRequestId.value) => {
  if (!form.sourceCompanyName || !form.sourceFactoryName || !form.scopeName || !form.scopeSubcategory) {
    resetSourceCascadeOptions('emissionSourceName');
    return;
  }
  sourceNameLoading.value = true;
  try {
    const options = await loadActivityEntryEmissionSourceNameOptions({
      companyName: form.sourceCompanyName,
      factoryName: form.sourceFactoryName,
      scopeName: form.scopeName,
      scopeSubcategory: form.scopeSubcategory,
      sourceIdentificationName: form.sourceIdentificationName
    });
    if (isLatestCascadeRequest(requestId)) {
      sourceNameOptions.value = options;
    }
  } finally {
    if (isLatestCascadeRequest(requestId)) {
      sourceNameLoading.value = false;
    }
  }
};

const loadSourceIdentificationOptions = async (requestId = latestCascadeRequestId.value) => {
  if (!form.sourceCompanyName || !form.sourceFactoryName || !form.scopeName || !form.scopeSubcategory) {
    resetSourceCascadeOptions('identification');
    return;
  }
  sourceIdentificationLoading.value = true;
  try {
    const options = await loadActivityEntrySourceIdentificationOptions({
      companyName: form.sourceCompanyName,
      factoryName: form.sourceFactoryName,
      scopeName: form.scopeName,
      scopeSubcategory: form.scopeSubcategory
    });
    if (isLatestCascadeRequest(requestId)) {
      sourceIdentificationOptions.value = options;
    }
  } finally {
    if (isLatestCascadeRequest(requestId)) {
      sourceIdentificationLoading.value = false;
    }
  }
};

const refreshSourceCascadeOptions = async () => {
  const requestId = nextCascadeRequestId();
  await loadSourceFactoryOptions(requestId);
  await loadSourceScopeOptions(requestId);
  await loadSourceSubcategoryOptions(requestId);
  await loadSourceIdentificationOptions(requestId);
  await loadSourceNameOptions(requestId);
};

const handleCompanyChange = async () => {
  const requestId = nextCascadeRequestId();
  form.sourceFactoryName = undefined;
  form.scopeName = undefined;
  form.scopeSubcategory = undefined;
  form.sourceIdentificationName = undefined;
  form.emissionSourceName = undefined;
  form.sourceIdentificationCode = undefined;
  resetSourceCascadeOptions('factory');
  clearResolvedSourceFields();
  clearManualValidation();
  await loadSourceFactoryOptions(requestId);
};

const handleFactoryChange = async () => {
  const requestId = nextCascadeRequestId();
  form.scopeName = undefined;
  form.scopeSubcategory = undefined;
  form.sourceIdentificationName = undefined;
  form.emissionSourceName = undefined;
  form.sourceIdentificationCode = undefined;
  resetSourceCascadeOptions('scope');
  clearResolvedSourceFields();
  clearManualValidation();
  await loadSourceScopeOptions(requestId);
};

const handleScopeChange = async () => {
  const requestId = nextCascadeRequestId();
  form.scopeSubcategory = undefined;
  form.sourceIdentificationName = undefined;
  form.emissionSourceName = undefined;
  form.sourceIdentificationCode = undefined;
  resetSourceCascadeOptions('subcategory');
  clearResolvedSourceFields();
  clearManualValidation();
  await loadSourceSubcategoryOptions(requestId);
};

const handleSubcategoryChange = async () => {
  const requestId = nextCascadeRequestId();
  form.sourceIdentificationName = undefined;
  form.emissionSourceName = undefined;
  form.sourceIdentificationCode = undefined;
  resetSourceCascadeOptions('identification');
  clearResolvedSourceFields();
  clearManualValidation();
  await loadSourceIdentificationOptions(requestId);
  await loadSourceNameOptions(requestId);
};

const handleSourceIdentificationChange = async () => {
  const requestId = nextCascadeRequestId();
  form.emissionSourceName = undefined;
  form.sourceIdentificationCode = undefined;
  resetSourceCascadeOptions('emissionSourceName');
  clearResolvedSourceFields();
  clearManualValidation();
  await loadSourceNameOptions(requestId);
};

const handleSourceNameChange = (value?: unknown) => {
  clearResolvedSourceFields();
  clearManualValidation();
  const option = sourceOptionByValue(sourceNameOptions.value, value ?? form.emissionSourceName);
  applySourceRecordToForm(optionRecord(option));
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

const fieldValueFromResolvedSource = (source: EmissionActivityResolvedRow | undefined, code: string) => {
  if (!source) return '';
  const values: DerivedValueMap = {
    companyCode: source.companyCode ?? '',
    companyName: source.companyName ?? '',
    factoryName: source.factoryName ?? '',
    sourceCategoryKey: source.emissionSourceCategoryCode ?? '',
    scopeName: source.scope ?? '',
    scopeSubcategory: source.scopeSubcategory ?? '',
    sourceIdentificationName: source.emissionSourceIdentity ?? '',
    emissionSourceName: source.emissionSourceName ?? '',
    activityUnit: source.unit ?? '',
    factorKey: source.emissionFactorCode ?? ''
  };
  return values[code] ?? '';
};

const resolvedRowFromSourceRecord = (record: Record<string, any> | undefined): EmissionActivityResolvedRow | undefined => {
  if (!record) return undefined;
  return {
    emissionSourceCode: record.sourceIdentificationCode,
    companyCode: record.companyCode,
    companyName: record.companyName,
    factoryName: record.factoryName,
    emissionSourceCategoryCode: record.sourceCategoryKey,
    scope: record.scopeName,
    scopeSubcategory: record.scopeSubcategory,
    emissionSourceIdentity: record.sourceIdentificationName,
    emissionSourceName: record.emissionSourceName,
    unit: record.sourceUnit,
    emissionFactorCode: record.factorKey
  };
};

const applySourceRecordToForm = (record: Record<string, any> | undefined) => {
  const resolved = resolvedRowFromSourceRecord(record);
  if (!resolved) return;
  resolvedSource.value = resolved;
  manualResolvedDerivedValues.value = {
    sourceIdentificationCode: resolved.emissionSourceCode ?? '',
    companyCode: resolved.companyCode ?? '',
    companyName: resolved.companyName ?? '',
    factoryName: resolved.factoryName ?? '',
    sourceCategoryKey: resolved.emissionSourceCategoryCode ?? '',
    scopeName: resolved.scope ?? '',
    scopeSubcategory: resolved.scopeSubcategory ?? '',
    sourceIdentificationName: resolved.emissionSourceIdentity ?? '',
    emissionSourceName: resolved.emissionSourceName ?? '',
    activityUnit: resolved.unit ?? '',
    factorKey: resolved.emissionFactorCode ?? ''
  };
  form.sourceIdentificationCode = resolved.emissionSourceCode || form.sourceIdentificationCode;
  form.sourceCompanyName = resolved.companyName || form.sourceCompanyName;
  form.sourceFactoryName = resolved.factoryName || form.sourceFactoryName;
  form.sourceCategoryKey = resolved.emissionSourceCategoryCode || form.sourceCategoryKey;
  form.scopeName = resolved.scope || form.scopeName;
  form.scopeSubcategory = resolved.scopeSubcategory || form.scopeSubcategory;
  form.sourceIdentificationName = resolved.emissionSourceIdentity || form.sourceIdentificationName;
  form.emissionSourceName = resolved.emissionSourceName || form.emissionSourceName;
  form.activityUnit = resolved.unit || form.activityUnit;
  form.factorKey = resolved.emissionFactorCode || form.factorKey;
};

const currentDerivedValues = () =>
  ALL_FIELD_DESCRIPTORS.filter((field) => field.derivedField).reduce<DerivedValueMap>((values, field) => {
    const resolvedValue = fieldValueFromResolvedSource(resolvedSource.value, field.fieldCode);
    values[field.fieldCode] = manualResolvedDerivedValues.value[field.fieldCode] ?? resolvedValue;
    return values;
  }, {});

const derivedFieldValue = (code: string) => {
  return currentDerivedValues()[code] ?? '';
};

const collectIssues = (result?: EmissionActivityImportValidationResult): EmissionActivityValidationIssue[] => [
  ...(result?.headerIssues ?? []),
  ...(result?.rowResults?.flatMap((row) => row.issues ?? []) ?? [])
];

const cloneFieldDescriptors = (fields: EmissionActivityFieldDescriptor[] = []): EmissionActivityFieldDescriptor[] =>
  fields.map((field) => ({ ...field }));

const cloneFieldValues = (fieldValues: EmissionActivityFieldValue[] = []): EmissionActivityFieldValue[] =>
  fieldValues.map((fieldValue) => ({ ...fieldValue }));

const cloneImportValidationRequest = (request: EmissionActivityImportValidationRequest): EmissionActivityImportValidationRequest => ({
  headerFields: cloneFieldDescriptors(request.headerFields ?? []),
  rows: (request.rows ?? []).map((row) => ({
    rowNumber: row.rowNumber,
    fieldValues: cloneFieldValues(row.fieldValues ?? [])
  }))
});

const buildFieldValues = (): EmissionActivityFieldValue[] => {
  const { year, month } = splitPeriod(form.selectedPeriod);
  const values: DerivedValueMap = {
    ...currentDerivedValues(),
    companyName: form.sourceCompanyName ?? '',
    factoryName: form.sourceFactoryName ?? '',
    scopeName: form.scopeName ?? '',
    scopeSubcategory: form.scopeSubcategory ?? '',
    sourceIdentificationName: form.sourceIdentificationName ?? '',
    emissionSourceName: form.emissionSourceName ?? '',
    activityYear: year ?? '',
    activityMonth: month ?? '',
    activityDate: form.date ?? '',
    activityValue: valueToString(roundToTwoDecimal(form.activityValue)),
    responsibleDept: form.responsibleDept ?? '',
    dataSource: form.dataSource ?? '',
    sourceRemark: form.remark ?? ''
  };

  return entryFieldDescriptors.value.map((field) => ({
    fieldCode: field.fieldCode,
    fieldName: field.fieldName,
    value: values[field.fieldCode] ?? ''
  }));
};

const buildActivityDataForm = (dataStatus?: string) => {
  const { year, month } = splitPeriod(form.selectedPeriod);
  const derivedValues = currentDerivedValues();
  return {
    id: form.id,
    sourceSheetCode: 'emission_activity',
    sourceIdentificationCode: derivedValues.sourceIdentificationCode ?? form.sourceIdentificationCode,
    companyCode: derivedValues.companyCode,
    companyName: form.sourceCompanyName,
    factoryCode: derivedValues.companyCode,
    factoryName: form.sourceFactoryName,
    sourceCategoryKey: derivedValues.sourceCategoryKey ?? form.sourceCategoryKey,
    scopeName: form.scopeName,
    scopeSubcategory: form.scopeSubcategory,
    sourceIdentificationName: derivedValues.sourceIdentificationName ?? form.sourceIdentificationName,
    emissionSourceName: form.emissionSourceName,
    activityUnit: derivedValues.activityUnit ?? form.activityUnit,
    activityYear: year ? Number(year) : undefined,
    activityMonth: month ? Number(month) : undefined,
    activityDate: form.date,
    activityValue: roundToTwoDecimal(form.activityValue),
    responsibleDept: form.responsibleDept,
    dataSource: form.dataSource,
    sourceRemark: form.remark,
    factorKey: derivedValues.factorKey ?? form.factorKey,
    dataStatus: dataStatus ?? form.dataStatus ?? 'draft',
    remark: form.remark
  };
};

const buildManualValidationRequest = (): EmissionActivityImportValidationRequest => ({
  headerFields: cloneFieldDescriptors(entryFieldDescriptors.value),
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
    id: undefined,
    sourceCompanyName: undefined,
    sourceFactoryName: undefined,
    sourceCategoryKey: undefined,
    scopeName: undefined,
    scopeSubcategory: undefined,
    sourceIdentificationName: undefined,
    sourceIdentificationCode: undefined,
    emissionSourceName: undefined,
    factorKey: undefined,
    activityUnit: undefined,
    selectedPeriod: undefined,
    date: undefined,
    activityValue: undefined,
    responsibleDept: undefined,
    dataSource: undefined,
    dataStatus: undefined,
    remark: undefined
  });
  resolvedSource.value = undefined;
  clearManualValidation();
  activityFormRef.value?.clearValidate();
};

const openCreateDrawer = async () => {
  resetForm();
  applyRouteQuery();
  await loadSourceCompanyOptions();
  await refreshSourceCascadeOptions();
  formDrawer.title = '新增活动数据';
  formDrawer.readonly = false;
  formDrawer.open = true;
};

const openDetailDrawer = async (row: ActivityDataVO) => {
  initializingForm.value = true;
  resetForm();
  Object.assign(form, {
    id: row.id,
    sourceCompanyName: row.companyName,
    sourceFactoryName: row.factoryName,
    sourceCategoryKey: row.sourceCategoryKey,
    scopeName: row.scopeName,
    scopeSubcategory: row.scopeSubcategory,
    sourceIdentificationName: row.sourceIdentificationName,
    sourceIdentificationCode: row.sourceIdentificationCode,
    emissionSourceName: row.emissionSourceName,
    factorKey: row.factorKey,
    activityUnit: row.activityUnit,
    selectedPeriod: joinPeriod(row.activityYear, row.activityMonth),
    date: row.activityDate,
    activityValue: roundToTwoDecimal(row.activityValue),
    responsibleDept: row.responsibleDept,
    dataSource: row.dataSource,
    dataStatus: row.dataStatus,
    remark: row.sourceRemark ?? row.remark
  });
  manualResolvedDerivedValues.value = {
    companyCode: row.companyCode ?? '',
    companyName: row.companyName ?? '',
    factoryName: row.factoryName ?? '',
    sourceCategoryKey: row.sourceCategoryKey ?? '',
    scopeName: row.scopeName ?? '',
    scopeSubcategory: row.scopeSubcategory ?? '',
    sourceIdentificationName: row.sourceIdentificationName ?? '',
    emissionSourceName: row.emissionSourceName ?? '',
    activityUnit: row.activityUnit ?? '',
    factorKey: row.factorKey ?? ''
  };
  resolvedSource.value = {
    emissionSourceCode: row.sourceIdentificationCode,
    companyCode: row.companyCode,
    companyName: row.companyName,
    factoryName: row.factoryName,
    emissionSourceCategoryCode: row.sourceCategoryKey,
    scope: row.scopeName,
    scopeSubcategory: row.scopeSubcategory,
    emissionSourceIdentity: row.sourceIdentificationName,
    emissionSourceName: row.emissionSourceName,
    unit: row.activityUnit,
    emissionFactorCode: row.factorKey
  };
  await loadSourceCompanyOptions();
  await refreshSourceCascadeOptions();
  formDrawer.title = '查看活动数据';
  formDrawer.readonly = true;
  formDrawer.open = true;
  nextTick(() => {
    initializingForm.value = false;
  });
};

const openEditDrawer = async (row: ActivityDataVO) => {
  await openDetailDrawer(row);
  formDrawer.title = '编辑活动数据';
  formDrawer.readonly = false;
};

const openUploadDialog = () => {
  uploadDialog.open = true;
};

const preloadSpreadsheetEditor = () => {
  const run = () => {
    void loadUniverSheetsCore();
  };
  const idleWindow = window as Window & {
    requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
  };
  if (idleWindow.requestIdleCallback) {
    idleWindow.requestIdleCallback(run, { timeout: 3000 });
    return;
  }
  globalThis.setTimeout(run, 300);
};

const openSheetDrawer = () => {
  void loadUniverSheetsCore();
  sheetDrawer.open = true;
};

const downloadImportTemplate = () => {
  const entryHeaders = entryFieldDescriptors.value.map((field) => field.fieldName);
  const headerName = (code: string) => entryFieldDescriptors.value.find((field) => field.fieldCode === code)?.fieldName ?? code;
  downloadXlsxTemplate({
    fileName: `emission_activity_activity_template_${new Date().getTime()}.xlsx`,
    sheetName: 'emission_activity',
    headers: entryHeaders,
    validations: {
      [headerName('companyName')]: sourceCompanyOptions.value.map((option) => String(option.value)),
      [headerName('factoryName')]: allSourceFactoryOptions.value.map((option) => String(option.value)),
      [headerName('scopeName')]: allSourceScopeOptions.value.map((option) => String(option.value)),
      [headerName('scopeSubcategory')]: allSourceSubcategoryOptions.value.map((option) => String(option.value)),
      [headerName('sourceIdentificationName')]: allSourceIdentificationOptions.value.map((option) => String(option.value)),
      [headerName('emissionSourceName')]: emissionSourceNameOptions.value.map((option) => String(option.value)),
      [headerName('responsibleDept')]: deptOptions.value.map((option) => String(option.value)),
      [headerName('dataSource')]: dataSourceOptions.value.map((option) => String(option.value))
    }
  });
};

const applyManualResolvedDerivedValues = (result: EmissionActivityImportValidationResult) => {
  const resolved = result.rowResults?.[0]?.resolvedDerivedFieldValues ?? [];
  manualResolvedDerivedValues.value = resolved.reduce<DerivedValueMap>((acc, field) => {
    if (field.fieldCode) {
      acc[field.fieldCode] = field.value ?? '';
    }
    return acc;
  }, {});
  form.sourceIdentificationCode = manualResolvedDerivedValues.value.sourceIdentificationCode || form.sourceIdentificationCode;
  form.sourceCompanyName = manualResolvedDerivedValues.value.companyName || form.sourceCompanyName;
  form.sourceFactoryName = manualResolvedDerivedValues.value.factoryName || form.sourceFactoryName;
  form.sourceCategoryKey = manualResolvedDerivedValues.value.sourceCategoryKey || form.sourceCategoryKey;
  form.scopeName = manualResolvedDerivedValues.value.scopeName || form.scopeName;
  form.scopeSubcategory = manualResolvedDerivedValues.value.scopeSubcategory || form.scopeSubcategory;
  form.sourceIdentificationName = manualResolvedDerivedValues.value.sourceIdentificationName || form.sourceIdentificationName;
  form.emissionSourceName = manualResolvedDerivedValues.value.emissionSourceName || form.emissionSourceName;
  form.activityUnit = manualResolvedDerivedValues.value.activityUnit || form.activityUnit;
  const factorKey = manualResolvedDerivedValues.value.factorKey;
  if (factorKey) {
    form.factorKey = factorKey;
  }
};

const validateFormFields = async () => {
  if (!activityFormRef.value) return false;
  return activityFormRef.value.validate().catch(() => false);
};

const runManualServerValidation = async (request: EmissionActivityImportValidationRequest = buildManualValidationRequest()) => {
  validating.value = true;
  try {
    const res = await validateLocalEmissionActivity(request);
    manualValidation.value = res.data;
    applyManualResolvedDerivedValues(res.data);
    return res.data;
  } finally {
    validating.value = false;
  }
};

const runUploadServerValidation = async (request: EmissionActivityImportValidationRequest) => {
  const res = await validateLocalEmissionActivity(request);
  uploadValidation.value = res.data;
  return res.data;
};

const handleValidate = async () => {
  const valid = await validateFormFields();
  if (!valid) return;
  if (selectedSourceMasterIssue.value) {
    ElMessage.error(selectedSourceMasterIssue.value);
    return;
  }
  const result = await runManualServerValidation(buildManualValidationRequest());
  if (result.blocking) {
    ElMessage.error('校验存在错误');
    return;
  }
  ElMessage.success(result.valid ? '校验通过' : '校验完成，存在警告');
};

const saveActivity = async (options: { submitAfterSave?: boolean } = {}) => {
  const valid = await validateFormFields();
  if (!valid) return;
  if (selectedSourceMasterIssue.value) {
    ElMessage.error(selectedSourceMasterIssue.value);
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

    if (form.id) {
      const updatePayload = buildActivityDataForm(options.submitAfterSave ? 'submitted' : undefined);
      await updateActivityData(updatePayload);
      ElMessage.success(options.submitAfterSave ? '保存并提交成功' : manualWarningIssues.value.length ? '已保存，存在警告请复核' : '保存成功');
      formDrawer.open = false;
      await loadActivities();
      return;
    }

    const saveRes = await saveLocalEmissionActivity(request.rows[0]);

    // 检查后端返回的验证结果
    if (saveRes.data?.validationResult?.blocking) {
      ElMessage.error('保存失败：存在验证错误，请检查数据');
      return;
    }

    const persisted = saveRes.data?.persisted === true || (saveRes.data?.persistedRowCount ?? 0) > 0;
    if (!persisted) {
      ElMessage.warning('保存未持久化，请根据校验结果复核后重试');
      return;
    }

    ElMessage.success(manualWarningIssues.value.length ? '已保存，存在警告请复核' : '保存成功');
    formDrawer.open = false;
    await loadActivities();
  } catch (error) {
    // 异常处理：确保用户能看到错误消息
    console.error('保存失败:', error);
    const errorMsg = error instanceof Error ? error.message : '服务器异常，请稍后重试';
    ElMessage.error('保存失败：' + errorMsg);
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
    const parseRes = await parseLocalEmissionActivityFile(file as File);
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

    const importRes = await importLocalEmissionActivity(request);
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

const handleSelectionChange = (rows: ActivityDataVO[]) => {
  selectedActivities.value = rows;
};

const confirmAction = (message: string, title = '确认操作') =>
  ElMessageBox.confirm(message, title, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  });

const deleteActivitiesByIds = async (ids: Array<string | number>) => {
  if (!ids.length) {
    ElMessage.warning('请选择要删除的数据');
    return;
  }
  await confirmAction(`确认删除选中的 ${ids.length} 条活动数据吗？删除后不可恢复。`, '删除确认');
  await delActivityData(ids);
  ElMessage.success('删除成功');
  selectedActivities.value = [];
  await loadActivities();
};

const deleteSelectedActivities = () => deleteActivitiesByIds(selectedActivityIds.value);

const deleteActivity = (row: ActivityDataVO) => deleteActivitiesByIds([row.id]);

const submitActivitiesByIds = async (ids: Array<string | number>, message: string) => {
  if (!ids.length) {
    ElMessage.warning('请选择要提交的数据');
    return;
  }
  await confirmAction(message, '提交确认');
  await updateActivityDataStatus(ids, 'submitted');
  ElMessage.success('提交成功');
  selectedActivities.value = [];
  await loadActivities();
};

const submitSelectedActivities = () =>
  submitActivitiesByIds(selectedActivityIds.value, `确认提交选中的 ${selectedActivityIds.value.length} 条活动数据吗？`);

const submitCurrentPageActivities = () =>
  submitActivitiesByIds(
    activityList.value.map((row) => row.id),
    `确认提交当前页 ${activityList.value.length} 条活动数据吗？`
  );

const submitActivity = (row: ActivityDataVO) => submitActivitiesByIds([row.id], '确认提交这条活动数据吗？');

const buildSheetRowRequest = (rows: Record<string, any>[]): EmissionActivityImportValidationRequest => ({
  headerFields: cloneFieldDescriptors(entryFieldDescriptors.value),
  rows: rows.map((row, index) => ({
    rowNumber: index + 2,
    fieldValues: entryFieldDescriptors.value.map((field) => ({
      fieldCode: field.fieldCode,
      fieldName: field.fieldName,
      value: valueToString(field.fieldCode === 'activityValue' ? roundToTwoDecimal(row[field.fieldCode]) : row[field.fieldCode])
    }))
  }))
});

const sheetSourceMasterIssues = (rows: Record<string, any>[]) =>
  rows
    .map((row, index) => {
      const option = sheetEmissionSourceNameOptions(row).find((item) => sameOptionValue(item.value, row.emissionSourceName));
      const record = optionRecord(option);
      if (!record) return '';
      if (!record.sourceUnit) {
        return `第 ${index + 2} 行排放源“${row.emissionSourceName}”关联的 201 排放因子缺少排放源单位/因子单位`;
      }
      if (!record.sourceIdentificationCode) {
        return `第 ${index + 2} 行排放源“${row.emissionSourceName}”在 104 缺少排放源编号`;
      }
      if (!record.factorKey) {
        return `第 ${index + 2} 行排放源“${row.emissionSourceName}”在 104 缺少适用因子`;
      }
      return '';
    })
    .filter(Boolean);

const saveSheetRows = async (rows: Record<string, any>[]) => {
  sheetSaving.value = true;
  try {
    if (!rows.length) {
      ElMessage.warning('没有可保存的新增数据');
      return;
    }
    const masterIssues = sheetSourceMasterIssues(rows);
    if (masterIssues.length) {
      ElMessage.error(`${masterIssues[0]}，请先补齐 104 排放源识别主数据。`);
      return;
    }
    const request = buildSheetRowRequest(rows);
    const validation = await validateLocalEmissionActivity(request);
    if (validation.data?.blocking) {
      ElMessage.error('在线填报存在错误，不能保存');
      return;
    }

    const importRes = await importLocalEmissionActivity(request);
    if (importRes.data?.validationResult?.blocking) {
      ElMessage.error('在线填报保存失败，请按校验结果修正');
      return;
    }
    const persisted = importRes.data?.persisted === true || (importRes.data?.persistedRowCount ?? 0) > 0;
    if (!persisted) {
      ElMessage.warning('在线填报新增数据未持久化，请根据校验结果复核后重试');
      return;
    }
    ElMessage.success('在线填报已保存');
    sheetDrawer.open = false;
    await loadActivities();
  } finally {
    sheetSaving.value = false;
  }
};

const loadEmissionSourceOptions = async () => {
  sourceLoading.value = true;
  try {
    const [sourceNames, companies, factories, scopes, subcategories, identifications] = await Promise.all([
      loadActivityEntryEmissionSourceNameOptions(),
      loadActivityEntrySourceCompanyOptions(),
      loadActivityEntrySourceFactoryOptions(),
      loadActivityEntrySourceScopeOptions(),
      loadActivityEntrySourceSubcategoryOptions(),
      loadActivityEntrySourceIdentificationOptions()
    ]);
    emissionSourceNameOptions.value = sourceNames;
    sourceCompanyOptions.value = companies;
    sourceFactoryOptions.value = [];
    sourceScopeOptions.value = [];
    sourceSubcategoryOptions.value = [];
    sourceNameOptions.value = [];
    allSourceFactoryOptions.value = factories;
    allSourceScopeOptions.value = scopes;
    allSourceSubcategoryOptions.value = subcategories;
    allSourceIdentificationOptions.value = identifications;
  } finally {
    sourceLoading.value = false;
  }
};

const loadActivities = async () => {
  const requestId = latestActivityRequestId.value + 1;
  latestActivityRequestId.value = requestId;
  listLoading.value = true;
  try {
    const res = await listLocalActivityData(queryParams);
    if (requestId !== latestActivityRequestId.value) {
      return;
    }
    activityList.value = (res.rows ?? res.data ?? []) as ActivityDataVO[];
    total.value = Number(res.total ?? activityList.value.length);
  } finally {
    if (requestId === latestActivityRequestId.value) {
      listLoading.value = false;
    }
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

const loadEntryFieldDescriptors = async () => {
  try {
    const res = await listLocalEmissionActivityFields();
    const fields = [...(res.data ?? [])].sort((left, right) => Number(left.fieldOrder ?? 0) - Number(right.fieldOrder ?? 0));
    if (fields.length) {
      entryFieldDescriptors.value = fields;
    }
  } catch (error) {
    console.warn('加载 emission_activity 字段定义失败，使用前端兜底字段。', error);
    entryFieldDescriptors.value = FALLBACK_ENTRY_FIELD_DESCRIPTORS;
  }
};

watch(
  () => [form.sourceCompanyName, form.sourceFactoryName, form.scopeName, form.scopeSubcategory, form.emissionSourceName],
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

onMounted(async () => {
  applyRouteQuery();
  await Promise.all([loadEntryFieldDescriptors(), loadEmissionSourceOptions(), loadControlledOptions()]);
  await loadActivities();
  hasMounted.value = true;
  preloadSpreadsheetEditor();
});

onActivated(() => {
  if (hasMounted.value) {
    loadActivities();
  }
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
