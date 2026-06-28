<template>
  <div class="p-2 enterprise-activity-data page-panel">
    <section class="page-head">
      <div>
        <h1>排放活动数据</h1>
        <p>填报、上传并校验企业排放活动原始明细数据，支持 Excel 批量导入和导入结果追踪。</p>
      </div>
    </section>

    <section class="panel">
      <el-tabs>
        <el-tab-pane label="填报与上传">
          <EnterpriseActivityEntry />
        </el-tab-pane>
        <el-tab-pane label="导入结果">
          <EnterpriseImportResults />
        </el-tab-pane>
        <el-tab-pane label="扩展字段维护">
          <EnterpriseActivityDataExtension />
        </el-tab-pane>
      </el-tabs>
    </section>
  </div>
</template>

<script setup name="EnterpriseActivityData" lang="ts">
import EnterpriseActivityEntry from '@/views/enterprise/activityEntry/index.vue';
import EnterpriseActivityDataExtension from '@/views/enterprise/activityData/extension.vue';
import EnterpriseImportResults from '@/views/enterprise/importResults/index.vue';
</script>

<style scoped lang="scss">
.enterprise-activity-data {
  :deep(.el-tabs__header) {
    margin-bottom: 16px;
  }
}
</style>
