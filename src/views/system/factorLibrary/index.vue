<template>
  <div class="page-panel">
    <!-- 页面头部 -->
    <div class="page-head">
      <div>
        <h1>因子库</h1>
        <p>维护碳排放因子标准库，按分类与区域管理因子值，支持 IPCC、国家发改委、国际能源署等多数据源。</p>
      </div>
      <div class="btns">
        <el-button @click="handleExport" v-hasPermi="['system:factorLibrary:export']" icon="Download">导出</el-button>
        <el-button type="primary" @click="handleAdd" v-hasPermi="['system:factorLibrary:add']" icon="Plus">新增因子</el-button>
      </div>
    </div>

    <div class="panel">
      <!-- 搜索栏 -->
      <div class="search-bar wide" v-show="showSearch">
        <div class="search-item">
          <label>因子编码</label>
          <el-input v-model="queryParams.factorCode" placeholder="请输入因子编码" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>因子名称</label>
          <el-input v-model="queryParams.factorName" placeholder="请输入因子名称" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>因子分类</label>
          <el-input v-model="queryParams.factorCategory" placeholder="电力/热力/燃料/交通/废弃物/制冷剂" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>适用区域</label>
          <el-input v-model="queryParams.region" placeholder="全国/华东/华北/华南/华中/西北/西南/东北" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>数据来源</label>
          <el-input v-model="queryParams.dataSource" placeholder="IPCC/国家发改委/国际能源署" clearable @keyup.enter="handleQuery" />
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
          <el-button type="primary" icon="Plus" @click="handleAdd" v-hasPermi="['system:factorLibrary:add']">新增</el-button>
          <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['system:factorLibrary:remove']">删除</el-button>
          <el-button icon="Download" @click="handleExport" v-hasPermi="['system:factorLibrary:export']">导出</el-button>
        </div>
        <span class="select-count" v-if="ids.length > 0">已选 {{ ids.length }} 项</span>
      </div>

      <!-- 数据表格 -->
      <el-table v-loading="loading" :data="factorLibraryList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="42" align="center" />
        <el-table-column label="因子编码" align="center" prop="factorCode" />
        <el-table-column label="因子名称" align="center" prop="factorName" :show-overflow-tooltip="true" />
        <el-table-column label="因子分类" align="center" prop="factorCategory" />
        <el-table-column label="因子值" align="center" prop="factorValue" />
        <el-table-column label="因子单位" align="center" prop="factorUnit" />
        <el-table-column label="适用区域" align="center" prop="region" />
        <el-table-column label="适用年份" align="center" prop="factorYear" />
        <el-table-column label="GWP" align="center" prop="gwpValue" />
        <el-table-column label="数据来源" align="center" prop="dataSource" />
        <el-table-column label="发布状态" align="center" prop="isPublished">
          <template #default="scope">
            <span class="tag" :class="scope.row.isPublished === '1' ? 'ok' : scope.row.isPublished === '0' ? 'gray' : 'error'">
              {{ scope.row.isPublished === '0' ? '草稿' : scope.row.isPublished === '1' ? '已发布' : '已冻结' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="发布时间" align="center" prop="publishedTime">
          <template #default="scope">
            <span>{{ parseTime(scope.row.publishedTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
        <el-table-column label="操作" align="center" width="150" fixed="right">
          <template #default="scope">
            <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:factorLibrary:edit']">编辑</el-button>
            <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:factorLibrary:remove']">删除</el-button>
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
      <el-form ref="factorLibraryFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="因子编码" prop="factorCode">
          <el-input v-model="form.factorCode" placeholder="请输入因子编码" />
        </el-form-item>
        <el-form-item label="因子名称" prop="factorName">
          <el-input v-model="form.factorName" placeholder="请输入因子名称" />
        </el-form-item>
        <el-form-item label="因子分类" prop="factorCategory">
          <el-select v-model="form.factorCategory" placeholder="请选择因子分类" clearable class="w-full">
            <el-option label="电力" value="电力" />
            <el-option label="热力" value="热力" />
            <el-option label="燃料" value="燃料" />
            <el-option label="交通" value="交通" />
            <el-option label="废弃物" value="废弃物" />
            <el-option label="制冷剂" value="制冷剂" />
          </el-select>
        </el-form-item>
        <el-form-item label="因子值" prop="factorValue">
          <el-input v-model="form.factorValue" placeholder="请输入因子值" />
        </el-form-item>
        <el-form-item label="因子单位" prop="factorUnit">
          <el-input v-model="form.factorUnit" placeholder="请输入因子单位" />
        </el-form-item>
        <el-form-item label="适用区域" prop="region">
          <el-select v-model="form.region" placeholder="请选择适用区域" clearable class="w-full">
            <el-option label="全国" value="全国" />
            <el-option label="华东" value="华东" />
            <el-option label="华北" value="华北" />
            <el-option label="华南" value="华南" />
            <el-option label="华中" value="华中" />
            <el-option label="西北" value="西北" />
            <el-option label="西南" value="西南" />
            <el-option label="东北" value="东北" />
          </el-select>
        </el-form-item>
        <el-form-item label="适用年份" prop="factorYear">
          <el-input v-model="form.factorYear" placeholder="请输入适用年份" />
        </el-form-item>
        <el-form-item label="GWP" prop="gwpValue">
          <el-input v-model="form.gwpValue" placeholder="请输入全球变暖潜势GWP" />
        </el-form-item>
        <el-form-item label="数据来源" prop="dataSource">
          <el-select v-model="form.dataSource" placeholder="请选择数据来源" clearable class="w-full">
            <el-option label="IPCC" value="IPCC" />
            <el-option label="国家发改委" value="国家发改委" />
            <el-option label="国际能源署" value="国际能源署" />
          </el-select>
        </el-form-item>
        <el-form-item label="发布状态" prop="isPublished">
          <el-input v-model="form.isPublished" placeholder="0草稿 1已发布 2已冻结" />
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

<script setup name="FactorLibrary" lang="ts">
import { listFactorLibrary, getFactorLibrary, delFactorLibrary, addFactorLibrary, updateFactorLibrary } from '@/api/system/factorLibrary';
import { FactorLibraryVO, FactorLibraryQuery, FactorLibraryForm } from '@/api/system/factorLibrary/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const factorLibraryList = ref<FactorLibraryVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const factorLibraryFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: FactorLibraryForm = {
  id: undefined,
  factorCode: undefined,
  factorName: undefined,
  factorCategory: undefined,
  factorValue: undefined,
  factorUnit: undefined,
  region: undefined,
  factorYear: undefined,
  gwpValue: undefined,
  dataSource: undefined,
  isPublished: undefined,
  publishedTime: undefined,
  remark: undefined,
}
const data = reactive<PageData<FactorLibraryForm, FactorLibraryQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    factorCode: undefined,
    factorName: undefined,
    factorCategory: undefined,
    factorValue: undefined,
    factorUnit: undefined,
    region: undefined,
    factorYear: undefined,
    gwpValue: undefined,
    dataSource: undefined,
    isPublished: undefined,
    publishedTime: undefined,
    params: {
    }
  },
  rules: {
    factorCode: [
      { required: true, message: "因子编码不能为空", trigger: "blur" }
    ],
    factorName: [
      { required: true, message: "因子名称不能为空", trigger: "blur" }
    ],
    factorValue: [
      { required: true, message: "因子值不能为空", trigger: "blur" }
    ],
    factorUnit: [
      { required: true, message: "因子单位不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询因子库列表 */
const getList = async () => {
  loading.value = true;
  const res = await listFactorLibrary(queryParams.value);
  factorLibraryList.value = res.rows;
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
  factorLibraryFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: FactorLibraryVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "新增因子";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: FactorLibraryVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getFactorLibrary(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改因子";
}

/** 提交按钮 */
const submitForm = () => {
  factorLibraryFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateFactorLibrary(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addFactorLibrary(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: FactorLibraryVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除因子库编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delFactorLibrary(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('system/factorLibrary/export', {
    ...queryParams.value
  }, `factorLibrary_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
