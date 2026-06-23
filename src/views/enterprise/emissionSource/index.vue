<template>
  <EnterpriseCrudPage :config="config" :api="api" />
</template>

<script setup name="EnterpriseEmissionSource" lang="ts">
import EnterpriseCrudPage from '@/views/enterprise/components/EnterpriseCrudPage.vue';
import { addEmissionSource, delEmissionSource, getEmissionSource, listEmissionSource, updateEmissionSource } from '@/api/enterprise/emissionSource';

const enabledOptions = [
  { label: '启用', value: true },
  { label: '停用', value: false }
];

const config = {
  title: '排放源识别',
  description: '维护客户样例口径的排放源识别数据，供活动数据录入和排放计算引用。',
  permissionPrefix: 'enterprise:emissionSource',
  columns: [
    { prop: 'companyCode', label: '公司编号', minWidth: 140 },
    { prop: 'companyName', label: '公司名称', minWidth: 180 },
    { prop: 'factoryName', label: '工厂', minWidth: 150 },
    { prop: 'sourceCategoryKey', label: '排放源分类', minWidth: 150 },
    { prop: 'scopeName', label: '范围', width: 110 },
    { prop: 'scopeSubcategory', label: '范围子分类', minWidth: 160 },
    { prop: 'sourceIdentificationCode', label: '排放源识别编号', minWidth: 170 },
    { prop: 'sourceIdentificationName', label: '排放源识别', minWidth: 180 },
    { prop: 'emissionSourceName', label: '排放源', minWidth: 180 },
    { prop: 'responsibleDept', label: '负责部门', minWidth: 150 },
    { prop: 'dataSource', label: '数据来源', minWidth: 150 },
    { prop: 'factorKey', label: '排放因子', minWidth: 140 },
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
    { prop: 'companyCode', label: '公司编号' },
    { prop: 'factoryName', label: '工厂' },
    { prop: 'sourceIdentificationCode', label: '识别编号' },
    { prop: 'emissionSourceName', label: '排放源' },
    { prop: 'enabledFlag', label: '状态', type: 'select', options: enabledOptions }
  ],
  formFields: [
    { prop: 'companyCode', label: '公司编号', required: true },
    { prop: 'companyName', label: '公司名称' },
    { prop: 'factoryName', label: '工厂' },
    { prop: 'sourceCategoryKey', label: '排放源分类', required: true },
    { prop: 'scopeName', label: '范围' },
    { prop: 'scopeSubcategory', label: '范围子分类' },
    { prop: 'sourceIdentificationCode', label: '排放源识别编号', required: true },
    { prop: 'sourceIdentificationName', label: '排放源识别' },
    { prop: 'emissionSourceName', label: '排放源' },
    { prop: 'responsibleDept', label: '负责部门' },
    { prop: 'dataSource', label: '数据来源' },
    { prop: 'factorKey', label: '排放因子' },
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
