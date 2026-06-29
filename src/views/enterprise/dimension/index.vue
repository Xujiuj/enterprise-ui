<template>
  <div class="app-container enterprise-dimension-page">
    <template v-if="page">
      <section class="page-head">
        <div>
          <h1>{{ page.title }}</h1>
          <p>{{ page.stage }} / {{ page.owner }} / {{ page.mode }}</p>
        </div>
      </section>

      <section class="panel">
        <div class="search-bar wide" v-show="showSearch">
          <div class="search-item">
            <label>{{ page.codeLabel }}</label>
            <el-input v-model="queryParams.recordCode" :placeholder="`请输入${page.codeLabel}`" clearable @keyup.enter="handleQuery" />
          </div>
          <div class="search-item">
            <label>{{ page.nameLabel }}</label>
            <el-input v-model="queryParams.recordName" :placeholder="`请输入${page.nameLabel}`" clearable @keyup.enter="handleQuery" />
          </div>
          <div v-if="page.showStatus !== false" class="search-item">
            <label>状态</label>
            <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
              <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </div>
          <div class="search-actions">
            <right-toolbar v-model:showSearch="showSearch" :gutter="0" @query-table="getList" />
          </div>
        </div>
        <div class="search-bar search-bar-collapsed" v-show="!showSearch">
          <div class="search-actions">
            <right-toolbar v-model:showSearch="showSearch" :gutter="0" @query-table="getList" />
          </div>
        </div>

        <div class="toolbar">
          <div class="btns">
            <el-button v-if="isEditable" type="primary" icon="Plus" @click="handleAdd" v-hasPermi="['enterprise:dimension:add']">新增</el-button>
            <el-button v-if="isEditable" icon="Grid" @click="openSheetDrawer" v-hasPermi="['enterprise:dimension:edit']">在线填报</el-button>
            <el-button v-if="isEditable" icon="Download" @click="downloadDimensionTemplate" v-hasPermi="['enterprise:dimension:edit']"
              >下载模板</el-button
            >
            <el-button v-if="isEditable" icon="Upload" @click="openUploadDialog" v-hasPermi="['enterprise:dimension:edit']">Excel 上传</el-button>
            <el-button
              v-if="isEditable"
              type="danger"
              plain
              icon="Delete"
              :disabled="multiple"
              @click="handleDelete()"
              v-hasPermi="['enterprise:dimension:remove']"
              >删除</el-button
            >
            <el-button
              v-if="isVendorLinked"
              type="warning"
              plain
              icon="Refresh"
              :loading="syncLoading"
              @click="handleRefresh()"
              v-hasPermi="['enterprise:dimension:sync']"
              >从厂商刷新</el-button
            >
          </div>
          <span class="select-count" v-if="ids.length > 0">已选 {{ ids.length }} 项</span>
        </div>

        <el-table v-loading="loading" :data="recordList" @selection-change="handleSelectionChange">
          <el-table-column v-if="isEditable" type="selection" width="42" align="center" />
          <el-table-column :label="page.codeLabel" align="center" prop="recordCode" min-width="150" />
          <el-table-column :label="page.nameLabel" align="center" prop="recordName" min-width="180" :show-overflow-tooltip="true" />
          <el-table-column v-if="page.showParent" :label="page.parentLabel ?? '上级编码'" align="center" prop="parentCode" min-width="140" />
          <el-table-column
            v-for="field in visibleFields"
            :key="field.prop"
            :label="field.label"
            align="center"
            :prop="field.prop"
            :min-width="field.width ?? 140"
            :show-overflow-tooltip="true"
          >
            <template #default="scope">
              {{ formatDisplayValue(scope.row[field.prop], field) }}
            </template>
          </el-table-column>
          <el-table-column v-if="page.showStatus !== false" label="状态" align="center" prop="status" width="100">
            <template #default="scope">
              <span class="tag" :class="scope.row.status === '0' ? 'ok' : 'gray'">
                {{ statusLabel(scope.row.status) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column v-if="page.showSort !== false" label="排序" align="center" prop="sortOrder" width="80" />
          <el-table-column v-if="page.showRemark !== false" label="备注" align="center" prop="remark" min-width="180" :show-overflow-tooltip="true" />
          <el-table-column v-if="isEditable" label="操作" align="center" width="150" fixed="right">
            <template #default="scope">
              <el-button
                v-if="dimensionExtensionFields.length > 0"
                link
                type="primary"
                icon="EditPen"
                @click="handleDimensionExtensionUpdate(scope.row)"
                v-hasPermi="['enterprise:extensionFieldValue:edit']"
                >扩展字段</el-button
              >
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['enterprise:dimension:edit']">编辑</el-button>
              <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['enterprise:dimension:remove']"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>

        <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
      </section>

      <el-drawer v-model="dialog.visible" :title="dialog.title" size="620px" append-to-body>
        <el-form ref="dimensionFormRef" :model="form" :rules="rules" label-width="120px">
          <el-form-item :label="page.codeLabel" prop="recordCode">
            <el-input v-model="form.recordCode" :placeholder="`请输入${page.codeLabel}`" />
          </el-form-item>
          <el-form-item :label="page.nameLabel" prop="recordName">
            <el-select
              v-if="page.nameField"
              v-model="form.recordName"
              :placeholder="page.nameField.placeholder ?? `请选择${page.nameLabel}`"
              clearable
              filterable
              :allow-create="page.nameField.allowCreate ?? false"
              class="w-full"
              @change="handleFieldSelect(page.nameField, $event)"
            >
              <el-option v-for="item in fieldOptions(page.nameField, form)" :key="String(item.value)" :label="item.label" :value="item.value" />
            </el-select>
            <el-input v-else v-model="form.recordName" :placeholder="`请输入${page.nameLabel}`" />
          </el-form-item>
          <el-form-item v-if="page.showParent" :label="page.parentLabel ?? '上级编码'" :prop="page.parentRequired ? 'parentCode' : undefined" :required="page.parentRequired">
            <el-select
              v-model="form.parentCode"
              :placeholder="page.parentPlaceholder ?? `请选择${page.parentLabel ?? '上级编码'}`"
              clearable
              filterable
              allow-create
              class="w-full"
              @change="handleParentCodeChange"
            >
              <el-option v-for="item in parentCodeOptions" :key="String(item.value)" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item v-for="field in visibleFormFields" :key="field.prop" :label="field.formLabel ?? field.label" :prop="field.required ? field.prop : undefined" :required="field.required">
            <el-select
              v-if="field.optionSource"
              v-model="form[field.prop]"
              :placeholder="field.placeholder ?? `请选择${field.formLabel ?? field.label}`"
              clearable
              :filterable="field.filterable ?? true"
              :allow-create="field.allowCreate ?? false"
              class="w-full"
              @change="handleFieldSelect(field, $event)"
            >
              <el-option v-for="item in fieldOptions(field, form)" :key="String(item.value)" :label="item.label" :value="item.value" />
            </el-select>
            <el-date-picker
              v-else-if="field.type === 'date'"
              v-model="form[field.prop]"
              value-format="YYYY-MM-DD"
              type="date"
              :placeholder="field.placeholder ?? `请选择${field.formLabel ?? field.label}`"
              class="w-full"
            />
            <el-input v-else-if="field.type === 'number'" v-model="form[field.prop]" type="number" :placeholder="field.placeholder ?? `请输入${field.formLabel ?? field.label}`" />
            <el-input v-else v-model="form[field.prop]" :placeholder="field.placeholder ?? `请输入${field.formLabel ?? field.label}`" />
          </el-form-item>
          <el-form-item v-if="page.showStatus !== false" label="状态" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio value="0">启用</el-radio>
              <el-radio value="1">停用</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="page.showSort !== false" label="排序" prop="sortOrder">
            <el-input-number v-model="form.sortOrder" :min="0" controls-position="right" class="w-full" />
          </el-form-item>
          <el-form-item v-if="page.showRemark !== false" label="备注" prop="remark">
            <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </template>
      </el-drawer>

      <el-drawer v-model="extensionDialog.visible" :title="extensionDialog.title" size="560px" append-to-body>
        <el-form label-width="132px">
          <template v-if="dimensionExtensionFields.length > 0">
            <el-form-item v-for="field in dimensionExtensionFields" :key="String(field.id)" :label="field.fieldName || field.fieldCode">
              <component :is="extensionControlComponent(field)" v-bind="extensionControlProps(field)" v-model="extensionValues[extensionFieldKey(field)]" />
            </el-form-item>
          </template>
          <el-empty v-else description="暂无可维护的扩展字段" />
        </el-form>
        <template #footer>
          <el-button :loading="extensionSaving" type="primary" @click="submitExtensionValues">保存</el-button>
          <el-button @click="cancelExtensionDialog">取消</el-button>
        </template>
      </el-drawer>

      <el-drawer v-model="sheetDrawer.visible" :title="`${page.title}在线填报`" size="92%" append-to-body destroy-on-close>
        <SpreadsheetEditor
          :title="page.title"
          :columns="sheetColumns"
          :rows="sheetRows"
          :empty-row="sheetEmptyRow"
          :saving="sheetSaving"
          hint="在线填报仅用于新增数据。编码、名称和状态必填；带下拉的维度字段必须选择已有选项。"
          @save="saveSheetRows"
        />
      </el-drawer>

      <el-dialog
        v-model="uploadDialog.visible"
        :title="`${page.title} Excel 上传`"
        width="720px"
        append-to-body
        destroy-on-close
        v-loading="uploadParsing"
      >
        <el-upload drag action="#" accept=".xlsx" :auto-upload="false" :show-file-list="false" :on-change="parseDimensionUploadFile">
          <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
          <div class="el-upload__text">拖拽 Excel 文件到此处，或点击选择 `.xlsx` 文件</div>
        </el-upload>
        <el-alert class="mt-4" type="info" show-icon :closable="false">
          <template #title>请使用“下载模板”生成的表头上传；编码、名称和状态必填。</template>
        </el-alert>
        <template #footer>
          <el-button @click="uploadDialog.visible = false">关闭</el-button>
        </template>
      </el-dialog>
    </template>

    <el-result v-else icon="error" title="未配置合法维度" :sub-title="routeKey">
      <template #extra>
        <el-button type="primary" @click="$router.back()">返回</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup name="EnterpriseDimension" lang="ts">
import { UploadFilled } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox, type UploadFile, type UploadRawFile } from 'element-plus';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import {
  addDimensionRecord,
  delDimensionRecord,
  getDimensionRecord,
  listDimensionRecord,
  updateDimensionRecord
} from '@/api/enterprise/dimensionRecord';
import { refreshDimension } from '@/api/enterprise/dimensionSync';
import { useAutoQuery } from '@/hooks/useAutoQuery';
import { DimensionRecordForm, DimensionRecordQuery, DimensionRecordVO } from '@/api/enterprise/dimensionRecord/types';
import { downloadXlsxTemplate } from '@/utils/xlsxTemplate';
import SpreadsheetEditor from '@/components/SpreadsheetEditor/index.vue';
import type { SpreadsheetColumn } from '@/components/SpreadsheetEditor/types';
import { loadDimensionFieldOptions, loadEmissionSourceNameOptions, loadRecordStatusOptions, type SelectOption } from '@/utils/enterpriseFieldOptions';
import { listExtensionFields, listExtensionFieldValues, saveExtensionFieldValuesBatch } from '@/api/enterprise/extensionField';
import type { ExtensionFieldVO, ExtensionFieldValueForm, ExtensionFieldValueVO } from '@/api/enterprise/extensionField/types';

type FieldProp = keyof DimensionRecordForm;

interface FieldConfig {
  prop: FieldProp;
  label: string;
  formLabel?: string;
  type?: 'text' | 'number' | 'date';
  optionSource?: 'dimension-field' | 'emission-source-name';
  fillProps?: FieldProp[];
  width?: number;
  hidden?: boolean;
  formHidden?: boolean;
  required?: boolean;
  allowCreate?: boolean;
  filterable?: boolean;
  placeholder?: string;
  parentProp?: FieldProp;
  clearsOnChange?: FieldProp[];
}

type CompanyIndustryFieldPair = {
  code: FieldProp;
  name: FieldProp;
};

interface PageConfig {
  title: string;
  stage: string;
  owner: string;
  mode: string;
  codeLabel: string;
  nameLabel: string;
  parentLabel?: string;
  parentPlaceholder?: string;
  showParent?: boolean;
  parentRequired?: boolean;
  showStatus?: boolean;
  showSort?: boolean;
  showRemark?: boolean;
  nameField?: FieldConfig;
  fields: FieldConfig[];
}

interface ZipEntry {
  path: string;
  method: number;
  compressed: Uint8Array;
}

const route = useRoute();
const router = useRouter();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const statusOptions = ref<SelectOption[]>([]);
const dynamicFieldOptions = reactive<Record<string, SelectOption[]>>({});
const companyIndustryFieldPairs: CompanyIndustryFieldPair[] = [
  { code: 'industrySectionCode', name: 'industrySectionName' },
  { code: 'industryDivisionCode', name: 'industryDivisionName' },
  { code: 'industryGroupCode', name: 'industryGroupName' },
  { code: 'industryClassCode', name: 'industryClassName' }
];
const companyDerivedNameFields = new Set<FieldProp>([
  'provinceName',
  ...companyIndustryFieldPairs.map((item) => item.name)
]);
const dimensionPages: Record<string, PageConfig> = {
  'admin-division': {
    title: '行政区划',
    stage: '配置排放源',
    owner: '链接厂商',
    mode: '同步后可维护',
    codeLabel: '行政区划代码',
    nameLabel: '行政区划名称',
    showParent: true,
    fields: [
      { prop: 'divisionCode', label: '区划代码' },
      { prop: 'divisionName', label: '区划名称' },
      { prop: 'levelType', label: '区划层级' }
    ]
  },
  company: {
    title: '公司表',
    stage: '配置排放源',
    owner: '企业',
    mode: '企业维护',
    codeLabel: '公司编号',
    nameLabel: '公司',
    showParent: true,
    parentRequired: true,
    parentLabel: '工厂编号',
    parentPlaceholder: '请选择或输入工厂编号',
    fields: [
      { prop: 'companySk', label: 'SK_公司', hidden: true },
      { prop: 'factoryName', label: '工厂', placeholder: '请输入工厂名称', required: true },
      { prop: 'provinceCode', label: '省份编码', formLabel: '所在省份', optionSource: 'dimension-field', fillProps: ['provinceCode', 'provinceName'], placeholder: '请选择所在省份' },
      { prop: 'provinceName', label: '所在省份', optionSource: 'dimension-field', formHidden: true },
      { prop: 'factoryType', label: '工厂类型', optionSource: 'dimension-field', allowCreate: true, placeholder: '请选择或输入工厂类型' },
      { prop: 'industrySectionCode', label: '行业门类代码', formLabel: '行业门类', optionSource: 'dimension-field', fillProps: ['industrySectionCode', 'industrySectionName'], clearsOnChange: ['industryDivisionCode', 'industryDivisionName', 'industryGroupCode', 'industryGroupName', 'industryClassCode', 'industryClassName'], placeholder: '请选择行业门类' },
      { prop: 'industrySectionName', label: '行业门类名称', optionSource: 'dimension-field', formHidden: true },
      { prop: 'industryDivisionCode', label: '行业大类代码', formLabel: '行业大类', optionSource: 'dimension-field', fillProps: ['industryDivisionCode', 'industryDivisionName'], parentProp: 'industrySectionCode', clearsOnChange: ['industryGroupCode', 'industryGroupName', 'industryClassCode', 'industryClassName'], placeholder: '请选择行业大类' },
      { prop: 'industryDivisionName', label: '行业大类名称', optionSource: 'dimension-field', formHidden: true },
      { prop: 'industryGroupCode', label: '行业中类代码', formLabel: '行业中类', optionSource: 'dimension-field', fillProps: ['industryGroupCode', 'industryGroupName'], parentProp: 'industryDivisionCode', clearsOnChange: ['industryClassCode', 'industryClassName'], placeholder: '请选择行业中类' },
      { prop: 'industryGroupName', label: '行业中类名称', optionSource: 'dimension-field', formHidden: true },
      { prop: 'industryClassCode', label: '行业小类代码', formLabel: '行业小类', optionSource: 'dimension-field', fillProps: ['industryClassCode', 'industryClassName'], parentProp: 'industryGroupCode', placeholder: '请选择行业小类' },
      { prop: 'industryClassName', label: '行业小类名称', optionSource: 'dimension-field', formHidden: true },
      { prop: 'effectiveDate', label: '生效日期', type: 'date' },
      { prop: 'expiryDate', label: '失效日期', type: 'date' }
    ]
  },
  'emission-source-category': {
    title: '排放源分类',
    stage: '配置排放源',
    owner: '链接厂商',
    mode: '同步后确认',
    codeLabel: '分类编码',
    nameLabel: '分类名称',
    showParent: true,
    fields: [
      { prop: 'categorySk', label: 'SK_排放源分类' },
      { prop: 'businessKey', label: '业务编码' },
      { prop: 'categoryNameEn', label: '分类英文名' },
      { prop: 'ghgScope', label: 'GHG Protocol范围', optionSource: 'dimension-field' },
      { prop: 'ghgScopeCategorySort', label: 'GHG范围分类排序', type: 'number' },
      { prop: 'ghgScopeCategory', label: 'GHG Protocol范围子类别' },
      { prop: 'ghgScopeEn', label: 'GHG范围英文' },
      { prop: 'ghgScopeCategoryEn', label: 'GHG范围子类别英文' },
      { prop: 'isoCategory', label: 'ISO 14064-1类别' },
      { prop: 'isoCategoryEn', label: 'ISO类别英文' },
      { prop: 'isoCategoryDescription', label: 'ISO类别描述', width: 220 },
      { prop: 'isoCategoryDescriptionEn', label: 'ISO类别英文描述', width: 240 },
      { prop: 'isoCustomSubcategory', label: 'ISO自定义子分类', width: 180 },
      { prop: 'gbScopeCategory', label: 'GB/T 32150-2025范围分类' },
      { prop: 'gbSubcategory', label: '国标子分类' },
      { prop: 'effectiveDate', label: '生效日期', type: 'date' },
      { prop: 'expiryDate', label: '失效日期', type: 'date' },
      { prop: 'currentFlag', label: '是否当前版本' },
      { prop: 'versionNo', label: '版本号' },
      { prop: 'unifiedStandardCategory', label: '统一标准分类' }
    ]
  },
  'base-year': {
    title: '基准年维度表',
    stage: '配置排放源',
    owner: '企业',
    mode: '企业确认',
    codeLabel: '工厂编号',
    nameLabel: '工厂名称',
    fields: [
      { prop: 'baseYearKey', label: '基准年业务键' },
      { prop: 'description', label: '说明', width: 220 },
      { prop: 'baseYear', label: '基准年', optionSource: 'dimension-field', fillProps: ['baseYearKey', 'description', 'baseYear', 'isCurrent', 'currentBaseFlag'], allowCreate: true, required: true },
      { prop: 'isCurrent', label: '厂商当前标识', optionSource: 'dimension-field', fillProps: ['isCurrent', 'currentBaseFlag'], allowCreate: true },
      { prop: 'currentBaseFlag', label: '是否当前基准', optionSource: 'dimension-field', allowCreate: true }
    ]
  },
  'ef-factor': {
    title: 'EF排放因子维度表',
    stage: '确认排放因子',
    owner: '企业',
    mode: '确认引用',
    codeLabel: 'SK_排放因子',
    nameLabel: '排放源名称',
    nameField: {
      prop: 'recordName',
      label: '排放源名称',
      optionSource: 'emission-source-name',
      fillProps: ['recordName', 'sourceUnit'],
      allowCreate: true,
      placeholder: '请选择104排放源或输入新的排放源名称'
    },
    fields: [
      { prop: 'emissionSourceNameEn', label: '排放源英文名', optionSource: 'dimension-field', fillProps: ['emissionSourceNameEn', 'fuelMaterialCategory', 'sourceUnit', 'applicableScope', 'factorSource', 'factorUnit'], allowCreate: true },
      { prop: 'fuelMaterialCategory', label: '燃料/物料类别', optionSource: 'dimension-field', fillProps: ['fuelMaterialCategory', 'sourceUnit', 'applicableScope'], allowCreate: true },
      { prop: 'sourceUnit', label: '源单位', optionSource: 'dimension-field', allowCreate: true },
      { prop: 'co2', label: 'CO2', type: 'number' },
      { prop: 'ch4', label: 'CH4', type: 'number' },
      { prop: 'n2o', label: 'N2O', type: 'number' },
      { prop: 'hfcs', label: 'HFCs', type: 'number' },
      { prop: 'pfcs', label: 'PFCs', type: 'number' },
      { prop: 'sf6', label: 'SF6', type: 'number' },
      { prop: 'nf3', label: 'NF3', type: 'number' },
      { prop: 'applicableScope', label: '适用范围', optionSource: 'dimension-field', allowCreate: true },
      { prop: 'factorSource', label: '因子来源', optionSource: 'dimension-field', allowCreate: true },
      { prop: 'gwpCh4', label: 'GWP_CH4', type: 'number' },
      { prop: 'gwpN2o', label: 'GWP_N2O', type: 'number' },
      { prop: 'gwpHfcs', label: 'GWP_HFCs', type: 'number' },
      { prop: 'gwpPfcs', label: 'GWP_PFCs', type: 'number' },
      { prop: 'gwpSf6', label: 'GWP_SF6', type: 'number' },
      { prop: 'gwpNf3', label: 'GWP_NF3', type: 'number' },
      { prop: 'factorGwp', label: '因子GWP', type: 'number' },
      { prop: 'factorUnit', label: '因子单位', optionSource: 'dimension-field', allowCreate: true }
    ]
  },
  'ef-electricity-factor': {
    title: 'EF电力因子维度表',
    stage: '确认排放因子',
    owner: '链接厂商',
    mode: '同步后确认',
    codeLabel: '电力因子编码',
    nameLabel: '电力因子名称',
    fields: [
      { prop: 'factorVersion', label: '因子版本' },
      { prop: 'divisionCode', label: '行政区划代码' },
      { prop: 'divisionName', label: '行政区划名称' },
      { prop: 'regionName', label: '区域名称' },
      { prop: 'provinceFactor', label: '省级因子（kgCO2/kWh）', type: 'number', precision: 10 },
      { prop: 'regionFactor', label: '区域因子（kgCO2/kWh）', type: 'number', precision: 10 },
      { prop: 'nationalFactor', label: '全国因子（kgCO2/kWh）', type: 'number', precision: 10 },
      { prop: 'nonFossilExcludedFactor', label: '不含市场化非化石因子', type: 'number', precision: 10 },
      { prop: 'nationalFossilPowerFactor', label: '全国化石能源电力因子', type: 'number', precision: 10 }
    ]
  },
  'ef-electricity-version': {
    title: 'EF电力因子版本对应',
    stage: '确认排放因子',
    owner: '企业',
    mode: '企业确认',
    codeLabel: '因子版本',
    nameLabel: '版本说明',
    fields: [
      { prop: 'factorVersion', label: '因子版本' },
      { prop: 'effectiveYear', label: '生效年份', type: 'number', required: true }
    ]
  },
  'ef-electricity-scope': {
    title: 'EF电力因子口径维度',
    stage: '确认排放因子',
    owner: '链接厂商',
    mode: '同步后确认',
    codeLabel: '口径编码',
    nameLabel: '口径名称',
    fields: [
      { prop: 'scopeKey', label: '口径类型', optionSource: 'dimension-field' },
      { prop: 'scopeName', label: '适用说明', width: 220 }
    ]
  },
  'greenhouse-gas': {
    title: '温室气体维度',
    stage: '确认排放因子',
    owner: '链接厂商',
    mode: '同步后确认',
    codeLabel: '气体编码',
    nameLabel: '气体名称',
    fields: [
      { prop: 'gasNameEn', label: '气体英文名' },
      { prop: 'gwpValue', label: 'GWP值', type: 'number' },
      { prop: 'gwpVersion', label: 'GWP版本' },
      { prop: 'chemicalFormula', label: '化学式' }
    ]
  },
  'intensity-denominator': {
    title: '碳排放强度分母维度表',
    stage: '强度管理',
    owner: '企业',
    mode: '企业维护',
    codeLabel: '分母规则Key',
    nameLabel: '工厂类型',
    showStatus: false,
    showSort: false,
    showRemark: false,
    fields: [
      { prop: 'denominatorType', label: '分母类型', required: true },
      { prop: 'denominatorMetricName', label: '分母度量名称', required: true },
      { prop: 'intensityUnitDisplay', label: '强度单位展示', required: true },
      { prop: 'enabledText', label: '是否启用', optionSource: 'dimension-field', required: true }
    ]
  },
  'intensity-target': {
    title: '强度目标表',
    stage: '强度管理',
    owner: '企业',
    mode: '企业维护',
    codeLabel: '工厂类型',
    nameLabel: '年份',
    showStatus: false,
    showSort: false,
    showRemark: false,
    fields: [
      { prop: 'targetValue', label: '强度目标值', type: 'number', required: true },
      { prop: 'unitName', label: '单位', required: true }
    ]
  },
  'denominator-fact': {
    title: '分母事实表',
    stage: '强度管理',
    owner: '企业',
    mode: '企业填报',
    codeLabel: '工厂编号',
    nameLabel: '工厂名称',
    showStatus: false,
    showSort: false,
    showRemark: false,
    fields: [
      { prop: 'factoryType', label: '工厂类型' },
      { prop: 'factYear', label: '年份', type: 'number', required: true },
      { prop: 'factMonth', label: '月份', type: 'number' },
      { prop: 'denominatorType', label: '分母类型', required: true },
      { prop: 'denominatorMetricName', label: '分母度量名称', required: true },
      { prop: 'denominatorValue', label: '分母值', type: 'number', required: true },
      { prop: 'unitName', label: '单位' },
      { prop: 'dataSource', label: '数据来源', optionSource: 'dimension-field' }
    ]
  },
  'intensity-tolerance': {
    title: '碳排放强度容忍率参数表',
    stage: '强度管理',
    owner: '企业',
    mode: '企业维护',
    codeLabel: '容忍率Key',
    nameLabel: '行业门类',
    showStatus: false,
    showSort: false,
    showRemark: false,
    fields: [
      { prop: 'toleranceRate', label: '容忍率', type: 'number', required: true },
      { prop: 'enabledText', label: '是否启用', optionSource: 'dimension-field' }
    ]
  }
};

const concreteTableRoutes: Record<string, string> = {
  'emission-source': '/emission-source-config/emission-source',
  'emission-activity-data': '/activity-data/emission-activity-data',
  'green-electricity-data': '/green-electricity/green-electricity-data'
};

const vendorOnlyDimensionCodes = new Set([
  'admin-division',
  'emission-source-category',
  'ef-electricity-factor',
  'ef-electricity-scope',
  'greenhouse-gas'
]);

const editableDimensionCodes = new Set([
  'company',
  'base-year',
  'ef-factor',
  'ef-electricity-version',
  'intensity-denominator',
  'intensity-target',
  'denominator-fact',
  'intensity-tolerance'
]);

const dimensionExtensionOwnerTables: Record<string, string> = {
  company: 'ce_company_factory',
  'base-year': 'ce_base_year',
  'ef-factor': 'ce_ef_factor',
  'ef-electricity-version': 'ce_electricity_factor_version_map',
  'intensity-denominator': 'ce_intensity_denominator_rule',
  'intensity-target': 'ce_intensity_target',
  'denominator-fact': 'ce_intensity_denominator_fact',
  'intensity-tolerance': 'ce_intensity_tolerance'
};

const enabledFlagOptions: SelectOption[] = [
  { label: '启用', value: '1' },
  { label: '停用', value: '0' }
];

const routeKey = computed(() => {
  const queryCode = typeof route.query.code === 'string' ? route.query.code : '';
  const pathParts = route.path.split('/').filter(Boolean);
  const leafPath = pathParts[pathParts.length - 1] ?? '';
  return queryCode || leafPath;
});
const concreteTableRoute = computed(() => concreteTableRoutes[routeKey.value]);
const page = computed(() => dimensionPages[routeKey.value]);
const dimensionExtensionOwnerTable = computed(() => dimensionExtensionOwnerTables[routeKey.value]);
const visibleFields = computed(() => page.value?.fields.filter((field) => !field.hidden) ?? []);
const isCompanyDerivedNameField = (field: FieldConfig) => routeKey.value === 'company' && companyDerivedNameFields.has(field.prop);
const visibleFormFields = computed(() => visibleFields.value.filter((field) => !field.formHidden && !isCompanyDerivedNameField(field)));
const sheetFields = computed(() => visibleFields.value);
const parentCodeOptions = computed(() => {
  const records = recordList.value ?? [];
  if (routeKey.value === 'company') {
    const uniqueFactories = new Map<string, SelectOption>();
    records.forEach((record: any) => {
      const factoryCode = String(record.parentCode ?? '').trim();
      if (!factoryCode || uniqueFactories.has(factoryCode)) return;
      uniqueFactories.set(factoryCode, {
        label: [factoryCode, record.factoryName].filter(Boolean).join(' / '),
        value: factoryCode,
        record
      });
    });
    return Array.from(uniqueFactories.values());
  }
  return records
    .filter((r: any) => r.recordCode)
    .map((r: any) => ({
      label: [r.recordCode, r.recordName].filter(Boolean).join(' / '),
      value: r.recordCode,
      record: r
    }));
});
const isVendorOnly = computed(() => vendorOnlyDimensionCodes.has(routeKey.value));
const isEditable = computed(() => editableDimensionCodes.has(routeKey.value));
const isVendorLinked = computed(() =>
  [
    'admin-division',
    'emission-source-category',
    'ef-electricity-factor',
    'ef-electricity-version',
    'ef-electricity-scope',
    'greenhouse-gas',
    'base-year'
  ].includes(routeKey.value)
);
const syncLoading = ref(false);
const readOnlyMessage = '旧维度表已拆分为具体业务表，请到对应页面维护。';
const sheetColumns = computed<SpreadsheetColumn[]>(() => {
  if (!page.value) return [];
  const columns: SpreadsheetColumn[] = [
    { prop: 'recordCode', label: page.value.codeLabel, required: true, width: 170 },
    {
      prop: 'recordName',
      label: page.value.nameLabel,
      type: page.value.nameField?.optionSource ? 'select' : 'text',
      getOptions: page.value.nameField ? (row) => fieldOptions(page.value.nameField!, row) : undefined,
      clearsOnChange: page.value.nameField?.clearsOnChange,
      fillProps: page.value.nameField?.fillProps,
      required: true,
      width: 190
    }
  ];
  if (page.value.showParent) {
    columns.push({ prop: 'parentCode', label: page.value.parentLabel ?? '上级编码', required: page.value.parentRequired, width: 150 });
  }
  sheetFields.value.forEach((field) => {
    columns.push({
      prop: field.prop,
      label: field.formLabel ?? field.label,
      type: field.optionSource ? 'select' : field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text',
      getOptions: field.optionSource && !field.formHidden ? (row) => fieldOptions(field, row) : undefined,
      clearsOnChange: field.clearsOnChange,
      fillProps: field.fillProps,
      required: field.required,
      readonly: field.formHidden,
      width: field.width ?? 150,
      precision: field.type === 'number' ? 2 : undefined
    });
  });
  if (page.value.showStatus !== false) {
    columns.push({
      prop: 'status',
      label: '状态',
      type: 'select',
      required: true,
      width: 120,
      options: statusOptions.value
    });
  }
  if (page.value.showSort !== false) {
    columns.push({ prop: 'sortOrder', label: '排序', type: 'number', width: 110, min: 0, precision: 0 });
  }
  if (page.value.showRemark !== false) {
    columns.push({ prop: 'remark', label: '备注', width: 220 });
  }
  return columns;
});

const recordList = ref<DimensionRecordVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(false);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const multiple = ref(true);
const total = ref(0);
const dimensionFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});
const sheetDrawer = reactive({
  visible: false
});
const uploadDialog = reactive({
  visible: false
});
const sheetSaving = ref(false);
const uploadParsing = ref(false);
const dimensionExtensionFields = ref<ExtensionFieldVO[]>([]);
const extensionValueRows = ref<Record<string, ExtensionFieldValueVO>>({});
const extensionValues = reactive<Record<string, any>>({});
const extensionSaving = ref(false);
const extensionOwnerId = ref<string | number>();
const extensionDialog = reactive({
  visible: false,
  title: ''
});

