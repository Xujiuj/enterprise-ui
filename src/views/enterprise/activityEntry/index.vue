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
            <el-form-item label="公司">
              <el-select
                v-model="form.sourceCompanyName"
                class="w-full"
                clearable
                filterable
                :disabled="formDrawer.readonly"
                placeholder="请选择公司"
                @change="handleCompanyChange"
              >
                <el-option v-for="option in sourceCompanyOptions" :key="option.value" :label="option.label" :value="option.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="工厂">
              <el-select
                v-model="form.sourceFactoryName"
                class="w-full"
                clearable
                filterable
                :disabled="formDrawer.readonly || !form.sourceCompanyName"
                placeholder="请选择工厂"
                @change="handleFactoryChange"
              >
                <el-option v-for="option in sourceFactoryOptions" :key="option.value" :label="option.label" :value="option.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="排放源分类">
              <el-select
                v-model="form.sourceCategoryKey"
                class="w-full"
                clearable
                filterable
                :disabled="formDrawer.readonly"
                placeholder="请选择排放源分类"
                @change="handleCategoryChange"
              >
                <el-option v-for="option in sourceCategoryCascadeOptions" :key="option.value" :label="option.label" :value="option.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="排放源识别" prop="sourceIdentificationCode">
              <el-select
                v-model="form.sourceIdentificationCode"
                class="w-full"
                clearable
                filterable
                :loading="sourceLoading"
                :disabled="formDrawer.readonly"
                placeholder="请选择排放源识别"
                @change="handleSourceSelect"
              >
                <el-option v-for="option in sourceLeafOptions" :key="option.value" :label="option.label" :value="option.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="范围">
              <el-input v-model="form.scopeName" placeholder="选择排放源识别后自动填充" disabled />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="范围子类别">
              <el-input v-model="form.scopeSubcategory" placeholder="选择排放源识别后自动填充" disabled />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="排放源名称">
              <el-input v-model="form.emissionSourceName" placeholder="选择排放源识别后自动填充" disabled />
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
              <el-input v-model="form.activityUnit" placeholder="选择排放源识别后自动填充" disabled />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="适用因子">
              <el-input v-model="form.factorKey" placeholder="选择排放源识别后自动填充" disabled />
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
        allow-empty-save
        hint="在线填报仅用于新增活动数据，只填写人工录入字段；公司、分类、单位、因子等派生字段会在保存前按排放源识别编号自动匹配。"
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
  importLocalSheet656Activity,
  listLocalActivityData,
  parseLocalSheet656ActivityFile,
  resolveLocalSheet656Source,
  saveLocalSheet656Activity,
  validateLocalSheet656Activity
} from '@/api/enterprise/activityEntry';
import {
  loadActivityDataStatusOptions,
  loadActivityEntryEmissionSourceNameOptions,
  loadActivityEntrySourceCategoryOptions,
  loadActivityEntrySourceCompanyOptions,
  loadActivityEntrySourceFactoryOptions,
  loadActivityEntrySourceLeafOptions,
  loadCompanyNameOptions,
  loadDataSourceOptions,
  loadFactoryNameOptions,
  loadResponsibleDeptOptions,
  loadSourceCategoryOptions,
  type SelectOption
} from '@/utils/enterpriseFieldOptions';
import type { ActivityDataQuery, ActivityDataVO } from '@/api/enterprise/activityData/types';
import { delActivityData, updateActivityData, updateActivityDataStatus } from '@/api/enterprise/activityData';
import type { EmissionSourceVO } from '@/api/enterprise/emissionSource/types';
import type {
  Sheet656FieldDescriptor,
  Sheet656FieldValue,
  Sheet656ImportValidationRequest,
  Sheet656ImportValidationResult,
  Sheet656ResolvedRow,
  Sheet656ValidationIssue
} from '@/api/enterprise/sheet656ActivityValidation/types';

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
const ENTRY_FIELD_DESCRIPTORS = FIELD_DESCRIPTORS.filter((field) => !field.derivedField);

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
const sourceCategoryCascadeOptions = ref<SelectOption[]>([]);
const sourceLeafOptions = ref<SelectOption[]>([]);
const allSourceOptions = ref<SelectOption[]>([]);
const manualValidation = ref<Sheet656ImportValidationResult>();
const uploadValidation = ref<Sheet656ImportValidationResult>();
const manualResolvedDerivedValues = ref<DerivedValueMap>({});
const resolvedSource = ref<Sheet656ResolvedRow>();
const parsedUploadRequest = ref<Sheet656ImportValidationRequest>();
const uploadFileName = ref('');
const selectedQueryPeriod = ref('');
const initializingForm = ref(false);
const hasMounted = ref(false);
const latestActivityRequestId = ref(0);
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
  { prop: 'dataStatus', label: '数据状态', width: 110 },
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
  ENTRY_FIELD_DESCRIPTORS.map((field) => {
    if (field.sourceColumnCode === 'f001') {
      return {
        prop: field.sourceColumnCode,
        label: field.sourceColumnName,
        type: 'select',
        required: true,
        width: 230,
        options: allSourceOptions.value
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
      readonly: field.derivedField,
      width: field.derivedField ? 170 : 160
    };
  })
);
const sheetEmptyRow = computed(() =>
  ENTRY_FIELD_DESCRIPTORS.reduce<Record<string, string | number | undefined>>((row, field) => {
    row[field.sourceColumnCode] = undefined;
    return row;
  }, {})
);
const sheetRows = computed(() => Array.from({ length: 10 }, () => ({ ...sheetEmptyRow.value })));

