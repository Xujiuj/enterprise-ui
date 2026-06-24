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
          <el-table-column v-if="page.showParent" label="上级编码" align="center" prop="parentCode" min-width="140" />
          <el-table-column
            v-for="field in page.fields"
            :key="field.prop"
            :label="field.label"
            align="center"
            :prop="field.prop"
            :min-width="field.width ?? 140"
            :show-overflow-tooltip="true"
          />
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
            <el-input v-model="form.recordName" :placeholder="`请输入${page.nameLabel}`" />
          </el-form-item>
          <el-form-item v-if="page.showParent" label="上级编码" prop="parentCode">
            <el-select v-model="form.parentCode" placeholder="请选择上级编码" clearable filterable allow-create class="w-full">
              <el-option v-for="item in parentCodeOptions" :key="String(item.value)" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item v-for="field in page.fields" :key="field.prop" :label="field.label" :prop="field.prop">
            <el-select v-if="field.optionSource" v-model="form[field.prop]" :placeholder="`请选择${field.label}`" clearable class="w-full">
              <el-option v-for="item in fieldOptions(field)" :key="String(item.value)" :label="item.label" :value="item.value" />
            </el-select>
            <el-date-picker
              v-else-if="field.type === 'date'"
              v-model="form[field.prop]"
              value-format="YYYY-MM-DD"
              type="date"
              :placeholder="`请选择${field.label}`"
              class="w-full"
            />
            <el-input v-else-if="field.type === 'number'" v-model="form[field.prop]" type="number" :placeholder="`请输入${field.label}`" />
            <el-input v-else v-model="form[field.prop]" :placeholder="`请输入${field.label}`" />
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

      <el-drawer v-model="sheetDrawer.visible" :title="`${page.title}在线填报`" size="92%" append-to-body destroy-on-close>
        <SpreadsheetEditor
          :title="page.title"
          :columns="sheetColumns"
          :rows="sheetRows"
          :empty-row="sheetEmptyRow"
          :saving="sheetSaving"
          hint="支持从 Excel 复制多行粘贴。编码、名称和状态必填；带下拉的维度字段必须选择已有选项。"
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
import { loadDimensionFieldOptions, loadRecordStatusOptions, type SelectOption } from '@/utils/enterpriseFieldOptions';

type FieldProp =
  | 'field01'
  | 'field02'
  | 'field03'
  | 'field04'
  | 'field05'
  | 'field06'
  | 'field07'
  | 'field08'
  | 'field09'
  | 'field10'
  | 'field11'
  | 'field12'
  | 'field13'
  | 'field14'
  | 'field15'
  | 'field16'
  | 'field17'
  | 'field18'
  | 'field19'
  | 'field20'
  | 'field21'
  | 'field22';

interface FieldConfig {
  prop: FieldProp;
  label: string;
  type?: 'text' | 'number' | 'date';
  optionSource?: 'dimension-field';
  width?: number;
}

