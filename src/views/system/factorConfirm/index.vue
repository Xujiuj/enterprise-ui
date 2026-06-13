<template>
  <div class="page-panel">
    <!-- 页面头部 -->
    <div class="page-head">
      <div>
        <h1>排放因子确认</h1>
        <p>管理排放因子的确认流程，确保因子数据的准确性与时效性，支持版本管控与过期提醒。</p>
      </div>
      <div class="btns">
        <el-button @click="handleExport" v-hasPermi="['system:factorConfirm:export']" icon="Download">导出</el-button>
        <el-button type="primary" @click="handleAdd" v-hasPermi="['system:factorConfirm:add']" icon="Plus">新增因子确认</el-button>
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
          <label>因子编码</label>
          <el-input v-model="queryParams.factorCode" placeholder="请输入因子编码" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>因子名称</label>
          <el-input v-model="queryParams.factorName" placeholder="请输入因子名称" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>因子来源</label>
          <el-input v-model="queryParams.factorSource" placeholder="默认值/厂商API/手动录入" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>状态</label>
          <el-input v-model="queryParams.status" placeholder="0待确认 1已确认 2已过期" clearable @keyup.enter="handleQuery" />
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
          <el-button type="primary" icon="Plus" @click="handleAdd" v-hasPermi="['system:factorConfirm:add']">新增</el-button>
          <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['system:factorConfirm:remove']">删除</el-button>
          <el-button icon="Download" @click="handleExport" v-hasPermi="['system:factorConfirm:export']">导出</el-button>
        </div>
        <span class="select-count" v-if="ids.length > 0">已选 {{ ids.length }} 项</span>
      </div>

      <!-- 数据表格 -->
      <el-table v-loading="loading" :data="factorConfirmList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="42" align="center" />
        <el-table-column label="排放源ID" align="center" prop="sourceId" />
        <el-table-column label="因子编码" align="center" prop="factorCode" />
        <el-table-column label="因子名称" align="center" prop="factorName" :show-overflow-tooltip="true" />
        <el-table-column label="因子值" align="center" prop="factorValue" />
        <el-table-column label="因子单位" align="center" prop="factorUnit" />
        <el-table-column label="因子来源" align="center" prop="factorSource">
          <template #default="scope">
            <span class="tag" :class="scope.row.factorSource === '手动录入' ? 'gray' : 'ok'">
              {{ scope.row.factorSource }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="因子版本" align="center" prop="factorVersion" />
        <el-table-column label="适用年份" align="center" prop="applicableYear" />
        <el-table-column label="GWP" align="center" prop="gwpValue" />
        <el-table-column label="确认人" align="center" prop="confirmedBy" />
        <el-table-column label="确认时间" align="center" prop="confirmedTime">
          <template #default="scope">
            <span>{{ parseTime(scope.row.confirmedTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center" prop="status">
          <template #default="scope">
            <span class="tag" :class="scope.row.status === '1' ? 'ok' : scope.row.status === '0' ? 'gray' : 'error'">
              {{ scope.row.status === '0' ? '待确认' : scope.row.status === '1' ? '已确认' : '已过期' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
        <el-table-column label="操作" align="center" width="150" fixed="right">
          <template #default="scope">
            <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:factorConfirm:edit']">编辑</el-button>
            <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:factorConfirm:remove']">删除</el-button>
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
      <el-form ref="factorConfirmFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="排放源ID" prop="sourceId">
          <el-input v-model="form.sourceId" placeholder="请输入排放源ID" />
        </el-form-item>
        <el-form-item label="因子编码" prop="factorCode">
          <el-input v-model="form.factorCode" placeholder="请输入因子编码" />
        </el-form-item>
        <el-form-item label="因子名称" prop="factorName">
          <el-input v-model="form.factorName" placeholder="请输入因子名称" />
        </el-form-item>
        <el-form-item label="因子值" prop="factorValue">
          <el-input v-model="form.factorValue" placeholder="请输入因子值" />
        </el-form-item>
        <el-form-item label="因子单位" prop="factorUnit">
          <el-input v-model="form.factorUnit" placeholder="请输入因子单位" />
        </el-form-item>
        <el-form-item label="因子来源" prop="factorSource">
          <el-select v-model="form.factorSource" placeholder="请选择因子来源" clearable class="w-full">
            <el-option label="默认值" value="默认值" />
            <el-option label="厂商API" value="厂商API" />
            <el-option label="手动录入" value="手动录入" />
          </el-select>
        </el-form-item>
        <el-form-item label="因子版本" prop="factorVersion">
          <el-input v-model="form.factorVersion" placeholder="请输入因子版本" />
        </el-form-item>
        <el-form-item label="适用年份" prop="applicableYear">
          <el-input v-model="form.applicableYear" placeholder="请输入适用年份" />
        </el-form-item>
        <el-form-item label="GWP" prop="gwpValue">
          <el-input v-model="form.gwpValue" placeholder="请输入全球变暖潜势GWP" />
        </el-form-item>
        <el-form-item label="确认人" prop="confirmedBy">
          <el-input v-model="form.confirmedBy" placeholder="请输入确认人" />
        </el-form-item>
        <el-form-item label="确认时间" prop="confirmedTime">
          <el-date-picker clearable
            v-model="form.confirmedTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择确认时间" class="w-full">
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

<script setup name="FactorConfirm" lang="ts">
import { listFactorConfirm, getFactorConfirm, delFactorConfirm, addFactorConfirm, updateFactorConfirm } from '@/api/system/factorConfirm';
import { FactorConfirmVO, FactorConfirmQuery, FactorConfirmForm } from '@/api/system/factorConfirm/types';

import { useAutoQuery } from '@/hooks/useAutoQuery';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const factorConfirmList = ref<FactorConfirmVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const factorConfirmFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: FactorConfirmForm = {
  id: undefined,
  sourceId: undefined,
  factorCode: undefined,
  factorName: undefined,
  factorValue: undefined,
  factorUnit: undefined,
  factorSource: undefined,
  factorVersion: undefined,
  applicableYear: undefined,
  gwpValue: undefined,
  confirmedBy: undefined,
  confirmedTime: undefined,
  status: undefined,
  remark: undefined,
}
const data = reactive<PageData<FactorConfirmForm, FactorConfirmQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    sourceId: undefined,
    factorCode: undefined,
    factorName: undefined,
    factorValue: undefined,
    factorUnit: undefined,
    factorSource: undefined,
    factorVersion: undefined,
    applicableYear: undefined,
    gwpValue: undefined,
    confirmedBy: undefined,
    confirmedTime: undefined,
    status: undefined,
    params: {
    }
  },
  rules: {
    sourceId: [
      { required: true, message: "排放源ID不能为空", trigger: "blur" }
    ],
    factorCode: [
      { required: true, message: "因子编码不能为空", trigger: "blur" }
    ],
    factorName: [
      { required: true, message: "因子名称不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询排放因子确认列表 */
const getList = async () => {
  loading.value = true;
  const res = await listFactorConfirm(queryParams.value);
  factorConfirmList.value = res.rows;
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
  factorConfirmFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: FactorConfirmVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "新增排放因子确认";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: FactorConfirmVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getFactorConfirm(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改排放因子确认";
}

/** 提交按钮 */
const submitForm = () => {
  factorConfirmFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateFactorConfirm(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addFactorConfirm(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: FactorConfirmVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除排放因子确认编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delFactorConfirm(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('system/factorConfirm/export', {
    ...queryParams.value
  }, `factorConfirm_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});

useAutoQuery(queryParams, () => handleQuery());
</script>
