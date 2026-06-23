<template>
  <EnterpriseCrudPage :config="config" :api="api" />
</template>

<script setup name="EnterpriseEmissionSource" lang="ts">
import EnterpriseCrudPage from '@/views/enterprise/components/EnterpriseCrudPage.vue';
import { addEmissionSource, delEmissionSource, getEmissionSource, listEmissionSource, updateEmissionSource } from '@/api/enterprise/emissionSource';
import { DATA_SOURCE_OPTIONS, loadDeptOptions, loadDimensionOptions } from '@/utils/enterpriseFieldOptions';

const loadCompanyOptions = () => loadDimensionOptions('company');
const loadFactoryOptions = () =>
  loadDimensionOptions('company', (record) => {
    const factoryName = record.field02 || record.recordName;
    if (!factoryName) return undefined;
    return {
      label: [record.recordCode, factoryName].filter(Boolean).join(' / '),
      value: factoryName,
      record
    };
  });
const loadSourceCategoryOptions = () => loadDimensionOptions('emission-source-category');
const loadFactorOptions = () => loadDimensionOptions('ef-factor');

const enabledOptions = [
  { label: '启用', value: true },
  { label: '停用', value: false }
];

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
    { prop: 'companyCode', label: 'FK_公司编号', type: 'select', loadOptions: loadCompanyOptions },
    { prop: 'factoryName', label: '工厂', type: 'select', loadOptions: loadFactoryOptions },
    { prop: 'sourceCategoryKey', label: 'FK_排放源分类', type: 'select', loadOptions: loadSourceCategoryOptions },
    { prop: 'sourceIdentificationCode', label: 'PK_排放源识别编号' },
    { prop: 'emissionSourceName', label: '排放源' },
    { prop: 'responsibleDept', label: '负责部门', type: 'select', loadOptions: loadDeptOptions },
    { prop: 'dataSource', label: '数据来源', type: 'select', options: DATA_SOURCE_OPTIONS },
    { prop: 'factorKey', label: 'FK_排放因子', type: 'select', loadOptions: loadFactorOptions },
    { prop: 'enabledFlag', label: '状态', type: 'select', options: enabledOptions }
  ],
  formFields: [
    { prop: 'companyCode', label: 'FK_公司编号', type: 'select', loadOptions: loadCompanyOptions, onChange: applyCompany, required: true },
    { prop: 'companyName', label: '公司名称', disabled: true },
    { prop: 'factoryName', label: '工厂', type: 'select', loadOptions: loadFactoryOptions },
    { prop: 'sourceCategoryKey', label: 'FK_排放源分类', type: 'select', loadOptions: loadSourceCategoryOptions, onChange: applySourceCategory, required: true },
    { prop: 'scopeName', label: '范围', disabled: true },
    { prop: 'scopeSubcategory', label: '范围子类别', disabled: true },
    { prop: 'sourceIdentificationCode', label: 'PK_排放源识别编号', required: true },
    { prop: 'sourceIdentificationName', label: '排放源识别' },
    { prop: 'emissionSourceName', label: '排放源' },
    { prop: 'responsibleDept', label: '负责部门', type: 'select', loadOptions: loadDeptOptions },
    { prop: 'dataSource', label: '数据来源', type: 'select', options: DATA_SOURCE_OPTIONS },
    { prop: 'factorKey', label: 'FK_排放因子', type: 'select', loadOptions: loadFactorOptions, onChange: applyFactor }
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