const sheetEmptyRow = computed(() => ({
  dimensionCode: routeKey.value,
  recordCode: undefined,
  recordName: undefined,
  parentCode: undefined,
  status: '0',
  sortOrder: 0,
  remark: undefined
}));
const sheetRows = computed(() => [{ ...sheetEmptyRow.value }]);

const initFormData: DimensionRecordForm = {
  id: undefined,
  dimensionCode: undefined,
  recordCode: undefined,
  recordName: undefined,
  parentCode: undefined,
  sortOrder: 0,
  status: '0',
  remark: undefined
};

const data = reactive<PageData<DimensionRecordForm, DimensionRecordQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    dimensionCode: routeKey.value,
    recordCode: undefined,
    recordName: undefined,
    parentCode: undefined,
    status: undefined
  },
  rules: {
    recordCode: [{ required: true, message: '编码不能为空', trigger: 'blur' }],
    recordName: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
    parentCode: [{ required: true, message: '工厂编号不能为空', trigger: 'change' }],
    factoryName: [{ required: true, message: '工厂名称不能为空', trigger: 'blur' }],
    baseYear: [{ required: true, message: '基准年不能为空', trigger: 'blur' }],
    effectiveYear: [{ required: true, message: '生效年份不能为空', trigger: 'blur' }],
    denominatorType: [{ required: true, message: '分母类型不能为空', trigger: 'blur' }],
    denominatorMetricName: [{ required: true, message: '分母度量名称不能为空', trigger: 'blur' }],
    intensityUnitDisplay: [{ required: true, message: '强度单位展示不能为空', trigger: 'blur' }],
    enabledText: [{ required: true, message: '请选择是否启用', trigger: 'change' }],
    targetValue: [{ required: true, message: '强度目标值不能为空', trigger: 'blur' }],
    unitName: [{ required: true, message: '单位不能为空', trigger: 'blur' }],
    factYear: [{ required: true, message: '年份不能为空', trigger: 'blur' }],
    denominatorValue: [{ required: true, message: '分母值不能为空', trigger: 'blur' }],
    toleranceRate: [{ required: true, message: '容忍率不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

const statusLabel = (value?: string) => statusOptions.value.find((item) => item.value === value)?.label ?? value ?? '-';

const formatDisplayValue = (value: unknown, field?: FieldConfig) => {
  if (value === undefined || value === null || value === '') {
    return '-';
  }
  if (field?.prop === 'enabledText') {
    return enabledFlagOptions.find((option) => String(option.value) === String(value))?.label ?? String(value);
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(Number(value.toFixed(10))) : value;
  }
  if (typeof value !== 'string') {
    return value;
  }
  const text = value.trim();
  if (!/^-?\d+(\.\d+)?$/.test(text) || !text.includes('.')) {
    return value;
  }
  return text.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '');
};

const fieldOptionKey = (dimensionCode: string, field: FieldConfig) => `${dimensionCode}:${field.prop}`;
const optionRecord = (option?: SelectOption) => option?.record?.record ?? option?.record;
const optionValueEquals = (left: unknown, right: unknown) => String(left ?? '') === String(right ?? '');
const fieldOptions = (field: FieldConfig, row: Record<string, any> = form.value) => {
  if (field.prop === 'enabledText') {
    return enabledFlagOptions;
  }
  const options = page.value ? (dynamicFieldOptions[fieldOptionKey(routeKey.value, field)] ?? []) : [];
  if (routeKey.value !== 'company' || !field.parentProp) {
    return options;
  }
  const parentValue = row[field.parentProp];
  if (parentValue === undefined || parentValue === null || parentValue === '') {
    return [];
  }
  return options.filter((option) => optionValueEquals(optionRecord(option)?.[field.parentProp as string], parentValue));
};
const extensionFieldKey = (field: ExtensionFieldVO) => String(field.id);
const formValueFromRecord = (record: Record<string, any> | undefined, prop: FieldProp) => record?.[prop];
const assignFormValueFromRecord = (record: Record<string, any> | undefined, prop: FieldProp) => {
  const value = formValueFromRecord(record, prop);
  if (value !== undefined && value !== null && value !== '') {
    form.value[prop] = value;
  }
};
const clearFormFields = (props?: FieldProp[]) => {
  props?.forEach((prop) => {
    form.value[prop] = undefined;
  });
};

const handleParentCodeChange = (value: unknown) => {
  if (routeKey.value !== 'company') return;
  const selected = parentCodeOptions.value.find((option) => optionValueEquals(option.value, value));
  assignFormValueFromRecord(optionRecord(selected), 'factoryName');
};

const handleFieldSelect = (field: FieldConfig, value: unknown) => {
  clearFormFields(field.clearsOnChange);
  const selected = fieldOptions(field, form.value).find((option) => optionValueEquals(option.value, value));
  const record = optionRecord(selected);
  if (!record) return;
  if (field.fillProps?.length) {
    field.fillProps.forEach((prop) => assignFormValueFromRecord(record, prop));
  }
  if (routeKey.value === 'company') {
    const pair = companyIndustryFieldPairs.find((item) => item.code === field.prop || item.name === field.prop);
    if (pair) {
      assignFormValueFromRecord(record, pair.code);
      assignFormValueFromRecord(record, pair.name);
    }
    if (field.prop === 'provinceCode' || field.prop === 'provinceName') {
      assignFormValueFromRecord(record, 'provinceCode');
      assignFormValueFromRecord(record, 'provinceName');
    }
  }
};

const fieldByProp = (prop: FieldProp) => page.value?.fields.find((field) => field.prop === prop);

const fillRowValueFromOption = (row: Record<string, any>, field: FieldConfig, prop: FieldProp) => {
  const value = row[field.prop];
  const selected = fieldOptions(field, row).find((option) => optionValueEquals(option.value, value));
  const record = optionRecord(selected);
  const recordValue = formValueFromRecord(record, prop);
  if (recordValue !== undefined && recordValue !== null && recordValue !== '') {
    row[prop] = recordValue;
  }
};

const hydrateCompanyDerivedFields = (row: Record<string, any>) => {
  if (routeKey.value !== 'company') return row;
  const provinceField = fieldByProp('provinceCode');
  if (provinceField) {
    fillRowValueFromOption(row, provinceField, 'provinceName');
  }
  companyIndustryFieldPairs.forEach((pair) => {
    const codeField = fieldByProp(pair.code);
    if (codeField) {
      fillRowValueFromOption(row, codeField, pair.name);
    }
  });
  return row;
};

const loadPageFieldOptions = async () => {
  statusOptions.value = await loadRecordStatusOptions();
  const currentPage = page.value;
  if (!currentPage) {
    return;
  }
  const fields = [
    ...(currentPage.nameField ? [currentPage.nameField] : []),
    ...currentPage.fields
  ].filter((field) => field.optionSource && field.prop !== 'enabledText' && !isCompanyDerivedNameField(field));
  await Promise.all(
    fields.map(async (field) => {
      dynamicFieldOptions[fieldOptionKey(routeKey.value, field)] =
        field.optionSource === 'emission-source-name'
          ? await loadEmissionSourceNameOptions()
          : await loadDimensionFieldOptions(routeKey.value, field.prop);
    })
  );
};

const resetExtensionValues = () => {
  Object.keys(extensionValues).forEach((key) => delete extensionValues[key]);
  extensionValueRows.value = {};
  extensionOwnerId.value = undefined;
};

const extensionValueProp = (field: ExtensionFieldVO): keyof ExtensionFieldValueForm => {
  const valueType = String(field.valueType ?? 'text').toLowerCase();
  if (['number', 'decimal', 'numeric', 'integer'].includes(valueType)) {
    return 'decimalValue';
  }
  if (valueType === 'date') {
    return 'dateValue';
  }
  if (['boolean', 'bool'].includes(valueType)) {
    return 'booleanValue';
  }
  return 'textValue';
};

const extensionControlComponent = (field: ExtensionFieldVO) => {
  const prop = extensionValueProp(field);
  if (prop === 'decimalValue') return 'el-input-number';
  if (prop === 'dateValue') return 'el-date-picker';
  if (prop === 'booleanValue') return 'el-switch';
  return 'el-input';
};

const extensionControlProps = (field: ExtensionFieldVO) => {
  const label = field.fieldName || field.fieldCode || '扩展字段';
  if (String(field.valueType ?? '').toLowerCase() === 'textarea') {
    return { placeholder: `请输入${label}`, type: 'textarea', rows: 3, maxlength: 500, showWordLimit: true };
  }
  const prop = extensionValueProp(field);
  if (prop === 'decimalValue') {
    return { placeholder: `请输入${label}`, min: 0, precision: 4, controlsPosition: 'right', class: 'w-full' };
  }
  if (prop === 'dateValue') {
    return { placeholder: `请选择${label}`, type: 'date', valueFormat: 'YYYY-MM-DD', class: 'w-full' };
  }
  if (prop === 'booleanValue') {
    return { activeValue: true, inactiveValue: false };
  }
  return { placeholder: `请输入${label}`, clearable: true };
};

const normalizeExtensionValue = (field: ExtensionFieldVO, value: unknown) => {
  const prop = extensionValueProp(field);
  if (value === undefined || value === null || value === '') {
    return null;
  }
  if (prop === 'decimalValue') {
    return Number(value);
  }
  if (prop === 'booleanValue') {
    return Boolean(value);
  }
  return value as string;
};

const hasExtensionValue = (field: ExtensionFieldVO, value: unknown, existing?: ExtensionFieldValueVO) => {
  if (existing?.id) return true;
  if (extensionValueProp(field) === 'booleanValue') return value === true;
  return value !== undefined && value !== null && value !== '';
};

const loadDimensionExtensionFields = async () => {
  if (!dimensionExtensionOwnerTable.value || !isEditable.value) {
    dimensionExtensionFields.value = [];
    return;
  }
  const res = await listExtensionFields({
    moduleCode: routeKey.value,
    enabledFlag: true,
    pageNum: 1,
    pageSize: 200
  });
  dimensionExtensionFields.value = (res.rows ?? res.data ?? []).filter((field) => field.enabledFlag !== false && field.id != null);
};

const loadExtensionValues = async (ownerId?: string | number) => {
  resetExtensionValues();
  if (!dimensionExtensionOwnerTable.value || !ownerId) return;
  extensionOwnerId.value = ownerId;
  const res = await listExtensionFieldValues({
    ownerTableCode: dimensionExtensionOwnerTable.value,
    ownerRecordId: ownerId,
    pageNum: 1,
    pageSize: 200
  });
  const rows = res.rows ?? res.data ?? [];
  extensionValueRows.value = rows.reduce<Record<string, ExtensionFieldValueVO>>((acc, item) => {
    if (item.extensionFieldId != null) acc[String(item.extensionFieldId)] = item;
    return acc;
  }, {});
  for (const field of dimensionExtensionFields.value) {
    const key = extensionFieldKey(field);
    const row = extensionValueRows.value[key];
    if (row) extensionValues[key] = row[extensionValueProp(field)];
  }
};

const buildExtensionPayload = (field: ExtensionFieldVO, ownerId: string | number, existing?: ExtensionFieldValueVO): ExtensionFieldValueForm => {
  const prop = extensionValueProp(field);
  return {
    id: existing?.id,
    ownerTableCode: dimensionExtensionOwnerTable.value,
    ownerRecordId: ownerId,
    extensionFieldId: field.id,
    textValue: null,
    decimalValue: null,
    dateValue: null,
    booleanValue: null,
    [prop]: normalizeExtensionValue(field, extensionValues[extensionFieldKey(field)])
  };
};

const saveExtensionValues = async (ownerId?: string | number) => {
  if (!dimensionExtensionOwnerTable.value || !ownerId) return;
  const payloads = dimensionExtensionFields.value
    .map((field) => {
      const key = extensionFieldKey(field);
      const existing = extensionValueRows.value[key];
      if (!hasExtensionValue(field, extensionValues[key], existing)) return undefined;
      return buildExtensionPayload(field, ownerId, existing);
    })
    .filter((payload): payload is ExtensionFieldValueForm => Boolean(payload));
  if (payloads.length > 0) {
    await saveExtensionFieldValuesBatch(payloads);
  }
};

const textDecoder = new TextDecoder('utf-8');

const readUint16 = (bytes: Uint8Array, offset: number) => bytes[offset] | (bytes[offset + 1] << 8);
const readUint32 = (bytes: Uint8Array, offset: number) =>
  bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24);

const inflateRaw = async (bytes: Uint8Array) => {
  const streamCtor = (globalThis as typeof globalThis & { DecompressionStream?: new (format: string) => DecompressionStream }).DecompressionStream;
  if (!streamCtor) {
    throw new Error('当前浏览器不支持解析压缩 Excel，请使用系统模板直接上传');
  }
  const stream = new Blob([bytes]).stream().pipeThrough(new streamCtor('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
};

const readZipEntries = async (file: Blob) => {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const entries: ZipEntry[] = [];
  let offset = 0;
  while (offset + 30 < bytes.length) {
    if (readUint32(bytes, offset) !== 0x04034b50) break;
    const flags = readUint16(bytes, offset + 6);
    const method = readUint16(bytes, offset + 8);
    const compressedSize = readUint32(bytes, offset + 18);
    const nameLength = readUint16(bytes, offset + 26);
    const extraLength = readUint16(bytes, offset + 28);
    if (flags & 0x08) {
      throw new Error('暂不支持带数据描述符的 Excel 文件，请使用下载模板填写后上传');
    }
    const nameStart = offset + 30;
    const dataStart = nameStart + nameLength + extraLength;
    const path = textDecoder.decode(bytes.slice(nameStart, nameStart + nameLength));
    entries.push({
      path,
      method,
      compressed: bytes.slice(dataStart, dataStart + compressedSize)
    });
    offset = dataStart + compressedSize;
  }
  return entries;
};

const unzipTextEntry = async (entries: ZipEntry[], path: string) => {
  const entry = entries.find((item) => item.path === path);
  if (!entry) return '';
  if (entry.method === 0) {
    return textDecoder.decode(entry.compressed);
  }
  if (entry.method === 8) {
    return textDecoder.decode(await inflateRaw(entry.compressed));
  }
  throw new Error('暂不支持该 Excel 压缩格式');
};

const parseXml = (xml: string) => new DOMParser().parseFromString(xml, 'application/xml');

const columnIndexFromRef = (ref: string) => {
  const letters = ref.replace(/[^A-Z]/gi, '').toUpperCase();
  return letters.split('').reduce((acc, letter) => acc * 26 + letter.charCodeAt(0) - 64, 0) - 1;
};

const excelSerialDateToText = (serial: number) => {
  const utc = Date.UTC(1899, 11, 30) + serial * 86400000;
  return new Date(utc).toISOString().slice(0, 10);
};

const normalizeUploadValue = (column: SpreadsheetColumn, value: string) => {
  const text = value.trim();
  if (!text) return undefined;
  if (column.prop === 'status') {
    return statusOptions.value.find((option) => option.label === text || option.value === text)?.value ?? text;
  }
  if (column.type === 'number') {
    const numberValue = Number(text);
    return Number.isNaN(numberValue) ? text : numberValue;
  }
  if (column.type === 'date') {
    const serial = Number(text);
    return Number.isFinite(serial) && serial > 20000 ? excelSerialDateToText(serial) : text;
  }
  return text;
};

const parseXlsxRows = async (file: Blob) => {
  const entries = await readZipEntries(file);
  const sharedStringsXml = await unzipTextEntry(entries, 'xl/sharedStrings.xml');
  const sharedStrings = sharedStringsXml
    ? Array.from(parseXml(sharedStringsXml).getElementsByTagName('si')).map((item) =>
        Array.from(item.getElementsByTagName('t'))
          .map((node) => node.textContent ?? '')
          .join('')
      )
    : [];
  const worksheetPath = entries.find((entry) => /^xl\/worksheets\/sheet\d+\.xml$/.test(entry.path))?.path;
  if (!worksheetPath) {
    throw new Error('未找到 Excel 工作表');
  }
  const worksheetXml = await unzipTextEntry(entries, worksheetPath);
  const rows = Array.from(parseXml(worksheetXml).getElementsByTagName('row')).map((row) => {
    const values: string[] = [];
    Array.from(row.getElementsByTagName('c')).forEach((cell) => {
      const ref = cell.getAttribute('r') ?? '';
      const type = cell.getAttribute('t');
      const index = columnIndexFromRef(ref);
      const rawValue =
        type === 'inlineStr'
          ? Array.from(cell.getElementsByTagName('t'))
              .map((node) => node.textContent ?? '')
              .join('')
          : (cell.getElementsByTagName('v')[0]?.textContent ?? '');
      values[index] = type === 's' ? (sharedStrings[Number(rawValue)] ?? '') : rawValue;
    });
    return values;
  });
  const headerRow = rows.find((row) => row.some(Boolean));
  if (!headerRow) return [];
  const columnByLabel = new Map(sheetColumns.value.map((column) => [column.label, column]));
  const uploadColumns = headerRow.map((label) => columnByLabel.get(label?.trim?.() ?? ''));
  const parsedRows = rows
    .slice(rows.indexOf(headerRow) + 1)
    .map((row, rowIndex) => {
      const item: Record<string, any> = {};
      uploadColumns.forEach((column, index) => {
        if (!column) return;
        item[column.prop] = normalizeUploadValue(column, row[index] ?? '');
      });
      if (!item.status) item.status = '0';
      const line = rowIndex + 2;
      if (!item.recordCode || !item.recordName) {
        const hasAnyValue = Object.values(item).some((value) => value !== undefined && value !== '');
        if (hasAnyValue) {
          throw new Error(`第 ${line} 行缺少编码或名称`);
        }
      }
      return item;
    })
    .filter((row) => row.recordCode && row.recordName);
  return parsedRows;
};

const validateDimensionPayloadRows = (rows: Record<string, any>[]) => {
  const currentPage = page.value;
  if (!currentPage) return;
  const requiredFields = [
    { prop: 'recordCode', label: currentPage.codeLabel },
    { prop: 'recordName', label: currentPage.nameLabel },
    ...(currentPage.showParent && currentPage.parentRequired ? [{ prop: 'parentCode', label: currentPage.parentLabel ?? '上级编码' }] : []),
    ...sheetFields.value.filter((field) => field.required)
  ];
  rows.forEach((row, rowIndex) => {
    const missing = requiredFields.find((field) => row[field.prop] === undefined || row[field.prop] === null || row[field.prop] === '');
    if (missing) {
      throw new Error(`第 ${rowIndex + 1} 行${missing.label}不能为空`);
    }
  });
};

const getList = async () => {
  if (concreteTableRoute.value || !page.value) {
    recordList.value = [];
    total.value = 0;
    return;
  }
  loading.value = true;
  try {
    queryParams.value.dimensionCode = routeKey.value;
    const res = await listDimensionRecord(queryParams.value);
    recordList.value = res.rows;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
};

const reset = () => {
  form.value = {
    ...initFormData,
    dimensionCode: routeKey.value,
    enabledText: routeKey.value === 'intensity-denominator' || routeKey.value === 'intensity-tolerance' ? '1' : undefined
  };
  dimensionFormRef.value?.resetFields();
  if (routeKey.value === 'intensity-denominator' || routeKey.value === 'intensity-tolerance') {
    form.value.enabledText = '1';
  }
};

const cancel = () => {
  reset();
  dialog.visible = false;
};

const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

const resetQuery = () => {
  queryParams.value = {
    pageNum: 1,
    pageSize: queryParams.value.pageSize,
    dimensionCode: routeKey.value,
    recordCode: undefined,
    recordName: undefined,
    parentCode: undefined,
    status: undefined
  };
  getList();
};

const handleSelectionChange = (selection: DimensionRecordVO[]) => {
  ids.value = selection.map((item) => item.id);
  multiple.value = !selection.length;
};

const handleAdd = () => {
  if (!isEditable.value) return;
  reset();
  dialog.visible = true;
  dialog.title = `新增${page.value?.title ?? ''}`;
};

const openSheetDrawer = () => {
  if (!isEditable.value) return;
  sheetDrawer.visible = true;
};

const openUploadDialog = () => {
  if (!isEditable.value) return;
  uploadDialog.visible = true;
};

const downloadDimensionTemplate = () => {
  if (!isEditable.value || !page.value) return;
  const validations = Object.fromEntries(
    sheetColumns.value
      .filter((column) => column.type === 'select')
      .map((column) => [column.label, (column.options ?? []).map((option) => String(option.value))])
  );
  downloadXlsxTemplate({
    fileName: `${routeKey.value}_dimension_template_${new Date().getTime()}.xlsx`,
    sheetName: page.value.title,
    headers: sheetColumns.value.map((column) => column.label),
    validations
  });
};

const handleUpdate = async (row?: DimensionRecordVO) => {
  if (!isEditable.value) return;
  reset();
  const id = row?.id || ids.value[0];
  const res = await getDimensionRecord(id, routeKey.value);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = `修改${page.value?.title ?? ''}`;
};

const handleDimensionExtensionUpdate = async (row: DimensionRecordVO) => {
  resetExtensionValues();
  await loadExtensionValues(row.id);
  extensionDialog.title = `${page.value?.title ?? ''}扩展字段`;
  extensionDialog.visible = true;
};

const submitExtensionValues = async () => {
  extensionSaving.value = true;
  try {
    await saveExtensionValues(extensionOwnerId.value);
    ElMessage.success('扩展字段已保存');
    extensionDialog.visible = false;
  } finally {
    extensionSaving.value = false;
  }
};

const cancelExtensionDialog = () => {
  extensionDialog.visible = false;
  resetExtensionValues();
};

const submitForm = () => {
  if (!isEditable.value) return;
  dimensionFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    form.value.dimensionCode = routeKey.value;
    try {
      hydrateCompanyDerivedFields(form.value);
      if (form.value.id) {
        await updateDimensionRecord(form.value);
      } else {
        await addDimensionRecord(form.value);
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    } finally {
      buttonLoading.value = false;
    }
  });
};

const persistDimensionRows = async (rows: Record<string, any>[], successMessage: string) => {
  if (!isEditable.value) return;
  validateDimensionPayloadRows(rows);
  sheetSaving.value = true;
  try {
    for (const row of rows) {
      const entryRow = hydrateCompanyDerivedFields({ ...row });
      delete entryRow.id;
      const payload: DimensionRecordForm = {
        ...sheetEmptyRow.value,
        ...entryRow,
        dimensionCode: routeKey.value,
        sortOrder: Number(entryRow.sortOrder ?? 0)
      };
      await addDimensionRecord(payload);
    }
    proxy?.$modal.msgSuccess(successMessage);
    await getList();
  } finally {
    sheetSaving.value = false;
  }
};

const saveSheetRows = async (rows: Record<string, any>[]) => {
  await persistDimensionRows(rows, '在线填报已保存');
  sheetDrawer.visible = false;
};

const parseDimensionUploadFile = async (uploadFile: UploadFile | UploadRawFile) => {
  const file = 'raw' in uploadFile ? uploadFile.raw : uploadFile;
  if (!file) return false;
  if (!isEditable.value) return false;
  if (!file.name.toLowerCase().endsWith('.xlsx')) {
    ElMessage.warning('请选择 .xlsx 文件');
    return false;
  }
  uploadParsing.value = true;
  try {
    const rows = await parseXlsxRows(file);
    if (!rows.length) {
      ElMessage.warning('文件解析完成，但没有可导入的数据行');
      return false;
    }
    await persistDimensionRows(rows, 'Excel 上传已导入');
    uploadDialog.visible = false;
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : 'Excel 文件解析失败');
  } finally {
    uploadParsing.value = false;
  }
  return false;
};

const handleDelete = async (row?: DimensionRecordVO) => {
  if (!isEditable.value) return;
  const targetIds = row?.id || ids.value;
  await proxy?.$modal.confirm(`是否确认删除编号为 "${targetIds}" 的数据项？`);
  await delDimensionRecord(targetIds, routeKey.value);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

watch(
  () => routeKey.value,
  () => {
    if (concreteTableRoute.value) {
      router.replace(concreteTableRoute.value);
      return;
    }
    loadPageFieldOptions();
    loadDimensionExtensionFields();
    resetQuery();
  }
);

const handleRefresh = async () => {
  if (!routeKey.value) return;
  try {
    await ElMessageBox.confirm('确认从厂商端刷新当前维度数据？本地数据将被覆盖。', '刷新确认', { type: 'warning' });
    syncLoading.value = true;
    const res = await refreshDimension(routeKey.value);
    const count = (res as any).data?.recordCount ?? 0;
    ElMessage.success(`刷新成功，同步 ${count} 条记录`);
    await getList();
  } catch (e: any) {
    if (e !== 'cancel') {
      ElMessage.error('刷新失败：' + (e?.message || '未知错误'));
    }
  } finally {
    syncLoading.value = false;
  }
};

onMounted(async () => {
  await loadPageFieldOptions();
  await loadDimensionExtensionFields();
  if (concreteTableRoute.value) {
    router.replace(concreteTableRoute.value);
    return;
  }
  resetQuery();
});

useAutoQuery(queryParams, () => handleQuery());
</script>

<style scoped lang="scss">
.enterprise-dimension-page {
  color: var(--carbon-ink);
}

.w-full {
  width: 100%;
}
</style>
