<template>
  <div class="page-panel">
    <!-- 页面头部 -->
    <div class="page-head">
      <div>
        <h1>排放源识别</h1>
        <p>建立企业排放源台账，作为数据录入的依据。本页由企业维护，可在线编辑或通过 Excel 批量导入。</p>
      </div>
      <div class="btns">
        <el-button @click="handleExport" v-hasPermi="['system:emissionSource:export']" icon="Download">导出</el-button>
        <el-button type="primary" @click="handleAdd" v-hasPermi="['system:emissionSource:add']" icon="Plus">新增排放源</el-button>
      </div>
    </div>

    <div class="panel">
      <!-- 搜索栏 -->
      <div class="search-bar wide" v-show="showSearch">
        <div class="search-item">
          <label>排放源编码</label>
          <el-input v-model="queryParams.sourceCode" placeholder="请输入排放源编码" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>排放源名称</label>
          <el-input v-model="queryParams.sourceName" placeholder="请输入排放源名称" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>排放源分类</label>
          <el-input v-model="queryParams.category" placeholder="固定燃烧/移动燃烧/过程排放/逸散排放/间接排放" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>范围明细</label>
          <el-input v-model="queryParams.scopeDetail" placeholder="请输入范围明细" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>负责部门</label>
          <el-input v-model="queryParams.responsibleDept" placeholder="请输入负责部门" clearable @keyup.enter="handleQuery" />
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
          <el-button type="primary" icon="Plus" @click="handleAdd" v-hasPermi="['system:emissionSource:add']">新增</el-button>
          <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['system:emissionSource:remove']">删除</el-button>
          <el-button icon="Download" @click="handleExport" v-hasPermi="['system:emissionSource:export']">导出</el-button>
        </div>
        <span class="select-count" v-if="ids.length > 0">已选 {{ ids.length }} 项</span>
      </div>

      <!-- 数据表格 -->
      <el-table v-loading="loading" :data="emissionSourceList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="42" align="center" />
        <el-table-column label="排放源编码" align="center" prop="sourceCode" />
        <el-table-column label="排放源名称" align="center" prop="sourceName" :show-overflow-tooltip="true" />
        <el-table-column label="排放源分类" align="center" prop="category" />
        <el-table-column label="范围" align="center" prop="scopeType" />
        <el-table-column label="范围明细" align="center" prop="scopeDetail" :show-overflow-tooltip="true" />
        <el-table-column label="温室气体类型" align="center" prop="ghgType" />
        <el-table-column label="负责部门" align="center" prop="responsibleDept" />
        <el-table-column label="负责人" align="center" prop="responsiblePerson" />
        <el-table-column label="更新频率" align="center" prop="updateFrequency" />
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
            <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:emissionSource:edit']">编辑</el-button>
            <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:emissionSource:remove']">删除</el-button>
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
      <el-form ref="emissionSourceFormRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="排放源编码" prop="sourceCode">
          <el-input v-model="form.sourceCode" placeholder="请输入排放源编码" />
        </el-form-item>
        <el-form-item label="排放源名称" prop="sourceName">
          <el-input v-model="form.sourceName" placeholder="请输入排放源名称" />
        </el-form-item>
        <el-form-item label="排放源分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择排放源分类" clearable class="w-full">
            <el-option label="固定燃烧" value="固定燃烧" />
            <el-option label="移动燃烧" value="移动燃烧" />
            <el-option label="过程排放" value="过程排放" />
            <el-option label="逸散排放" value="逸散排放" />
            <el-option label="间接排放" value="间接排放" />
          </el-select>
        </el-form-item>
        <el-form-item label="范围" prop="scopeType">
          <el-select v-model="form.scopeType" placeholder="请选择范围" clearable class="w-full">
            <el-option label="范围1" value="范围1" />
            <el-option label="范围2" value="范围2" />
            <el-option label="范围3" value="范围3" />
          </el-select>
        </el-form-item>
        <el-form-item label="范围明细" prop="scopeDetail">
          <el-input v-model="form.scopeDetail" placeholder="请输入范围明细" />
        </el-form-item>
        <el-form-item label="温室气体类型" prop="ghgType">
          <el-select v-model="form.ghgType" placeholder="请选择温室气体类型" clearable class="w-full">
            <el-option label="CO2" value="CO2" />
            <el-option label="CH4" value="CH4" />
            <el-option label="N2O" value="N2O" />
            <el-option label="HFCs" value="HFCs" />
            <el-option label="PFCs" value="PFCs" />
            <el-option label="SF6" value="SF6" />
          </el-select>
        </el-form-item>
        <el-form-item label="排放源描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="负责部门" prop="responsibleDept">
          <el-input v-model="form.responsibleDept" placeholder="请输入负责部门" />
        </el-form-item>
        <el-form-item label="负责人" prop="responsiblePerson">
          <el-input v-model="form.responsiblePerson" placeholder="请输入负责人" />
        </el-form-item>
        <el-form-item label="更新频率" prop="updateFrequency">
          <el-select v-model="form.updateFrequency" placeholder="请选择更新频率" clearable class="w-full">
            <el-option label="月度" value="月度" />
            <el-option label="季度" value="季度" />
            <el-option label="年度" value="年度" />
          </el-select>
        </el-form-item>
        <el-form-item label="数据权限类型" prop="dataPermission">
          <el-input-number v-model="form.dataPermission" :min="1" :max="3" placeholder="1企业可编辑 2系统预设只读 3链接厂商只读" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup name="EmissionSource" lang="ts">
