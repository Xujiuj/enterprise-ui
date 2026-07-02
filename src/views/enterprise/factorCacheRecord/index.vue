<template>
  <EnterpriseCrudPage :config="config" :api="api" />
</template>

<script setup name="EnterpriseFactorCacheRecord" lang="ts">
import EnterpriseCrudPage from '@/views/enterprise/components/EnterpriseCrudPage.vue';
import {
  addFactorCacheRecord,
  delFactorCacheRecord,
  getFactorCacheRecord,
  listFactorCacheRecord,
  updateFactorCacheRecord
} from '@/api/enterprise/factorCacheRecord';
import { loadBooleanStatusOptions, loadFactorTableOptions } from '@/utils/enterpriseFieldOptions';

const config = {
  title: '因子缓存记录',
  description: '查看从厂商端匹配并同步到企业端的 Source(A) 因子库字段。',
  permissionPrefix: 'enterprise:factorCacheRecord',
  readonly: true,
  columns: [
    { prop: 'factorTableCode', label: '因子表', minWidth: 110 },
    { prop: 'factorCode', label: '因子编码', minWidth: 140 },
    { prop: 'factorName', label: '因子名称', minWidth: 160 },
    { prop: 'factorCategory', label: '因子类别', minWidth: 140 },
    { prop: 'factorValue', label: '因子值', minWidth: 120 },
    { prop: 'factorKey', label: 'SK_排放因子/因子Key', minWidth: 150 },
    { prop: 'emissionSourceName', label: '排放源', minWidth: 150 },
    { prop: 'emissionSourceNameEn', label: '排放源_EN', minWidth: 160 },
    { prop: 'fuelMaterialCategory', label: '燃料/物质类别', minWidth: 160 },
    { prop: 'sourceUnit', label: '排放源单位', minWidth: 120 },
    { prop: 'co2', label: 'CO2', width: 110 },
    { prop: 'ch4', label: 'CH4', width: 110 },
    { prop: 'n2o', label: 'N2O', width: 110 },
    { prop: 'hfcs', label: 'HFCs', width: 110 },
    { prop: 'pfcs', label: 'PFCs', width: 110 },
    { prop: 'sf6', label: 'SF6', width: 110 },
    { prop: 'nf3', label: 'NF3', width: 110 },
    { prop: 'applicableScope', label: '适用范围', minWidth: 130 },
    { prop: 'factorSource', label: '因子来源', minWidth: 180 },
    { prop: 'gwpCh4', label: 'GWP_CH4', width: 120 },
    { prop: 'gwpN2o', label: 'GWP_N2O', width: 120 },
    { prop: 'gwpHfcs', label: 'GWP_HFCs', width: 120 },
    { prop: 'gwpPfcs', label: 'GWP_PFCs', width: 120 },
    { prop: 'gwpSf6', label: 'GWP_SF6', width: 120 },
    { prop: 'gwpNf3', label: 'GWP_NF3', width: 120 },
    { prop: 'factorGwp', label: '因子GWP', width: 120 },
    { prop: 'factorUnit', label: '因子单位', minWidth: 120 },
    { prop: 'versionProvinceCode', label: 'PK_因子版本省份代码', minWidth: 180 },
    { prop: 'factorVersion', label: '因子版本', minWidth: 120 },
    { prop: 'divisionCode', label: '行政区划代码', minWidth: 130 },
    { prop: 'divisionName', label: '行政区划', minWidth: 130 },
    { prop: 'regionName', label: '区域划分', minWidth: 130 },
    { prop: 'provinceFactor', label: '省级因子(kgCO2/kWh)', minWidth: 180 },
    { prop: 'regionFactor', label: '区域因子(kgCO2/kWh)', minWidth: 180 },
    { prop: 'nationalFactor', label: '全国因子(kgCO2/kWh)', minWidth: 180 },
    { prop: 'nonFossilExcludedFactor', label: '不包括市场化交易的非化石能源电量因子(kgCO2/kWh)', minWidth: 320 },
    { prop: 'nationalFossilPowerFactor', label: '全国化石能源电力二氧化碳排放因子(kgCO2/kWh)', minWidth: 300 },
    { prop: 'rowNo', label: '序号', width: 90 },
    { prop: 'fuelLevel1', label: '一类', minWidth: 120 },
    { prop: 'fuelLevel2', label: '二类', minWidth: 120 },
    { prop: 'fuelLevel3', label: '三类', minWidth: 120 },
    { prop: 'fuelLevel4', label: '四类', minWidth: 120 },
    { prop: 'lowerHeatValue', label: '低位发热量(TJ/10^4Nm³)', minWidth: 190 },
    { prop: 'lowerHeatValueCv', label: '低位发热量变异系数(%)', minWidth: 180 },
    { prop: 'co2Factor', label: '因子(tCO2/TJ)', minWidth: 140 },
    { prop: 'co2FactorCv', label: '因子变异系数(%)', minWidth: 150 },
    { prop: 'gwpValue', label: 'GWP', width: 110 },
    { prop: 'convertedFactor', label: '因子(转换)', minWidth: 130 },
    { prop: 'customFields', label: '扩展字段', minWidth: 220 },
    {
      prop: 'enabledFlag',
      label: '状态',
      type: 'tag',
      width: 90,
      tagMap: { true: 'success', false: 'info' },
      valueMap: { true: '启用', false: '停用' }
    },
    { prop: 'sourceRef', label: '来源表', minWidth: 170 },
    { prop: 'remark', label: '备注', minWidth: 180 },
    { prop: 'syncedTime', label: '同步时间', minWidth: 170 }
  ],
  searchFields: [
    { prop: 'factorTableCode', label: '因子表', type: 'select', loadOptions: loadFactorTableOptions },
    { prop: 'factorKey', label: 'SK_排放因子' },
    { prop: 'emissionSourceName', label: '排放源' },
    { prop: 'factorVersion', label: '因子版本' },
    { prop: 'divisionName', label: '行政区划' },
    { prop: 'enabledFlag', label: '状态', type: 'select', loadOptions: loadBooleanStatusOptions }
  ],
  formFields: [],
  emptyForm: {}
};

const api = {
  list: listFactorCacheRecord,
  get: getFactorCacheRecord,
  add: addFactorCacheRecord,
  update: updateFactorCacheRecord,
  remove: delFactorCacheRecord
};
</script>
