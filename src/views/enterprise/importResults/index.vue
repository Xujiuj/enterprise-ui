<template>
  <div class="p-2 enterprise-import-results">
    <el-card shadow="never">
      <template #header>
        <div class="card-head">
          <div>
            <span>企业本地导入结果</span>
            <p>读取企业端 capture batch / row 接口，不请求厂商服务。</p>
          </div>
          <el-button type="primary" icon="Refresh" :loading="loading" @click="loadBatches">刷新</el-button>
        </div>
      </template>

      <el-form :model="queryParams" inline>
        <el-form-item label="模板版本">
          <el-input v-model="queryParams.templateVersionId" clearable placeholder="templateVersionId" />
        </el-form-item>
        <el-form-item label="模块">
          <el-input v-model="queryParams.moduleCode" clearable placeholder="moduleCode" />
        </el-form-item>
        <el-form-item label="校验状态">
          <el-select v-model="queryParams.validationStatus" clearable placeholder="全部" style="width: 150px">
            <el-option label="通过" value="PASS" />
            <el-option label="失败" value="FAIL" />
            <el-option label="警告" value="WARN" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
          <el-button icon="RefreshLeft" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="batchList" row-key="id">
        <el-table-column prop="id" label="批次ID" width="110" />
        <el-table-column prop="moduleCode" label="模块" width="140" show-overflow-tooltip />
        <el-table-column prop="sourceMode" label="来源" width="110" />
        <el-table-column prop="batchStatus" label="批次状态" width="120">
          <template #default="scope">
            <el-tag :type="statusType(scope.row.batchStatus)" size="small">{{ scope.row.batchStatus || '-' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="validationStatus" label="校验状态" width="120">
          <template #default="scope">
            <el-tag :type="statusType(scope.row.validationStatus)" size="small">{{ scope.row.validationStatus || '-' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="submittedBy" label="提交人" width="120" />
        <el-table-column prop="submittedTime" label="提交时间" width="170" />
        <el-table-column prop="remark" label="说明" min-width="180" show-overflow-tooltip />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="scope">
            <el-button link type="primary" icon="List" @click="openRows(scope.row)">行结果</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :total="total"
        @pagination="loadBatches"
      />
    </el-card>

    <el-drawer v-model="rowDrawer.visible" :title="rowDrawer.title" size="720px" append-to-body>
      <div class="row-drawer-toolbar">
        <span>共 {{ rowTotal }} 行</span>
      </div>
      <el-table v-loading="rowLoading" :data="rowList" row-key="id">
        <el-table-column prop="sourceRowNo" label="源行号" width="90" />
        <el-table-column prop="rowStatus" label="行状态" width="120">
          <template #default="scope">
            <el-tag :type="statusType(scope.row.rowStatus)" size="small">{{ scope.row.rowStatus || '-' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="validationLevel" label="校验级别" width="120">
          <template #default="scope">
            <el-tag :type="statusType(scope.row.validationLevel)" size="small">{{ scope.row.validationLevel || '-' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" min-width="170" />
      </el-table>
      <pagination
        v-show="rowTotal > 0"
        v-model:page="rowQuery.pageNum"
        v-model:limit="rowQuery.pageSize"
        :total="rowTotal"
        @pagination="loadRows"
      />
    </el-drawer>
  </div>
</template>

<script setup name="EnterpriseImportResults" lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { listCaptureBatch } from '@/api/enterprise/captureBatch';
import type { CaptureBatchQuery, CaptureBatchVO } from '@/api/enterprise/captureBatch/types';
import { listCaptureRow } from '@/api/enterprise/captureRow';
import type { CaptureRowQuery, CaptureRowVO } from '@/api/enterprise/captureRow/types';

const loading = ref(false);
const rowLoading = ref(false);
const batchList = ref<CaptureBatchVO[]>([]);
const rowList = ref<CaptureRowVO[]>([]);
const total = ref(0);
const rowTotal = ref(0);

const queryParams = reactive<CaptureBatchQuery>({
  pageNum: 1,
  pageSize: 10,
  templateVersionId: undefined,
  moduleCode: undefined,
  validationStatus: undefined,
  params: {}
});

const rowDrawer = reactive({
  visible: false,
  title: ''
});

const rowQuery = reactive<CaptureRowQuery>({
  pageNum: 1,
  pageSize: 20,
  batchId: undefined,
  params: {}
});

const statusType = (status?: string) => {
  const normalized = String(status ?? '').toUpperCase();
  if (['SUCCESS', 'PASS', 'PASSED', 'VALID', 'DONE', 'SUBMITTED'].includes(normalized)) return 'success';
  if (['FAIL', 'FAILED', 'ERROR', 'BLOCKING', 'REJECTED'].includes(normalized)) return 'danger';
  if (['WARN', 'WARNING', 'PARTIAL'].includes(normalized)) return 'warning';
  return 'info';
};

const loadBatches = async () => {
  loading.value = true;
  try {
    const res = await listCaptureBatch(queryParams);
    batchList.value = res.rows ?? res.data ?? [];
    total.value = Number(res.total ?? batchList.value.length);
  } finally {
    loading.value = false;
  }
};

const handleQuery = () => {
  queryParams.pageNum = 1;
  loadBatches();
};

const resetQuery = () => {
  queryParams.pageNum = 1;
  queryParams.templateVersionId = undefined;
  queryParams.moduleCode = undefined;
  queryParams.validationStatus = undefined;
  loadBatches();
};

const loadRows = async () => {
  if (!rowQuery.batchId) return;
  rowLoading.value = true;
  try {
    const res = await listCaptureRow(rowQuery);
    rowList.value = res.rows ?? res.data ?? [];
    rowTotal.value = Number(res.total ?? rowList.value.length);
  } finally {
    rowLoading.value = false;
  }
};

const openRows = async (batch: CaptureBatchVO) => {
  rowDrawer.visible = true;
  rowDrawer.title = `批次 ${batch.id} 行结果`;
  rowQuery.batchId = batch.id;
  rowQuery.pageNum = 1;
  await loadRows();
};

onMounted(() => {
  loadBatches();
});
</script>

<style scoped lang="scss">
.enterprise-import-results {
  .card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;

    p {
      margin: 4px 0 0;
      color: var(--el-text-color-secondary);
      font-size: 13px;
    }
  }

  .row-drawer-toolbar {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 12px;
    color: var(--el-text-color-secondary);
    font-size: 13px;
  }
}
</style>
