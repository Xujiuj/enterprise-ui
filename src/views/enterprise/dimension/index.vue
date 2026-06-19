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
          <div class="search-item">
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
            <el-button v-if="!isVendorOnly" type="primary" icon="Plus" @click="handleAdd" v-hasPermi="['enterprise:dimension:add']">新增</el-button>
            <el-button v-if="!isVendorOnly" icon="Grid" @click="openSheetDrawer" v-hasPermi="['enterprise:dimension:edit']">在线填报</el-button>
            <el-button
              v-if="!isVendorOnly"
              type="danger"
              plain
              icon="Delete"
              :disabled="multiple"
              @click="handleDelete()"
              v-hasPermi="['enterprise:dimension:remove']"
              >删除</el-button
            >
          </div>
          <span class="select-count" v-if="ids.length > 0">已选 {{ ids.length }} 项</span>
        </div>

        <el-table v-loading="loading" :data="recordList" @selection-change="handleSelectionChange">
          <el-table-column v-if="!isVendorOnly" type="selection" width="42" align="center" />
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
          <el-table-column label="状态" align="center" prop="status" width="100">
            <template #default="scope">
              <span class="tag" :class="scope.row.status === '0' ? 'ok' : 'gray'">
                {{ statusLabel(scope.row.status) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="排序" align="center" prop="sortOrder" width="80" />
          <el-table-column label="备注" align="center" prop="remark" min-width="180" :show-overflow-tooltip="true" />
          <el-table-column v-if="!isVendorOnly" label="操作" align="center" width="150" fixed="right">
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
            <el-input v-model="form.parentCode" placeholder="请输入上级编码" />
          </el-form-item>
          <el-form-item v-for="field in page.fields" :key="field.prop" :label="field.label" :prop="field.prop">
            <el-select v-if="field.options" v-model="form[field.prop]" :placeholder="`请选择${field.label}`" clearable class="w-full">
              <el-option v-for="item in field.options" :key="item" :label="item" :value="item" />
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
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio value="0">启用</el-radio>
              <el-radio value="1">停用</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="排序" prop="sortOrder">
            <el-input-number v-model="form.sortOrder" :min="0" controls-position="right" class="w-full" />
          </el-form-item>
          <el-form-item label="备注" prop="remark">
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
    </template>

    <el-result v-else icon="error" title="未配置合法维度" :sub-title="routeKey">
      <template #extra>
        <el-button type="primary" @click="$router.back()">返回</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup name="EnterpriseDimension" lang="ts">
import { computed, reactive, watch } from 'vue';
import {
  addDimensionRecord,
  delDimensionRecord,
  getDimensionRecord,
  listDimensionRecord,
  updateDimensionRecord
} from '@/api/enterprise/dimensionRecord';
import { useAutoQuery } from '@/hooks/useAutoQuery';
import { DimensionRecordForm, DimensionRecordQuery, DimensionRecordVO } from '@/api/enterprise/dimensionRecord/types';
import SpreadsheetEditor from '@/components/SpreadsheetEditor/index.vue';
import type { SpreadsheetColumn } from '@/components/SpreadsheetEditor/types';

type FieldProp = 'field01' | 'field02' | 'field03' | 'field04' | 'field05' | 'field06';

interface FieldConfig {
  prop: FieldProp;
  label: string;
  type?: 'text' | 'number' | 'date';
  options?: string[];
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
  fields: FieldConfig[];
}

const route = useRoute();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const statusOptions = [
  { label: '启用', value: '0' },
  { label: '停用', value: '1' }
];
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
      { prop: 'field01', label: '区划层级', options: ['省级', '市级', '区县级'] },
      { prop: 'field02', label: '适用电网区域' },
      { prop: 'field03', label: '国家/地区', options: ['中国'] }
    ]
  },
  company: {
    title: '公司表',
    stage: '配置排放源',
    owner: '企业',
    mode: '企业维护',
    codeLabel: '公司编号',
    nameLabel: '公司名称',
    showParent: true,
    fields: [
      { prop: 'field01', label: '组织边界', options: ['法人主体', '工厂', '园区', '部门'] },
      { prop: 'field02', label: '行政区划代码' },
      { prop: 'field03', label: '统一社会信用代码' }
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
      { prop: 'field01', label: '核算范围', options: ['范围一', '范围二', '范围三'] },
      { prop: 'field02', label: '默认活动单位' },
      { prop: 'field03', label: '默认因子口径' }
    ]
  },
  'emission-source': {
    title: '排放源识别',
    stage: '配置排放源',
    owner: '企业',
    mode: '企业维护',
    codeLabel: '排放源识别编号',
    nameLabel: '排放源名称',
    fields: [
      { prop: 'field01', label: '公司编号' },
      { prop: 'field02', label: '分类编码' },
      { prop: 'field03', label: '活动数据单位' },
      { prop: 'field04', label: '默认因子编码' }
    ]
  },
  'base-year': {
    title: '基准年维度表',
    stage: '配置排放源',
    owner: '企业',
    mode: '企业确认',
    codeLabel: '基准年编码',
    nameLabel: '基准年名称',
    fields: [
      { prop: 'field01', label: '年度', type: 'number' },
      { prop: 'field02', label: '适用组织' },
      { prop: 'field03', label: '适用指标' }
    ]
  },
  'ef-factor': {
    title: 'EF排放因子维度表',
    stage: '确认排放因子',
    owner: '企业',
    mode: '确认引用',
    codeLabel: '因子编码',
    nameLabel: '因子名称',
    fields: [
      { prop: 'field01', label: '因子单位' },
      { prop: 'field02', label: '因子来源' },
      { prop: 'field03', label: '适用排放源' },
      { prop: 'field04', label: '版本号' }
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
    codeLabel: '对应编码',
    nameLabel: '对应名称',
    fields: [
      { prop: 'field01', label: '核算期间' },
      { prop: 'field02', label: '因子版本' },
      { prop: 'field03', label: '适用区域' }
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
      { prop: 'field01', label: '口径类型', options: ['全国', '区域', '省级', '市场化交易'] },
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
  'emission-activity-data': {
    title: '排放活动数据',
    stage: '活动数据',
    owner: '企业',
    mode: '企业填报',
    codeLabel: '活动数据编号',
    nameLabel: '活动数据名称',
    fields: [
      { prop: 'field01', label: '排放源识别编号' },
      { prop: 'field02', label: '核算期间' },
      { prop: 'field03', label: '活动数据', type: 'number' },
      { prop: 'field04', label: '活动单位' },
      { prop: 'field05', label: '负责部门' }
    ]
  },
  'green-electricity-data': {
    title: '绿电绿证数据',
    stage: '绿电绿证',
    owner: '企业',
    mode: '企业填报',
    codeLabel: '绿电绿证编号',
    nameLabel: '绿电绿证名称',
    fields: [
      { prop: 'field01', label: '电力类型', options: ['自建光伏', '绿电直购', '绿证'] },
      { prop: 'field02', label: '数量', type: 'number' },
      { prop: 'field03', label: '单位' },
      { prop: 'field04', label: '购买日期', type: 'date' },
      { prop: 'field05', label: '到期日期', type: 'date' }
    ]
  },
  'intensity-denominator': {
    title: '碳排放强度分母维度表',
    stage: '强度管理',
    owner: '企业',
    mode: '企业维护',
    codeLabel: '分母编码',
    nameLabel: '分母名称',
    fields: [
      { prop: 'field01', label: '分母类型', options: ['营收', '产量', '面积', '发电量'] },
      { prop: 'field02', label: '单位' },
      { prop: 'field03', label: '适用组织' }
    ]
  },
  'intensity-target': {
    title: '强度目标表',
    stage: '强度管理',
    owner: '企业',
    mode: '企业维护',
    codeLabel: '目标编码',
    nameLabel: '目标名称',
    fields: [
      { prop: 'field01', label: '目标期间' },
      { prop: 'field02', label: '强度指标' },
      { prop: 'field03', label: '目标值', type: 'number' },
      { prop: 'field04', label: '基准年' }
    ]
  },
  'denominator-fact': {
    title: '分母事实表',
    stage: '强度管理',
    owner: '企业',
    mode: '企业填报',
    codeLabel: '事实编码',
    nameLabel: '事实名称',
    fields: [
      { prop: 'field01', label: '期间' },
      { prop: 'field02', label: '分母编码' },
      { prop: 'field03', label: '分母值', type: 'number' },
      { prop: 'field04', label: '数据来源部门' }
    ]
  },
  'intensity-tolerance': {
    title: '碳排放强度容忍率参数表',
    stage: '强度管理',
    owner: '企业',
    mode: '企业维护',
    codeLabel: '容忍率编码',
    nameLabel: '容忍率名称',
    fields: [
      { prop: 'field01', label: '强度指标' },
      { prop: 'field02', label: '容忍率(%)', type: 'number' },
      { prop: 'field03', label: '起始期间' },
      { prop: 'field04', label: '结束期间' }
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
      { prop: 'field01', label: '模板类型', options: ['Power BI', 'Excel', 'PDF'] },
      { prop: 'field02', label: '版本号' },
      { prop: 'field03', label: '文件路径', width: 220 },
      { prop: 'field04', label: '发布时间', type: 'date' }
    ]
  }
};

const vendorOnlyDimensionCodes = new Set([
  'admin-division',
  'emission-source-category',
  'ef-electricity-factor',
  'ef-electricity-scope',
  'greenhouse-gas',
  'report-template-download'
]);

const routeKey = computed(() => {
  const queryCode = typeof route.query.code === 'string' ? route.query.code : '';
  const pathParts = route.path.split('/').filter(Boolean);
  const leafPath = pathParts[pathParts.length - 1] ?? '';
  return queryCode || leafPath;
});
const page = computed(() => dimensionPages[routeKey.value]);
const isVendorOnly = computed(() => vendorOnlyDimensionCodes.has(routeKey.value));
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
      type: field.options ? 'select' : field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text',
      options: field.options?.map((option) => ({ label: option, value: option })),
      width: field.width ?? 150,
      precision: field.type === 'number' ? 2 : undefined
    });
  });
  columns.push(
    {
      prop: 'status',
      label: '状态',
      type: 'select',
      required: true,
      width: 120,
      options: statusOptions
    },
    { prop: 'sortOrder', label: '排序', type: 'number', width: 110, min: 0, precision: 0 },
    { prop: 'remark', label: '备注', width: 220 }
  );
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
const sheetSaving = ref(false);

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

