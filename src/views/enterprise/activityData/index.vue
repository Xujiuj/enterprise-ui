<template>
  <div class="enterprise-activity-data">
    <el-tabs>
      <el-tab-pane label="填报与上传">
        <EnterpriseActivityEntry />
      </el-tab-pane>
      <el-tab-pane label="导入结果">
        <EnterpriseImportResults />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup name="EnterpriseActivityData" lang="ts">
import EnterpriseActivityEntry from '@/views/enterprise/activityEntry/index.vue';
import EnterpriseImportResults from '@/views/enterprise/importResults/index.vue';
</script>

<style scoped lang="scss">
.enterprise-activity-data {
  padding: 8px;
}
</style>
