<template>
  <div class="p-2 page-panel enterprise-extension-field-page">
    <section class="page-head">
      <div>
        <h1>扩展字段配置</h1>
        <p>为企业自维护的数据页追加字段定义；原始字段由系统保护，不能在这里覆盖或删除。</p>
      </div>
    </section>

    <section class="panel">
      <el-form v-show="showSearch" :model="queryParams" inline label-width="88px" class="search-bar">
        <el-form-item label="所属页面">
          <el-select v-model="queryParams.moduleCode" clearable filterable placeholder="请选择页面" class="w-260" @change="handleQuery">
            <el-option v-for="item in moduleOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="字段名">
          <el-input v-model="queryParams.fieldCode" clearable placeholder="请输入字段名" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="启用">
          <el-select v-model="queryParams.enabledFlag" clearable placeholder="全部" class="w-120" @change="handleQuery">
            <el-option label="启用" :value="true" />
            <el-option label="停用" :value="false" />
          </el-select>
        </el-form-item>
        <div class="search-actions">
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          <right-toolbar v-model:showSearch="showSearch" :columns="columnOptions" :gutter="0" @query-table="getList" />
        </div>
      </el-form>
      <div v-show="!showSearch" class="search-bar search-bar-collapsed">
        <div class="search-actions">
          <right-toolbar v-model:showSearch="showSearch" :columns="columnOptions" :gutter="0" @query-table="getList" />
        </div>
      </div>

      <el-row :gutter="10" class="mb-3">
        <el-col :span="1.5">
          <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['enterprise:extensionField:add']">新增</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['enterprise:extensionField:remove']">
            删除
          </el-button>
        </el-col>
      </el-row>

      <el-table v-loading="loading" :data="rows" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="48" align="center" />
        <el-table-column label="所属页面" prop="moduleCode" min-width="180">
          <template #default="scope">{{ moduleLabel(scope.row.moduleCode) }}</template>
        </el-table-column>
        <el-table-column label="字段名" prop="fieldCode" min-width="150" />
        <el-table-column label="显示名称" prop="fieldName" min-width="160" />
        <el-table-column label="存储类型" prop="valueType" width="120">
          <template #default="scope">{{ valueTypeLabel(scope.row.valueType) }}</template>
        </el-table-column>
        <el-table-column label="启用" prop="enabledFlag" width="90">
          <template #default="scope">
            <el-tag :type="scope.row.enabledFlag === false ? 'info' : 'success'">{{ scope.row.enabledFlag === false ? '停用' : '启用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" width="170" />
        <el-table-column label="操作" align="center" width="150" fixed="right">
          <template #default="scope">
            <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['enterprise:extensionField:edit']">编辑</el-button>
            <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['enterprise:extensionField:remove']">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </section>

    <el-drawer v-model="dialog.visible" :title="dialog.title" size="540px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="112px">
        <el-form-item label="所属页面" prop="moduleCode">
          <el-select v-model="form.moduleCode" filterable placeholder="请选择允许扩展的页面" class="w-full">
            <el-option v-for="item in moduleOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="字段名" prop="fieldCode">
          <el-input v-model="form.fieldCode" placeholder="例如 invoice_no，只允许字母、数字、下划线" />
        </el-form-item>
        <el-form-item label="显示名称" prop="fieldName">
          <el-input v-model="form.fieldName" placeholder="例如 发票编号" />
        </el-form-item>
        <el-form-item label="存储类型" prop="valueType">
          <el-select v-model="form.valueType" placeholder="请选择存储类型" class="w-full">
            <el-option v-for="item in valueTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="启用" prop="enabledFlag">
          <el-switch v-model="form.enabledFlag" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button :loading="buttonLoading" type="primary" @click="submitForm">确定</el-button>
        <el-button @click="cancel">取消</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup name="EnterpriseExtensionField" lang="ts">
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { computed, onMounted, reactive, ref } from 'vue';
import { addExtensionField, delExtensionField, getExtensionField, listExtensionFields, updateExtensionField } from '@/api/enterprise/extensionField';
import type { ExtensionFieldForm, ExtensionFieldQuery, ExtensionFieldVO } from '@/api/enterprise/extensionField/types';

const moduleOptions = [
  { label: '102 公司表', value: 'company' },
  { label: '104 排放源识别', value: 'emission_source' },
  { label: '106 基准年维度表', value: 'base-year' },
  { label: '201 EF排放因子维度表', value: 'ef-factor' },
  { label: '203 EF电力因子版本对应', value: 'ef-electricity-version' },
  { label: '排放活动数据', value: 'activity_data' },
  { label: '401 绿电绿证数据', value: 'green_electricity' },
  { label: '501 碳排放强度分母维度表', value: 'intensity-denominator' },
  { label: '502 强度目标表', value: 'intensity-target' },
  { label: '503 分母事实表', value: 'denominator-fact' },
  { label: '504 碳排放强度容忍率参数表', value: 'intensity-tolerance' },
  { label: '强度指标结果', value: 'intensity_metric' }
];

const valueTypeOptions = [
  { label: '文本', value: 'text' },
  { label: '多行文本', value: 'textarea' },
  { label: '数字', value: 'number' },
  { label: '日期', value: 'date' },
  { label: '是/否', value: 'boolean' }
];

const showSearch = ref(true);
const loading = ref(false);
const buttonLoading = ref(false);
const rows = ref<ExtensionFieldVO[]>([]);
const total = ref(0);
const ids = ref<Array<string | number>>([]);
const multiple = ref(true);
const formRef = ref<FormInstance>();

const queryParams = reactive<ExtensionFieldQuery>({
  pageNum: 1,
  pageSize: 10
});

const form = ref<ExtensionFieldForm>({});
const dialog = reactive({
  visible: false,
  title: ''
});

const columnOptions = ref<FieldOption[]>([
  { key: 'moduleCode', label: '所属页面', visible: true, children: [] },
  { key: 'fieldCode', label: '字段名', visible: true, children: [] },
  { key: 'fieldName', label: '显示名称', visible: true, children: [] },
  { key: 'valueType', label: '存储类型', visible: true, children: [] },
  { key: 'enabledFlag', label: '启用', visible: true, children: [] },
  { key: 'createTime', label: '创建时间', visible: true, children: [] }
]);

const rules = computed<FormRules>(() => ({
  moduleCode: [{ required: true, message: '所属页面不能为空', trigger: 'change' }],
  fieldCode: [
    { required: true, message: '字段名不能为空', trigger: 'blur' },
    { pattern: /^[A-Za-z][A-Za-z0-9_]{1,63}$/, message: '字段名必须以字母开头，只能包含字母、数字、下划线', trigger: 'blur' }
  ],
  fieldName: [{ required: true, message: '显示名称不能为空', trigger: 'blur' }],
  valueType: [{ required: true, message: '存储类型不能为空', trigger: 'change' }]
}));

const moduleLabel = (moduleCode?: string) => moduleOptions.find((item) => item.value === moduleCode)?.label ?? moduleCode ?? '-';
const valueTypeLabel = (valueType?: string) => valueTypeOptions.find((item) => item.value === valueType)?.label ?? valueType ?? '-';

const resetForm = () => {
  form.value = {
    templateVersionId: 1,
    sheetId: 1,
    valueType: 'text',
    enabledFlag: true
  };
  formRef.value?.resetFields();
};

const getList = async () => {
  loading.value = true;
  try {
    const res = await listExtensionFields(queryParams);
    rows.value = res.rows ?? res.data ?? [];
    total.value = Number(res.total ?? rows.value.length);
  } finally {
    loading.value = false;
  }
};

const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
};

const resetQuery = () => {
  queryParams.moduleCode = undefined;
  queryParams.fieldCode = undefined;
  queryParams.enabledFlag = undefined;
  handleQuery();
};

const handleSelectionChange = (selection: ExtensionFieldVO[]) => {
  ids.value = selection.map((item) => item.id).filter(Boolean);
  multiple.value = selection.length === 0;
};

const handleAdd = () => {
  resetForm();
  dialog.title = '新增扩展字段';
  dialog.visible = true;
};

const unwrapData = <T,>(response: unknown): T => {
  const payload = response as { data?: T };
  return payload.data ?? (response as T);
};

const handleUpdate = async (row: ExtensionFieldVO) => {
  resetForm();
  const res = await getExtensionField(row.id);
  form.value = { ...unwrapData<ExtensionFieldVO>(res) };
  dialog.title = '编辑扩展字段';
  dialog.visible = true;
};

const submitForm = async () => {
  await formRef.value?.validate();
  buttonLoading.value = true;
  try {
    if (form.value.id) {
      await updateExtensionField(form.value);
      ElMessage.success('修改成功');
    } else {
      await addExtensionField(form.value);
      ElMessage.success('新增成功');
    }
    dialog.visible = false;
    await getList();
  } finally {
    buttonLoading.value = false;
  }
};

const handleDelete = async (row?: ExtensionFieldVO) => {
  const targetIds = row?.id ?? ids.value;
  await ElMessageBox.confirm(`是否确认删除扩展字段编号为 "${targetIds}" 的数据项？`, '系统提示', { type: 'warning' });
  await delExtensionField(targetIds);
  ElMessage.success('删除成功');
  await getList();
};

const cancel = () => {
  dialog.visible = false;
  resetForm();
};

onMounted(() => {
  resetForm();
  getList();
});
</script>

<style scoped>
.w-full {
  width: 100%;
}

.w-120 {
  width: 120px;
}

.w-260 {
  width: 260px;
}
</style>
