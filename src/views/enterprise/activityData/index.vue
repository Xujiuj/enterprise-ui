<template>
  <div class="app-container enterprise-activity-data">
    <section class="page-head">
      <div>
        <h1>排放活动数据</h1>
        <p>填报、上传并校验企业排放活动原始明细数据，支持 Excel 批量导入。</p>
      </div>
    </section>

    <EnterpriseActivityEntry />
  </div>
</template>

<script setup name="EnterpriseActivityData" lang="ts">
import EnterpriseActivityEntry from '@/views/enterprise/activityEntry/index.vue';
</script>
