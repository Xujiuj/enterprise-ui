<template>
  <div class="page-panel">
    <!-- 页面头部 -->
    <div class="page-head">
      <div>
        <h1>报表模板</h1>
        <p>管理Power BI报表模板的上传、版本控制与发布，配置数据源连接参数。</p>
      </div>
      <div class="btns">
        <el-button @click="handleExport" v-hasPermi="['system:reportTemplate:export']" icon="Download">导出</el-button>
        <el-button type="primary" @click="handleAdd" v-hasPermi="['system:reportTemplate:add']" icon="Plus">新增报表模板</el-button>
      </div>
    </div>

    <div class="panel">
      <!-- 搜索栏 -->
      <div class="search-bar wide" v-show="showSearch">
        <div class="search-item">
          <label>模板编码</label>
          <el-input v-model="queryParams.templateCode" placeholder="请输入模板编码" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>模板名称</label>
          <el-input v-model="queryParams.templateName" placeholder="请输入模板名称" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>模板版本</label>
          <el-input v-model="queryParams.templateVersion" placeholder="请输入模板版本" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>模板说明</label>
          <el-input v-model="queryParams.description" placeholder="请输入模板说明" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>是否发布</label>
          <el-input v-model="queryParams.isPublished" placeholder="0草稿 1已发布" clearable @keyup.enter="handleQuery" />
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
          <el-button type="primary" icon="Plus" @click="handleAdd" v-hasPermi="['system:reportTemplate:add']">新增</el-button>
          <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['system:reportTemplate:remove']">删除</el-button>
          <el-button icon="Download" @click="handleExport" v-hasPermi="['system:reportTemplate:export']">导出</el-button>
        </div>
        <span class="select-count" v-if="ids.length > 0">已选 {{ ids.length }} 项</span>
      </div>

      <!-- 数据表格 -->
      <el-table v-loading="loading" :data="reportTemplateList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="42" align="center" />
        <el-table-column label="模板编码" align="center" prop="templateCode" />
        <el-table-column label="模板名称" align="center" prop="templateName" :show-overflow-tooltip="true" />
        <el-table-column label="模板类型" align="center" prop="templateType" />
        <el-table-column label="模板文件路径" align="center" prop="templateFile" :show-overflow-tooltip="true" />
        <el-table-column label="模板版本" align="center" prop="templateVersion" />
        <el-table-column label="模板说明" align="center" prop="description" :show-overflow-tooltip="true" />
        <el-table-column label="报表连接参数JSON" align="center" prop="rptConnectionParams" :show-overflow-tooltip="true" />
        <el-table-column label="是否发布" align="center" prop="isPublished">
          <template #default="scope">
            <span class="tag" :class="scope.row.isPublished === '1' ? 'ok' : 'gray'">
              {{ scope.row.isPublished === '1' ? '已发布' : '草稿' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="发布时间" align="center" prop="publishedTime">
          <template #default="scope">
            <span>{{ parseTime(scope.row.publishedTime, '{y}-{m}-{d}') }}</span>
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
            <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:reportTemplate:edit']">编辑</el-button>
            <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:reportTemplate:remove']">删除</el-button>
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
      <el-form ref="reportTemplateFormRef" :model="form" :rules="rules" label-width="130px">
        <el-form-item label="模板编码" prop="templateCode">
          <el-input v-model="form.templateCode" placeholder="请输入模板编码" />
        </el-form-item>
        <el-form-item label="模板名称" prop="templateName">
          <el-input v-model="form.templateName" placeholder="请输入模板名称" />
        </el-form-item>
        <el-form-item label="模板类型" prop="templateType">
          <el-select v-model="form.templateType" placeholder="请选择模板类型" clearable class="w-full">
            <el-option label="排放报告" value="排放报告" />
            <el-option label="碳足迹" value="碳足迹" />
            <el-option label="ESG" value="ESG" />
            <el-option label="自定义" value="自定义" />
          </el-select>
        </el-form-item>
        <el-form-item label="模板文件路径(.pbix)" prop="templateFile">
          <file-upload v-model="form.templateFile"/>
        </el-form-item>
        <el-form-item label="模板版本" prop="templateVersion">
          <el-input v-model="form.templateVersion" placeholder="请输入模板版本" />
        </el-form-item>
        <el-form-item label="模板说明" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入模板说明" />
        </el-form-item>
        <el-form-item label="报表连接参数JSON" prop="rptConnectionParams">
          <el-input v-model="form.rptConnectionParams" type="textarea" placeholder="请输入rpt视图/因子API连接信息" />
        </el-form-item>
        <el-form-item label="是否发布" prop="isPublished">
          <el-select v-model="form.isPublished" placeholder="请选择是否发布" clearable class="w-full">
            <el-option label="草稿" value="0" />
            <el-option label="已发布" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="发布时间" prop="publishedTime">
          <el-date-picker clearable
            v-model="form.publishedTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择发布时间" class="w-full">
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

<script setup name="ReportTemplate" lang="ts">
import { listReportTemplate, getReportTemplate, delReportTemplate, addReportTemplate, updateReportTemplate } from '@/api/system/reportTemplate';
import { ReportTemplateVO, ReportTemplateQuery, ReportTemplateForm } from '@/api/system/reportTemplate/types';

import { useAutoQuery } from '@/hooks/useAutoQuery';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const reportTemplateList = ref<ReportTemplateVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const reportTemplateFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: ReportTemplateForm = {
  id: undefined,
  templateCode: undefined,
  templateName: undefined,
  templateType: undefined,
  templateFile: undefined,
  templateVersion: undefined,
  description: undefined,
  rptConnectionParams: undefined,
  isPublished: undefined,
  publishedTime: undefined,
  status: undefined,
  remark: undefined,
}
const data = reactive<PageData<ReportTemplateForm, ReportTemplateQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    templateCode: undefined,
    templateName: undefined,
    templateType: undefined,
    templateFile: undefined,
    templateVersion: undefined,
    description: undefined,
    rptConnectionParams: undefined,
    isPublished: undefined,
    publishedTime: undefined,
    status: undefined,
    params: {
    }
  },
  rules: {
    templateCode: [
      { required: true, message: "模板编码不能为空", trigger: "blur" }
    ],
    templateName: [
      { required: true, message: "模板名称不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询报表模板列表 */
const getList = async () => {
  loading.value = true;
  const res = await listReportTemplate(queryParams.value);
  reportTemplateList.value = res.rows;
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
  reportTemplateFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: ReportTemplateVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "新增报表模板";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: ReportTemplateVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getReportTemplate(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改报表模板";
}

/** 提交按钮 */
const submitForm = () => {
  reportTemplateFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateReportTemplate(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addReportTemplate(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: ReportTemplateVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除报表模板编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delReportTemplate(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('system/reportTemplate/export', {
    ...queryParams.value
  }, `reportTemplate_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});

useAutoQuery(queryParams, () => handleQuery());
</script>
