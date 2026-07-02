<template>
  <EnterpriseCrudPage :config="config" :api="api" />
</template>

<script setup name="EnterpriseEmissionSource" lang="ts">
import EnterpriseCrudPage from '@/views/enterprise/components/EnterpriseCrudPage.vue';
import { addEmissionSource, delEmissionSource, getEmissionSource, listEmissionSource, updateEmissionSource } from '@/api/enterprise/emissionSource';
import {
  loadBooleanStatusOptions,
  loadCompanyCodeOptions,
  loadDataFrequencyOptions,
  loadDataSourceOptions,
  loadEmissionSourceCodeOptions,
  loadFactorOptions,
  loadFactoryNameOptions,
  loadResponsibleDeptOptions,
  loadResponsibleUserOptions,
  loadSourceCategoryOptions
} from '@/utils/enterpriseFieldOptions';

const assignFromRecord = (form: Record<string, any>, record: Record<string, any> | undefined, props: string[]) => {
  if (!record) return;
  props.forEach((prop) => {
    const value = record[prop];
    if (value !== undefined && value !== null && value !== '') {
      form[prop] = value;
    }
  });
};

const applyCompany = (_value: unknown, form: Record<string, any>, option?: { record?: Record<string, any> }) => {
  assignFromRecord(form, option?.record, ['companyName']);
};

const applyFactory = (_value: unknown, form: Record<string, any>, option?: { record?: Record<string, any> }) => {
  assignFromRecord(form, option?.record, ['companyCode', 'companyName', 'factoryName']);
};

const applySourceCategory = (_value: unknown, form: Record<string, any>, option?: { record?: Record<string, any> }) => {
  assignFromRecord(form, option?.record, ['sourceCategoryKey', 'scopeName', 'scopeSubcategory']);
};

const applyFactor = (_value: unknown, form: Record<string, any>, option?: { record?: Record<string, any> }) => {
  const record = option?.record;
  if (!record) return;
  form.emissionSourceName = form.emissionSourceName || record.recordName || record.emissionSourceName || record.factorName;
};

const applyResponsibleUser = (_value: unknown, form: Record<string, any>, option?: { record?: Record<string, any> }) => {
  const record = option?.record;
  if (!record) {
    form.responsibleUserName = undefined;
    return;
  }
  form.responsibleUserName = record.nickName || record.userName || '';
};

const config = {
  title: '排放源识别',
  description: '维护企业排放源、数据频次、负责人、负责部门、数据来源和适用因子。公司、工厂、排放源分类均来自企业业务表已有值去重选项。',
  permissionPrefix: 'enterprise:emissionSource',
  extension: {
    moduleCode: 'emission_source',
    ownerTableCode: 'ce_emission_source'
  },
  columns: [
    { prop: 'companyCode', label: 'FK_公司编号', minWidth: 150 },
    { prop: 'companyName', label: '公司名称', minWidth: 180 },
    { prop: 'factoryName', label: '工厂', minWidth: 180 },
    { prop: 'sourceCategoryKey', label: 'FK_排放源分类', minWidth: 150 },
    { prop: 'scopeName', label: '范围', width: 110 },
    { prop: 'scopeSubcategory', label: '范围子类别', minWidth: 170 },
    { prop: 'sourceIdentificationCode', label: 'PK_排放源识别编号', minWidth: 180 },
    { prop: 'sourceIdentificationName', label: '排放源识别', minWidth: 180 },
    { prop: 'emissionSourceName', label: '排放源', minWidth: 180 },
    { prop: 'dataFrequency', label: '数据频次', width: 110, valueMap: { monthly: '月报', daily: '日报', quarterly: '季报' } },
    { prop: 'responsibleUserName', label: '负责人', minWidth: 130 },
    { prop: 'responsibleDept', label: '负责部门', minWidth: 150 },
    { prop: 'dataSource', label: '数据来源', minWidth: 150 },
    { prop: 'factorKey', label: 'FK_排放因子', minWidth: 150 }
  ],
  searchFields: [
    { prop: 'companyCode', label: '公司', type: 'select', loadOptions: loadCompanyCodeOptions },
    { prop: 'factoryName', label: '工厂', type: 'select', loadOptions: loadFactoryNameOptions },
    { prop: 'sourceCategoryKey', label: '排放源分类', type: 'select', loadOptions: loadSourceCategoryOptions },
    { prop: 'sourceIdentificationCode', label: '排放源编号', type: 'select', loadOptions: loadEmissionSourceCodeOptions },
    { prop: 'dataFrequency', label: '数据频次', type: 'select', loadOptions: loadDataFrequencyOptions },
    { prop: 'responsibleUserId', label: '负责人', type: 'select', loadOptions: loadResponsibleUserOptions },
    { prop: 'responsibleDept', label: '负责部门', type: 'select', loadOptions: loadResponsibleDeptOptions },
    { prop: 'dataSource', label: '数据来源', type: 'select', loadOptions: loadDataSourceOptions },
    { prop: 'factorKey', label: '适用因子', type: 'select', loadOptions: loadFactorOptions },
    { prop: 'enabledFlag', label: '状态', type: 'select', loadOptions: loadBooleanStatusOptions }
  ],
  formFields: [
    { prop: 'companyCode', label: '公司', type: 'select', loadOptions: loadCompanyCodeOptions, onChange: applyCompany, required: true },
    { prop: 'factoryName', label: '工厂', type: 'select', loadOptions: loadFactoryNameOptions, onChange: applyFactory },
    {
      prop: 'sourceCategoryKey',
      label: '排放源分类',
      type: 'select',
      loadOptions: loadSourceCategoryOptions,
      onChange: applySourceCategory,
      required: true
    },
    { prop: 'companyName', label: '公司名称', hidden: true },
    { prop: 'scopeName', label: '核算范围', hidden: true },
    { prop: 'scopeSubcategory', label: '范围子类别', hidden: true },
    { prop: 'sourceIdentificationCode', label: '排放源编号', required: true },
    { prop: 'sourceIdentificationName', label: '排放源识别' },
    { prop: 'emissionSourceName', label: '排放源' },
    { prop: 'dataFrequency', label: '数据频次', type: 'select', loadOptions: loadDataFrequencyOptions, required: true },
    { prop: 'responsibleUserId', label: '负责人', type: 'select', loadOptions: loadResponsibleUserOptions, onChange: applyResponsibleUser },
    { prop: 'responsibleUserName', label: '负责人姓名', hidden: true },
    { prop: 'responsibleDept', label: '负责部门', type: 'select', loadOptions: loadResponsibleDeptOptions, allowCreate: true },
    { prop: 'dataSource', label: '数据来源', type: 'select', loadOptions: loadDataSourceOptions, allowCreate: true },
    { prop: 'factorKey', label: '适用因子', type: 'select', loadOptions: loadFactorOptions, onChange: applyFactor, allowCreate: true }
  ],
  emptyForm: {
    dataFrequency: 'monthly',
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
