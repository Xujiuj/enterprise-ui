<template>
  <div class="p-2 enterprise-reports-page">
    <section class="page-head">
      <div>
        <h1>报表内容目录</h1>
        <p>维护企业本地报表目录，企业可按自身口径调整，不影响厂商端配置。</p>
      </div>
      <div class="page-actions">
        <el-button icon="Refresh" :loading="loading" @click="loadContent">刷新</el-button>
        <el-button type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
        <el-button type="success" plain icon="Connection" :loading="syncing" @click="handleSync">补充厂商目录</el-button>
      </div>
    </section>

    <section class="content-grid">
      <aside class="directory-list">
        <button type="button" :class="{ active: activeDirectoryKey === '' }" @click="activeDirectoryKey = ''">
          <span class="directory-no">全</span>
          <span>全部目录</span>
        </button>
        <button
          v-for="directory in directories"
          :key="directory.key"
          type="button"
          :class="{ active: directory.key === activeDirectoryKey }"
          @click="activeDirectoryKey = directory.key"
        >
          <span class="directory-no">{{ formatNo(directory.no) }}</span>
          <span>{{ stripLeadingDirectoryNo(directory.name) }}</span>
        </button>
      </aside>

      <main class="content-table">
        <div class="toolbar">
          <el-button type="danger" plain icon="Delete" :disabled="selectedIds.length === 0" @click="handleDelete()">删除</el-button>
        </div>
        <el-table v-loading="loading" :data="activeRows" row-key="id" border @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="目录" min-width="180" show-overflow-tooltip>
            <template #default="{ row }">
              {{ formatDirectory(row) }}
            </template>
          </el-table-column>
          <el-table-column label="子目录" min-width="220" show-overflow-tooltip>
            <template #default="{ row }">
              {{ formatSubdirectory(row) }}
            </template>
          </el-table-column>
          <el-table-column label="排序" prop="displayOrder" width="90" align="center" />
          <el-table-column label="备注" prop="remark" min-width="220" show-overflow-tooltip />
          <el-table-column label="操作" align="center" width="210" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" icon="View" @click="openDetail(row)">详情</el-button>
              <el-button link type="primary" icon="Edit" @click="handleUpdate(row)">编辑</el-button>
              <el-button link type="danger" icon="Delete" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </main>
    </section>

    <el-drawer v-model="formDrawer.visible" :title="formDrawer.title" size="560px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="96px">
        <el-form-item label="目录序号" prop="directoryNo">
          <el-input-number v-model="form.directoryNo" class="w-full" :min="1" :precision="0" controls-position="right" />
        </el-form-item>
        <el-form-item label="目录名称" prop="directoryName">
          <el-input v-model="form.directoryName" placeholder="请输入目录名称" maxlength="128" />
        </el-form-item>
        <el-form-item label="子目录序号" prop="subdirectoryNo">
          <el-input-number v-model="form.subdirectoryNo" class="w-full" :min="1" :precision="0" controls-position="right" />
        </el-form-item>
        <el-form-item label="子目录名称" prop="subdirectoryName">
          <el-input v-model="form.subdirectoryName" placeholder="请输入子目录名称" maxlength="128" />
        </el-form-item>
        <el-form-item label="排序" prop="displayOrder">
          <el-input-number v-model="form.displayOrder" class="w-full" :min="0" :precision="0" controls-position="right" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="4" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formDrawer.visible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitForm">确定</el-button>
      </template>
    </el-drawer>

    <el-drawer v-model="detailDrawer.visible" title="报表内容详情" size="480px" append-to-body>
      <el-descriptions v-if="detailRecord" :column="1" border>
        <el-descriptions-item label="目录">{{ formatDirectory(detailRecord) }}</el-descriptions-item>
        <el-descriptions-item label="子目录">{{ formatSubdirectory(detailRecord) }}</el-descriptions-item>
        <el-descriptions-item label="排序">{{ detailRecord.displayOrder ?? 0 }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ detailRecord.remark || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-drawer>
  </div>
</template>

<script setup name="EnterpriseReports" lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  addReportContent,
  deleteReportContent,
  getReportContent,
  listReportContent,
  syncReportContent,
  updateReportContent
} from '@/api/enterprise/reportContent';
import type { ReportContentForm, ReportContentVO } from '@/api/enterprise/reportContent/types';

interface DirectoryItem {
  key: string;
  no?: number;
  name: string;
}

const loading = ref(false);
const syncing = ref(false);
const submitLoading = ref(false);
const rows = ref<ReportContentVO[]>([]);
const selectedIds = ref<Array<string | number>>([]);
const activeDirectoryKey = ref('');
const formRef = ref<FormInstance>();
const formDrawer = reactive({ visible: false, title: '' });
const detailDrawer = reactive({ visible: false });
const detailRecord = ref<ReportContentVO>();

const form = reactive<ReportContentForm>({
  id: undefined,
  directoryNo: 1,
  directoryName: '',
  subdirectoryNo: 1,
  subdirectoryName: '',
  displayOrder: 0,
  remark: ''
});

const rules: FormRules<ReportContentForm> = {
  directoryNo: [{ required: true, message: '目录序号不能为空', trigger: 'change' }],
  directoryName: [{ required: true, message: '目录名称不能为空', trigger: 'blur' }],
  subdirectoryNo: [{ required: true, message: '子目录序号不能为空', trigger: 'change' }],
  subdirectoryName: [{ required: true, message: '子目录名称不能为空', trigger: 'blur' }]
};

const unwrapRows = (response: { data?: ReportContentVO[]; rows?: ReportContentVO[] }): ReportContentVO[] => {
  return response.data ?? response.rows ?? [];
};

