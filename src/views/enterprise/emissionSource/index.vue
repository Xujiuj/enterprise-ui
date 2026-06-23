<template>
  <EnterpriseCrudPage :config="config" :api="api" />
</template>

<script setup name="EnterpriseEmissionSource" lang="ts">
import EnterpriseCrudPage from '@/views/enterprise/components/EnterpriseCrudPage.vue';
import { addEmissionSource, delEmissionSource, getEmissionSource, listEmissionSource, updateEmissionSource } from '@/api/enterprise/emissionSource';

const config = {
  title: '排放源识别',
  description: '维护客户样例口径的排放源识别数据，供活动数据录入和排放计算引用。',
  permissionPrefix: 'enterprise:emissionSource',
  columns: [
    { prop: 'companyCode', label: 'FK_公司编号', minWidth: 140 },
    { prop: 'companyName', label: '公司名称', minWidth: 180 },
    { prop: 'factoryName', label: '工厂', minWidth: 150 },
    { prop: 'sourceCategoryKey', label: 'FK_排放源分类', minWidth: 150 },
    { prop: 'scopeName', label: '范围', width: 110 },
    { prop: 'scopeSubcategory', label: '范围子类别', minWidth: 160 },
    { prop: 'sourceIdentificationCode', label: 'PK_排放源识别编号', minWidth: 170 },
    { prop: 'sourceIdentificationName', label: '排放源识别', minWidth: 180 },
    { prop: 'emissionSourceName', label: '排放源', minWidth: 180 },
    { prop: 'responsibleDept', label: '负责部门', minWidth: 150 },
    { prop: 'dataSource', label: '数据来源', minWidth: 150 },
    { prop: 'factorKey', label: 'FK_排放因子', minWidth: 140 }
  ],
  searchFields: [
    { prop: 'companyCode', label: 'FK_公司编号' },
    { prop: 'factoryName', label: '工厂' },
    { prop: 'sourceIdentificationCode', label: 'PK_排放源识别编号' },
    { prop: 'emissionSourceName', label: '排放源' }
  ],
  formFields: [
    { prop: 'companyCode', label: 'FK_公司编号', required: true },
    { prop: 'companyName', label: '公司名称' },
    { prop: 'factoryName', label: '工厂' },
    { prop: 'sourceCategoryKey', label: 'FK_排放源分类', required: true },
    { prop: 'scopeName', label: '范围' },
    { prop: 'scopeSubcategory', label: '范围子类别' },
    { prop: 'sourceIdentificationCode', label: 'PK_排放源识别编号', required: true },
    { prop: 'sourceIdentificationName', label: '排放源识别' },
    { prop: 'emissionSourceName', label: '排放源' },
    { prop: 'responsibleDept', label: '负责部门' },
    { prop: 'dataSource', label: '数据来源' },
    { prop: 'factorKey', label: 'FK_排放因子' }
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
