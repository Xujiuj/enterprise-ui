<template>
  <div class="powerbi-report-page">
    <section class="powerbi-toolbar">
      <div>
        <h1>企业温室气体核算数字化平台</h1>
        <p>正在加载企业温室气体核算报表。</p>
      </div>
      <div class="powerbi-actions">
        <el-button icon="Refresh" @click="refreshReport">刷新</el-button>
        <el-button type="primary" icon="Link" @click="openReport">新窗口打开</el-button>
      </div>
    </section>

    <iframe
      :key="frameKey"
      title="企业温室气体核算数字化平台"
      class="powerbi-frame"
      width="1140"
      height="541.25"
      :src="reportUrl"
      frameborder="0"
      allowfullscreen
    />
  </div>
</template>

<script setup name="EnterprisePowerBiReport" lang="ts">
import { ref } from 'vue';

const reportUrl = 'https://app.powerbi.com/reportEmbed?reportId=a5fe1fc7-db00-4093-aa48-958e9b2ef205&autoAuth=true&ctid=e6411fdb-6d77-4ffd-b015-619c75b13768';

const frameKey = ref(0);

const refreshReport = () => {
  frameKey.value += 1;
};

const openReport = () => {
  window.open(reportUrl, '_blank', 'noopener,noreferrer');
};
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