const directoryKey = (row: ReportContentVO) => `${row.directoryNo ?? ''}-${row.directoryName ?? ''}`;

const formatNo = (value?: number) => (value == null ? '' : String(Number(value)));

const stripLeadingDirectoryNo = (value?: string) =>
  String(value || '-')
    .replace(/^\s*\d+\s*/, '')
    .trim() || '-';

const stripLeadingSubdirectoryNo = (value?: string) =>
  String(value || '-')
    .replace(/^\s*\d+(?:\.\d+)?\s*/, '')
    .trim() || '-';

const formatDirectory = (row: ReportContentVO) => {
  const no = row.directoryNo == null ? '-' : Number(row.directoryNo);
  return `${no} ${stripLeadingDirectoryNo(row.directoryName)}`;
};

const formatSubdirectory = (row: ReportContentVO) => {
  if (row.directoryNo == null || row.subdirectoryNo == null) {
    return stripLeadingSubdirectoryNo(row.subdirectoryName);
  }
  return `${Number(row.directoryNo)}.${Number(row.subdirectoryNo)} ${stripLeadingSubdirectoryNo(row.subdirectoryName)}`;
};

const directories = computed<DirectoryItem[]>(() => {
  const seen = new Map<string, DirectoryItem>();
  rows.value.forEach((row) => {
    const key = directoryKey(row);
    if (!seen.has(key)) {
      seen.set(key, {
        key,
        no: row.directoryNo,
        name: row.directoryName || '-'
      });
    }
  });
  return Array.from(seen.values());
});

const activeRows = computed(() => {
  if (!activeDirectoryKey.value) {
    return rows.value;
  }
  return rows.value.filter((row) => directoryKey(row) === activeDirectoryKey.value);
});

const resetForm = () => {
  form.id = undefined;
  form.directoryNo = 1;
  form.directoryName = '';
  form.subdirectoryNo = 1;
  form.subdirectoryName = '';
  form.displayOrder = 0;
  form.remark = '';
  formRef.value?.clearValidate();
};

const assignForm = (record: ReportContentVO) => {
  form.id = record.id;
  form.directoryNo = record.directoryNo;
  form.directoryName = record.directoryName || '';
  form.subdirectoryNo = record.subdirectoryNo;
  form.subdirectoryName = record.subdirectoryName || '';
  form.displayOrder = record.displayOrder ?? 0;
  form.remark = record.remark || '';
};

const loadContent = async () => {
  loading.value = true;
  try {
    rows.value = unwrapRows(await listReportContent());
    if (activeDirectoryKey.value && !directories.value.some((item) => item.key === activeDirectoryKey.value)) {
      activeDirectoryKey.value = '';
    }
  } finally {
    loading.value = false;
  }
};

const handleAdd = () => {
  resetForm();
  formDrawer.title = '新增报表内容';
  formDrawer.visible = true;
};

const handleUpdate = async (row: ReportContentVO) => {
  const response = await getReportContent(row.id);
  assignForm(response.data || row);
  formDrawer.title = '编辑报表内容';
  formDrawer.visible = true;
};

const submitForm = async () => {
  await formRef.value?.validate();
  submitLoading.value = true;
  try {
    if (form.id) {
      await updateReportContent(form);
      ElMessage.success('修改成功');
    } else {
      await addReportContent(form);
      ElMessage.success('新增成功');
    }
    formDrawer.visible = false;
    await loadContent();
  } finally {
    submitLoading.value = false;
  }
};

const handleSelectionChange = (selection: ReportContentVO[]) => {
  selectedIds.value = selection.map((item) => item.id);
};

const handleDelete = async (row?: ReportContentVO) => {
  const ids = row ? [row.id] : selectedIds.value;
  if (ids.length === 0) {
    return;
  }
  await ElMessageBox.confirm('确认删除选中的报表内容吗？', '删除确认', { type: 'warning' });
  await deleteReportContent(ids);
  ElMessage.success('删除成功');
  selectedIds.value = [];
  await loadContent();
};

const openDetail = (row: ReportContentVO) => {
  detailRecord.value = row;
  detailDrawer.visible = true;
};

const handleSync = async () => {
  syncing.value = true;
  try {
    const response = await syncReportContent();
    const count = response.data?.contentCount ?? 0;
    await loadContent();
    ElMessage.success(`已补充 ${count} 条厂商目录，已有企业配置未被覆盖`);
  } finally {
    syncing.value = false;
  }
};

onMounted(loadContent);
</script>

<style scoped lang="scss">
.enterprise-reports-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;

  h1 {
    margin: 0 0 6px;
    font-size: 22px;
    font-weight: 650;
  }

  p {
    margin: 0;
    color: var(--el-text-color-secondary);
  }
}

.page-actions,
.toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(220px, 300px) minmax(0, 1fr);
  gap: 16px;
  min-height: 520px;
}

.directory-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  background: var(--el-bg-color);

  button {
    display: grid;
    grid-template-columns: 32px minmax(0, 1fr);
    align-items: center;
    gap: 10px;
    width: 100%;
    min-height: 40px;
    padding: 8px 10px;
    border: 1px solid transparent;
    border-radius: 6px;
    background: transparent;
    color: var(--el-text-color-primary);
    text-align: left;
    cursor: pointer;
  }

  button.active {
    border-color: var(--el-color-primary-light-7);
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
  }
}

.directory-no {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--el-fill-color-light);
  font-weight: 650;
}

.content-table {
  min-width: 0;
}

.toolbar {
  margin-bottom: 10px;
}

.w-full {
  width: 100%;
}

@media (max-width: 900px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>
