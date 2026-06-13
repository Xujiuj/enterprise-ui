<template>
  <div class="page-panel">
    <!-- 页面头部 -->
    <div class="page-head">
      <div>
        <h1>强度分母</h1>
        <p>管理碳排放强度计算的分母数据，如营业收入、产品产量、建筑面积等，用于强度指标计算。</p>
      </div>
      <div class="btns">
        <el-button @click="handleExport" v-hasPermi="['system:intensityDenominator:export']" icon="Download">导出</el-button>
        <el-button type="primary" @click="handleAdd" v-hasPermi="['system:intensityDenominator:add']" icon="Plus">新增强度分母</el-button>
      </div>
    </div>

    <div class="panel">
      <!-- 搜索栏 -->
      <div class="search-bar wide" v-show="showSearch">
        <div class="search-item">
          <label>强度指标ID</label>
          <el-input v-model="queryParams.intensityId" placeholder="请输入强度指标ID" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>分母编码</label>
          <el-input v-model="queryParams.denominatorCode" placeholder="请输入分母编码" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>分母名称</label>
          <el-input v-model="queryParams.denominatorName" placeholder="营业收入/产品产量/建筑面积" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>分母单位</label>
          <el-input v-model="queryParams.denominatorUnit" placeholder="请输入分母单位" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>数据期间</label>
          <el-input v-model="queryParams.dataPeriod" placeholder="请输入数据期间" clearable @keyup.enter="handleQuery" />
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
          <el-button type="primary" icon="Plus" @click="handleAdd" v-hasPermi="['system:intensityDenominator:add']">新增</el-button>
          <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['system:intensityDenominator:remove']">删除</el-button>
          <el-button icon="Download" @click="handleExport" v-hasPermi="['system:intensityDenominator:export']">导出</el-button>
        </div>
        <span class="select-count" v-if="ids.length > 0">已选 {{ ids.length }} 项</span>
      </div>

      <!-- 数据表格 -->
      <el-table v-loading="loading" :data="intensityDenominatorList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="42" align="center" />
        <el-table-column label="强度指标ID" align="center" prop="intensityId" />
        <el-table-column label="分母编码" align="center" prop="denominatorCode" />
        <el-table-column label="分母名称" align="center" prop="denominatorName" />
        <el-table-column label="分母数值" align="center" prop="denominatorValue" />
        <el-table-column label="分母单位" align="center" prop="denominatorUnit" />
        <el-table-column label="数据期间" align="center" prop="dataPeriod" />
        <el-table-column label="扩展字段" align="center" prop="extendJson" :show-overflow-tooltip="true" />
        <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
        <el-table-column label="操作" align="center" width="150" fixed="right">
          <template #default="scope">
            <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:intensityDenominator:edit']">编辑</el-button>
            <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:intensityDenominator:remove']">删除</el-button>
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
      <el-form ref="intensityDenominatorFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="强度指标ID" prop="intensityId">
          <el-input v-model="form.intensityId" placeholder="请输入强度指标ID" />
        </el-form-item>
        <el-form-item label="分母编码" prop="denominatorCode">
          <el-input v-model="form.denominatorCode" placeholder="请输入分母编码" />
        </el-form-item>
        <el-form-item label="分母名称" prop="denominatorName">
          <el-select v-model="form.denominatorName" placeholder="请选择分母名称" clearable class="w-full">
            <el-option label="营业收入" value="营业收入" />
            <el-option label="产品产量" value="产品产量" />
            <el-option label="建筑面积" value="建筑面积" />
          </el-select>
        </el-form-item>
        <el-form-item label="分母数值" prop="denominatorValue">
          <el-input v-model="form.denominatorValue" placeholder="请输入分母数值" />
        </el-form-item>
        <el-form-item label="分母单位" prop="denominatorUnit">
          <el-input v-model="form.denominatorUnit" placeholder="请输入分母单位" />
        </el-form-item>
        <el-form-item label="数据期间" prop="dataPeriod">
          <el-input v-model="form.dataPeriod" placeholder="请输入数据期间" />
        </el-form-item>
        <el-form-item label="扩展字段JSON" prop="extendJson">
          <el-input v-model="form.extendJson" type="textarea" placeholder="请输入扩展字段JSON" />
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

<script setup name="IntensityDenominator" lang="ts">
import { listIntensityDenominator, getIntensityDenominator, delIntensityDenominator, addIntensityDenominator, updateIntensityDenominator } from '@/api/system/intensityDenominator';
import { IntensityDenominatorVO, IntensityDenominatorQuery, IntensityDenominatorForm } from '@/api/system/intensityDenominator/types';

import { useAutoQuery } from '@/hooks/useAutoQuery';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const intensityDenominatorList = ref<IntensityDenominatorVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const intensityDenominatorFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: IntensityDenominatorForm = {
  id: undefined,
  intensityId: undefined,
  denominatorCode: undefined,
  denominatorName: undefined,
  denominatorValue: undefined,
  denominatorUnit: undefined,
  dataPeriod: undefined,
  extendJson: undefined,
  remark: undefined,
}
const data = reactive<PageData<IntensityDenominatorForm, IntensityDenominatorQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    intensityId: undefined,
    denominatorCode: undefined,
    denominatorName: undefined,
    denominatorValue: undefined,
    denominatorUnit: undefined,
    dataPeriod: undefined,
    extendJson: undefined,
    params: {
    }
  },
  rules: {
    intensityId: [
      { required: true, message: "强度指标ID不能为空", trigger: "blur" }
    ],
    denominatorCode: [
      { required: true, message: "分母编码不能为空", trigger: "blur" }
    ],
    denominatorName: [
      { required: true, message: "分母名称不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询强度分母列表 */
const getList = async () => {
  loading.value = true;
  const res = await listIntensityDenominator(queryParams.value);
  intensityDenominatorList.value = res.rows;
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
  intensityDenominatorFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: IntensityDenominatorVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "新增强度分母";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: IntensityDenominatorVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getIntensityDenominator(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改强度分母";
}

/** 提交按钮 */
const submitForm = () => {
  intensityDenominatorFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateIntensityDenominator(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addIntensityDenominator(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: IntensityDenominatorVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除强度分母编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delIntensityDenominator(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('system/intensityDenominator/export', {
    ...queryParams.value
  }, `intensityDenominator_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});

useAutoQuery(queryParams, () => handleQuery());
</script>
