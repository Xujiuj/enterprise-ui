<template>
  <div class="page-panel">
    <!-- 页面头部 -->
    <div class="page-head">
      <div>
        <h1>提交状态跟踪</h1>
        <p>跟踪各部门的数据提交进度与审核状态，支持催办提醒与超时预警。</p>
      </div>
      <div class="btns">
        <el-button @click="handleExport" v-hasPermi="['system:submissionTracking:export']" icon="Download">导出</el-button>
        <el-button type="primary" @click="handleAdd" v-hasPermi="['system:submissionTracking:add']" icon="Plus">新增提交记录</el-button>
      </div>
    </div>

    <div class="panel">
      <!-- 搜索栏 -->
      <div class="search-bar wide" v-show="showSearch">
        <div class="search-item">
          <label>模块名称</label>
          <el-input v-model="queryParams.moduleName" placeholder="请输入模块名称" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>数据期间</label>
          <el-input v-model="queryParams.dataPeriod" placeholder="请输入数据期间" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>部门ID</label>
          <el-input v-model="queryParams.deptId" placeholder="请输入部门ID" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>责任人</label>
          <el-input v-model="queryParams.responsiblePerson" placeholder="请输入责任人" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>提交状态</label>
          <el-input v-model="queryParams.submissionStatus" placeholder="0未提交 1已提交 2已退回 3已审核" clearable @keyup.enter="handleQuery" />
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
          <el-button type="primary" icon="Plus" @click="handleAdd" v-hasPermi="['system:submissionTracking:add']">新增</el-button>
          <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['system:submissionTracking:remove']">删除</el-button>
          <el-button icon="Download" @click="handleExport" v-hasPermi="['system:submissionTracking:export']">导出</el-button>
        </div>
        <span class="select-count" v-if="ids.length > 0">已选 {{ ids.length }} 项</span>
      </div>

      <!-- 数据表格 -->
      <el-table v-loading="loading" :data="submissionTrackingList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="42" align="center" />
        <el-table-column label="模块名称" align="center" prop="moduleName" />
        <el-table-column label="数据期间" align="center" prop="dataPeriod" />
        <el-table-column label="部门ID" align="center" prop="deptId" />
        <el-table-column label="责任人" align="center" prop="responsiblePerson" />
        <el-table-column label="提交状态" align="center" prop="submissionStatus">
          <template #default="scope">
            <span class="tag" :class="scope.row.submissionStatus === '3' ? 'ok' : scope.row.submissionStatus === '2' ? 'error' : scope.row.submissionStatus === '1' ? 'ok' : 'gray'">
              {{ scope.row.submissionStatus === '0' ? '未提交' : scope.row.submissionStatus === '1' ? '已提交' : scope.row.submissionStatus === '2' ? '已退回' : '已审核' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="提交时间" align="center" prop="submittedTime">
          <template #default="scope">
            <span>{{ parseTime(scope.row.submittedTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="审核人" align="center" prop="auditedBy" />
        <el-table-column label="审核时间" align="center" prop="auditedTime">
          <template #default="scope">
            <span>{{ parseTime(scope.row.auditedTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="催办次数" align="center" prop="remindCount" />
        <el-table-column label="最近催办时间" align="center" prop="lastRemindTime">
          <template #default="scope">
            <span>{{ parseTime(scope.row.lastRemindTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
        <el-table-column label="操作" align="center" width="150" fixed="right">
          <template #default="scope">
            <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:submissionTracking:edit']">编辑</el-button>
            <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:submissionTracking:remove']">删除</el-button>
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
      <el-form ref="submissionTrackingFormRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="模块名称" prop="moduleName">
          <el-input v-model="form.moduleName" placeholder="请输入模块名称" />
        </el-form-item>
        <el-form-item label="数据期间" prop="dataPeriod">
          <el-input v-model="form.dataPeriod" placeholder="请输入数据期间" />
        </el-form-item>
        <el-form-item label="部门ID" prop="deptId">
          <el-input v-model="form.deptId" placeholder="请输入部门ID" />
        </el-form-item>
        <el-form-item label="责任人" prop="responsiblePerson">
          <el-input v-model="form.responsiblePerson" placeholder="请输入责任人" />
        </el-form-item>
        <el-form-item label="提交状态" prop="submissionStatus">
          <el-select v-model="form.submissionStatus" placeholder="请选择提交状态" clearable class="w-full">
            <el-option label="未提交" value="0" />
            <el-option label="已提交" value="1" />
            <el-option label="已退回" value="2" />
            <el-option label="已审核" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="提交时间" prop="submittedTime">
          <el-date-picker clearable
            v-model="form.submittedTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择提交时间" class="w-full">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="审核人" prop="auditedBy">
          <el-input v-model="form.auditedBy" placeholder="请输入审核人" />
        </el-form-item>
        <el-form-item label="审核时间" prop="auditedTime">
          <el-date-picker clearable
            v-model="form.auditedTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择审核时间" class="w-full">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="催办次数" prop="remindCount">
          <el-input v-model="form.remindCount" placeholder="请输入催办次数" />
        </el-form-item>
        <el-form-item label="最近催办时间" prop="lastRemindTime">
          <el-date-picker clearable
            v-model="form.lastRemindTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择最近催办时间" class="w-full">
          </el-date-picker>
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

<script setup name="SubmissionTracking" lang="ts">
import { listSubmissionTracking, getSubmissionTracking, delSubmissionTracking, addSubmissionTracking, updateSubmissionTracking } from '@/api/system/submissionTracking';
import { SubmissionTrackingVO, SubmissionTrackingQuery, SubmissionTrackingForm } from '@/api/system/submissionTracking/types';

import { useAutoQuery } from '@/hooks/useAutoQuery';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const submissionTrackingList = ref<SubmissionTrackingVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const submissionTrackingFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: SubmissionTrackingForm = {
  id: undefined,
  moduleName: undefined,
  dataPeriod: undefined,
  deptId: undefined,
  responsiblePerson: undefined,
  submissionStatus: undefined,
  submittedTime: undefined,
  auditedBy: undefined,
  auditedTime: undefined,
  remindCount: undefined,
  lastRemindTime: undefined,
  remark: undefined,
}
const data = reactive<PageData<SubmissionTrackingForm, SubmissionTrackingQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    moduleName: undefined,
    dataPeriod: undefined,
    deptId: undefined,
    responsiblePerson: undefined,
    submissionStatus: undefined,
    submittedTime: undefined,
    auditedBy: undefined,
    auditedTime: undefined,
    remindCount: undefined,
    lastRemindTime: undefined,
    params: {
    }
  },
  rules: {
    moduleName: [
      { required: true, message: "模块名称不能为空", trigger: "blur" }
    ],
    dataPeriod: [
      { required: true, message: "数据期间不能为空", trigger: "blur" }
    ],
    deptId: [
      { required: true, message: "部门ID不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询提交状态跟踪列表 */
const getList = async () => {
  loading.value = true;
  const res = await listSubmissionTracking(queryParams.value);
  submissionTrackingList.value = res.rows;
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
  submissionTrackingFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: SubmissionTrackingVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "新增提交记录";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: SubmissionTrackingVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getSubmissionTracking(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改提交记录";
}

/** 提交按钮 */
const submitForm = () => {
  submissionTrackingFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateSubmissionTracking(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addSubmissionTracking(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: SubmissionTrackingVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除提交记录编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delSubmissionTracking(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('system/submissionTracking/export', {
    ...queryParams.value
  }, `submissionTracking_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});

useAutoQuery(queryParams, () => handleQuery());
</script>
