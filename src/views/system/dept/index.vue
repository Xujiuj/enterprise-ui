<template>
  <div class="p-2">
    <section class="page-head">
      <div>
        <h1>部门管理</h1>
        <p>维护公司、工厂和部门三级组织；其他业务页面统一引用此组织架构。</p>
      </div>
    </section>

    <section class="panel">
      <el-form v-show="showSearch" :model="queryParams" inline label-width="82px" class="search-bar wide">
        <el-form-item label="所属公司">
          <el-select v-model="queryParams.deptCategory" clearable filterable placeholder="请选择所属公司" class="query-medium">
            <el-option
              v-for="option in companyOptions"
              :key="String(option.value)"
              :label="companyOptionLabel(option)"
              :value="String(option.value)"
            />
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
          <el-button plain icon="Grid" @click="handleOnlineFill" v-hasPermi="['system:dept:add']">在线填报</el-button>
          <el-button plain icon="Download" @click="downloadImportTemplate" v-hasPermi="['system:dept:add']">模板下载</el-button>
          <el-button plain icon="Upload" @click="handleImport" v-hasPermi="['system:dept:add']">Excel上传</el-button>
        </div>
      </div>

      <el-table v-loading="loading" :data="deptList" row-key="deptId" :fit="false" :tree-props="{ children: 'children' }">
        <el-table-column
          prop="deptName"
          label="组织层级"
          width="360"
          align="left"
          header-align="left"
          class-name="dept-name-column"
          :show-overflow-tooltip="true"
        >
          <template #default="scope">
            <div class="dept-name-cell">
              <el-tag size="small" effect="plain" :type="deptLevelTagType(scope.row)">{{ deptLevelLabel(scope.row) }}</el-tag>
              <span class="dept-name-text">{{ scope.row.deptName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="deptCategory" label="公司编号" width="96" align="center" :show-overflow-tooltip="true">
          <template #default="scope">{{ scope.row.deptCategory || '-' }}</template>
        </el-table-column>
        <el-table-column prop="deptCategory" label="所属公司" width="240" :show-overflow-tooltip="true">
          <template #default="scope">{{ companyLabel(scope.row.deptCategory) }}</template>
        </el-table-column>
        <el-table-column label="工厂编号" width="116" align="center" :show-overflow-tooltip="true">
          <template #default="scope">{{ factoryCodeLabel(scope.row) }}</template>
        </el-table-column>
        <el-table-column label="部门编号" width="116" align="center" :show-overflow-tooltip="true">
          <template #default="scope">{{ departmentCodeLabel(scope.row) }}</template>
        </el-table-column>
        <el-table-column prop="orderNum" label="排序" width="72" align="center" />
        <el-table-column prop="status" label="状态" width="76" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === '0' ? 'success' : 'info'">{{ scope.row.status === '0' ? '正常' : '停用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="158" />
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="scope">
            <el-button
              v-if="deptLevel(scope.row) !== 'department'"
              link
              type="primary"
              icon="Plus"
              @click="handleAdd(scope.row)"
              v-hasPermi="['system:dept:add']"
              >新增</el-button
            >
            <el-button
              link
              type="primary"
              icon="Edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['system:dept:edit']"
              >编辑</el-button
            >
            <el-button
              link
              type="danger"
              icon="Delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['system:dept:remove']"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </section>

    <el-drawer v-model="dialog.visible" :title="dialog.title" size="560px" append-to-body>
      <el-form ref="deptFormRef" :model="form" :rules="rules" label-width="112px">
        <el-form-item label="所属公司" prop="deptCategory">
          <el-input v-if="organizationFormLevel === 'company'" v-model="form.deptCategory" placeholder="请输入公司编号" />
          <el-select v-else v-model="form.deptCategory" clearable filterable placeholder="请选择所属公司" class="w-full" @change="handleCompanyChange">
            <el-option
              v-for="option in companyOptions"
              :key="String(option.value)"
              :label="companyOptionLabel(option)"
              :value="String(option.value)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="公司编号">
          <el-input :model-value="form.deptCategory || '选择所属公司后自动带出'" disabled />
        </el-form-item>
        <el-form-item label="上级部门" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="parentOptions"
            :props="{ value: 'deptId', label: 'deptName', children: 'children' } as any"
            value-key="deptId"
            check-strictly
            :disabled="organizationFormLevel === 'company' || !form.deptCategory"
            :placeholder="parentPlaceholder"
            class="w-full"
          />
        </el-form-item>
        <el-form-item label="工厂编号">
          <el-input v-if="organizationFormLevel === 'factory'" v-model="form.factoryCode" placeholder="请输入工厂编号" />
          <el-input v-else :model-value="selectedFactoryCode || '选择上级工厂或部门后自动带出'" disabled />
        </el-form-item>
        <el-form-item label="部门编号">
          <el-input :model-value="form.deptId || '保存后自动生成'" disabled />
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

    <el-dialog v-model="upload.open" title="部门Excel上传" width="440px" append-to-body>
      <el-upload
        ref="uploadRef"
        :limit="1"
        accept=".xlsx"
        :headers="upload.headers"
        :action="upload.url"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">拖入Excel，或<em>选择文件</em></div>
      </el-upload>
      <template #footer>
        <el-button type="primary" :loading="upload.isUploading" @click="submitImportFile">上传</el-button>
        <el-button @click="upload.open = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Dept" lang="ts">
import { ElMessage, ElMessageBox, type FormInstance, type FormRules, type UploadFile, type UploadInstance } from 'element-plus';
import { addDept, delDept, getDept, listDept, listDeptExcludeChild, updateDept } from '@/api/system/dept';
import type { DeptForm, DeptQuery, DeptVO } from '@/api/system/dept/types';
import { loadCompanyCodeOptions, loadFactoryCodeOptions, type SelectOption } from '@/utils/enterpriseFieldOptions';
import { useAutoQuery } from '@/hooks/useAutoQuery';
import { globalHeaders } from '@/utils/request';

type DeptTreeRow = DeptVO & { children?: DeptTreeRow[] };
type DeptLevel = 'company' | 'factory' | 'department' | 'root';

const loading = ref(false);
const buttonLoading = ref(false);
const showSearch = ref(true);
const deptList = ref<DeptTreeRow[]>([]);
const flatDeptRows = ref<DeptVO[]>([]);
const parentOptions = ref<DeptTreeRow[]>([]);
const companyOptions = ref<SelectOption[]>([]);
const factoryOptions = ref<SelectOption[]>([]);
const deptFormRef = ref<FormInstance>();
const uploadRef = ref<UploadInstance>();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const upload = reactive({
  open: false,
  isUploading: false,
  headers: globalHeaders(),
  url: import.meta.env.VITE_APP_BASE_API + '/system/dept/importData'
});

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
  factoryCode: '',
  orderNum: 0,
  leader: undefined,
  phone: '',
  email: '',
  status: '0'
};

const form = ref<DeptForm>({ ...defaultForm });
const organizationFormLevel = ref<DeptLevel>('department');

const rules: FormRules = {
  deptName: [{ required: true, message: '部门名称不能为空', trigger: 'blur' }],
  deptCategory: [{ required: true, message: '请选择所属公司', trigger: 'change' }],
  parentId: [
    { required: true, message: '请选择所属工厂或上级部门', trigger: 'change' },
    {
      validator: (_rule: unknown, value: unknown, callback: (error?: Error) => void) => {
        if (Number(value ?? 0) > 0) {
          callback();
          return;
        }
        callback(new Error('部门必须归属于工厂'));
      },
      trigger: 'change'
    }
  ],
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

const optionRecord = (option?: SelectOption) => option?.record?.record ?? option?.record;

const companyOptionLabel = (option?: SelectOption) => {
  if (!option) return '';
  return String(optionRecord(option)?.companyName ?? option.label ?? '').trim();
};

const companyLabel = (value?: string) => {
  if (!value) return '-';
  const option = companyOptions.value.find((item) => String(item.value) === String(value));
  return companyOptionLabel(option) || value;
};

const rowById = (rows: DeptVO[], deptId?: string | number) => rows.find((item) => String(item.deptId) === String(deptId ?? ''));

const findFactoryNode = (row?: DeptVO, rows = flatDeptRows.value): DeptVO | undefined => {
  if (!row) return undefined;
  if (deptLevel(row, rows) === 'factory') return row;
  let current = row;
  const visited = new Set<string>();
  while (current?.parentId && Number(current.parentId) > 0 && !visited.has(String(current.parentId))) {
    visited.add(String(current.parentId));
    const parent = rowById(rows, current.parentId);
    if (!parent) return undefined;
    if (deptLevel(parent, rows) === 'factory') return parent;
    current = parent;
  }
  return undefined;
};

const factoryCodeLabel = (row: DeptVO) => {
  const factory = findFactoryNode(row);
  return String(factory?.factoryCode ?? '').trim() || '-';
};

const departmentCodeLabel = (row: DeptVO) => (deptLevel(row) === 'department' ? row.deptId || '-' : '-');

const selectedFactoryCode = computed(() => {
  const parent = rowById(flatDeptRows.value, form.value.parentId);
  if (!parent) return '';
  return String(findFactoryNode(parent)?.factoryCode ?? '').trim();
});

const parentPlaceholder = computed(() => {
  if (!form.value.deptCategory) return '请先选择所属公司';
  return '请选择所属工厂或上级部门';
});

const getRows = async (query?: DeptQuery) => {
  const res = await listDept(query);
  return ((res.rows ?? res.data ?? []) as DeptVO[]).sort((a, b) => Number(a.orderNum ?? 0) - Number(b.orderNum ?? 0));
};

const getList = async () => {
  loading.value = true;
  try {
    const rows = await getRows(queryParams);
    flatDeptRows.value = rows;
    deptList.value = buildDeptTree(rows);
  } finally {
    loading.value = false;
  }
};

const filterRowsByCompany = (rows: DeptVO[], companyCode?: string) => {
  if (!companyCode) return [];
  return rows.filter((row) => String(row.deptCategory ?? '') === String(companyCode));
};

const isCompanyNode = (row: DeptVO, rows: DeptVO[]) => {
  if (!row.deptCategory) return false;
  const parent = rows.find((item) => String(item.deptId) === String(row.parentId ?? 0));
  return !parent?.deptCategory;
};

const isFactoryNode = (row: DeptVO, rows: DeptVO[]) => {
  if (!row.deptCategory) return false;
  const parent = rows.find((item) => String(item.deptId) === String(row.parentId ?? 0));
  return !!parent && isCompanyNode(parent, rows);
};

const deptLevel = (row: DeptVO, rows = flatDeptRows.value): DeptLevel => {
  if (!row.deptCategory) return 'root';
  if (isCompanyNode(row, rows)) return 'company';
  if (isFactoryNode(row, rows)) return 'factory';
  return 'department';
};

const deptLevelLabel = (row: DeptVO) => {
  const labels: Record<DeptLevel, string> = {
    root: '根',
    company: '公司',
    factory: '工厂',
    department: '部门'
  };
  return labels[deptLevel(row)];
};

const deptLevelTagType = (row: DeptVO) => {
  const types: Record<DeptLevel, 'primary' | 'success' | 'warning' | 'info'> = {
    root: 'info',
    company: 'primary',
    factory: 'success',
    department: 'warning'
  };
  return types[deptLevel(row)];
};

const factoryRowsByCompany = (rows: DeptVO[], companyCode?: string) => {
  const companyRows = filterRowsByCompany(rows, companyCode);
  return companyRows.filter((row) => isFactoryNode(row, rows));
};

const loadParentOptions = async (companyCode?: string, excludeDeptId?: string | number) => {
  const rows = excludeDeptId ? ((await listDeptExcludeChild(excludeDeptId)).data ?? []) : await getRows({ pageNum: 1, pageSize: 1000 });
  const companyRows = filterRowsByCompany(rows as DeptVO[], companyCode);
  const factories = factoryRowsByCompany(rows as DeptVO[], companyCode);
  const factoryIds = new Set(factories.map((row) => String(row.deptId)));
  const selectableRows = companyRows.filter(
    (row) =>
      factoryIds.has(String(row.deptId)) ||
      factoryIds.has(String(row.parentId ?? 0)) ||
      factories.some((factory) =>
        String(row.ancestors ?? '')
          .split(',')
          .includes(String(factory.deptId))
      )
  );
  parentOptions.value = buildDeptTree(selectableRows);
  return factories[0]?.deptId ?? 0;
};

const reset = () => {
  form.value = { ...defaultForm };
  deptFormRef.value?.resetFields();
};

const handleQuery = () => {
  getList();
};

const handleCompanyChange = async (value: string) => {
  const defaultParentId = await loadParentOptions(value);
  form.value.parentId = defaultParentId;
  if (!defaultParentId && value) {
    ElMessage.warning('请先在部门管理中新建该公司的工厂');
  }
};

const handleAdd = async (row?: DeptVO, title = '新增部门') => {
  reset();
  const rows = await getRows({ pageNum: 1, pageSize: 1000 });
  const level = row ? deptLevel(row, rows) : 'root';
  organizationFormLevel.value = level === 'root' ? 'company' : level === 'company' ? 'factory' : 'department';
  form.value.deptCategory = row?.deptCategory || queryParams.deptCategory || '';
  if (organizationFormLevel.value === 'company') {
    const root = rows.find((item) => deptLevel(item, rows) === 'root');
    form.value.parentId = root?.deptId || 100;
    dialog.title = '新增公司';
    dialog.visible = true;
    return;
  }
  const defaultParentId = await loadParentOptions(form.value.deptCategory);
  if (row) {
    form.value.parentId = row.deptId;
  } else {
    form.value.parentId = defaultParentId;
  }
  if (form.value.deptCategory && !form.value.parentId) {
    ElMessage.warning('请先在部门管理中新建该公司的工厂');
    return;
  }
  dialog.title = title;
  dialog.visible = true;
};

const handleOnlineFill = async () => {
  const rows = await getRows({ pageNum: 1, pageSize: 1000 });
  const companyCode = queryParams.deptCategory || (companyOptions.value.length === 1 ? String(companyOptions.value[0].value) : '');
  const factory = factoryRowsByCompany(rows, companyCode)[0];
  if (!factory) {
    ElMessage.warning('请先选择所属公司，并在该公司下新建工厂');
    return;
  }
  await handleAdd(factory, '部门在线填报');
};

const downloadImportTemplate = () => {
  proxy?.download('system/dept/importTemplate', {}, `部门导入模板_${new Date().getTime()}.xlsx`);
};

const handleImport = () => {
  upload.open = true;
};

const handleFileUploadProgress = () => {
  upload.isUploading = true;
};

const handleFileSuccess = async (response: { code?: number; msg?: string; data?: number }, file: UploadFile) => {
  upload.isUploading = false;
  if (response.code !== 200) {
    ElMessage.error(response.msg || '部门导入失败');
    return;
  }
  upload.open = false;
  uploadRef.value?.handleRemove(file);
  ElMessage.success(`成功导入${response.data ?? 0}个部门`);
  await getList();
};

const submitImportFile = () => {
  uploadRef.value?.submit();
};

const handleUpdate = async (row: DeptVO) => {
  reset();
  const rows = await getRows({ pageNum: 1, pageSize: 1000 });
  organizationFormLevel.value = deptLevel(row, rows);
  const res = await getDept(row.deptId);
  form.value = { ...defaultForm, ...(res.data ?? row) };
  await loadParentOptions(form.value.deptCategory, row.deptId);
  dialog.title = '编辑部门';
  dialog.visible = true;
};

const submitForm = async () => {
  await deptFormRef.value?.validate();
  if (!form.value.parentId || Number(form.value.parentId) <= 0) {
    ElMessage.warning('请选择上级组织');
    return;
  }
  if (organizationFormLevel.value === 'factory' && !String(form.value.factoryCode ?? '').trim()) {
    ElMessage.warning('请填写工厂编号');
    return;
  }
  if (organizationFormLevel.value !== 'factory') {
    form.value.factoryCode = '';
  }
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
  const [companies, factories] = await Promise.all([loadCompanyCodeOptions(), loadFactoryCodeOptions(), getList()]);
  companyOptions.value = companies;
  factoryOptions.value = factories;
};

onMounted(init);
useAutoQuery(queryParams, () => handleQuery());
</script>

<style scoped>
.dept-name-cell {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  gap: 8px;
  text-align: left;
}

.dept-name-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.dept-name-column .cell) {
  justify-content: flex-start;
  text-align: left;
}

.w-full {
  width: 100%;
}
</style>
