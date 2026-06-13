<template>
  <div class="page-panel">
    <!-- 页面头部 -->
    <div class="page-head">
      <div>
        <h1>License管理</h1>
        <p>管理License的签发、验证与生命周期，控制功能授权、设备绑定与有效期。</p>
      </div>
      <div class="btns">
        <el-button @click="handleExport" v-hasPermi="['system:license:export']" icon="Download">导出</el-button>
        <el-button type="primary" @click="handleAdd" v-hasPermi="['system:license:add']" icon="Plus">新增License</el-button>
      </div>
    </div>

    <div class="panel">
      <!-- 搜索栏 -->
      <div class="search-bar wide" v-show="showSearch">
        <div class="search-item">
          <label>License标识</label>
          <el-input v-model="queryParams.licenseId" placeholder="请输入License唯一标识" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>授权企业名称</label>
          <el-input v-model="queryParams.companyName" placeholder="请输入授权企业名称" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>版本</label>
          <el-input v-model="queryParams.edition" placeholder="基础版/标准版/专业版" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>设备指纹</label>
          <el-input v-model="queryParams.installId" placeholder="请输入设备指纹" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>状态</label>
          <el-input v-model="queryParams.status" placeholder="0待激活 1有效 2即将到期 3已过期 4已吊销" clearable @keyup.enter="handleQuery" />
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
          <el-button type="primary" icon="Plus" @click="handleAdd" v-hasPermi="['system:license:add']">新增</el-button>
          <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['system:license:remove']">删除</el-button>
          <el-button icon="Download" @click="handleExport" v-hasPermi="['system:license:export']">导出</el-button>
        </div>
        <span class="select-count" v-if="ids.length > 0">已选 {{ ids.length }} 项</span>
      </div>

      <!-- 数据表格 -->
      <el-table v-loading="loading" :data="licenseList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="42" align="center" />
        <el-table-column label="License标识" align="center" prop="licenseId" />
        <el-table-column label="授权企业名称" align="center" prop="companyName" :show-overflow-tooltip="true" />
        <el-table-column label="版本" align="center" prop="edition" />
        <el-table-column label="设备指纹" align="center" prop="installId" :show-overflow-tooltip="true" />
        <el-table-column label="签发日期" align="center" prop="issuedDate">
          <template #default="scope">
            <span>{{ parseTime(scope.row.issuedDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="有效期起" align="center" prop="validFrom">
          <template #default="scope">
            <span>{{ parseTime(scope.row.validFrom, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="有效期止" align="center" prop="validTo">
          <template #default="scope">
            <span>{{ parseTime(scope.row.validTo, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="最大用户数" align="center" prop="maxUsers" />
        <el-table-column label="状态" align="center" prop="status">
          <template #default="scope">
            <span class="tag" :class="scope.row.status === '1' ? 'ok' : scope.row.status === '2' ? 'gray' : scope.row.status === '0' ? 'gray' : 'error'">
              {{ scope.row.status === '0' ? '待激活' : scope.row.status === '1' ? '有效' : scope.row.status === '2' ? '即将到期' : scope.row.status === '3' ? '已过期' : '已吊销' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="最近校验时间" align="center" prop="lastCheckTime">
          <template #default="scope">
            <span>{{ parseTime(scope.row.lastCheckTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
        <el-table-column label="操作" align="center" width="150" fixed="right">
          <template #default="scope">
            <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:license:edit']">编辑</el-button>
            <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:license:remove']">删除</el-button>
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
      <el-form ref="licenseFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="License标识" prop="licenseId">
          <el-input v-model="form.licenseId" placeholder="请输入License唯一标识" />
        </el-form-item>
        <el-form-item label="授权企业名称" prop="companyName">
          <el-input v-model="form.companyName" placeholder="请输入授权企业名称" />
        </el-form-item>
        <el-form-item label="版本" prop="edition">
          <el-select v-model="form.edition" placeholder="请选择版本" clearable class="w-full">
            <el-option label="基础版" value="基础版" />
            <el-option label="标准版" value="标准版" />
            <el-option label="专业版" value="专业版" />
          </el-select>
        </el-form-item>
        <el-form-item label="功能清单JSON" prop="features">
          <el-input v-model="form.features" type="textarea" placeholder="请输入功能清单JSON" />
        </el-form-item>
        <el-form-item label="设备指纹" prop="installId">
          <el-input v-model="form.installId" placeholder="请输入设备指纹" />
        </el-form-item>
        <el-form-item label="签发日期" prop="issuedDate">
          <el-date-picker clearable
            v-model="form.issuedDate"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择签发日期" class="w-full">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="有效期起" prop="validFrom">
          <el-date-picker clearable
            v-model="form.validFrom"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择有效期起" class="w-full">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="有效期止" prop="validTo">
          <el-date-picker clearable
            v-model="form.validTo"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择有效期止" class="w-full">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="最大用户数" prop="maxUsers">
          <el-input v-model="form.maxUsers" placeholder="请输入最大用户数(-1不限)" />
        </el-form-item>
        <el-form-item label="最近校验时间" prop="lastCheckTime">
          <el-date-picker clearable
            v-model="form.lastCheckTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择最近校验时间" class="w-full">
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

<script setup name="License" lang="ts">
import { listLicense, getLicense, delLicense, addLicense, updateLicense } from '@/api/system/license';
import { LicenseVO, LicenseQuery, LicenseForm } from '@/api/system/license/types';

import { useAutoQuery } from '@/hooks/useAutoQuery';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const licenseList = ref<LicenseVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const licenseFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: LicenseForm = {
  id: undefined,
  licenseId: undefined,
  companyName: undefined,
  edition: undefined,
  features: undefined,
  installId: undefined,
  issuedDate: undefined,
  validFrom: undefined,
  validTo: undefined,
  maxUsers: undefined,
  status: undefined,
  lastCheckTime: undefined,
  remark: undefined,
}
const data = reactive<PageData<LicenseForm, LicenseQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    licenseId: undefined,
    companyName: undefined,
    edition: undefined,
    features: undefined,
    installId: undefined,
    issuedDate: undefined,
    validFrom: undefined,
    validTo: undefined,
    maxUsers: undefined,
    status: undefined,
    lastCheckTime: undefined,
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

/** 查询License列表 */
const getList = async () => {
  loading.value = true;
  const res = await listLicense(queryParams.value);
  licenseList.value = res.rows;
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
  licenseFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: LicenseVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "新增License";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: LicenseVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getLicense(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改License";
}

/** 提交按钮 */
const submitForm = () => {
  licenseFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateLicense(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addLicense(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: LicenseVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除License编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delLicense(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('system/license/export', {
    ...queryParams.value
  }, `license_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});

useAutoQuery(queryParams, () => handleQuery());
</script>
