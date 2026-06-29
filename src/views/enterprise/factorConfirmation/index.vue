<template>
  <EnterpriseCrudPage :config="config" :api="api">
    <template #toolbar-actions="{ refresh }">
      <el-button type="success" plain icon="RefreshRight" :loading="syncing" @click="handleSync(refresh)" v-hasPermi="['enterprise:factorSync:run']">
        同步厂商因子
      </el-button>
    </template>
  </EnterpriseCrudPage>
</template>

<script setup name="EnterpriseFactorConfirmation" lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import EnterpriseCrudPage from '@/views/enterprise/components/EnterpriseCrudPage.vue';
import {
  addFactorConfirmation,
  delFactorConfirmation,
  getFactorConfirmation,
  listFactorConfirmation,
  syncFactors,
  updateFactorConfirmation
} from '@/api/enterprise/factorConfirmation';
import { loadConfirmedByOptions, loadFactorConfirmationStatusOptions, loadLicenseIdOptions } from '@/utils/enterpriseFieldOptions';

const syncing = ref(false);
const loadConfirmationStatusOptions = loadFactorConfirmationStatusOptions;

async function handleSync(refresh: () => Promise<void>) {
  syncing.value = true;
  try {
    const response = await syncFactors();
    const result = response.data;
    const changedText = result?.changed ? '已更新' : '无变化';
    const count = result?.recordCount ?? 0;
    const version = result?.versionCode ? `，版本 ${result.versionCode}` : '';
    await refresh();
    ElMessage.success(`厂商因子同步完成：${changedText} ${count} 条${version}`);
  } catch (error: any) {
    const message = error?.response?.data?.msg || error?.message || '因子同步失败';
    ElMessage.error(message);
  } finally {
    syncing.value = false;
  }
}

const config = {
  title: '因子确认记录',
  description: '维护企业本地确认过的排放因子版本，活动数据计算只引用本地确认记录。',
  permissionPrefix: 'enterprise:factorConfirmation',
  columns: [
    { prop: 'factorCode', label: '因子编码', minWidth: 150 },
    { prop: 'factorName', label: '因子名称', minWidth: 180 },
    { prop: 'factorVersionCode', label: '版本编码', minWidth: 140 },
    { prop: 'factorValue', label: '因子值', width: 110 },
    { prop: 'factorUnit', label: '单位', width: 120 },
    {
      prop: 'confirmationStatus',
      label: '确认状态',
      type: 'tag',
      width: 110,
      tagMap: { pending: 'warning', confirmed: 'success', rejected: 'danger' }
    },
    { prop: 'confirmedBy', label: '确认人', width: 120 },
    { prop: 'confirmedTime', label: '确认时间', minWidth: 170 },
    { prop: 'remark', label: '备注', minWidth: 180 }
  ],
  searchFields: [
    { prop: 'factorCode', label: '因子编码' },
    { prop: 'factorName', label: '因子名称' },
    { prop: 'factorVersionCode', label: '版本编码' },
    { prop: 'confirmationStatus', label: '确认状态', type: 'select', loadOptions: loadConfirmationStatusOptions }
  ],
  formFields: [
    { prop: 'factorCode', label: '因子编码', required: true },
    { prop: 'factorName', label: '因子名称', required: true },
    { prop: 'factorVersionCode', label: '版本编码' },
    { prop: 'factorValue', label: '因子值', type: 'number', required: true, precision: 6 },
    { prop: 'factorUnit', label: '单位', required: true },
    { prop: 'confirmationStatus', label: '确认状态', type: 'select', loadOptions: loadConfirmationStatusOptions, required: true },
    { prop: 'confirmedBy', label: '确认人', type: 'select', loadOptions: loadConfirmedByOptions, allowCreate: true },
    { prop: 'confirmedTime', label: '确认时间', type: 'date' },
    { prop: 'licenseId', label: '授权编号', type: 'select', loadOptions: loadLicenseIdOptions, allowCreate: true },
    { prop: 'remark', label: '备注', type: 'textarea' }
  ],
  emptyForm: {
    confirmationStatus: 'pending'
  }
};

const api = {
  list: listFactorConfirmation,
  get: getFactorConfirmation,
  add: addFactorConfirmation,
  update: updateFactorConfirmation,
  remove: delFactorConfirmation
};
</script>
