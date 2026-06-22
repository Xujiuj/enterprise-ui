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

const proofStatusOptions = [
  { label: '草稿', value: 'draft' },
  { label: '待核验', value: 'pending' },
  { label: '已核验', value: 'verified' },
  { label: '已作废', value: 'voided' }
];

const config = {
  title: '绿电绿证数据',
  description: '维护客户样例口径的绿电绿证活动数据，供抵扣来源和报表视图引用。',
  permissionPrefix: 'enterprise:greenPowerCertificate',
  extension: {
    moduleCode: 'green_electricity',
    ownerTableCode: 'ce_green_power_certificate'
  },
  columns: [
    { prop: 'rowNo', label: '行号', width: 90 },
    { prop: 'factoryCode', label: '工厂编号', minWidth: 140 },
    { prop: 'factoryName', label: '工厂名称', minWidth: 160 },
    { prop: 'activityYear', label: '年度', width: 90 },
    { prop: 'activityMonth', label: '月份', width: 90 },
    { prop: 'sourceCategoryKey', label: '排放源分类', minWidth: 150 },
    { prop: 'scopeName', label: '范围', width: 110 },
    { prop: 'scopeSubcategory', label: '范围子分类', minWidth: 160 },
    { prop: 'electricityType', label: '电力类型', minWidth: 140 },
    { prop: 'electricityTypeDesc', label: '电力类型说明', minWidth: 180 },
    { prop: 'quantityKwh', label: '数量(kWh)', width: 130 },
    { prop: 'certificateCode', label: '凭证编码', minWidth: 160 },
    { prop: 'issuingOrg', label: '签发机构', minWidth: 150 },
    { prop: 'powerGridRegion', label: '电网区域', minWidth: 150 },
    { prop: 'offsetPowerSource', label: '抵扣电源', minWidth: 150 },
    {
      prop: 'proofStatus',
      label: '核验状态',
      type: 'tag',
      width: 110,
      valueMap: { draft: '草稿', pending: '待核验', verified: '已核验', voided: '已作废' },
      tagMap: { draft: 'info', pending: 'warning', verified: 'success', voided: 'danger' }
    },
    { prop: 'remark', label: '备注', minWidth: 180 }
  ],
  searchFields: [
    { prop: 'factoryCode', label: '工厂编号' },
    { prop: 'factoryName', label: '工厂名称' },
    { prop: 'activityYear', label: '年度', type: 'number', precision: 0 },
    { prop: 'activityMonth', label: '月份', type: 'number', precision: 0 },
    { prop: 'certificateCode', label: '凭证编码' },
    { prop: 'proofStatus', label: '核验状态', type: 'select', options: proofStatusOptions }
  ],
  formFields: [
    { prop: 'rowNo', label: '行号', type: 'number', precision: 0 },
    { prop: 'factoryCode', label: '工厂编号', required: true },
    { prop: 'factoryName', label: '工厂名称' },
    { prop: 'activityYear', label: '年度', type: 'number', precision: 0 },
    { prop: 'activityMonth', label: '月份', type: 'number', precision: 0 },
    { prop: 'sourceCategoryKey', label: '排放源分类' },
    { prop: 'scopeName', label: '范围' },
    { prop: 'scopeSubcategory', label: '范围子分类' },
    { prop: 'electricityType', label: '电力类型' },
    { prop: 'electricityTypeDesc', label: '电力类型说明' },
    { prop: 'quantityKwh', label: '数量(kWh)', type: 'number', precision: 4 },
    { prop: 'certificateCode', label: '凭证编码' },
    { prop: 'issuingOrg', label: '签发机构' },
    { prop: 'purchaseDate', label: '购买日期', type: 'date' },
    { prop: 'expiryDate', label: '到期日期', type: 'date' },
    { prop: 'powerGridRegion', label: '电网区域' },
    { prop: 'offsetPowerSource', label: '抵扣电源' },
    { prop: 'dataSource', label: '数据来源' },
    { prop: 'sourceRemark', label: '来源备注', type: 'textarea' },
    { prop: 'emissionSourceName', label: '排放源' },
    { prop: 'factorKey', label: '排放因子' },
    { prop: 'proofStatus', label: '核验状态', type: 'select', options: proofStatusOptions, required: true },
    { prop: 'remark', label: '备注', type: 'textarea' }
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
