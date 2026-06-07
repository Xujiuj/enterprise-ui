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
              <el-tag :type="stateTagType">{{ stateText }}</el-tag>
            </div>
          </template>

          <el-skeleton :loading="statusLoading" animated :rows="6">
            <el-empty v-if="!currentState" description="暂无可用授权状态" />
            <el-descriptions v-else :column="2" border>
              <el-descriptions-item label="授权主体">{{ currentState.companyName || '-' }}</el-descriptions-item>
              <el-descriptions-item label="授权版本">{{ currentState.edition || '-' }}</el-descriptions-item>
              <el-descriptions-item label="授权状态">{{ normalizeStatus(currentState.status) }}</el-descriptions-item>
              <el-descriptions-item label="最大用户数">{{ currentState.maxUsers ?? '-' }}</el-descriptions-item>
              <el-descriptions-item label="有效期起">{{ formatTime(currentState.validFrom) }}</el-descriptions-item>
              <el-descriptions-item label="有效期止">{{ formatTime(currentState.validTo) }}</el-descriptions-item>
              <el-descriptions-item label="部署指纹">{{ currentState.installId || '-' }}</el-descriptions-item>
              <el-descriptions-item label="最近校验">{{ formatTime(currentState.lastCheckTime) }}</el-descriptions-item>
            </el-descriptions>
          </el-skeleton>
        </el-card>

        <el-card shadow="hover" class="section-card mt-4">
          <template #header>
            <div class="card-header">
              <span>访问网关</span>
              <el-tag :type="gateAllowed ? 'success' : 'danger'">{{ gateAllowed ? '已放行' : '已拦截' }}</el-tag>
            </div>
          </template>

          <el-skeleton :loading="statusLoading" animated :rows="4">
            <div class="gate-status">
              <el-alert :type="gateAllowed ? 'success' : 'warning'" :closable="false" show-icon>
                <template #title>{{ gateMessage }}</template>
              </el-alert>
              <el-descriptions class="mt-4" :column="2" border>
                <el-descriptions-item label="网关结果">{{ gateAllowed ? '允许访问企业业务接口' : '企业业务接口暂不可访问' }}</el-descriptions-item>
                <el-descriptions-item label="校验时间">{{ formatTime(gateStatus?.checkedAt) }}</el-descriptions-item>
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
            <el-descriptions-item label="授权版本">{{ lastImportResult.edition || '-' }}</el-descriptions-item>
            <el-descriptions-item label="有效期起">{{ formatTime(lastImportResult.validFrom) }}</el-descriptions-item>
            <el-descriptions-item label="有效期止">{{ formatTime(lastImportResult.validTo) }}</el-descriptions-item>
            <el-descriptions-item label="导入时间">{{ formatTime(lastImportResult.importTime) }}</el-descriptions-item>
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
const currentState = ref<EnterpriseLicenseCurrentState>();
const gateStatus = ref<EnterpriseLicenseGateStatus>();
const lastImportResult = ref<EnterpriseLicenseImportResult>();

const canImport = computed(() => licenseContent.value.trim().length > 0 && !importLoading.value);
const gateAllowed = computed(() => gateStatus.value?.allowed === true);
const stateText = computed(() => normalizeStatus(currentState.value?.status));
const stateTagType = computed(() => statusTagType(currentState.value?.status));
const importResultTagType = computed(() => statusTagType(lastImportResult.value?.status));
const gateMessage = computed(() => {
  if (!gateStatus.value) {
    return '尚未读取访问网关状态';
  }
  if (gateStatus.value.allowed) {
    return gateStatus.value.message || '当前授权可访问企业业务接口';
  }
  return denialReasonText(gateStatus.value.reason, gateStatus.value.message);
});

function unwrapResponse<T>(response: unknown): T {
  const payload = response as { data?: T };
  return payload.data ?? (response as T);
}

function normalizeStatus(status?: string): string {
  const normalized = String(status ?? '').toUpperCase();
  const statusMap: Record<string, string> = {
    VALID: '有效',
    ACTIVE: '有效',
    NORMAL: '有效',
    INSTALLED: '已安装',
    EXPIRED: '已过期',
    INVALID: '无效',
    DISABLED: '停用',
    PENDING: '待校验'
  };
  return statusMap[normalized] || status || '未知';
}

function statusTagType(status?: string): 'success' | 'warning' | 'danger' | 'info' {
  const normalized = String(status ?? '').toUpperCase();
  if (['VALID', 'ACTIVE', 'NORMAL', 'INSTALLED'].includes(normalized)) {
    return 'success';
  }
  if (['EXPIRED', 'INVALID', 'DISABLED'].includes(normalized)) {
    return 'danger';
  }
  if (['PENDING', 'WARNING'].includes(normalized)) {
    return 'warning';
  }
  return 'info';
}

function denialReasonText(reason?: LicenseGateDenialReason, fallback?: string): string {
  const reasonMap: Record<string, string> = {
    NO_VALID_LICENSE: 'no valid license',
    CLOCK_ROLLBACK: 'clock rollback',
    EXPIRED: 'expired',
    INSTALL_ID_MISMATCH: 'install ID mismatch'
  };
  return reasonMap[String(reason ?? '').toUpperCase()] || fallback || 'no valid license';
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
    const [stateResult, gateResult] = await Promise.allSettled([getCurrentLicenseState(), getLicenseGateStatus()]);
    if (stateResult.status === 'fulfilled') {
      currentState.value = unwrapResponse<EnterpriseLicenseCurrentState>(stateResult.value);
    }
    if (gateResult.status === 'fulfilled') {
      gateStatus.value = unwrapResponse<EnterpriseLicenseGateStatus>(gateResult.value);
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
    const response = await importEnterpriseLicense({ licenseContent: licenseContent.value.trim() });
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
