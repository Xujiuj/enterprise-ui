<template>
  <div class="page-panel">
    <!-- 页面头部 -->
    <div class="page-head">
      <div>
        <h1>强度管理</h1>
        <p>设定与追踪碳排放强度指标，对比目标值与实际值，监控减排趋势与完成率。</p>
      </div>
      <div class="btns">
        <el-button @click="handleExport" v-hasPermi="['system:intensity:export']" icon="Download">导出</el-button>
        <el-button type="primary" @click="handleAdd" v-hasPermi="['system:intensity:add']" icon="Plus">新增强度指标</el-button>
      </div>
    </div>

    <div class="panel">
      <!-- 搜索栏 -->
      <div class="search-bar wide" v-show="showSearch">
        <div class="search-item">
          <label>强度指标编码</label>
          <el-input v-model="queryParams.intensityCode" placeholder="请输入强度指标编码" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>强度指标名称</label>
          <el-input v-model="queryParams.intensityName" placeholder="请输入强度指标名称" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>强度类型</label>
          <el-input v-model="queryParams.intensityType" placeholder="营收强度/产量强度/面积强度" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>目标年份</label>
          <el-input v-model="queryParams.targetYear" placeholder="请输入目标年份" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>趋势方向</label>
          <el-input v-model="queryParams.trendDirection" placeholder="上升/下降/持平" clearable @keyup.enter="handleQuery" />
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
          <el-button type="primary" icon="Plus" @click="handleAdd" v-hasPermi="['system:intensity:add']">新增</el-button>
          <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['system:intensity:remove']">删除</el-button>
          <el-button icon="Download" @click="handleExport" v-hasPermi="['system:intensity:export']">导出</el-button>
        </div>
        <span class="select-count" v-if="ids.length > 0">已选 {{ ids.length }} 项</span>
      </div>

      <!-- 数据表格 -->
      <el-table v-loading="loading" :data="intensityList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="42" align="center" />
        <el-table-column label="强度指标编码" align="center" prop="intensityCode" />
        <el-table-column label="强度指标名称" align="center" prop="intensityName" :show-overflow-tooltip="true" />
        <el-table-column label="强度类型" align="center" prop="intensityType" />
        <el-table-column label="目标年份" align="center" prop="targetYear" />
        <el-table-column label="目标值" align="center" prop="targetValue" />
        <el-table-column label="实际值" align="center" prop="actualValue" />
        <el-table-column label="强度单位" align="center" prop="intensityUnit" />
        <el-table-column label="完成率(%)" align="center" prop="completionRate" />
        <el-table-column label="趋势方向" align="center" prop="trendDirection">
          <template #default="scope">
            <span class="tag" :class="scope.row.trendDirection === '下降' ? 'ok' : scope.row.trendDirection === '上升' ? 'error' : 'gray'">
              {{ scope.row.trendDirection }}
            </span>
          </template>
        </el-table-column>
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
            <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:intensity:edit']">编辑</el-button>
            <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:intensity:remove']">删除</el-button>
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
      <el-form ref="intensityFormRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="强度指标编码" prop="intensityCode">
          <el-input v-model="form.intensityCode" placeholder="请输入强度指标编码" />
        </el-form-item>
        <el-form-item label="强度指标名称" prop="intensityName">
          <el-input v-model="form.intensityName" placeholder="请输入强度指标名称" />
        </el-form-item>
        <el-form-item label="强度类型" prop="intensityType">
          <el-select v-model="form.intensityType" placeholder="请选择强度类型" clearable class="w-full">
            <el-option label="营收强度" value="营收强度" />
            <el-option label="产量强度" value="产量强度" />
            <el-option label="面积强度" value="面积强度" />
          </el-select>
        </el-form-item>
        <el-form-item label="目标年份" prop="targetYear">
          <el-input v-model="form.targetYear" placeholder="请输入目标年份" />
        </el-form-item>
        <el-form-item label="目标值" prop="targetValue">
          <el-input v-model="form.targetValue" placeholder="请输入目标值" />
        </el-form-item>
        <el-form-item label="实际值" prop="actualValue">
          <el-input v-model="form.actualValue" placeholder="请输入实际值" />
        </el-form-item>
        <el-form-item label="强度单位" prop="intensityUnit">
          <el-select v-model="form.intensityUnit" placeholder="请选择强度单位" clearable class="w-full">
            <el-option label="tCO2e/万元营收" value="tCO2e/万元营收" />
            <el-option label="tCO2e/吨产品" value="tCO2e/吨产品" />
            <el-option label="tCO2e/平方米" value="tCO2e/平方米" />
          </el-select>
        </el-form-item>
        <el-form-item label="完成率(%)" prop="completionRate">
          <el-input v-model="form.completionRate" placeholder="请输入完成率(%)" />
        </el-form-item>
        <el-form-item label="趋势方向" prop="trendDirection">
          <el-select v-model="form.trendDirection" placeholder="请选择趋势方向" clearable class="w-full">
            <el-option label="上升" value="上升" />
            <el-option label="下降" value="下降" />
            <el-option label="持平" value="持平" />
          </el-select>
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

<script setup name="Intensity" lang="ts">
import { listIntensity, getIntensity, delIntensity, addIntensity, updateIntensity } from '@/api/system/intensity';
import { IntensityVO, IntensityQuery, IntensityForm } from '@/api/system/intensity/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const intensityList = ref<IntensityVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const intensityFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: IntensityForm = {
  id: undefined,
  intensityCode: undefined,
  intensityName: undefined,
  intensityType: undefined,
  targetYear: undefined,
  targetValue: undefined,
  actualValue: undefined,
  intensityUnit: undefined,
  completionRate: undefined,
  trendDirection: undefined,
  status: undefined,
  remark: undefined,
}
const data = reactive<PageData<IntensityForm, IntensityQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    intensityCode: undefined,
    intensityName: undefined,
    intensityType: undefined,
    targetYear: undefined,
    targetValue: undefined,
    actualValue: undefined,
    intensityUnit: undefined,
    completionRate: undefined,
    trendDirection: undefined,
    status: undefined,
    params: {
    }
  },
  rules: {
    intensityCode: [
      { required: true, message: "强度指标编码不能为空", trigger: "blur" }
    ],
    intensityName: [
      { required: true, message: "强度指标名称不能为空", trigger: "blur" }
    ],
    targetYear: [
      { required: true, message: "目标年份不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询强度管理列表 */
const getList = async () => {
  loading.value = true;
  const res = await listIntensity(queryParams.value);
  intensityList.value = res.rows;
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
  intensityFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: IntensityVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "新增强度指标";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: IntensityVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getIntensity(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改强度指标";
}

/** 提交按钮 */
const submitForm = () => {
  intensityFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateIntensity(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addIntensity(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: IntensityVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除强度管理编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delIntensity(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('system/intensity/export', {
    ...queryParams.value
  }, `intensity_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
