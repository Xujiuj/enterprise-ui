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
import {
  loadDataSourceOptions,
  loadElectricityTypeOptions,
  loadFactorOptions,
  loadFactoryCodeOptions,
  loadMonthOptions,
  loadProofStatusOptions,
  loadSourceCategoryOptions,
  loadYearOptions
} from '@/utils/enterpriseFieldOptions';

const applyFactor = (_value: unknown, form: Record<string, any>, option?: { record?: Record<string, any> }) => {
  const record = option?.record;
  if (!record) return;
  form.emissionSourceName = form.emissionSourceName || record.recordName;
};

const config = {
  title: '绿电绿证数据',
  description: '维护企业采购或持有的绿电、绿证数据。工厂、排放源分类、数据来源和适用因子均从企业业务表已有值去重选项选择。',
  permissionPrefix: 'enterprise:greenPowerCertificate',
  extension: {
    moduleCode: 'green_electricity' as const,
    ownerTableCode: 'ce_green_power_certificate' as const
  },
  columns: [
    { prop: 'factoryName', label: '工厂', minWidth: 180 },
    { prop: 'activityYear', label: '年度', width: 90 },
    { prop: 'activityMonth', label: '月份', width: 90 },
    { prop: 'scopeName', label: '核算范围', width: 110 },
    { prop: 'scopeSubcategory', label: '范围子类别', minWidth: 170 },
    { prop: 'electricityType', label: '电力类型', minWidth: 120 },
    { prop: 'electricityTypeDesc', label: '电力类型说明', minWidth: 180 },
    { prop: 'quantityKwh', label: '数量(kWh)', width: 130 },
    { prop: 'certificateCode', label: '证书编号', minWidth: 160 },
    { prop: 'issuingOrg', label: '证书签发机构', minWidth: 150 },
    { prop: 'purchaseDate', label: '购买日期', width: 120 },
    { prop: 'expiryDate', label: '到期日期', width: 120 },
    { prop: 'powerGridRegion', label: '电网区域', minWidth: 150 },
    { prop: 'offsetPowerSource', label: '抵消电力来源', minWidth: 150 },
    { prop: 'dataSource', label: '数据来源', minWidth: 150 },
    { prop: 'sourceRemark', label: '备注', minWidth: 180 },
    { prop: 'emissionSourceName', label: '排放源', minWidth: 160 }
  ],
  searchFields: [
    { prop: 'factoryCode', label: '工厂', type: 'select', loadOptions: loadFactoryCodeOptions },
    { prop: 'sourceCategoryKey', label: '排放源分类', type: 'select', loadOptions: loadSourceCategoryOptions },
    { prop: 'activityYear', label: '年度', type: 'select', loadOptions: loadYearOptions },
    { prop: 'activityMonth', label: '月份', type: 'select', loadOptions: loadMonthOptions },
    { prop: 'electricityType', label: '电力类型', type: 'select', loadOptions: loadElectricityTypeOptions },
    { prop: 'dataSource', label: '数据来源', type: 'select', loadOptions: loadDataSourceOptions },
    { prop: 'factorKey', label: '适用因子', type: 'select', loadOptions: loadFactorOptions },
    { prop: 'proofStatus', label: '核验状态', type: 'select', loadOptions: loadProofStatusOptions },
    { prop: 'certificateCode', label: '证书编号' }
  ],
  formFields: [
    { prop: 'factoryCode', label: '工厂', type: 'select', loadOptions: loadFactoryCodeOptions, required: true },
    { prop: 'factoryName', label: '工厂名称' },
    { prop: 'activityYear', label: '年度', type: 'select', loadOptions: loadYearOptions },
    { prop: 'activityMonth', label: '月份', type: 'select', loadOptions: loadMonthOptions },
    { prop: 'sourceCategoryKey', label: '排放源分类', type: 'select', loadOptions: loadSourceCategoryOptions },
    { prop: 'scopeName', label: '核算范围' },
    { prop: 'scopeSubcategory', label: '范围子类别' },
    { prop: 'electricityType', label: '电力类型', type: 'select', loadOptions: loadElectricityTypeOptions },
    { prop: 'electricityTypeDesc', label: '电力类型说明' },
    { prop: 'quantityKwh', label: '数量(kWh)', type: 'number', precision: 4 },
    { prop: 'certificateCode', label: '证书编号' },
    { prop: 'issuingOrg', label: '证书签发机构' },
    { prop: 'purchaseDate', label: '购买日期', type: 'date' },
    { prop: 'expiryDate', label: '到期日期', type: 'date' },
    { prop: 'powerGridRegion', label: '对应电网区域' },
    { prop: 'offsetPowerSource', label: '抵消电力来源' },
    { prop: 'dataSource', label: '数据来源', type: 'select', loadOptions: loadDataSourceOptions },
    { prop: 'sourceRemark', label: '备注', type: 'textarea' },
    { prop: 'emissionSourceName', label: '排放源' },
    { prop: 'factorKey', label: '适用因子', type: 'select', loadOptions: loadFactorOptions, onChange: applyFactor }
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
