<template>
  <RuoyiCrudPage :config="config" :api="api">
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
  </RuoyiCrudPage>
</template>

<script setup name="EnterpriseReportTemplateFile" lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import FileSaver from 'file-saver';
import RuoyiCrudPage from '@/views/enterprise/components/RuoyiCrudPage.vue';
import {
  addReportTemplateFile,
  delReportTemplateFile,
  downloadReportTemplateFile,
  getReportTemplateFile,
  listReportTemplateFile,
  syncReportTemplates,
  updateReportTemplateFile
} from '@/api/enterprise/reportTemplateFile';
import type { ReportTemplateFileVO } from '@/api/enterprise/reportTemplateFile/types';
import { errorCode } from '@/utils/errorCode';
import { blobValidate } from '@/utils/ruoyi';

const syncing = ref(false);

const enabledOptions = [
  { label: '启用', value: true },
  { label: '停用', value: false }
];

const templateTypeOptions = [
  { label: 'Power BI', value: 'power_bi' },
  { label: 'Excel', value: 'excel' },
  { label: 'PDF', value: 'pdf' }
];

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
  description: '维护企业端可下载的报表模板元数据。模板文件下载仅允许访问企业模板目录内的受控文件。',
  permissionPrefix: 'enterprise:reportTemplateFile',
  columns: [
    { prop: 'templateCode', label: '模板编码', minWidth: 150 },
    { prop: 'templateName', label: '模板名称', minWidth: 180 },
    {
      prop: 'templateType',
      label: '类型',
      type: 'tag',
      width: 110,
      valueMap: { power_bi: 'Power BI', excel: 'Excel', pdf: 'PDF' },
      tagMap: { power_bi: 'success', excel: 'primary', pdf: 'info' }
    },
    { prop: 'fileName', label: '文件名', minWidth: 180 },
    {
      prop: 'enabledFlag',
      label: '状态',
      type: 'tag',
      width: 90,
      valueMap: { true: '启用', false: '停用' },
      tagMap: { true: 'success', false: 'info' }
    },
    { prop: 'remark', label: '备注', minWidth: 180 }
  ],
  searchFields: [
    { prop: 'templateCode', label: '模板编码' },
    { prop: 'templateName', label: '模板名称' },
    { prop: 'templateType', label: '类型', type: 'select', options: templateTypeOptions },
    { prop: 'enabledFlag', label: '状态', type: 'select', options: enabledOptions }
  ],
  formFields: [
    { prop: 'templateCode', label: '模板编码', required: true },
    { prop: 'templateName', label: '模板名称', required: true },
    { prop: 'templateType', label: '类型', type: 'select', options: templateTypeOptions, required: true },
    { prop: 'fileName', label: '文件名', required: true },
    {
      prop: 'filePath',
      label: '模板相对路径',
      placeholder: '请输入企业模板目录下的相对路径',
      required: true
    },
    { prop: 'enabledFlag', label: '启用状态', type: 'switch' },
    { prop: 'remark', label: '备注', type: 'textarea' }
  ],
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
  add: addReportTemplateFile,
  update: updateReportTemplateFile,
  remove: delReportTemplateFile
};
</script>