const statusLabel = (value?: string) => statusOptions.find((item) => item.value === value)?.label ?? value ?? '-';

const getList = async () => {
  if (!page.value) {
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
  if (isVendorOnly.value) return;
  reset();
  dialog.visible = true;
  dialog.title = `新增${page.value?.title ?? ''}`;
};

const openSheetDrawer = () => {
  if (isVendorOnly.value) return;
  sheetDrawer.visible = true;
};

const handleUpdate = async (row?: DimensionRecordVO) => {
  if (isVendorOnly.value) return;
  reset();
  const id = row?.id || ids.value[0];
  const res = await getDimensionRecord(id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = `修改${page.value?.title ?? ''}`;
};

const submitForm = () => {
  if (isVendorOnly.value) return;
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

const saveSheetRows = async (rows: Record<string, any>[]) => {
  if (isVendorOnly.value) return;
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
    proxy?.$modal.msgSuccess('在线填报已保存');
    sheetDrawer.visible = false;
    await getList();
  } finally {
    sheetSaving.value = false;
  }
};

const handleDelete = async (row?: DimensionRecordVO) => {
  if (isVendorOnly.value) return;
  const targetIds = row?.id || ids.value;
  await proxy?.$modal.confirm(`是否确认删除编号为 "${targetIds}" 的数据项？`);
  await delDimensionRecord(targetIds);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

watch(
  () => routeKey.value,
  () => {
    resetQuery();
  },
  { immediate: true }
);

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
