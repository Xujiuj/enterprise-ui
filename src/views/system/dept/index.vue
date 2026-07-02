<template>
  <div class="p-2">
    <section class="page-head">
      <div>
        <h1>部门管理</h1>
        <p>维护公司、工厂和部门层级；工厂作为公司下的部门节点。</p>
      </div>
    </section>

    <section class="panel">
      <el-form v-show="showSearch" :model="queryParams" inline label-width="82px" class="search-bar wide">
        <el-form-item label="所属公司">
          <el-select v-model="queryParams.deptCategory" clearable filterable placeholder="请选择所属公司" class="query-medium">
            <el-option v-for="option in companyOptions" :key="String(option.value)" :label="companyOptionLabel(option)" :value="String(option.value)" />
          </el-select>
        </el-form-item>
        <el-form-item label="部门名称">
          <el-input v-model="queryParams.deptName" clearable placeholder="请输入部门名称" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" clearable placeholder="请选择状态" class="query-small">
            <el-option label="正常" value="0" />
            <el-option label="停用" value="1" />
          </el-select>
        </el-form-item>
        <div class="search-actions">
          <right-toolbar v-model:showSearch="showSearch" :gutter="0" @query-table="getList" />
        </div>
      </el-form>

      <div class="toolbar">
        <div class="btns">
          <el-button type="primary" plain icon="Plus" @click="handleAdd()" v-hasPermi="['system:dept:add']">新增</el-button>
        </div>
      </div>

      <el-table v-loading="loading" :data="deptList" row-key="deptId" :tree-props="{ children: 'children' }">
        <el-table-column prop="deptName" label="部门名称" min-width="180" />
        <el-table-column prop="deptCategory" label="所属公司" min-width="220" :show-overflow-tooltip="true">
          <template #default="scope">{{ companyLabel(scope.row.deptCategory) }}</template>
        </el-table-column>
        <el-table-column prop="orderNum" label="排序" width="90" align="center" />
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === '0' ? 'success' : 'info'">{{ scope.row.status === '0' ? '正常' : '停用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" width="170" fixed="right" align="center">
          <template #default="scope">
            <el-button link type="primary" icon="Plus" @click="handleAdd(scope.row)" v-hasPermi="['system:dept:add']">新增</el-button>
            <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:dept:edit']">编辑</el-button>
            <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:dept:remove']">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <el-drawer v-model="dialog.visible" :title="dialog.title" size="560px" append-to-body>
      <el-form ref="deptFormRef" :model="form" :rules="rules" label-width="112px">
        <el-form-item label="所属公司" prop="deptCategory">
          <el-select v-model="form.deptCategory" clearable filterable placeholder="请选择所属公司" class="w-full" @change="handleCompanyChange">
            <el-option v-for="option in companyOptions" :key="String(option.value)" :label="companyOptionLabel(option)" :value="String(option.value)" />
          </el-select>
        </el-form-item>
        <el-form-item label="上级部门" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="parentOptions"
            :props="{ value: 'deptId', label: 'deptName', children: 'children' } as any"
            value-key="deptId"
            check-strictly
            :disabled="!form.deptCategory"
            :placeholder="form.deptCategory ? '请选择上级部门' : '请先选择所属公司'"
            class="w-full"
          />
        </el-form-item>
        <el-form-item label="部门名称" prop="deptName">
          <el-input v-model="form.deptName" placeholder="请输入部门名称" />
        </el-form-item>
        <el-form-item label="显示排序" prop="orderNum">
          <el-input-number v-model="form.orderNum" :min="0" controls-position="right" class="w-full" />
        </el-form-item>
        <el-form-item label="负责人" prop="leader">
          <el-input v-model="form.leader" placeholder="请输入负责人用户ID" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio value="0">正常</el-radio>
            <el-radio value="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" :loading="buttonLoading" @click="submitForm">确定</el-button>
        <el-button @click="dialog.visible = false">取消</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup name="Dept" lang="ts">
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { addDept, delDept, getDept, listDept, listDeptExcludeChild, updateDept } from '@/api/system/dept';
import type { DeptForm, DeptQuery, DeptVO } from '@/api/system/dept/types';
import { loadCompanyCodeOptions, type SelectOption } from '@/utils/enterpriseFieldOptions';
import { useAutoQuery } from '@/hooks/useAutoQuery';

type DeptTreeRow = DeptVO & { children?: DeptTreeRow[] };

const loading = ref(false);
const buttonLoading = ref(false);
const showSearch = ref(true);
const deptList = ref<DeptTreeRow[]>([]);
const parentOptions = ref<DeptTreeRow[]>([]);
const companyOptions = ref<SelectOption[]>([]);
const deptFormRef = ref<FormInstance>();

const queryParams = reactive<DeptQuery>({
  pageNum: 1,
  pageSize: 1000,
  deptName: undefined,
  deptCategory: undefined,
  status: undefined
});

