<template>
  <div class="powerbi-report-page">
    <iframe
      title="企业温室气体核算数字化平台"
      class="powerbi-frame"
      :src="reportUrl"
      frameborder="0"
      allowfullscreen
    />
  </div>
</template>

<script setup name="EnterprisePowerBiReport" lang="ts">
const reportUrl =
  'https://app.powerbi.com/reportEmbed?reportId=a5fe1fc7-db00-4093-aa48-958e9b2ef205&autoAuth=true&ctid=e6411fdb-6d77-4ffd-b015-619c75b13768&actionBarEnabled=true&reportCopilotInEmbed=true';
</script>

<style scoped lang="scss">
.powerbi-report-page {
  width: 100%;
  min-height: calc(100vh - 116px);
  padding: 12px;
  background: var(--el-bg-color-page);
}

.powerbi-frame {
  display: block;
  width: 100%;
  height: calc(100vh - 140px);
  min-height: 560px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  background: var(--el-bg-color);
}

@media (max-width: 768px) {
  .powerbi-report-page {
    min-height: calc(100vh - 92px);
    padding: 8px;
  }

  .powerbi-frame {
    height: calc(100vh - 108px);
    min-height: 520px;
  }
}
</style>
