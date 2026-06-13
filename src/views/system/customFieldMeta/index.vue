<template>
  <div class="page-panel">
    <!-- 页面头部 -->
    <div class="page-head">
      <div>
        <h1>自定义字段元数据</h1>
        <p>管理各模块的扩展字段定义，控制字段名称、类型、选项及校验规则，确保数据一致性。</p>
      </div>
      <div class="btns">
        <el-button @click="handleExport" v-hasPermi="['system:customFieldMeta:export']" icon="Download">导出</el-button>
        <el-button type="primary" @click="handleAdd" v-hasPermi="['system:customFieldMeta:add']" icon="Plus">新增字段元数据</el-button>
      </div>
    </div>

    <div class="panel">
      <!-- 搜索栏 -->
      <div class="search-bar wide" v-show="showSearch">
        <div class="search-item">
          <label>模块名称</label>
          <el-input v-model="queryParams.moduleName" placeholder="activity_data/green_electricity/intensity_denominator" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>字段键名</label>
          <el-input v-model="queryParams.fieldKey" placeholder="请输入字段键名" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>字段显示名称</label>
          <el-input v-model="queryParams.fieldLabel" placeholder="请输入字段显示名称" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>字段类型</label>
          <el-input v-model="queryParams.fieldType" placeholder="text/number/date/select/boolean" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>是否必填</label>
          <el-input v-model="queryParams.isRequired" placeholder="0否 1是" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-actions">
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
          <el-button type="primary" icon="Plus" @click="handleAdd" v-hasPermi="['system:customFieldMeta:add']">新增</el-button>
          <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['system:customFieldMeta:remove']">删除</el-button>
          <el-button icon="Download" @click="handleExport" v-hasPermi="['system:customFieldMeta:export']">导出</el-button>
        </div>
        <span class="select-count" v-if="ids.length > 0">已选 {{ ids.length }} 项</span>
      </div>

      <!-- 数据表格 -->
      <el-table v-loading="loading" :data="customFieldMetaList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="42" align="center" />
        <el-table-column label="模块名称" align="center" prop="moduleName" />
        <el-table-column label="字段键名" align="center" prop="fieldKey" />
        <el-table-column label="字段显示名称" align="center" prop="fieldLabel" />
        <el-table-column label="字段类型" align="center" prop="fieldType" />
        <el-table-column label="字段选项JSON" align="center" prop="fieldOptions" :show-overflow-tooltip="true" />
        <el-table-column label="是否必填" align="center" prop="isRequired" />
        <el-table-column label="排序" align="center" prop="sortOrder" />
        <el-table-column label="状态" align="center" prop="status">
          <template #default="scope">
            <span class="tag" :class="scope.row.status === '0' ? 'ok' : 'gray'">
              {{ scope.row.status === '0' ? '正常' : '停用' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
        <el-table-column label="操作" align="center" width="150" fixed="right">
          <template #default="scope">
            <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:customFieldMeta:edit']">编辑</el-button>
            <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:customFieldMeta:remove']">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </div>

    <!-- 侧栏抽屉表单 -->
    <el-drawer
      v-model="dialog.visible"
      :title="dialog.title"
      size="600px"
      append-to-body
    >
      <el-form ref="customFieldMetaFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="模块名称" prop="moduleName">
          <el-select v-model="form.moduleName" placeholder="请选择模块名称" clearable class="w-full">
            <el-option label="activity_data" value="activity_data" />
            <el-option label="green_electricity" value="green_electricity" />
            <el-option label="intensity_denominator" value="intensity_denominator" />
          </el-select>
        </el-form-item>
        <el-form-item label="字段键名" prop="fieldKey">
          <el-input v-model="form.fieldKey" placeholder="请输入字段键名" />
        </el-form-item>
        <el-form-item label="字段显示名称" prop="fieldLabel">
          <el-input v-model="form.fieldLabel" placeholder="请输入字段显示名称" />
        </el-form-item>
        <el-form-item label="字段类型" prop="fieldType">
          <el-select v-model="form.fieldType" placeholder="请选择字段类型" clearable class="w-full">
            <el-option label="text" value="text" />
            <el-option label="number" value="number" />
            <el-option label="date" value="date" />
            <el-option label="select" value="select" />
            <el-option label="boolean" value="boolean" />
          </el-select>
        </el-form-item>
        <el-form-item label="字段选项JSON" prop="fieldOptions">
          <el-input v-model="form.fieldOptions" type="textarea" placeholder="请输入字段选项JSON(select类型)" />
        </el-form-item>
        <el-form-item label="是否必填" prop="isRequired">
          <el-select v-model="form.isRequired" placeholder="请选择是否必填" clearable class="w-full">
            <el-option label="否" value="0" />
            <el-option label="是" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input v-model="form.sortOrder" placeholder="请输入排序" />
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
  </div>
</template>

<script setup name="CustomFieldMeta" lang="ts">
import { listCustomFieldMeta, getCustomFieldMeta, delCustomFieldMeta, addCustomFieldMeta, updateCustomFieldMeta } from '@/api/system/customFieldMeta';
import { CustomFieldMetaVO, CustomFieldMetaQuery, CustomFieldMetaForm } from '@/api/system/customFieldMeta/types';

import { useAutoQuery } from '@/hooks/useAutoQuery';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const customFieldMetaList = ref<CustomFieldMetaVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const customFieldMetaFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: CustomFieldMetaForm = {
  id: undefined,
  moduleName: undefined,
  fieldKey: undefined,
  fieldLabel: undefined,
  fieldType: undefined,
  fieldOptions: undefined,
  isRequired: undefined,
  sortOrder: undefined,
  status: undefined,
  remark: undefined,
}
const data = reactive<PageData<CustomFieldMetaForm, CustomFieldMetaQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    moduleName: undefined,
    fieldKey: undefined,
    fieldLabel: undefined,
    fieldType: undefined,
    fieldOptions: undefined,
    isRequired: undefined,
    sortOrder: undefined,
    status: undefined,
    params: {
    }
  },
  rules: {
    moduleName: [
      { required: true, message: "模块名称不能为空", trigger: "blur" }
    ],
    fieldKey: [
      { required: true, message: "字段键名不能为空", trigger: "blur" }
    ],
    fieldLabel: [
      { required: true, message: "字段显示名称不能为空", trigger: "blur" }
    ],
    fieldType: [
      { required: true, message: "字段类型不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询自定义字段元数据列表 */
const getList = async () => {
  loading.value = true;
  const res = await listCustomFieldMeta(queryParams.value);
  customFieldMetaList.value = res.rows;
  total.value = res.total;
  loading.value = false;
}

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
}

/** 表单重置 */
const reset = () => {
  form.value = {...initFormData};
  customFieldMetaFormRef.value?.resetFields();
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
}

/** 多选框选中数据 */
const handleSelectionChange = (selection: CustomFieldMetaVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "新增字段元数据";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: CustomFieldMetaVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getCustomFieldMeta(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改字段元数据";
}

/** 提交按钮 */
const submitForm = () => {
  customFieldMetaFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateCustomFieldMeta(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addCustomFieldMeta(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: CustomFieldMetaVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除字段元数据编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delCustomFieldMeta(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('system/customFieldMeta/export', {
    ...queryParams.value
  }, `customFieldMeta_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});

useAutoQuery(queryParams, () => handleQuery());
</script>
