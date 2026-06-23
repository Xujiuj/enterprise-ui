<template>
  <EnterpriseCrudPage :config="config" :api="api" />
</template>

<script setup name="EnterpriseGreenPowerCertificate" lang="ts">
import EnterpriseCrudPage from '@/views/enterprise/components/EnterpriseCrudPage.vue';
import {
  addGreenPowerCertificate,
  delGreenPowerCertificate,
  getGreenPowerCertificate,
  listGreenPowerCertificate,
  updateGreenPowerCertificate
} from '@/api/enterprise/greenPowerCertificate';
import { DATA_SOURCE_OPTIONS, MONTH_OPTIONS, loadDimensionOptions } from '@/utils/enterpriseFieldOptions';

const electricityTypeOptions = [
  { label: '绿电', value: '绿电' },
  { label: '绿证', value: '绿证' }
];

const proofStatusOptions = [
  { label: '草稿', value: 'draft' },
  { label: '已核验', value: 'verified' },
  { label: '已作废', value: 'voided' }
];

const loadFactoryOptions = () =>
  loadDimensionOptions('company', (record) => {
    const factoryCode = record.field01 || record.recordCode;
    const factoryName = record.field02 || record.recordName;
    if (!factoryCode) return undefined;
    return {
      label: [factoryCode, factoryName].filter(Boolean).join(' / '),
      value: factoryCode,
      record
    };
  });
const loadSourceCategoryOptions = () => loadDimensionOptions('emission-source-category');
const loadFactorOptions = () => loadDimensionOptions('ef-factor');

const applyFactory = (_value: unknown, form: Record<string, any>, option?: { record?: Record<string, any> }) => {
  const record = option?.record;
  if (!record) return;
  form.factoryName = record.field02 || record.recordName;
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
  title: '绿电绿证数据',
  description: '维护客户样例口径的绿电绿证活动数据，供抵扣来源和报表视图引用。',
  permissionPrefix: 'enterprise:greenPowerCertificate',
  extension: {
    moduleCode: 'green_electricity' as const,
    ownerTableCode: 'ce_green_power_certificate' as const
  },
  columns: [
    { prop: 'factoryCode', label: 'FK_工厂编号', minWidth: 140 },
    { prop: 'factoryName', label: '工厂名称', minWidth: 160 },
    { prop: 'activityYear', label: '年度', width: 90 },
    { prop: 'activityMonth', label: '月份', width: 90 },
    { prop: 'sourceCategoryKey', label: 'FK_排放源分类', minWidth: 150 },
    { prop: 'scopeName', label: '范围', width: 110 },
    { prop: 'scopeSubcategory', label: '范围子类别', minWidth: 160 },
    { prop: 'electricityType', label: '电力类型', minWidth: 140 },
    { prop: 'electricityTypeDesc', label: '电力类型说明', minWidth: 180 },
    { prop: 'quantityKwh', label: '数量_kWh', width: 130 },
    { prop: 'certificateCode', label: '证书编号', minWidth: 160 },
    { prop: 'issuingOrg', label: '证书签发机构', minWidth: 150 },
    { prop: 'purchaseDate', label: '购买日期', width: 120 },
    { prop: 'expiryDate', label: '到期日期', width: 120 },
    { prop: 'powerGridRegion', label: '电网区域', minWidth: 150 },
    { prop: 'offsetPowerSource', label: '抵消电力来源', minWidth: 150 },
    { prop: 'dataSource', label: '数据来源', minWidth: 150 },
    { prop: 'sourceRemark', label: '备注', minWidth: 180 },
    { prop: 'emissionSourceName', label: '排放源', minWidth: 160 },
    { prop: 'factorKey', label: 'FK_排放因子', minWidth: 140 }
  ],
  searchFields: [
    { prop: 'factoryCode', label: 'FK_工厂编号', type: 'select', loadOptions: loadFactoryOptions },
    { prop: 'sourceCategoryKey', label: 'FK_排放源分类', type: 'select', loadOptions: loadSourceCategoryOptions },
    { prop: 'activityYear', label: '年度', type: 'number', precision: 0 },
    { prop: 'activityMonth', label: '月份', type: 'select', options: MONTH_OPTIONS },
    { prop: 'electricityType', label: '电力类型', type: 'select', options: electricityTypeOptions },
    { prop: 'dataSource', label: '数据来源', type: 'select', options: DATA_SOURCE_OPTIONS },
    { prop: 'factorKey', label: 'FK_排放因子', type: 'select', loadOptions: loadFactorOptions },
    { prop: 'proofStatus', label: '核验状态', type: 'select', options: proofStatusOptions },
    { prop: 'certificateCode', label: '证书编号' }
  ],
  formFields: [
    { prop: 'factoryCode', label: 'FK_工厂编号', type: 'select', loadOptions: loadFactoryOptions, onChange: applyFactory, required: true },
    { prop: 'factoryName', label: '工厂名称', disabled: true },
    { prop: 'activityYear', label: '年度', type: 'number', precision: 0 },
    { prop: 'activityMonth', label: '月份', type: 'select', options: MONTH_OPTIONS },
    { prop: 'sourceCategoryKey', label: 'FK_排放源分类', type: 'select', loadOptions: loadSourceCategoryOptions, onChange: applySourceCategory },
    { prop: 'scopeName', label: '范围', disabled: true },
    { prop: 'scopeSubcategory', label: '范围子类别', disabled: true },
    { prop: 'electricityType', label: '电力类型', type: 'select', options: electricityTypeOptions },
    { prop: 'electricityTypeDesc', label: '电力类型说明' },
    { prop: 'quantityKwh', label: '数量_kWh', type: 'number', precision: 4 },
    { prop: 'certificateCode', label: '证书编号' },
    { prop: 'issuingOrg', label: '证书签发机构' },
    { prop: 'purchaseDate', label: '购买日期', type: 'date' },
    { prop: 'expiryDate', label: '到期日期', type: 'date' },
    { prop: 'powerGridRegion', label: '对应电网区域' },
    { prop: 'offsetPowerSource', label: '抵消电力来源' },
    { prop: 'dataSource', label: '数据来源', type: 'select', options: DATA_SOURCE_OPTIONS },
    { prop: 'sourceRemark', label: '备注', type: 'textarea' },
    { prop: 'emissionSourceName', label: '排放源' },
    { prop: 'factorKey', label: 'FK_排放因子', type: 'select', loadOptions: loadFactorOptions, onChange: applyFactor }
  ],
  emptyForm: {
    proofStatus: 'draft'
  }
};

const api = {
  list: listGreenPowerCertificate,
  get: getGreenPowerCertificate,
  add: addGreenPowerCertificate,
  update: updateGreenPowerCertificate,
  remove: delGreenPowerCertificate
};
</script>
