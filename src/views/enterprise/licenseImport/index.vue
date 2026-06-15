<template>
  <div class="p-2 license-import-page">
    <div class="page-intro">
      <div>
        <h2>License导入与运行状态</h2>
        <p>用于导入企业本地授权文件，查看当前授权与访问网关状态。</p>
      </div>
      <el-button type="primary" plain icon="Refresh" :loading="statusLoading" @click="refreshStatus">刷新状态</el-button>
    </div>

    <el-row :gutter="16">
      <el-col :xs="24" :lg="14">
        <el-card shadow="hover" class="section-card">
          <template #header>
            <div class="card-header">
              <span>当前授权</span>
              <el-tag :type="stateTagType">导入状态：{{ stateText }}</el-tag>
            </div>
          </template>

          <el-skeleton :loading="statusLoading" animated :rows="6">
            <el-empty v-if="!currentState" description="暂无可用授权状态" />
            <template v-else>
              <el-alert v-if="statusMismatch" class="mb-4" type="warning" :closable="false" show-icon>
                <template #title>
                  导入状态为 {{ stateText }}，但当前运行状态为 {{ effectiveStatusText }}。请以运行状态作为访问控制结果。
                </template>
              </el-alert>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="客户标识">{{ currentState.customerId || '-' }}</el-descriptions-item>
                <el-descriptions-item label="授权编号">{{ currentState.licenseId || '-' }}</el-descriptions-item>
                <el-descriptions-item label="导入状态/持久状态">
                  <el-tag :type="stateTagType">{{ stateText }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="运行状态/有效状态">
                  <el-tag :type="effectiveStatusTagType">{{ effectiveStatusText }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="签名密钥">{{ currentState.keyId || '-' }}</el-descriptions-item>
                <el-descriptions-item label="有效期起">{{ formatTime(currentState.validFrom) }}</el-descriptions-item>
                <el-descriptions-item label="有效期止">{{ formatTime(currentState.validTo) }}</el-descriptions-item>
                <el-descriptions-item label="部署指纹">{{ currentState.installId || '-' }}</el-descriptions-item>
                <el-descriptions-item label="最近校验">{{ formatTime(currentState.lastVerifiedTime) }}</el-descriptions-item>
                <el-descriptions-item label="最大观测时间">{{ formatTime(currentState.maxObservedTime) }}</el-descriptions-item>
              </el-descriptions>
            </template>
          </el-skeleton>
        </el-card>

        <el-card shadow="hover" class="section-card mt-4">
          <template #header>
            <div class="card-header">
              <span>访问网关</span>
              <el-tag :type="gateDecisionTagType">{{ gateDecisionText }}</el-tag>
            </div>
          </template>

          <el-skeleton :loading="statusLoading" animated :rows="4">
            <div class="gate-status">
              <el-alert :type="gateAlertType" :closable="false" show-icon>
                <template #title>{{ gateMessage }}</template>
              </el-alert>
              <el-descriptions class="mt-4" :column="2" border>
                <el-descriptions-item label="网关结果">{{ gateResultText }}</el-descriptions-item>
                <el-descriptions-item label="原因">
                  <el-tag :type="effectiveStatusTagType">{{ effectiveStatusText }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="说明" :span="2">{{ gateStatus?.message || '-' }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </el-skeleton>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="10">
        <el-card shadow="hover" class="section-card import-card">
          <template #header>
            <div class="card-header">
              <span>导入授权文件</span>
              <el-tag type="info">.lic</el-tag>
            </div>
          </template>

          <el-upload drag action="#" accept=".lic,text/plain" :auto-upload="false" :show-file-list="false" :before-upload="readLicenseFile">
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">拖拽 License 文件到此处，或点击选择</div>
          </el-upload>

          <el-input
            v-model="expectedInstallId"
            class="mt-4"
            maxlength="128"
            show-word-limit
            placeholder="请输入本地部署指纹 expectedInstallId"
          />

          <el-input
            v-model="licenseContent"
            class="mt-4"
            type="textarea"
            :rows="12"
            maxlength="120000"
            show-word-limit
            placeholder="粘贴 .lic 文件内容"
          />

          <div class="import-actions">
            <el-button icon="Delete" :disabled="!licenseContent" @click="clearLicenseContent">清空</el-button>
            <el-button type="primary" icon="Upload" :loading="importLoading" :disabled="!canImport" @click="submitLicense">导入License</el-button>
          </div>

          <el-alert class="mt-4" title="导入后将重新读取当前授权和网关状态。" type="info" :closable="false" show-icon />
        </el-card>

        <el-card v-if="lastImportResult" shadow="hover" class="section-card mt-4">
          <template #header>
            <div class="card-header">
              <span>最近导入结果</span>
              <el-tag :type="importResultTagType">{{ normalizeStatus(lastImportResult.status) }}</el-tag>
            </div>
          </template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="授权编号">{{ lastImportResult.licenseState?.licenseId || '-' }}</el-descriptions-item>
            <el-descriptions-item label="客户标识">{{ lastImportResult.licenseState?.customerId || '-' }}</el-descriptions-item>
            <el-descriptions-item label="有效期起">{{ formatTime(lastImportResult.licenseState?.validFrom) }}</el-descriptions-item>
            <el-descriptions-item label="有效期止">{{ formatTime(lastImportResult.licenseState?.validTo) }}</el-descriptions-item>
            <el-descriptions-item label="导入校验">{{ formatTime(lastImportResult.licenseState?.lastVerifiedTime) }}</el-descriptions-item>
            <el-descriptions-item label="结果说明">{{ lastImportResult.message || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="EnterpriseLicenseImport" lang="ts">
import { UploadFilled } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import type { UploadRawFile } from 'element-plus';
import { getCurrentLicenseState, getLicenseGateStatus, importEnterpriseLicense } from '@/api/enterprise/licenseImport';
import type {
  EnterpriseLicenseCurrentState,
  EnterpriseLicenseGateStatus,
  EnterpriseLicenseImportResult,
  LicenseGateDenialReason
} from '@/api/enterprise/licenseImport/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const statusLoading = ref(false);
const importLoading = ref(false);
const licenseContent = ref('');
const expectedInstallId = ref('');
const currentState = ref<EnterpriseLicenseCurrentState>();
const gateStatus = ref<EnterpriseLicenseGateStatus>();
const lastImportResult = ref<EnterpriseLicenseImportResult>();

const canImport = computed(() => licenseContent.value.trim().length > 0 && expectedInstallId.value.trim().length > 0 && !importLoading.value);
const effectiveReason = computed(() => {
  const reason = normalizeGateReason(gateStatus.value?.reason || gateStatus.value?.status);
  if (!reason && gateStatus.value && gateAllowed.value) {
    return 'VALID';
  }
  return reason;
});
const gateAllowed = computed(() => {
  if (typeof gateStatus.value?.allowed === 'boolean') {
    return gateStatus.value.allowed;
  }
  return String(gateStatus.value?.decision ?? '').toUpperCase() === 'ALLOW';
});
const stateText = computed(() => normalizeStatus(currentState.value?.licenseStatus));
const stateTagType = computed(() => statusTagType(currentState.value?.licenseStatus));
const importResultTagType = computed(() => statusTagType(lastImportResult.value?.status));
const effectiveStatusText = computed(() => gateStatus.value ? gateReasonText(effectiveReason.value) : '未读取网关状态');
const effectiveStatusTagType = computed(() => gateReasonTagType(effectiveReason.value));
const gateDecisionText = computed(() => {
  if (!gateStatus.value) {
    return '未读取';
  }
  return gateAllowed.value ? '已放行' : '已拦截';
});
const gateResultText = computed(() => {
  if (!gateStatus.value) {
    return '尚未读取访问网关状态';
  }
  return gateAllowed.value ? '允许访问企业业务接口' : '企业业务接口暂不可访问';
});
const gateDecisionTagType = computed(() => {
  if (!gateStatus.value) {
    return 'info';
  }
  return gateAllowed.value ? 'success' : 'danger';
});
const gateAlertType = computed(() => {
  if (!gateStatus.value) {
    return 'info';
  }
  if (gateAllowed.value) {
    return 'success';
  }
  return gateReasonTagType(effectiveReason.value) === 'danger' ? 'error' : 'warning';
});
const statusMismatch = computed(() => {
  if (!currentState.value || !gateStatus.value) {
    return false;
  }
  const persisted = normalizeComparableStatus(currentState.value.licenseStatus);
  const effective = normalizeComparableStatus(effectiveReason.value);
  return Boolean(persisted && effective && persisted !== effective);
});
const gateMessage = computed(() => {
  if (!gateStatus.value) {
    return '尚未读取访问网关状态';
  }
  if (gateAllowed.value) {
    return gateStatus.value.message || '当前授权可访问企业业务接口';
  }
  return gateReasonText(effectiveReason.value);
});

function unwrapResponse<T>(response: unknown): T {
  const payload = response as { data?: T };
  return payload.data ?? (response as T);
}

function normalizeStatus(status?: string): string {
  const statusMap: Record<string, string> = {
    VALID: '有效',
    ACTIVE: '有效',
    NORMAL: '有效',
    INSTALLED: '已安装',
    EXPIRED: '已过期',
    NOT_YET_VALID: '未到生效时间',
    INSTALL_ID_MISMATCH: '部署指纹不匹配',
    CLOCK_ROLLBACK: '系统时间异常',
    FEATURE_NOT_ENABLED: '功能未启用',
    NO_VALID_LICENSE: '无有效授权',
    INVALID: '无效',
    DISABLED: '停用',
    PENDING: '待校验'
  };
  const normalized = normalizeStatusKey(status);
  return statusMap[normalized] || status || '未知';
}

function statusTagType(status?: string): 'success' | 'warning' | 'danger' | 'info' {
  const normalized = normalizeStatusKey(status);
  if (['VALID', 'ACTIVE', 'NORMAL', 'INSTALLED'].includes(normalized)) {
    return 'success';
  }
  if (['EXPIRED', 'INVALID', 'DISABLED', 'NO_VALID_LICENSE'].includes(normalized)) {
    return 'danger';
  }
  if (['PENDING', 'WARNING', 'INSTALL_ID_MISMATCH', 'CLOCK_ROLLBACK', 'FEATURE_NOT_ENABLED'].includes(normalized)) {
    return 'warning';
  }
  if (normalized === 'NOT_YET_VALID') {
    return 'info';
  }
  return 'info';
}

function normalizeStatusKey(status?: string): string {
  return String(status ?? '').trim().toUpperCase();
}

function normalizeComparableStatus(status?: string): string {
  const normalized = normalizeStatusKey(status);
  if (['VALID', 'ACTIVE', 'NORMAL', 'INSTALLED'].includes(normalized)) {
    return 'VALID';
  }
  return normalized;
}

function normalizeGateReason(reason?: LicenseGateDenialReason | string): string {
  return normalizeStatusKey(reason);
}

function gateReasonText(reason?: string): string {
  const reasonMap: Record<string, string> = {
    VALID: '有效',
    NO_VALID_LICENSE: '无有效授权',
    CLOCK_ROLLBACK: '系统时间回拨，授权校验被拒绝',
    EXPIRED: '授权已过期',
    NOT_YET_VALID: '授权未到生效时间',
    INSTALL_ID_MISMATCH: '部署指纹不匹配',
    FEATURE_NOT_ENABLED: '功能未启用'
  };
  return reasonMap[normalizeGateReason(reason)] || reason || '无有效授权';
}

function gateReasonTagType(reason?: string): 'success' | 'warning' | 'danger' | 'info' {
  const normalized = normalizeGateReason(reason);
  if (normalized === 'VALID') {
    return 'success';
  }
  if (['EXPIRED', 'NO_VALID_LICENSE'].includes(normalized)) {
    return 'danger';
  }
  if (['INSTALL_ID_MISMATCH', 'CLOCK_ROLLBACK', 'FEATURE_NOT_ENABLED'].includes(normalized)) {
    return 'warning';
  }
  if (normalized === 'NOT_YET_VALID') {
    return 'info';
  }
  return 'info';
}

function formatTime(value?: string): string {
  if (!value) {
    return '-';
  }
  return proxy?.parseTime(value) || value;
}

function readLicenseFile(file: UploadRawFile): false {
  if (!file.name.toLowerCase().endsWith('.lic')) {
    ElMessage.warning('请选择 .lic 授权文件');
    return false;
  }
  const reader = new FileReader();
  reader.onload = () => {
    licenseContent.value = String(reader.result || '').trim();
  };
  reader.onerror = () => {
    ElMessage.error('License 文件读取失败');
  };
  reader.readAsText(file);
  return false;
}

function clearLicenseContent() {
  licenseContent.value = '';
}

async function refreshStatus() {
  statusLoading.value = true;
  try {
    const stateResult = await getCurrentLicenseState();
    currentState.value = unwrapResponse<EnterpriseLicenseCurrentState>(stateResult);
    if (!expectedInstallId.value && currentState.value?.installId) {
      expectedInstallId.value = String(currentState.value.installId);
    }
    if (expectedInstallId.value.trim()) {
      const gateResult = await getLicenseGateStatus(expectedInstallId.value.trim());
      gateStatus.value = unwrapResponse<EnterpriseLicenseGateStatus>(gateResult);
    } else {
      gateStatus.value = undefined;
    }
  } finally {
    statusLoading.value = false;
  }
}

async function submitLicense() {
  if (!canImport.value) {
    return;
  }
  importLoading.value = true;
  try {
    const response = await importEnterpriseLicense({
      licenseContent: licenseContent.value.trim(),
      expectedInstallId: expectedInstallId.value.trim()
    });
    lastImportResult.value = unwrapResponse<EnterpriseLicenseImportResult>(response);
    ElMessage.success(lastImportResult.value.message || 'License导入成功');
    licenseContent.value = '';
    await refreshStatus();
  } finally {
    importLoading.value = false;
  }
}

onMounted(() => {
  refreshStatus();
});
</script>

<style scoped lang="scss">
.license-import-page {
  .page-intro {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 16px 18px;
    margin-bottom: 16px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-light);
    border-radius: 6px;

    h2 {
      margin: 0 0 6px;
      font-size: 18px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    p {
      margin: 0;
      font-size: 13px;
      color: var(--el-text-color-regular);
    }
  }

  .section-card {
    border-radius: 6px;
  }

  .card-header,
  .import-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .import-actions {
    margin-top: 16px;
  }

  .gate-status :deep(.el-alert__title) {
    line-height: 1.5;
  }
}

@media (max-width: 768px) {
  .license-import-page {
    .page-intro,
    .import-actions {
      align-items: stretch;
      flex-direction: column;
    }
  }
}
</style>
