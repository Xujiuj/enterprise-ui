<template>
  <EnterpriseCrudPage :config="config" :api="api">
    <template #toolbar-actions="{ refresh }">
      <el-button
        type="success"
        plain
        icon="RefreshRight"
        :loading="syncing"
        @click="handleSync(refresh)"
        v-hasPermi="['enterprise:reportTemplateSync:run']"
      >
        同步厂商模板
      </el-button>
    </template>
  </EnterpriseCrudPage>
</template>

<script setup name="EnterpriseReportTemplateFile" lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import FileSaver from 'file-saver';
import EnterpriseCrudPage from '@/views/enterprise/components/EnterpriseCrudPage.vue';
import {
  downloadReportTemplateFile,
  getReportTemplateFile,
  listReportTemplateFile,
  syncReportTemplates
} from '@/api/enterprise/reportTemplateFile';
import type { ReportTemplateFileVO } from '@/api/enterprise/reportTemplateFile/types';
import { errorCode } from '@/utils/errorCode';
import { blobValidate } from '@/utils/ruoyi';
import { loadBooleanStatusOptions, loadTemplateTypeOptions } from '@/utils/enterpriseFieldOptions';

const syncing = ref(false);

async function handleSync(refresh: () => Promise<void>) {
  syncing.value = true;
  try {
    const response = await syncReportTemplates();
    const count = response.data?.templateCount ?? 0;
    await refresh();
    ElMessage.success(`已同步 ${count} 个厂商模板`);
  } finally {
    syncing.value = false;
  }
}

async function handleDownload(row: ReportTemplateFileVO) {
  try {
    const response = await downloadReportTemplateFile(row.id);
    if (!blobValidate(response.data)) {
      ElMessage.error(await resolveBlobErrorMessage(response.data));
      return;
    }

    const headerFileName = response.headers['download-filename'];
    const fileName = headerFileName ? decodeURIComponent(headerFileName as string) : row.fileName || `report-template-${row.id}`;
    FileSaver.saveAs(new Blob([response.data], { type: 'application/octet-stream' }), fileName);
  } catch (error) {
    console.error(error);
    ElMessage.error('下载失败');
  }
}

async function resolveBlobErrorMessage(blob: Blob) {
  try {
    const payload = JSON.parse(await blob.text());
    return errorCode[payload.code] || payload.msg || errorCode.default;
  } catch {
    return errorCode.default;
  }
}

const config = {
  title: '报表模板下载',
  description: '企业端模板仅支持从厂商端同步和下载，模板文件下载仅允许访问企业模板目录内的受控文件。',
  permissionPrefix: 'enterprise:reportTemplateFile',
  readonly: true,
  columns: [
    { prop: 'templateCode', label: '模板编码', minWidth: 150 },
    { prop: 'templateName', label: '模板名称', minWidth: 180 },
    {
      prop: 'templateType',
      label: '类型',
      type: 'tag',
      width: 110,
      tagMap: { power_bi: 'success', excel: 'primary', pdf: 'info' }
    },
    { prop: 'fileName', label: '文件名', minWidth: 180 },
    {
      prop: 'enabledFlag',
      label: '状态',
      type: 'tag',
      width: 90,
      tagMap: { true: 'success', false: 'info' }
    },
    { prop: 'remark', label: '备注', minWidth: 180 }
  ],
  searchFields: [
    { prop: 'templateCode', label: '模板编码' },
    { prop: 'templateName', label: '模板名称' },
    { prop: 'templateType', label: '类型', type: 'select', loadOptions: loadTemplateTypeOptions },
    { prop: 'enabledFlag', label: '状态', type: 'select', loadOptions: loadBooleanStatusOptions }
  ],
  formFields: [],
  rowActions: [
    {
      key: 'download',
      label: '下载',
      permission: 'enterprise:reportTemplateFile:download',
      icon: 'Download',
      disabled: (row: ReportTemplateFileVO) => row.enabledFlag === false,
      handler: handleDownload
    }
  ],
  emptyForm: {
    templateType: 'power_bi',
    enabledFlag: true
  }
};

const api = {
  list: listReportTemplateFile,
  get: getReportTemplateFile,
  add: rejectReadonlyMutation,
  update: rejectReadonlyMutation,
  remove: rejectReadonlyMutation
};

function rejectReadonlyMutation() {
  return Promise.reject(new Error('企业端报表模板仅允许从厂商端同步和下载'));
}
</script>
