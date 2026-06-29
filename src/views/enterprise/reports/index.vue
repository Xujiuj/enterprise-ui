<template>
  <div class="p-2 enterprise-reports-page">
    <section class="page-head">
      <h1>报表内容目录</h1>
      <div class="page-actions">
        <el-button icon="Refresh" :loading="loading" @click="loadContent">刷新</el-button>
        <el-button type="success" plain icon="RefreshRight" :loading="syncing" @click="handleSync">同步厂商配置</el-button>
      </div>
    </section>

    <section class="content-grid">
      <aside class="directory-list">
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
        <el-table v-loading="loading" :data="activeRows" row-key="id" border>
          <el-table-column label="子目录序号" width="120">
            <template #default="scope">
              {{ formatSubdirectoryNo(scope.row) }}
            </template>
          </el-table-column>
          <el-table-column label="子目录" min-width="180" show-overflow-tooltip>
            <template #default="scope">
              {{ stripLeadingSubdirectoryNo(scope.row.subdirectoryName) }}
            </template>
          </el-table-column>
          <el-table-column label="页面图表" min-width="420">
            <template #default="scope">
              <ul class="chart-list">
                <li v-for="chart in splitCharts(scope.row.chartNames)" :key="chart">{{ chart }}</li>
              </ul>
            </template>
          </el-table-column>
        </el-table>
      </main>
    </section>
  </div>
</template>

<script setup name="EnterpriseReports" lang="ts">
import { computed, onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { listReportContent, syncReportContent } from '@/api/enterprise/reportContent';
import type { ReportContentVO } from '@/api/enterprise/reportContent/types';

interface DirectoryItem {
  key: string;
  no?: number;
  name: string;
}

const loading = ref(false);
const syncing = ref(false);
const rows = ref<ReportContentVO[]>([]);
const activeDirectoryKey = ref('');

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

const formatSubdirectoryNo = (row: ReportContentVO) => {
  if (row.directoryNo == null || row.subdirectoryNo == null) {
    return '';
  }
  const rawName = String(row.subdirectoryName || '');
  const match = rawName.match(/^\s*(\d+\.\d+)/);
  return match?.[1] || `${Number(row.directoryNo)}.${Number(row.subdirectoryNo)}`;
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

const activeRows = computed(() => rows.value.filter((row) => directoryKey(row) === activeDirectoryKey.value));

const splitCharts = (value?: string) =>
  String(value || '')
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

const loadContent = async () => {
  loading.value = true;
  try {
    rows.value = unwrapRows(await listReportContent());
    if (!activeDirectoryKey.value || !directories.value.some((item) => item.key === activeDirectoryKey.value)) {
      activeDirectoryKey.value = directories.value[0]?.key || '';
    }
  } finally {
    loading.value = false;
  }
};

const handleSync = async () => {
  syncing.value = true;
  try {
    const response = await syncReportContent();
    const count = response.data?.contentCount ?? 0;
    await loadContent();
    ElMessage.success(`已同步 ${count} 条报表内容配置`);
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
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  h1 {
    margin: 0 0 4px;
    font-size: 22px;
    font-weight: 650;
    margin-bottom: 0;
  }
}

.page-actions {
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

.chart-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0;
  padding-left: 18px;
}

@media (max-width: 900px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>
