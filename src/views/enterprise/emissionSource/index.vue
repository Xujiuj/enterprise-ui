<template>
  <RuoyiCrudPage :config="config" :api="api" />
</template>

<script setup name="EnterpriseEmissionSource" lang="ts">
import RuoyiCrudPage from '@/views/enterprise/components/RuoyiCrudPage.vue';
import { addEmissionSource, delEmissionSource, getEmissionSource, listEmissionSource, updateEmissionSource } from '@/api/enterprise/emissionSource';

const enabledOptions = [
  { label: '启用', value: true },
  { label: '停用', value: false }
];

const config = {
  title: '排放源识别',
  description: '维护企业本地排放源，供活动数据录入和排放计算引用。',
  permissionPrefix: 'enterprise:emissionSource',
  columns: [
    { prop: 'sourceCode', label: '排放源编码', minWidth: 150 },
    { prop: 'sourceName', label: '排放源名称', minWidth: 180 },
    { prop: 'sourceCategoryCode', label: '分类编码', minWidth: 140 },
    { prop: 'sourceCategoryName', label: '分类名称', minWidth: 150 },
    { prop: 'facilityName', label: '设施/产线', minWidth: 150 },
    { prop: 'boundaryScope', label: '核算范围', width: 120 },
    {
      prop: 'enabledFlag',
      label: '状态',
      type: 'tag',
      width: 90,
      valueMap: { true: '启用', false: '停用' },
      tagMap: { true: 'success', false: 'info' }
    },
    { prop: 'remark', label: '备注', minWidth: 180 }
  ],
  searchFields: [
    { prop: 'sourceCode', label: '排放源编码' },
    { prop: 'sourceName', label: '排放源名称' },
    { prop: 'sourceCategoryCode', label: '分类编码' },
    { prop: 'enabledFlag', label: '状态', type: 'select', options: enabledOptions }
  ],
  formFields: [
    { prop: 'sourceCode', label: '排放源编码', required: true },
    { prop: 'sourceName', label: '排放源名称', required: true },
    { prop: 'sourceCategoryCode', label: '分类编码' },
    { prop: 'sourceCategoryName', label: '分类名称' },
    { prop: 'facilityName', label: '设施/产线' },
    { prop: 'boundaryScope', label: '核算范围' },
    { prop: 'enabledFlag', label: '启用状态', type: 'switch' },
    { prop: 'remark', label: '备注', type: 'textarea' }
  ],
  emptyForm: {
    enabledFlag: true
  }
};

const api = {
  list: listEmissionSource,
  get: getEmissionSource,
  add: addEmissionSource,
  update: updateEmissionSource,
  remove: delEmissionSource
};
</script>
