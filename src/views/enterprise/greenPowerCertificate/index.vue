<template>
  <RuoyiCrudPage :config="config" :api="api" />
</template>

<script setup name="EnterpriseGreenPowerCertificate" lang="ts">
import RuoyiCrudPage from '@/views/enterprise/components/RuoyiCrudPage.vue';
import {
  addGreenPowerCertificate,
  delGreenPowerCertificate,
  getGreenPowerCertificate,
  listGreenPowerCertificate,
  updateGreenPowerCertificate
} from '@/api/enterprise/greenPowerCertificate';

const certificateTypeOptions = [
  { label: '绿电', value: 'green_power' },
  { label: '绿证', value: 'green_certificate' }
];

const proofStatusOptions = [
  { label: '待核验', value: 'pending' },
  { label: '已核验', value: 'verified' },
  { label: '已作废', value: 'voided' }
];

const config = {
  title: '绿电绿证数据',
  description: '维护企业本地绿电绿证台账，供抵扣来源和报表视图引用。',
  permissionPrefix: 'enterprise:greenPowerCertificate',
  extension: {
    moduleCode: 'green_electricity',
    ownerTableCode: 'ce_green_power_certificate'
  },
  columns: [
    { prop: 'certificateCode', label: '凭证编码', minWidth: 160 },
    {
      prop: 'certificateType',
      label: '类型',
      type: 'tag',
      width: 100,
      valueMap: { green_power: '绿电', green_certificate: '绿证' },
      tagMap: { green_power: 'success', green_certificate: 'primary' }
    },
    { prop: 'energyPeriod', label: '电量期间', width: 120 },
    { prop: 'energyAmount', label: '电量', width: 110 },
    { prop: 'energyUnit', label: '单位', width: 90 },
    { prop: 'issuingOrg', label: '签发机构', minWidth: 150 },
    { prop: 'offsetSourceCode', label: '抵扣来源', minWidth: 140 },
    {
      prop: 'proofStatus',
      label: '核验状态',
      type: 'tag',
      width: 110,
      valueMap: { pending: '待核验', verified: '已核验', voided: '已作废' },
      tagMap: { pending: 'warning', verified: 'success', voided: 'danger' }
    },
    { prop: 'remark', label: '备注', minWidth: 180 }
  ],
  searchFields: [
    { prop: 'certificateCode', label: '凭证编码' },
    { prop: 'certificateType', label: '类型', type: 'select', options: certificateTypeOptions },
    { prop: 'energyPeriod', label: '电量期间' },
    { prop: 'proofStatus', label: '核验状态', type: 'select', options: proofStatusOptions }
  ],
  formFields: [
    { prop: 'certificateCode', label: '凭证编码', required: true },
    { prop: 'certificateType', label: '类型', type: 'select', options: certificateTypeOptions, required: true },
    { prop: 'energyPeriod', label: '电量期间', required: true },
    { prop: 'energyAmount', label: '电量', type: 'number', required: true, precision: 4 },
    { prop: 'energyUnit', label: '单位', required: true },
    { prop: 'issuingOrg', label: '签发机构' },
    { prop: 'purchaseDate', label: '购买日期', type: 'date' },
    { prop: 'expiryDate', label: '到期日期', type: 'date' },
    { prop: 'offsetSourceCode', label: '抵扣来源' },
    { prop: 'proofStatus', label: '核验状态', type: 'select', options: proofStatusOptions, required: true },
    { prop: 'remark', label: '备注', type: 'textarea' }
  ],
  emptyForm: {
    certificateType: 'green_certificate',
    proofStatus: 'pending',
    energyUnit: 'MWh'
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