import { listEmissionSource, getEmissionSource, delEmissionSource, addEmissionSource, updateEmissionSource } from '@/api/system/emissionSource';
import { EmissionSourceVO, EmissionSourceQuery, EmissionSourceForm } from '@/api/system/emissionSource/types';

import { useAutoQuery } from '@/hooks/useAutoQuery';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const emissionSourceList = ref<EmissionSourceVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const emissionSourceFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: EmissionSourceForm = {
  id: undefined,
  sourceCode: undefined,
  sourceName: undefined,
  category: undefined,
  scopeType: undefined,
  scopeDetail: undefined,
  ghgType: undefined,
  description: undefined,
  responsibleDept: undefined,
  responsiblePerson: undefined,
  updateFrequency: undefined,
  dataPermission: undefined,
  status: undefined,
  remark: undefined,
};
const data = reactive<PageData<EmissionSourceForm, EmissionSourceQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    sourceCode: undefined,
    sourceName: undefined,
    category: undefined,
    scopeType: undefined,
    scopeDetail: undefined,
    ghgType: undefined,
    description: undefined,
    responsibleDept: undefined,
    responsiblePerson: undefined,
    updateFrequency: undefined,
    dataPermission: undefined,
    status: undefined,
    params: {
    }
  },
  rules: {
    sourceCode: [
      { required: true, message: "排放源编码不能为空", trigger: "blur" }
    ],
    sourceName: [
      { required: true, message: "排放源名称不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询排放源列表 */
const getList = async () => {
  loading.value = true;
  const res = await listEmissionSource(queryParams.value);
  emissionSourceList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
};

/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  emissionSourceFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: EmissionSourceVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "新增排放源";
};

/** 修改按钮操作 */
const handleUpdate = async (row?: EmissionSourceVO) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getEmissionSource(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改排放源";
};

/** 提交按钮 */
const submitForm = () => {
  emissionSourceFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateEmissionSource(form.value).finally(() => buttonLoading.value = false);
      } else {
        await addEmissionSource(form.value).finally(() => buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: EmissionSourceVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除排放源编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delEmissionSource(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('system/emissionSource/export', {
    ...queryParams.value
  }, `emissionSource_${new Date().getTime()}.xlsx`);
};

onMounted(() => {
  getList();
});

useAutoQuery(queryParams, () => handleQuery());
</script>
