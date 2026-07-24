<template>
  <div class="powerbi-report-page">
    <section class="powerbi-toolbar">
      <div>
        <h1>碳核算分析驾驶舱</h1>
        <p>汇聚核算数据，支撑低碳决策</p>
      </div>
      <div class="powerbi-actions">
        <el-button icon="Setting" @click="openConfig" v-hasPermi="['enterprise:reports:powerbi:edit']">配置</el-button>
        <el-button icon="Refresh" :disabled="!reportUrl" @click="refreshReport">刷新</el-button>
        <el-button type="primary" icon="Link" :disabled="!reportUrl" @click="openReport">新窗口打开</el-button>
      </div>
    </section>

    <iframe
      v-if="reportUrl"
      :key="frameKey"
      title="企业碳管理数字化平台（企业版）"
      class="powerbi-frame"
      width="1024"
      height="804"
      :src="reportUrl"
      frameborder="0"
      referrerpolicy="no-referrer"
      allowfullscreen
    />
    <el-empty v-else v-loading="loading" description="尚未配置Power BI报表链接" class="powerbi-empty" />

    <el-drawer v-model="configDrawer.visible" title="Power BI链接配置" size="560px" append-to-body>
      <el-form ref="configFormRef" :model="configForm" :rules="configRules" label-width="96px">
        <el-form-item label="嵌入链接" prop="embedUrl">
          <el-input v-model="configForm.embedUrl" type="textarea" :rows="8" maxlength="8000" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" :loading="saving" @click="saveConfig">保存</el-button>
        <el-button @click="configDrawer.visible = false">取消</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup name="EnterprisePowerBiReport" lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { getPowerBiConfig, updatePowerBiConfig, type PowerBiConfig } from '@/api/enterprise/reportConfig';

const reportUrl = ref('');
const frameKey = ref(0);
const loading = ref(false);
const saving = ref(false);
const configFormRef = ref<FormInstance>();
const configDrawer = reactive({ visible: false });
const configForm = reactive({ embedUrl: '' });
const configRules: FormRules = {
  embedUrl: [
    { required: true, message: '请输入Power BI嵌入链接', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        try {
          const url = new URL(String(value ?? ''));
          const host = url.hostname.toLowerCase();
          if (url.protocol !== 'https:' || !(host === 'powerbi.com' || host.endsWith('.powerbi.com'))) {
            callback(new Error('仅支持Power BI官方HTTPS嵌入链接'));
            return;
          }
          callback();
        } catch {
          callback(new Error('Power BI嵌入链接格式不正确'));
        }
      },
      trigger: 'blur'
    }
  ]
};

const unwrapData = <T,>(response: unknown): T => {
  const payload = response as { data?: T };
  return payload?.data ?? (response as T);
};

const loadConfig = async () => {
  loading.value = true;
  try {
    const config = unwrapData<PowerBiConfig>(await getPowerBiConfig());
    reportUrl.value = config.embedUrl ?? '';
    configForm.embedUrl = reportUrl.value;
  } finally {
    loading.value = false;
  }
};

const refreshReport = () => {
  frameKey.value += 1;
};

const openReport = () => {
  if (reportUrl.value) window.open(reportUrl.value, '_blank', 'noopener,noreferrer');
};

const openConfig = () => {
  configForm.embedUrl = reportUrl.value;
  configDrawer.visible = true;
};

const saveConfig = async () => {
  await configFormRef.value?.validate();
  saving.value = true;
  try {
    const config = unwrapData<PowerBiConfig>(await updatePowerBiConfig({ embedUrl: configForm.embedUrl.trim() }));
    reportUrl.value = config.embedUrl;
    frameKey.value += 1;
    configDrawer.visible = false;
    ElMessage.success('Power BI链接已更新');
  } finally {
    saving.value = false;
  }
};

onMounted(loadConfig);
</script>

<style scoped lang="scss">
.powerbi-report-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  min-height: calc(100vh - 116px);
  padding: 12px;
  background: var(--el-bg-color-page);
}

.powerbi-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  background: var(--el-bg-color);

  h1 {
    margin: 0;
    font-size: 18px;
    font-weight: 650;
    color: var(--el-text-color-primary);
  }

  p {
    margin: 6px 0 0;
    color: var(--el-text-color-secondary);
    font-size: 13px;
  }
}

.powerbi-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
}

.powerbi-frame {
  display: block;
  width: 100%;
  height: calc(100vh - 220px);
  min-height: 541px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  background: var(--el-bg-color);
}

.powerbi-empty {
  min-height: 541px;
  border: 1px solid var(--el-border-color-light);
  background: var(--el-bg-color);
}

@media (max-width: 768px) {
  .powerbi-report-page {
    min-height: calc(100vh - 92px);
    padding: 8px;
  }

  .powerbi-toolbar {
    align-items: stretch;
    flex-direction: column;
    padding: 12px;
  }

  .powerbi-actions {
    justify-content: flex-start;
  }

  .powerbi-frame {
    height: calc(100vh - 240px);
    min-height: 480px;
  }
}
</style>