const rules: FormRules<ActivityEntryForm> = {
  sourceIdentificationCode: [{ required: true, message: '请选择排放源识别', trigger: 'change' }],
  selectedPeriod: [{ required: true, message: '请选择活动期间', trigger: 'change' }],
  date: [{ required: true, message: '请选择日期', trigger: 'change' }],
  activityValue: [{ required: true, message: '请输入活动数据', trigger: 'blur' }],
  responsibleDept: [{ required: true, message: '请选择负责部门', trigger: 'change' }],
  dataSource: [{ required: true, message: '请选择数据来源', trigger: 'change' }]
};

const optionRecordAsSource = (option?: SelectOption): EmissionSourceVO | undefined => option?.record as EmissionSourceVO | undefined;
const selectedSource = computed(() => {
  const sourceCode = form.sourceIdentificationCode;
  return (
    optionRecordAsSource(sourceLeafOptions.value.find((option) => option.value === sourceCode)) ??
    optionRecordAsSource(allSourceOptions.value.find((option) => option.value === sourceCode))
  );
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

const sourceHierarchyFilters = () => ({
  companyName: form.sourceCompanyName,
  factoryName: form.sourceFactoryName,
  sourceCategoryKey: form.sourceCategoryKey
});

const clearResolvedSourceFields = () => {
  resolvedSource.value = undefined;
  form.scopeName = undefined;
  form.scopeSubcategory = undefined;
  form.sourceIdentificationName = undefined;
  form.emissionSourceName = undefined;
  form.activityUnit = undefined;
  form.factorKey = undefined;
};

const loadSourceFactoryOptions = async () => {
  sourceFactoryOptions.value = form.sourceCompanyName ? await loadActivityEntrySourceFactoryOptions(sourceHierarchyFilters()) : [];
};

const loadSourceCategoryCascadeOptions = async () => {
  sourceCategoryCascadeOptions.value = await loadActivityEntrySourceCategoryOptions();
};

const loadSourceLeafOptions = async () => {
  sourceLoading.value = true;
  try {
    sourceLeafOptions.value = await loadActivityEntrySourceLeafOptions(sourceHierarchyFilters());
  } finally {
    sourceLoading.value = false;
  }
};

const refreshSourceCascadeOptions = async () => {
  await loadSourceFactoryOptions();
  await loadSourceLeafOptions();
};

const handleCompanyChange = async () => {
  form.sourceFactoryName = undefined;
  form.sourceCategoryKey = undefined;
  form.sourceIdentificationCode = undefined;
  clearResolvedSourceFields();
  clearManualValidation();
  await refreshSourceCascadeOptions();
};

const handleFactoryChange = async () => {
  form.sourceIdentificationCode = undefined;
  clearResolvedSourceFields();
  clearManualValidation();
  await loadSourceLeafOptions();
};

const handleCategoryChange = async () => {
  form.sourceIdentificationCode = undefined;
  clearResolvedSourceFields();
  clearManualValidation();
  await loadSourceLeafOptions();
};

const applyResolvedSourceToForm = (source: Sheet656ResolvedRow, optionSource?: EmissionSourceVO) => {
  resolvedSource.value = source;
  form.sourceIdentificationCode = source.emissionSourceCode ?? form.sourceIdentificationCode;
  form.sourceCompanyName = source.companyName;
  form.sourceFactoryName = source.factoryName;
  form.sourceCategoryKey = source.emissionSourceCategoryCode;
  form.scopeName = source.scope;
  form.scopeSubcategory = source.scopeSubcategory;
  form.sourceIdentificationName = source.emissionSourceIdentity;
  form.emissionSourceName = source.emissionSourceName;
  form.activityUnit = source.unit;
  form.factorKey = optionSource?.factorDisplayName || source.emissionFactorCode;
  if (!form.responsibleDept && optionSource?.responsibleDept) {
    form.responsibleDept = optionSource.responsibleDept;
  }
  if (!form.dataSource && optionSource?.dataSource) {
    form.dataSource = optionSource.dataSource;
  }
};

const handleSourceSelect = async (sourceIdentificationCode?: string) => {
  if (!sourceIdentificationCode) {
    clearResolvedSourceFields();
    clearManualValidation();
    return;
  }
  const option =
    sourceLeafOptions.value.find((opt) => opt.value === sourceIdentificationCode) ??
    allSourceOptions.value.find((opt) => opt.value === sourceIdentificationCode);
  const optionSource = optionRecordAsSource(option);
  try {
    const res = await resolveLocalSheet656Source(sourceIdentificationCode);
    applyResolvedSourceToForm(res.data, optionSource);
  } catch (error) {
    clearResolvedSourceFields();
    throw error;
  }
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
    f010: source.sourceUnit ?? '',
    f018: source.factorKey ?? ''
  };
  return values[code] ?? '';
};

const fieldValueFromResolvedSource = (source: Sheet656ResolvedRow | undefined, code: string) => {
  if (!source) return '';
  const values: DerivedValueMap = {
    f002: source.companyCode ?? '',
    f003: source.companyName ?? '',
    f004: source.factoryName ?? '',
    f005: source.emissionSourceCategoryCode ?? '',
    f006: source.scope ?? '',
    f007: source.scopeSubcategory ?? '',
    f008: source.emissionSourceIdentity ?? '',
    f009: source.emissionSourceName ?? '',
    f010: source.unit ?? '',
    f018: source.emissionFactorCode ?? ''
  };
  return values[code] ?? '';
};

const currentDerivedValues = () =>
  FIELD_DESCRIPTORS.filter((field) => field.derivedField).reduce<DerivedValueMap>((values, field) => {
    const resolvedValue = fieldValueFromResolvedSource(resolvedSource.value, field.sourceColumnCode);
    values[field.sourceColumnCode] =
      manualResolvedDerivedValues.value[field.sourceColumnCode] ??
      (resolvedValue || fieldValueFromSource(selectedSource.value, field.sourceColumnCode));
    return values;
  }, {});

const derivedFieldValue = (code: string) => {
  return currentDerivedValues()[code] ?? '';
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
    ...currentDerivedValues(),
    f011: year,
    f012: month,
    f013: form.date ?? '',
    f014: valueToString(roundToTwoDecimal(form.activityValue)),
    f015: form.responsibleDept ?? '',
    f016: form.dataSource ?? '',
    f017: form.remark ?? ''
  };

  return FIELD_DESCRIPTORS.map((field) => ({
    sourceColumnCode: field.sourceColumnCode,
    sourceColumnName: field.sourceColumnName,
    value: values[field.sourceColumnCode] ?? ''
  }));
};

