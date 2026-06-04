<template>
  <div class="page-panel">
    <!-- 页面头部 -->
    <div class="page-head">
      <div>
        <h1>License运行状态</h1>
        <p>监控License运行时状态，记录心跳、系统时间与操作计数，检测篡改行为。</p>
      </div>
      <div class="btns">
        <el-button @click="handleExport" v-hasPermi="['system:licenseState:export']" icon="Download">导出</el-button>
        <el-button type="primary" @click="handleAdd" v-hasPermi="['system:licenseState:add']" icon="Plus">新增运行状态</el-button>
      </div>
    </div>

    <div class="panel">
      <!-- 搜索栏 -->
      <div class="search-bar wide" v-show="showSearch">
        <div class="search-item">
          <label>License标识</label>
          <el-input v-model="queryParams.licenseId" placeholder="请输入License标识" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>最后心跳时间</label>
          <el-date-picker clearable v-model="queryParams.lastHeartbeat" type="date" value-format="YYYY-MM-DD" placeholder="请选择最后心跳时间" />
        </div>
        <div class="search-item">
          <label>系统时间</label>
          <el-date-picker clearable v-model="queryParams.lastSystemTime" type="date" value-format="YYYY-MM-DD" placeholder="请选择系统时间" />
        </div>
        <div class="search-item">
          <label>操作计数</label>
          <el-input v-model="queryParams.operationCount" placeholder="请输入操作计数" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>是否被篡改</label>
          <el-input v-model="queryParams.isTampered" placeholder="0否 1是" clearable @keyup.enter="handleQuery" />
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
          <el-button type="primary" icon="Plus" @click="handleAdd" v-hasPermi="['system:licenseState:add']">新增</el-button>
          <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['system:licenseState:remove']">删除</el-button>
          <el-button icon="Download" @click="handleExport" v-hasPermi="['system:licenseState:export']">导出</el-button>
        </div>
        <span class="select-count" v-if="ids.length > 0">已选 {{ ids.length }} 项</span>
      </div>

      <!-- 数据表格 -->
      <el-table v-loading="loading" :data="licenseStateList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="42" align="center" />
        <el-table-column label="License标识" align="center" prop="licenseId" />
        <el-table-column label="最后心跳时间" align="center" prop="lastHeartbeat">
          <template #default="scope">
            <span>{{ parseTime(scope.row.lastHeartbeat, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="系统时间(防回拨)" align="center" prop="lastSystemTime">
          <template #default="scope">
            <span>{{ parseTime(scope.row.lastSystemTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作计数" align="center" prop="operationCount" />
        <el-table-column label="是否被篡改" align="center" prop="isTampered">
          <template #default="scope">
            <span class="tag" :class="scope.row.isTampered === '1' ? 'error' : 'ok'">
              {{ scope.row.isTampered === '1' ? '是' : '否' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
        <el-table-column label="操作" align="center" width="150" fixed="right">
          <template #default="scope">
            <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:licenseState:edit']">编辑</el-button>
            <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:licenseState:remove']">删除</el-button>
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
      <el-form ref="licenseStateFormRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="License标识" prop="licenseId">
          <el-input v-model="form.licenseId" placeholder="请输入License标识" />
        </el-form-item>
        <el-form-item label="最后心跳时间" prop="lastHeartbeat">
          <el-date-picker clearable
            v-model="form.lastHeartbeat"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择最后心跳时间" class="w-full">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="系统时间(防回拨)" prop="lastSystemTime">
          <el-date-picker clearable
            v-model="form.lastSystemTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择系统时间" class="w-full">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="操作计数" prop="operationCount">
          <el-input v-model="form.operationCount" placeholder="请输入操作计数" />
        </el-form-item>
        <el-form-item label="是否被篡改" prop="isTampered">
          <el-select v-model="form.isTampered" placeholder="请选择是否被篡改" clearable class="w-full">
            <el-option label="否" value="0" />
            <el-option label="是" value="1" />
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

<script setup name="LicenseState" lang="ts">
import { listLicenseState, getLicenseState, delLicenseState, addLicenseState, updateLicenseState } from '@/api/system/licenseState';
import { LicenseStateVO, LicenseStateQuery, LicenseStateForm } from '@/api/system/licenseState/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const licenseStateList = ref<LicenseStateVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const licenseStateFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: LicenseStateForm = {
  id: undefined,
  licenseId: undefined,
  lastHeartbeat: undefined,
  lastSystemTime: undefined,
  operationCount: undefined,
  isTampered: undefined,
  remark: undefined,
}
const data = reactive<PageData<LicenseStateForm, LicenseStateQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    licenseId: undefined,
    lastHeartbeat: undefined,
    lastSystemTime: undefined,
    operationCount: undefined,
    isTampered: undefined,
    params: {
    }
  },
  rules: {
    licenseId: [
      { required: true, message: "License标识不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询License运行状态列表 */
const getList = async () => {
  loading.value = true;
  const res = await listLicenseState(queryParams.value);
  licenseStateList.value = res.rows;
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
  licenseStateFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: LicenseStateVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "新增运行状态";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: LicenseStateVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getLicenseState(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改运行状态";
}

/** 提交按钮 */
const submitForm = () => {
  licenseStateFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateLicenseState(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addLicenseState(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: LicenseStateVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除运行状态编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delLicenseState(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('system/licenseState/export', {
    ...queryParams.value
  }, `licenseState_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