const dialog = reactive({
  visible: false,
  title: ''
});

const defaultForm: DeptForm = {
  parentId: 0,
  deptName: '',
  deptCategory: '',
  orderNum: 0,
  leader: undefined,
  phone: '',
  email: '',
  status: '0'
};

const form = ref<DeptForm>({ ...defaultForm });

const rules: FormRules = {
  deptName: [{ required: true, message: '部门名称不能为空', trigger: 'blur' }],
  deptCategory: [{ required: true, message: '请选择所属公司', trigger: 'change' }],
  orderNum: [{ required: true, message: '显示排序不能为空', trigger: 'blur' }]
};

const buildDeptTree = (rows: DeptVO[]) => {
  const nodeMap = new Map<string, DeptTreeRow>();
  const roots: DeptTreeRow[] = [];
  rows.forEach((row) => nodeMap.set(String(row.deptId), { ...row, children: [] }));
  nodeMap.forEach((node) => {
    const parent = nodeMap.get(String(node.parentId ?? 0));
    if (parent && node.parentId !== node.deptId) {
      parent.children?.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
};

const companyRecord = (option?: SelectOption) => option?.record?.record ?? option?.record;

const companyOptionLabel = (option?: SelectOption) => {
  if (!option) return '';
  return String(companyRecord(option)?.companyName ?? option.label ?? '').trim();
};

const companyLabel = (value?: string) => {
  if (!value) return '-';
  const option = companyOptions.value.find((item) => String(item.value) === String(value));
  return companyOptionLabel(option) || value;
};

const getRows = async (query?: DeptQuery) => {
  const res = await listDept(query);
  return ((res.rows ?? res.data ?? []) as DeptVO[]).sort((a, b) => Number(a.orderNum ?? 0) - Number(b.orderNum ?? 0));
};

const getList = async () => {
  loading.value = true;
  try {
    deptList.value = buildDeptTree(await getRows(queryParams));
  } finally {
    loading.value = false;
  }
};

const filterRowsByCompany = (rows: DeptVO[], companyCode?: string) => {
  if (!companyCode) return [];
  return rows.filter((row) => String(row.deptCategory ?? '') === String(companyCode));
};

const rootDeptIdFromRows = (rows: DeptVO[]) => {
  const root = rows.find((row) => Number(row.parentId ?? 0) === 0 && !row.deptCategory);
  return root?.deptId ?? 0;
};

const loadParentOptions = async (companyCode?: string, excludeDeptId?: string | number) => {
  const rows = excludeDeptId ? ((await listDeptExcludeChild(excludeDeptId)).data ?? []) : await getRows({ pageNum: 1, pageSize: 1000 });
  const companyRows = filterRowsByCompany(rows as DeptVO[], companyCode);
  const rootDeptId = rootDeptIdFromRows(rows as DeptVO[]);
  parentOptions.value = [{ ...defaultForm, deptId: rootDeptId, id: rootDeptId, deptName: '公司直属部门', children: buildDeptTree(companyRows) } as DeptTreeRow];
  return rootDeptId;
};

const reset = () => {
  form.value = { ...defaultForm };
  deptFormRef.value?.resetFields();
};

const handleQuery = () => {
  getList();
};

const handleCompanyChange = async (value: string) => {
  const rootDeptId = await loadParentOptions(value);
  form.value.parentId = rootDeptId;
};

const handleAdd = async (row?: DeptVO) => {
  reset();
  form.value.parentId = row?.deptId ?? 0;
  form.value.deptCategory = row?.deptCategory || queryParams.deptCategory || '';
  const rootDeptId = await loadParentOptions(form.value.deptCategory);
  if (!row) {
    form.value.parentId = rootDeptId;
  }
  dialog.title = '新增部门';
  dialog.visible = true;
};

const handleUpdate = async (row: DeptVO) => {
  reset();
  const res = await getDept(row.deptId);
  form.value = { ...defaultForm, ...(res.data ?? row) };
  await loadParentOptions(form.value.deptCategory, row.deptId);
  dialog.title = '编辑部门';
  dialog.visible = true;
};

const submitForm = async () => {
  await deptFormRef.value?.validate();
  buttonLoading.value = true;
  try {
    if (form.value.deptId) {
      await updateDept(form.value);
      ElMessage.success('修改成功');
    } else {
      await addDept(form.value);
      ElMessage.success('新增成功');
    }
    dialog.visible = false;
    await getList();
  } finally {
    buttonLoading.value = false;
  }
};

const handleDelete = async (row: DeptVO) => {
  await ElMessageBox.confirm(`是否确认删除“${row.deptName}”？`, '系统提示', { type: 'warning' });
  await delDept(row.deptId);
  ElMessage.success('删除成功');
  await getList();
};

const init = async () => {
  companyOptions.value = await loadCompanyCodeOptions();
  await getList();
};

onMounted(init);
useAutoQuery(queryParams, () => handleQuery());
</script>
