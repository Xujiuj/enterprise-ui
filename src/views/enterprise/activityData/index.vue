<template>
  <EnterpriseCrudPage :config="config" :api="api" />
</template>

<script setup name="EnterpriseActivityData" lang="ts">
import EnterpriseCrudPage from '@/views/enterprise/components/EnterpriseCrudPage.vue';
import { addActivityData, delActivityData, getActivityData, listActivityData, updateActivityData } from '@/api/enterprise/activityData';

const statusOptions = [
  { label: '草稿', value: 'draft' },
  { label: '已提交', value: 'submitted' },
  { label: '已锁定', value: 'locked' }
];

const config = {
  title: '排放活动数据',
  description: '维护企业本地活动数据。新增建议优先使用活动数据录入页完成服务端校验。',
  permissionPrefix: 'enterprise:activityData',
  readonly: true,
  extension: {
    moduleCode: 'activity_data',
    ownerTableCode: 'ce_activity_data'
  },
  columns: [
    { prop: 'activityPeriod', label: '期间', width: 110 },
    { prop: 'emissionSourceId', label: '排放源ID', minWidth: 130 },
    { prop: 'activityValue', label: '活动数据', width: 120 },
    { prop: 'activityUnit', label: '单位', width: 90 },
    { prop: 'factorConfirmationId', label: '因子确认ID', minWidth: 130 },
    { prop: 'calculatedEmission', label: '计算排放量', width: 130 },
    {
      prop: 'dataStatus',
      label: '状态',
      type: 'tag',
      width: 100,
      valueMap: { draft: '草稿', submitted: '已提交', locked: '已锁定' },
      tagMap: { draft: 'info', submitted: 'success', locked: 'warning' }
    },
    { prop: 'remark', label: '备注', minWidth: 180 }
  ],
  searchFields: [
    { prop: 'activityPeriod', label: '期间' },
    { prop: 'emissionSourceId', label: '排放源ID' },
    { prop: 'factorConfirmationId', label: '因子确认ID' },
    { prop: 'dataStatus', label: '状态', type: 'select', options: statusOptions }
  ],
  formFields: [
    { prop: 'batchId', label: '批次ID' },
    { prop: 'emissionSourceId', label: '排放源ID', required: true },
    { prop: 'activityPeriod', label: '期间', required: true },
    { prop: 'activityValue', label: '活动数据', type: 'number', required: true, precision: 4 },
    { prop: 'activityUnit', label: '单位', required: true },
    { prop: 'factorConfirmationId', label: '因子确认ID' },
    { prop: 'calculatedEmission', label: '计算排放量', type: 'number', precision: 6 },
    { prop: 'dataStatus', label: '状态', type: 'select', options: statusOptions, required: true },
    { prop: 'remark', label: '备注', type: 'textarea' }
  ],
  emptyForm: {
    dataStatus: 'draft'
  }
};

const api = {
  list: listActivityData,
  get: getActivityData,
  add: addActivityData,
  update: updateActivityData,
  remove: delActivityData
};
</script>
