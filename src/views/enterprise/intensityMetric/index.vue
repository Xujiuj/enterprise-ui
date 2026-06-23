<template>
  <EnterpriseCrudPage :config="config" :api="api" />
</template>

<script setup name="EnterpriseIntensityMetric" lang="ts">
import EnterpriseCrudPage from '@/views/enterprise/components/EnterpriseCrudPage.vue';
import {
  addIntensityMetric,
  delIntensityMetric,
  getIntensityMetric,
  listIntensityMetric,
  updateIntensityMetric
} from '@/api/enterprise/intensityMetric';
import { loadIntensityMetricStatusOptions, loadIntensityRuleOptions, loadIntensityTargetOptions } from '@/utils/enterpriseFieldOptions';

const config = {
  title: '强度指标结果',
  description: '查看和维护企业碳排放强度结果。分母事实来自强度分母事实表，用户侧展示指标、期间、排放量、分母和目标，不暴露内部事实记录编号。',
  permissionPrefix: 'enterprise:intensityMetric',
  extension: {
    moduleCode: 'intensity_denominator' as const,
    ownerTableCode: 'ce_intensity_denominator_fact' as const
  },
  columns: [
    { prop: 'metricName', label: '指标名称', minWidth: 180 },
    { prop: 'ruleCode', label: '分母规则', minWidth: 140 },
    { prop: 'metricPeriod', label: '期间', width: 110 },
    { prop: 'numeratorEmission', label: '排放量分子', width: 130 },
    { prop: 'denominatorValue', label: '分母值', width: 120 },
    { prop: 'denominatorUnit', label: '分母单位', width: 110 },
    { prop: 'intensityValue', label: '强度值', width: 120 },
    {
      prop: 'metricStatus',
      label: '状态',
      type: 'tag',
      width: 100,
      tagMap: { draft: 'info', active: 'success', archived: 'warning' }
    },
    { prop: 'remark', label: '备注', minWidth: 180 }
  ],
  searchFields: [
    { prop: 'metricName', label: '指标名称' },
    { prop: 'ruleCode', label: '分母规则', type: 'select', loadOptions: loadIntensityRuleOptions },
    { prop: 'metricPeriod', label: '期间', type: 'month' },
    { prop: 'targetCode', label: '目标', type: 'select', loadOptions: loadIntensityTargetOptions },
    { prop: 'metricStatus', label: '状态', type: 'select', loadOptions: loadIntensityMetricStatusOptions }
  ],
  formFields: [
    { prop: 'metricCode', label: '指标编码', required: true },
    { prop: 'metricName', label: '指标名称', required: true },
    { prop: 'ruleCode', label: '分母规则', type: 'select', loadOptions: loadIntensityRuleOptions },
    { prop: 'metricPeriod', label: '期间', type: 'month', required: true },
    { prop: 'numeratorEmission', label: '排放量分子', type: 'number', required: true, precision: 6 },
    { prop: 'denominatorValue', label: '分母值', type: 'number', required: true, precision: 6 },
    { prop: 'denominatorUnit', label: '分母单位', required: true },
    { prop: 'intensityValue', label: '强度值', type: 'number', precision: 6 },
    { prop: 'targetCode', label: '目标', type: 'select', loadOptions: loadIntensityTargetOptions },
    { prop: 'metricStatus', label: '状态', type: 'select', loadOptions: loadIntensityMetricStatusOptions, required: true },
    { prop: 'remark', label: '备注', type: 'textarea' }
  ],
  emptyForm: {
    metricStatus: 'draft'
  }
};

const api = {
  list: listIntensityMetric,
  get: getIntensityMetric,
  add: addIntensityMetric,
  update: updateIntensityMetric,
  remove: delIntensityMetric
};
</script>
