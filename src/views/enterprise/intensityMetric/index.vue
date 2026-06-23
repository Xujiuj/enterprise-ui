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

const statusOptions = [
  { label: '草稿', value: 'draft' },
  { label: '生效', value: 'active' },
  { label: '归档', value: 'archived' }
];

const config = {
  title: '强度指标结果',
  description: '维护客户样例口径的碳排放强度指标结果，分母数据来自强度分母事实表。',
  permissionPrefix: 'enterprise:intensityMetric',
  extension: {
    moduleCode: 'intensity_denominator' as const,
    ownerTableCode: 'ce_intensity_denominator_fact' as const
  },
  columns: [
    { prop: 'metricCode', label: '指标编码', minWidth: 150 },
    { prop: 'metricName', label: '指标名称', minWidth: 180 },
    { prop: 'ruleCode', label: '规则编码', minWidth: 140 },
    { prop: 'metricPeriod', label: '期间', width: 110 },
    { prop: 'numeratorEmission', label: '排放量分子', width: 130 },
    { prop: 'denominatorFactId', label: '分母事实ID', width: 120 },
    { prop: 'denominatorValue', label: '分母值', width: 120 },
    { prop: 'denominatorUnit', label: '分母单位', width: 110 },
    { prop: 'intensityValue', label: '强度值', width: 120 },
    { prop: 'targetCode', label: '目标编码', minWidth: 140 },
    {
      prop: 'metricStatus',
      label: '状态',
      type: 'tag',
      width: 100,
      valueMap: { draft: '草稿', active: '生效', archived: '归档' },
      tagMap: { draft: 'info', active: 'success', archived: 'warning' }
    },
    { prop: 'remark', label: '备注', minWidth: 180 }
  ],
  searchFields: [
    { prop: 'metricCode', label: '指标编码' },
    { prop: 'metricName', label: '指标名称' },
    { prop: 'ruleCode', label: '规则编码' },
    { prop: 'metricPeriod', label: '期间' },
    { prop: 'targetCode', label: '目标编码' },
    { prop: 'metricStatus', label: '状态', type: 'select', options: statusOptions }
  ],
  formFields: [
    { prop: 'metricCode', label: '指标编码', required: true },
    { prop: 'metricName', label: '指标名称', required: true },
    { prop: 'ruleCode', label: '规则编码' },
    { prop: 'metricPeriod', label: '期间', required: true },
    { prop: 'numeratorEmission', label: '排放量分子', type: 'number', required: true, precision: 6 },
    { prop: 'denominatorFactId', label: '分母事实ID', type: 'number', precision: 0 },
    { prop: 'denominatorValue', label: '分母值', type: 'number', required: true, precision: 6 },
    { prop: 'denominatorUnit', label: '分母单位', required: true },
    { prop: 'intensityValue', label: '强度值', type: 'number', precision: 6 },
    { prop: 'targetCode', label: '目标编码' },
    { prop: 'metricStatus', label: '状态', type: 'select', options: statusOptions, required: true },
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
