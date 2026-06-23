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

const config = {
  title: '绿电绿证数据',
  description: '维护客户样例口径的绿电绿证活动数据，供抵扣来源和报表视图引用。',
  permissionPrefix: 'enterprise:greenPowerCertificate',
  extension: {
    moduleCode: 'green_electricity',
    ownerTableCode: 'ce_green_power_certificate'
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
    { prop: 'factoryCode', label: 'FK_工厂编号' },
    { prop: 'factoryName', label: '工厂名称' },
    { prop: 'activityYear', label: '年度', type: 'number', precision: 0 },
    { prop: 'activityMonth', label: '月份', type: 'number', precision: 0 },
    { prop: 'electricityType', label: '电力类型' },
    { prop: 'certificateCode', label: '证书编号' }
  ],
  formFields: [
    { prop: 'factoryCode', label: 'FK_工厂编号', required: true },
    { prop: 'factoryName', label: '工厂名称' },
    { prop: 'activityYear', label: '年度', type: 'number', precision: 0 },
    { prop: 'activityMonth', label: '月份', type: 'number', precision: 0 },
    { prop: 'sourceCategoryKey', label: 'FK_排放源分类' },
    { prop: 'scopeName', label: '范围' },
    { prop: 'scopeSubcategory', label: '范围子类别' },
    { prop: 'electricityType', label: '电力类型' },
    { prop: 'electricityTypeDesc', label: '电力类型说明' },
    { prop: 'quantityKwh', label: '数量_kWh', type: 'number', precision: 4 },
    { prop: 'certificateCode', label: '证书编号' },
    { prop: 'issuingOrg', label: '证书签发机构' },
    { prop: 'purchaseDate', label: '购买日期', type: 'date' },
    { prop: 'expiryDate', label: '到期日期', type: 'date' },
    { prop: 'powerGridRegion', label: '对应电网区域' },
    { prop: 'offsetPowerSource', label: '抵消电力来源' },
    { prop: 'dataSource', label: '数据来源' },
    { prop: 'sourceRemark', label: '备注', type: 'textarea' },
    { prop: 'emissionSourceName', label: '排放源' },
    { prop: 'factorKey', label: 'FK_排放因子' }
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