const buildActivityDataForm = (dataStatus?: string) => {
  const { year, month } = splitPeriod(form.selectedPeriod);
  return {
    id: form.id,
    sourceSheetCode: 'sheet_656',
    sourceIdentificationCode: form.sourceIdentificationCode,
    companyCode: currentDerivedValues().f002,
    companyName: form.sourceCompanyName,
    factoryName: form.sourceFactoryName,
    sourceCategoryKey: form.sourceCategoryKey,
    scopeName: form.scopeName,
    scopeSubcategory: form.scopeSubcategory,
    sourceIdentificationName: form.sourceIdentificationName,
    emissionSourceName: form.emissionSourceName,
    activityUnit: form.activityUnit,
    activityYear: year ? Number(year) : undefined,
    activityMonth: month ? Number(month) : undefined,
    activityDate: form.date,
    activityValue: roundToTwoDecimal(form.activityValue),
    responsibleDept: form.responsibleDept,
    dataSource: form.dataSource,
    sourceRemark: form.remark,
    factorKey: form.factorKey,
    dataStatus: dataStatus ?? form.dataStatus ?? 'draft',
    remark: form.remark
  };
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
  await refreshSourceCascadeOptions();
  if (form.sourceIdentificationCode) {
    await handleSourceSelect(form.sourceIdentificationCode);
  }
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
  const entryHeaders = ENTRY_FIELD_DESCRIPTORS.map((field) => field.sourceColumnName);
  const headerName = (code: string) => ENTRY_FIELD_DESCRIPTORS.find((field) => field.sourceColumnCode === code)?.sourceColumnName ?? code;
  downloadXlsxTemplate({
    fileName: `sheet_656_activity_template_${new Date().getTime()}.xlsx`,
    sheetName: 'sheet_656',
    headers: entryHeaders,
    validations: {
      [headerName('f001')]: allSourceOptions.value.map((option) => String(option.value)),
      [headerName('f015')]: deptOptions.value.map((option) => String(option.value)),
      [headerName('f016')]: dataSourceOptions.value.map((option) => String(option.value))
    }
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
  form.sourceCompanyName = manualResolvedDerivedValues.value.f003 || form.sourceCompanyName;
  form.sourceFactoryName = manualResolvedDerivedValues.value.f004 || form.sourceFactoryName;
  form.sourceCategoryKey = manualResolvedDerivedValues.value.f005 || form.sourceCategoryKey;
  form.scopeName = manualResolvedDerivedValues.value.f006 || form.scopeName;
  form.scopeSubcategory = manualResolvedDerivedValues.value.f007 || form.scopeSubcategory;
  form.sourceIdentificationName = manualResolvedDerivedValues.value.f008 || form.sourceIdentificationName;
  form.emissionSourceName = manualResolvedDerivedValues.value.f009 || form.emissionSourceName;
  form.activityUnit = manualResolvedDerivedValues.value.f010 || form.activityUnit;
  const factorKey = manualResolvedDerivedValues.value.f018;
  if (factorKey) {
    form.factorKey = factorKey;
  }
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
  if (form.sourceIdentificationCode && resolvedSource.value?.emissionSourceCode !== form.sourceIdentificationCode) {
    await handleSourceSelect(form.sourceIdentificationCode);
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
  if (!form.sourceIdentificationCode) {
    ElMessage.warning('请选择有效的排放源');
    return;
  }

  saving.value = true;
  try {
    if (resolvedSource.value?.emissionSourceCode !== form.sourceIdentificationCode) {
      await handleSourceSelect(form.sourceIdentificationCode);
    }
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

    const saveRes = await saveLocalSheet656Activity(request.rows[0]);

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
    const errorMsg = error?.message || '服务器异常，请稍后重试';
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
    if (!rows.length) {
      ElMessage.warning('没有可保存的新增数据');
      return;
    }
    const request = buildSheetRowRequest(rows);
    const validation = await validateLocalSheet656Activity(request);
    if (validation.data?.blocking) {
      ElMessage.error('在线填报存在错误，不能保存');
      return;
    }

    const importRes = await importLocalSheet656Activity(request);
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
    const [sourceNames, companies, allSources] = await Promise.all([
      loadActivityEntryEmissionSourceNameOptions(),
      loadActivityEntrySourceCompanyOptions(),
      loadActivityEntrySourceLeafOptions()
    ]);
    emissionSourceNameOptions.value = sourceNames;
    sourceCompanyOptions.value = companies;
    allSourceOptions.value = allSources;
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

onMounted(async () => {
  applyRouteQuery();
  await loadActivities();
  await Promise.all([loadEmissionSourceOptions(), loadControlledOptions(), loadSourceCategoryCascadeOptions()]);
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