interface PageConfig {
  title: string;
  stage: string;
  owner: string;
  mode: string;
  codeLabel: string;
  nameLabel: string;
  showParent?: boolean;
  showStatus?: boolean;
  showSort?: boolean;
  showRemark?: boolean;
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
      { prop: 'field01', label: '区划层级', optionSource: 'dimension-field' },
      { prop: 'field02', label: '适用电网区域' },
      { prop: 'field03', label: '国家/地区', optionSource: 'dimension-field' }
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
    fields: [
      { prop: 'field01', label: 'SK_公司' },
      { prop: 'field02', label: '工厂' },
      { prop: 'field03', label: '省份编码', optionSource: 'dimension-field' },
      { prop: 'field04', label: '所在省份', optionSource: 'dimension-field' },
      { prop: 'field05', label: '工厂类型' },
      { prop: 'field06', label: '行业门类代码' },
      { prop: 'field07', label: '行业门类名称' },
      { prop: 'field08', label: '行业大类代码' },
      { prop: 'field09', label: '行业大类名称' },
      { prop: 'field10', label: '行业中类代码' },
      { prop: 'field11', label: '行业中类名称' },
      { prop: 'field12', label: '行业小类代码' },
      { prop: 'field13', label: '行业小类名称' },
      { prop: 'field14', label: '生效日期', type: 'date' },
      { prop: 'field15', label: '失效日期', type: 'date' },
      { prop: 'field16', label: '是否有效', optionSource: 'dimension-field' }
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
      { prop: 'field01', label: '核算范围', optionSource: 'dimension-field' },
      { prop: 'field02', label: '默认活动单位' },
      { prop: 'field03', label: '默认因子口径' }
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
      { prop: 'field01', label: '基准年', type: 'number' },
      { prop: 'field02', label: '是否当前基准', optionSource: 'dimension-field' }
    ]
  },
  'ef-factor': {
    title: 'EF排放因子维度表',
    stage: '确认排放因子',
    owner: '企业',
    mode: '确认引用',
    codeLabel: 'SK_排放因子',
    nameLabel: '排放源名称',
    fields: [
      { prop: 'field01', label: '排放源英文名' },
      { prop: 'field02', label: '燃料/物料类别' },
      { prop: 'field03', label: '源单位' },
      { prop: 'field04', label: 'CO2', type: 'number' },
      { prop: 'field05', label: 'CH4', type: 'number' },
      { prop: 'field06', label: 'N2O', type: 'number' },
      { prop: 'field07', label: 'HFCs', type: 'number' },
      { prop: 'field08', label: 'PFCs', type: 'number' },
      { prop: 'field09', label: 'SF6', type: 'number' },
      { prop: 'field10', label: 'NF3', type: 'number' },
      { prop: 'field11', label: '适用范围' },
      { prop: 'field12', label: '因子来源' },
      { prop: 'field13', label: 'GWP_CH4', type: 'number' },
      { prop: 'field14', label: 'GWP_N2O', type: 'number' },
      { prop: 'field15', label: 'GWP_HFCs', type: 'number' },
      { prop: 'field16', label: 'GWP_PFCs', type: 'number' },
      { prop: 'field17', label: 'GWP_SF6', type: 'number' },
      { prop: 'field18', label: 'GWP_NF3', type: 'number' },
      { prop: 'field19', label: '因子GWP', type: 'number' },
      { prop: 'field20', label: '因子单位' }
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
      { prop: 'field01', label: '行政区划代码' },
      { prop: 'field02', label: '因子值', type: 'number' },
      { prop: 'field03', label: '单位' },
      { prop: 'field04', label: '版本号' }
    ]
  },
  'ef-electricity-version': {
    title: 'EF电力因子版本对应',
    stage: '确认排放因子',
    owner: '企业',
    mode: '企业确认',
    codeLabel: '因子版本',
    nameLabel: '版本说明',
    fields: [{ prop: 'field02', label: '生效年份', type: 'number' }]
  },
  'ef-electricity-scope': {
    title: 'EF电力因子口径维度',
    stage: '确认排放因子',
    owner: '链接厂商',
    mode: '同步后确认',
    codeLabel: '口径编码',
    nameLabel: '口径名称',
    fields: [
      { prop: 'field01', label: '口径类型', optionSource: 'dimension-field' },
      { prop: 'field02', label: '适用说明', width: 220 }
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
      { prop: 'field01', label: 'GWP值', type: 'number' },
      { prop: 'field02', label: 'GWP版本' },
      { prop: 'field03', label: '化学式' }
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
      { prop: 'field02', label: '分母类型' },
      { prop: 'field03', label: '分母度量名称' },
      { prop: 'field04', label: '强度单位展示' },
      { prop: 'field05', label: '是否启用', optionSource: 'dimension-field' },
      { prop: 'field06', label: '备注', width: 220 }
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
      { prop: 'field03', label: '强度目标值', type: 'number' },
      { prop: 'field04', label: '单位' }
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
      { prop: 'field02', label: '工厂类型' },
      { prop: 'field03', label: '年份', type: 'number' },
      { prop: 'field04', label: '月份', type: 'number' },
      { prop: 'field05', label: '分母类型' },
      { prop: 'field06', label: '分母度量名称' },
      { prop: 'field07', label: '分母值', type: 'number' },
      { prop: 'field08', label: '单位' },
      { prop: 'field09', label: '数据来源', optionSource: 'dimension-field' },
      { prop: 'field10', label: '备注', width: 220 }
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
      { prop: 'field02', label: '容忍率', type: 'number' },
      { prop: 'field03', label: '是否启用', optionSource: 'dimension-field' },
      { prop: 'field04', label: '备注', width: 220 }
    ]
  },
  'report-template-download': {
    title: '报表模板下载',
    stage: '报表管理',
    owner: '链接厂商',
    mode: '模板维护',
    codeLabel: '模板编码',
    nameLabel: '模板名称',
    fields: [
      { prop: 'field01', label: '模板类型', optionSource: 'dimension-field' },
      { prop: 'field02', label: '版本号' },
      { prop: 'field03', label: '文件路径', width: 220 },
      { prop: 'field04', label: '发布时间', type: 'date' }
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
  'greenhouse-gas',
  'report-template-download'
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

const routeKey = computed(() => {
  const queryCode = typeof route.query.code === 'string' ? route.query.code : '';
  const pathParts = route.path.split('/').filter(Boolean);
  const leafPath = pathParts[pathParts.length - 1] ?? '';
  return queryCode || leafPath;
});
const concreteTableRoute = computed(() => concreteTableRoutes[routeKey.value]);
const page = computed(() => dimensionPages[routeKey.value]);
const parentCodeOptions = computed(() => {
  const records = recordList.value ?? [];
  return records
    .filter((r: any) => r.recordCode)
    .map((r: any) => ({
      label: [r.recordCode, r.recordName].filter(Boolean).join(' / '),
      value: r.recordCode
    }));
});
const isVendorOnly = computed(() => vendorOnlyDimensionCodes.has(routeKey.value));
const isEditable = computed(() => editableDimensionCodes.has(routeKey.value));
const isVendorLinked = computed(() =>
  ['admin-division', 'emission-source-category', 'ef-electricity-factor',
   'ef-electricity-version', 'ef-electricity-scope', 'greenhouse-gas', 'base-year'].includes(routeKey.value)
);
const syncLoading = ref(false);
const readOnlyMessage = '旧维度表已拆分为具体业务表，请到对应页面维护。';
const sheetColumns = computed<SpreadsheetColumn[]>(() => {
  if (!page.value) return [];
  const columns: SpreadsheetColumn[] = [
    { prop: 'recordCode', label: page.value.codeLabel, required: true, width: 170 },
    { prop: 'recordName', label: page.value.nameLabel, required: true, width: 190 }
  ];
  if (page.value.showParent) {
    columns.push({ prop: 'parentCode', label: '上级编码', width: 150 });
  }
  page.value.fields.forEach((field) => {
    columns.push({
      prop: field.prop,
      label: field.label,
      type: field.optionSource ? 'select' : field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text',
      options: field.optionSource ? fieldOptions(field) : undefined,
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

const sheetRows = computed(() =>
  recordList.value.map((row) => ({
    id: row.id,
    dimensionCode: routeKey.value,
    recordCode: row.recordCode,
    recordName: row.recordName,
    parentCode: row.parentCode,
    field01: row.field01,
    field02: row.field02,
    field03: row.field03,
    field04: row.field04,
    field05: row.field05,
    field06: row.field06,
    field07: row.field07,
    field08: row.field08,
    field09: row.field09,
    field10: row.field10,
    field11: row.field11,
    field12: row.field12,
    field13: row.field13,
    field14: row.field14,
    field15: row.field15,
    field16: row.field16,
    field17: row.field17,
    field18: row.field18,
    field19: row.field19,
    field20: row.field20,
    field21: row.field21,
    field22: row.field22,
    status: row.status || '0',
    sortOrder: row.sortOrder ?? 0,
    remark: row.remark
  }))
);

const sheetEmptyRow = computed(() => ({
  dimensionCode: routeKey.value,
  recordCode: undefined,
  recordName: undefined,
  parentCode: undefined,
  field01: undefined,
  field02: undefined,
  field03: undefined,
  field04: undefined,
  field05: undefined,
  field06: undefined,
  field07: undefined,
  field08: undefined,
  field09: undefined,
  field10: undefined,
  field11: undefined,
  field12: undefined,
  field13: undefined,
  field14: undefined,
  field15: undefined,
  field16: undefined,
  field17: undefined,
  field18: undefined,
  field19: undefined,
  field20: undefined,
  field21: undefined,
  field22: undefined,
  status: '0',
  sortOrder: 0,
  remark: undefined
}));

const initFormData: DimensionRecordForm = {
  id: undefined,
  dimensionCode: undefined,
  recordCode: undefined,
  recordName: undefined,
  parentCode: undefined,
  field01: undefined,
  field02: undefined,
  field03: undefined,
  field04: undefined,
  field05: undefined,
  field06: undefined,
  field07: undefined,
  field08: undefined,
  field09: undefined,
  field10: undefined,
  field11: undefined,
  field12: undefined,
  field13: undefined,
  field14: undefined,
  field15: undefined,
  field16: undefined,
  field17: undefined,
  field18: undefined,
  field19: undefined,
  field20: undefined,
  field21: undefined,
  field22: undefined,
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
    recordName: [{ required: true, message: '名称不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

const statusLabel = (value?: string) => statusOptions.value.find((item) => item.value === value)?.label ?? value ?? '-';

const fieldOptionKey = (dimensionCode: string, field: FieldConfig) => `${dimensionCode}:${field.prop}`;
const fieldOptions = (field: FieldConfig) => (page.value ? (dynamicFieldOptions[fieldOptionKey(routeKey.value, field)] ?? []) : []);

const loadPageFieldOptions = async () => {
  statusOptions.value = await loadRecordStatusOptions();
  const currentPage = page.value;
  if (!currentPage) {
    return;
  }
  const fields = currentPage.fields.filter((field) => field.optionSource);
  await Promise.all(
    fields.map(async (field) => {
      dynamicFieldOptions[fieldOptionKey(routeKey.value, field)] = await loadDimensionFieldOptions(routeKey.value, field.prop);
    })
  );
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
    dimensionCode: routeKey.value
  };
  dimensionFormRef.value?.resetFields();
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
  downloadXlsxTemplate({
    fileName: `${routeKey.value}_dimension_template_${new Date().getTime()}.xlsx`,
    sheetName: page.value.title,
    headers: sheetColumns.value.map((column) => column.label)
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

const submitForm = () => {
  if (!isEditable.value) return;
  dimensionFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    form.value.dimensionCode = routeKey.value;
    try {
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
  sheetSaving.value = true;
  try {
    for (const row of rows) {
      const payload: DimensionRecordForm = {
        ...sheetEmptyRow.value,
        ...row,
        dimensionCode: routeKey.value,
        sortOrder: Number(row.sortOrder ?? 0)
      };
      if (payload.id) {
        await updateDimensionRecord(payload);
      } else {
        await addDimensionRecord(payload);
      }
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
