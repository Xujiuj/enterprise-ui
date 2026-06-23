<template>
  <EnterpriseCrudPage :config="config" :api="api" />
</template>

<script setup name="EnterpriseEmissionSource" lang="ts">
import EnterpriseCrudPage from '@/views/enterprise/components/EnterpriseCrudPage.vue';
import { addEmissionSource, delEmissionSource, getEmissionSource, listEmissionSource, updateEmissionSource } from '@/api/enterprise/emissionSource';
import {
  loadDeptOptions,
  loadDimensionOptions,
  loadFactorOptions,
  loadBooleanStatusOptions,
  loadDataSourceOptions
} from '@/utils/enterpriseFieldOptions';

const loadCompanyOptions = () =>
  loadDimensionOptions('company', (record) => {
    const factoryCode = record.field01 || record.recordCode;
    const factoryName = record.field02 || record.recordName;
    return {
      label: [factoryCode, factoryName].filter(Boolean).join(' / '),
      value: factoryCode,
      record
    };
  });

const loadFactoryOptions = () =>
  loadDimensionOptions('company', (record) => {
    const factoryCode = record.field01 || record.recordCode;
    const factoryName = record.field02 || record.recordName;
    if (!factoryName) return undefined;
    return {
      label: [factoryCode, factoryName].filter(Boolean).join(' / '),
      value: factoryName,
      record
    };
  });

const loadSourceCategoryOptions = () => loadDimensionOptions('emission-source-category');
const loadEmissionSourceOptions = () => loadDimensionOptions('emission-source');

const applyCompany = (_value: unknown, form: Record<string, any>, option?: { record?: Record<string, any> }) => {
  const record = option?.record;
  if (!record) return;
  form.companyName = record.recordName;
  form.factoryName = record.field02 || form.factoryName;
};

const applySourceCategory = (_value: unknown, form: Record<string, any>, option?: { record?: Record<string, any> }) => {
  const record = option?.record;
  if (!record) return;
  form.scopeName = record.field01 || form.scopeName;
  form.scopeSubcategory = record.recordName || form.scopeSubcategory;
};

const applyFactor = (_value: unknown, form: Record<string, any>, option?: { record?: Record<string, any> }) => {
  const record = option?.record;
  if (!record) return;
  form.emissionSourceName = form.emissionSourceName || record.recordName;
};

const config = {
  title: '排放源识别',
  description: '维护企业排放源、负责部门、数据来源和适用因子。企业填报活动数据时只需选择排放源，系统自动带出公司、工厂、分类、范围和因子。',
  permissionPrefix: 'enterprise:emissionSource',
  columns: [
    { prop: 'companyName', label: '公司名称', minWidth: 180 },
    { prop: 'factoryName', label: '工厂', minWidth: 180 },
    { prop: 'scopeName', label: '核算范围', width: 110 },
    { prop: 'scopeSubcategory', label: '范围子类别', minWidth: 170 },
    { prop: 'sourceIdentificationCode', label: '排放源编号', minWidth: 150 },
    { prop: 'sourceIdentificationName', label: '排放源识别', minWidth: 180 },
    { prop: 'emissionSourceName', label: '排放源', minWidth: 180 },
    { prop: 'responsibleDept', label: '负责部门', minWidth: 150 },
    { prop: 'dataSource', label: '数据来源', minWidth: 150 }
  ],
  searchFields: [
    { prop: 'companyCode', label: '公司/工厂', type: 'select', loadOptions: loadCompanyOptions },
    { prop: 'factoryName', label: '工厂', type: 'select', loadOptions: loadFactoryOptions },
    { prop: 'sourceCategoryKey', label: '排放源分类', type: 'select', loadOptions: loadSourceCategoryOptions },
    { prop: 'sourceIdentificationCode', label: '排放源编号', type: 'select', loadOptions: loadEmissionSourceOptions },
    { prop: 'responsibleDept', label: '负责部门', type: 'select', loadOptions: loadDeptOptions },
    { prop: 'dataSource', label: '数据来源', type: 'select', loadOptions: loadDataSourceOptions },
    { prop: 'factorKey', label: '适用因子', type: 'select', loadOptions: loadFactorOptions },
    { prop: 'enabledFlag', label: '状态', type: 'select', loadOptions: loadBooleanStatusOptions }
  ],
  formFields: [
    { prop: 'companyCode', label: '公司/工厂', type: 'select', loadOptions: loadCompanyOptions, onChange: applyCompany, required: true },
    { prop: 'companyName', label: '公司名称', disabled: true },
    { prop: 'factoryName', label: '工厂', type: 'select', loadOptions: loadFactoryOptions },
    {
      prop: 'sourceCategoryKey',
      label: '排放源分类',
      type: 'select',
      loadOptions: loadSourceCategoryOptions,
      onChange: applySourceCategory,
      required: true
    },
    { prop: 'scopeName', label: '核算范围', disabled: true },
    { prop: 'scopeSubcategory', label: '范围子类别', disabled: true },
    { prop: 'sourceIdentificationCode', label: '排放源编号', required: true },
    { prop: 'sourceIdentificationName', label: '排放源识别' },
    { prop: 'emissionSourceName', label: '排放源' },
    { prop: 'responsibleDept', label: '负责部门', type: 'select', loadOptions: loadDeptOptions },
    { prop: 'dataSource', label: '数据来源', type: 'select', loadOptions: loadDataSourceOptions },
    { prop: 'factorKey', label: '适用因子', type: 'select', loadOptions: loadFactorOptions, onChange: applyFactor }
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
