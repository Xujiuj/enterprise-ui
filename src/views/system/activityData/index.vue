<template>
  <div class="page-panel">
    <!-- 页面头部 -->
    <div class="page-head">
      <div>
        <h1>活动数据</h1>
        <p>管理排放源活动数据，记录能源消耗、物料使用等原始活动水平数据，支持数据校验与审核。</p>
      </div>
      <div class="btns">
        <el-button @click="handleExport" v-hasPermi="['system:activityData:export']" icon="Download">导出</el-button>
        <el-button type="primary" @click="handleAdd" v-hasPermi="['system:activityData:add']" icon="Plus">新增活动数据</el-button>
      </div>
    </div>

    <div class="panel">
      <!-- 搜索栏 -->
      <div class="search-bar wide" v-show="showSearch">
        <div class="search-item">
          <label>排放源ID</label>
          <el-input v-model="queryParams.sourceId" placeholder="请输入排放源ID" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>数据期间</label>
          <el-input v-model="queryParams.dataPeriod" placeholder="请输入数据期间(YYYY-MM)" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>数据年份</label>
          <el-input v-model="queryParams.dataYear" placeholder="请输入数据年份" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>数据类型</label>
          <el-input v-model="queryParams.dataType" placeholder="原始数据/计算值" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>校验状态</label>
          <el-input v-model="queryParams.verificationStatus" placeholder="0待校验 1已校验 2已退回" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-actions">
          <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
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
          <el-button type="primary" icon="Plus" @click="handleAdd" v-hasPermi="['system:activityData:add']">新增</el-button>
          <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['system:activityData:remove']">删除</el-button>
          <el-button icon="Download" @click="handleExport" v-hasPermi="['system:activityData:export']">导出</el-button>
        </div>
        <span class="select-count" v-if="ids.length > 0">已选 {{ ids.length }} 项</span>
      </div>

      <!-- 数据表格 -->
      <el-table v-loading="loading" :data="activityDataList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="42" align="center" />
        <el-table-column label="排放源ID" align="center" prop="sourceId" />
        <el-table-column label="数据期间" align="center" prop="dataPeriod" />
        <el-table-column label="数据年份" align="center" prop="dataYear" />
        <el-table-column label="活动数据值" align="center" prop="activityValue" />
        <el-table-column label="活动数据单位" align="center" prop="activityUnit" />
        <el-table-column label="数据类型" align="center" prop="dataType" />
        <el-table-column label="数据来源说明" align="center" prop="dataSource" :show-overflow-tooltip="true" />
        <el-table-column label="计算公式" align="center" prop="calculationFormula" :show-overflow-tooltip="true" />
        <el-table-column label="排放量计算结果" align="center" prop="emissionResult" />
        <el-table-column label="校验状态" align="center" prop="verificationStatus">
          <template #default="scope">
            <span class="tag" :class="scope.row.verificationStatus === '0' ? 'ok' : scope.row.verificationStatus === '1' ? 'ok' : 'gray'">
              {{ scope.row.verificationStatus === '0' ? '待校验' : scope.row.verificationStatus === '1' ? '已校验' : '已退回' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="扩展字段" align="center" prop="extendJson" :show-overflow-tooltip="true" />
        <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
        <el-table-column label="操作" align="center" width="150" fixed="right">
          <template #default="scope">
            <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:activityData:edit']">编辑</el-button>
            <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:activityData:remove']">删除</el-button>
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
      :close-on-click-modal="false"
    >
      <el-form ref="activityDataFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="排放源ID" prop="sourceId">
          <el-input v-model="form.sourceId" placeholder="请输入排放源ID" />
        </el-form-item>
        <el-form-item label="数据期间" prop="dataPeriod">
          <el-input v-model="form.dataPeriod" placeholder="请输入数据期间(YYYY-MM)" />
        </el-form-item>
        <el-form-item label="数据年份" prop="dataYear">
          <el-input v-model="form.dataYear" placeholder="请输入数据年份" />
        </el-form-item>
        <el-form-item label="活动数据值" prop="activityValue">
          <el-input v-model="form.activityValue" placeholder="请输入活动数据值" />
        </el-form-item>
        <el-form-item label="活动数据单位" prop="activityUnit">
          <el-input v-model="form.activityUnit" placeholder="请输入活动数据单位" />
        </el-form-item>
        <el-form-item label="数据类型" prop="dataType">
          <el-select v-model="form.dataType" placeholder="请选择数据类型" clearable class="w-full">
            <el-option label="原始数据" value="原始数据" />
            <el-option label="计算值" value="计算值" />
          </el-select>
        </el-form-item>
        <el-form-item label="数据来源说明" prop="dataSource">
          <el-input v-model="form.dataSource" placeholder="请输入数据来源说明" />
        </el-form-item>
        <el-form-item label="计算公式" prop="calculationFormula">
          <el-input v-model="form.calculationFormula" type="textarea" placeholder="请输入计算公式" />
        </el-form-item>
        <el-form-item label="排放量计算结果" prop="emissionResult">
          <el-input v-model="form.emissionResult" placeholder="请输入排放量计算结果(tCO2e)" />
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

<script setup name="ActivityData" lang="ts">
import { listActivityData, getActivityData, delActivityData, addActivityData, updateActivityData } from '@/api/system/activityData';
import { ActivityDataVO, ActivityDataQuery, ActivityDataForm } from '@/api/system/activityData/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const activityDataList = ref<ActivityDataVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const activityDataFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: ActivityDataForm = {
  id: undefined,
  sourceId: undefined,
  dataPeriod: undefined,
  dataYear: undefined,
  activityValue: undefined,
  activityUnit: undefined,
  dataType: undefined,
  dataSource: undefined,
  calculationFormula: undefined,
  emissionResult: undefined,
  verificationStatus: undefined,
  extendJson: undefined,
  remark: undefined,
}
const data = reactive<PageData<ActivityDataForm, ActivityDataQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    sourceId: undefined,
    dataPeriod: undefined,
    dataYear: undefined,
    activityValue: undefined,
    activityUnit: undefined,
    dataType: undefined,
    dataSource: undefined,
    calculationFormula: undefined,
    emissionResult: undefined,
    verificationStatus: undefined,
    extendJson: undefined,
    params: {
    }
  },
  rules: {
    sourceId: [
      { required: true, message: "排放源ID不能为空", trigger: "blur" }
    ],
    dataPeriod: [
      { required: true, message: "数据期间不能为空", trigger: "blur" }
    ],
    dataYear: [
      { required: true, message: "数据年份不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询活动数据列表 */
const getList = async () => {
  loading.value = true;
  const res = await listActivityData(queryParams.value);
  activityDataList.value = res.rows;
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
  activityDataFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: ActivityDataVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "新增活动数据";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: ActivityDataVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getActivityData(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改活动数据";
}

/** 提交按钮 */
const submitForm = () => {
  activityDataFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateActivityData(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addActivityData(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: ActivityDataVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除活动数据编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delActivityData(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('system/activityData/export', {
    ...queryParams.value
  }, `activityData_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
