<template>
  <div class="powerbi-report-page">
    <section class="powerbi-toolbar">
      <div>
        <h1>温室气体核算报表</h1>
        <p>{{ statusText }}</p>
      </div>
      <div class="powerbi-actions">
        <el-button icon="Refresh" @click="refreshReport">刷新</el-button>
        <el-button type="primary" icon="Link" @click="openReport">新窗口打开</el-button>
      </div>
    </section>

    <el-alert v-if="embedNotice" class="powerbi-notice" :title="embedNotice" type="warning" :closable="false" show-icon />

    <div v-show="sdkActive" ref="reportContainerRef" class="powerbi-frame powerbi-sdk-frame" />
    <iframe
      v-show="!sdkActive"
      :key="frameKey"
      title="企业碳管理数字化平台（会员版）"
      class="powerbi-frame"
      :src="fallbackReportUrl"
      frameborder="0"
      allow="fullscreen; clipboard-read; clipboard-write"
      allowfullscreen
    />
  </div>
</template>

<script setup name="EnterprisePowerBiReport" lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';

type PowerBiService = {
  embed: (container: HTMLElement, config: Record<string, unknown>) => unknown;
  reset?: (container: HTMLElement) => void;
};

type PowerBiClient = {
  models: {
    TokenType: {
      Embed: string | number;
    };
  };
};

declare global {
  interface Window {
    powerbi?: PowerBiService;
    'powerbi-client'?: PowerBiClient;
    __POWERBI_EMBED_TOKEN__?: string;
  }
}

const reportId = 'fe3213fc-3659-4a24-a7d8-031353e805f5';
const groupId = '3d918536-4851-4c7e-bc1a-0874d05eafdc';
const tenantId = 'e6411fdb-6d77-4ffd-b015-619c75b13768';
const embedUrl = `https://app.powerbi.com/reportEmbed?reportId=${reportId}&groupId=${groupId}`;
const fallbackReportUrl = `https://app.powerbi.com/reportEmbed?reportId=${reportId}&groupId=${groupId}&autoAuth=true&ctid=${tenantId}`;
const powerBiClientSrc = 'https://cdn.jsdelivr.net/npm/powerbi-client/dist/powerbi.min.js';
const tokenStorageKey = 'enterprisePowerBiEmbedToken';

const frameKey = ref(0);
const sdkActive = ref(false);
const sdkLoading = ref(false);
const embedNotice = ref('');
const reportContainerRef = ref<HTMLElement>();

const statusText = computed(() => {
  if (sdkActive.value) {
    return '已使用 Power BI Embedded SDK 加载会员版报表。';
  }

  if (sdkLoading.value) {
    return '正在加载 Power BI Embedded SDK。';
  }

  return '如内嵌登录无响应，请在新窗口完成 Microsoft 登录后返回刷新。';
});

const normalizeBase64 = (value: string) => {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  return base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
};

const parseTokenExpiry = (token: string) => {
  const payload = token.split('.')[1];

  if (!payload) {
    return undefined;
  }

  try {
    const json = atob(normalizeBase64(payload));
    const decoded = JSON.parse(json) as { exp?: number };
    return typeof decoded.exp === 'number' ? decoded.exp : undefined;
  } catch {
    return undefined;
  }
};

const hasFreshEmbedToken = (token: string) => {
  const expiry = parseTokenExpiry(token);
  return !expiry || expiry * 1000 > Date.now() + 60_000;
};

const getRuntimeEmbedToken = () => {
  const injectedToken = window.__POWERBI_EMBED_TOKEN__?.trim();
  const storedToken = window.localStorage?.getItem(tokenStorageKey)?.trim();

  return injectedToken || storedToken || '';
};

const loadPowerBiClient = () =>
  new Promise<void>((resolve, reject) => {
    if (window.powerbi && window['powerbi-client']) {
      resolve();
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${powerBiClientSrc}"]`);

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Power BI SDK 加载失败')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = powerBiClientSrc;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Power BI SDK 加载失败'));
    document.head.appendChild(script);
  });

const resetSdkReport = () => {
  const container = reportContainerRef.value;

  if (container) {
    window.powerbi?.reset?.(container);
  }
};

const embedWithSdk = async () => {
  const token = getRuntimeEmbedToken();

  if (!token) {
    sdkActive.value = false;
    embedNotice.value = '未检测到有效的 Power BI Embedded token，当前使用 Microsoft 登录 iframe 方式。';
    return;
  }

  if (!hasFreshEmbedToken(token)) {
    sdkActive.value = false;
    embedNotice.value = 'Power BI Embedded token 已过期，当前使用 Microsoft 登录 iframe 方式。';
    return;
  }

  sdkLoading.value = true;

  try {
    await loadPowerBiClient();
    await nextTick();

    const container = reportContainerRef.value;
    const powerbi = window.powerbi;
    const models = window['powerbi-client']?.models;

    if (!container || !powerbi || !models) {
      throw new Error('Power BI SDK 未就绪');
    }

    resetSdkReport();
    powerbi.embed(container, {
      type: 'report',
      id: reportId,
      embedUrl,
      accessToken: token,
      tokenType: models.TokenType.Embed,
      settings: {
        panes: {
          filters: { visible: false }
        }
      }
    });

    sdkActive.value = true;
    embedNotice.value = '';
  } catch (error) {
    sdkActive.value = false;
    embedNotice.value = error instanceof Error ? `${error.message}，当前使用 iframe 方式。` : 'Power BI SDK 加载异常，当前使用 iframe 方式。';
  } finally {
    sdkLoading.value = false;
  }
};

const refreshReport = async () => {
  resetSdkReport();
  sdkActive.value = false;
  frameKey.value += 1;
  await embedWithSdk();
};

const openReport = () => {
  window.open(fallbackReportUrl, '_blank', 'noopener,noreferrer');
};

onMounted(() => {
  void embedWithSdk();
});

onBeforeUnmount(() => {
  resetSdkReport();
});
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

.powerbi-notice {
  flex: 0 0 auto;
}

.powerbi-frame {
  display: block;
  width: 100%;
  height: calc(100vh - 268px);
  min-height: 520px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  background: var(--el-bg-color);
}

.powerbi-sdk-frame {
  overflow: hidden;
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
    height: calc(100vh - 280px);
    min-height: 480px;
  }
}
</style>
