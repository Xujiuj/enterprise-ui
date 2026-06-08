<template>
  <div class="p-2 enterprise-reports-page">
    <el-row :gutter="16">
      <el-col :xs="24" :lg="10">
        <el-card shadow="never">
          <template #header>
            <div class="card-head compact">
              <span>报表授权状态</span>
              <el-button link type="primary" icon="Refresh" :loading="loading" @click="loadGate">刷新</el-button>
            </div>
          </template>
          <el-skeleton v-if="loading && !gateStatus" :rows="5" animated />
          <template v-else>
            <el-result v-if="gateAllowed" icon="success" title="报表入口可用" sub-title="License gate 已允许 report-gate 功能。" />
            <el-result v-else icon="warning" title="报表入口未放行" :sub-title="gateReason" />
            <el-descriptions :column="1" border>
              <el-descriptions-item label="featureCode">{{ gateStatus?.featureCode || 'report-gate' }}</el-descriptions-item>
              <el-descriptions-item label="licenseStatus">{{ gateLicenseStatus }}</el-descriptions-item>
              <el-descriptions-item label="expiresAt">{{ gateExpiresAt }}</el-descriptions-item>
            </el-descriptions>
          </template>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="14">
        <el-card shadow="never">
          <template #header>
            <span>企业本地报表入口</span>
          </template>
          <el-alert type="info" show-icon :closable="false" class="mb-4">
            <template #title>Power BI 只读账号连接企业本地 rpt 视图，不连接厂商库。</template>
          </el-alert>
          <el-table :data="reportEntries" row-key="viewName">
            <el-table-column prop="title" label="报表" width="180" />
            <el-table-column prop="viewName" label="本地视图" width="170" />
            <el-table-column prop="description" label="说明" min-width="260" />
            <el-table-column label="状态" width="110">
              <template #default>
                <el-tag :type="gateAllowed ? 'success' : 'warning'">{{ gateAllowed ? '可连接' : '待授权' }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="EnterpriseReports" lang="ts">
import { computed, onMounted, ref } from 'vue';
import { getEnterpriseReportGate, type EnterpriseReportGateStatus } from '@/api/enterprise/reports';
import { getCurrentLicenseState } from '@/api/enterprise/licenseImport';
import type { EnterpriseLicenseCurrentState } from '@/api/enterprise/licenseImport/types';

const loading = ref(false);
const gateStatus = ref<EnterpriseReportGateStatus>();
const currentState = ref<EnterpriseLicenseCurrentState>();

const reportEntries = [
  {
    title: 'License gate 状态',
    viewName: 'rpt.v_LicenseGate',
    description: '用于确认本地授权状态和报表功能 gate。'
  },
  {
    title: '活动数据明细',
    viewName: 'rpt.v_CaptureRows',
    description: '读取企业本地 capture batch / row 数据，供 Power BI 只读分析。'
  }
];

const gateAllowed = computed(() => gateStatus.value?.decision === 'ALLOW');
const gateLicenseState = computed(() => gateStatus.value?.licenseState);
const gateLicenseStatus = computed(() => gateLicenseState.value?.licenseStatus || '-');
const gateExpiresAt = computed(() => gateLicenseState.value?.expiresAt || gateLicenseState.value?.validTo || '-');
const gateReason = computed(() => gateStatus.value?.message || gateStatus.value?.reason || '后端未返回可用的 report-gate 授权状态。');

const unwrapResponse = <T>(response: unknown): T => {
  const payload = response as { data?: T };
  return payload.data ?? (response as T);
};

const loadGate = async () => {
  loading.value = true;
  try {
    const stateResult = await getCurrentLicenseState();
    currentState.value = unwrapResponse<EnterpriseLicenseCurrentState>(stateResult);
    const expectedInstallId = currentState.value?.installId ? String(currentState.value.installId) : '';
    if (!expectedInstallId) {
      gateStatus.value = undefined;
      return;
    }
    const res = await getEnterpriseReportGate(expectedInstallId);
    gateStatus.value = unwrapResponse<EnterpriseReportGateStatus>(res);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadGate();
});
</script>

<style scoped lang="scss">
.enterprise-reports-page {
  .card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .compact {
    min-height: 32px;
  }
}
</style>
