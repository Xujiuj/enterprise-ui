<template>
  <div class="page-panel">
    <!-- 页面头部 -->
    <div class="page-head">
      <div>
        <h1>绿电绿证</h1>
        <p>管理绿电采购与绿证交易记录，追踪减排量，作为范围2间接排放的抵消凭证。</p>
      </div>
      <div class="btns">
        <el-button @click="handleExport" v-hasPermi="['system:greenElectricity:export']" icon="Download">导出</el-button>
        <el-button type="primary" @click="handleAdd" v-hasPermi="['system:greenElectricity:add']" icon="Plus">新增绿电绿证</el-button>
      </div>
    </div>

    <div class="panel">
      <!-- 搜索栏 -->
      <div class="search-bar wide" v-show="showSearch">
        <div class="search-item">
          <label>绿证编码</label>
          <el-input v-model="queryParams.certificateCode" placeholder="请输入绿证编码" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>类型</label>
          <el-input v-model="queryParams.certificateType" placeholder="绿电/绿证/碳抵消" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>购买日期</label>
          <el-date-picker clearable v-model="queryParams.purchaseDate" type="date" value-format="YYYY-MM-DD" placeholder="请选择购买日期" />
        </div>
        <div class="search-item">
          <label>供应商</label>
          <el-input v-model="queryParams.supplier" placeholder="请输入供应商" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>有效期起</label>
          <el-date-picker clearable v-model="queryParams.validFrom" type="date" value-format="YYYY-MM-DD" placeholder="请选择有效期起" />
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
          <el-button type="primary" icon="Plus" @click="handleAdd" v-hasPermi="['system:greenElectricity:add']">新增</el-button>
          <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['system:greenElectricity:remove']">删除</el-button>
          <el-button icon="Download" @click="handleExport" v-hasPermi="['system:greenElectricity:export']">导出</el-button>
        </div>
        <span class="select-count" v-if="ids.length > 0">已选 {{ ids.length }} 项</span>
      </div>

      <!-- 数据表格 -->
      <el-table v-loading="loading" :data="greenElectricityList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="42" align="center" />
        <el-table-column label="绿证编码" align="center" prop="certificateCode" />
        <el-table-column label="类型" align="center" prop="certificateType">
          <template #default="scope">
            <span class="tag" :class="scope.row.certificateType === '碳抵消' ? 'gray' : 'ok'">
              {{ scope.row.certificateType }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="购买日期" align="center" prop="purchaseDate">
          <template #default="scope">
            <span>{{ parseTime(scope.row.purchaseDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="电量(MWh)" align="center" prop="electricityAmount" />
        <el-table-column label="绿证量(张)" align="center" prop="certificateAmount" />
        <el-table-column label="单价" align="center" prop="pricePerUnit" />
        <el-table-column label="总价" align="center" prop="totalPrice" />
        <el-table-column label="供应商" align="center" prop="supplier" />
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
        <el-table-column label="减排量(tCO2e)" align="center" prop="emissionReduction" />
        <el-table-column label="扩展字段" align="center" prop="extendJson" :show-overflow-tooltip="true" />
        <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
        <el-table-column label="操作" align="center" width="150" fixed="right">
          <template #default="scope">
            <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:greenElectricity:edit']">编辑</el-button>
            <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:greenElectricity:remove']">删除</el-button>
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
      <el-form ref="greenElectricityFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="绿证编码" prop="certificateCode">
          <el-input v-model="form.certificateCode" placeholder="请输入绿证编码" />
        </el-form-item>
        <el-form-item label="类型" prop="certificateType">
          <el-select v-model="form.certificateType" placeholder="请选择类型" clearable class="w-full">
            <el-option label="绿电" value="绿电" />
            <el-option label="绿证" value="绿证" />
            <el-option label="碳抵消" value="碳抵消" />
          </el-select>
        </el-form-item>
        <el-form-item label="购买日期" prop="purchaseDate">
          <el-date-picker clearable
            v-model="form.purchaseDate"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择购买日期" class="w-full">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="电量(MWh)" prop="electricityAmount">
          <el-input v-model="form.electricityAmount" placeholder="请输入电量(MWh)" />
        </el-form-item>
        <el-form-item label="绿证量(张)" prop="certificateAmount">
          <el-input v-model="form.certificateAmount" placeholder="请输入绿证量(张)" />
        </el-form-item>
        <el-form-item label="单价" prop="pricePerUnit">
          <el-input v-model="form.pricePerUnit" placeholder="请输入单价" />
        </el-form-item>
        <el-form-item label="总价" prop="totalPrice">
          <el-input v-model="form.totalPrice" placeholder="请输入总价" />
        </el-form-item>
        <el-form-item label="供应商" prop="supplier">
          <el-input v-model="form.supplier" placeholder="请输入供应商" />
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
        <el-form-item label="减排量(tCO2e)" prop="emissionReduction">
          <el-input v-model="form.emissionReduction" placeholder="请输入减排量(tCO2e)" />
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

<script setup name="GreenElectricity" lang="ts">
import { listGreenElectricity, getGreenElectricity, delGreenElectricity, addGreenElectricity, updateGreenElectricity } from '@/api/system/greenElectricity';
import { GreenElectricityVO, GreenElectricityQuery, GreenElectricityForm } from '@/api/system/greenElectricity/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const greenElectricityList = ref<GreenElectricityVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const greenElectricityFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: GreenElectricityForm = {
  id: undefined,
  certificateCode: undefined,
  certificateType: undefined,
  purchaseDate: undefined,
  electricityAmount: undefined,
  certificateAmount: undefined,
  pricePerUnit: undefined,
  totalPrice: undefined,
  supplier: undefined,
  validFrom: undefined,
  validTo: undefined,
  emissionReduction: undefined,
  extendJson: undefined,
  remark: undefined,
}
const data = reactive<PageData<GreenElectricityForm, GreenElectricityQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    certificateCode: undefined,
    certificateType: undefined,
    purchaseDate: undefined,
    electricityAmount: undefined,
    certificateAmount: undefined,
    pricePerUnit: undefined,
    totalPrice: undefined,
    supplier: undefined,
    validFrom: undefined,
    validTo: undefined,
    emissionReduction: undefined,
    extendJson: undefined,
    params: {
    }
  },
  rules: {
    certificateCode: [
      { required: true, message: "绿证编码不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询绿电绿证列表 */
const getList = async () => {
  loading.value = true;
  const res = await listGreenElectricity(queryParams.value);
  greenElectricityList.value = res.rows;
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
  greenElectricityFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: GreenElectricityVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "新增绿电绿证";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: GreenElectricityVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getGreenElectricity(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改绿电绿证";
}

/** 提交按钮 */
const submitForm = () => {
  greenElectricityFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateGreenElectricity(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addGreenElectricity(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: GreenElectricityVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除绿电绿证编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delGreenElectricity(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('system/greenElectricity/export', {
    ...queryParams.value
  }, `greenElectricity_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
