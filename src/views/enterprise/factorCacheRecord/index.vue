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

const enabledOptions = [
  { label: '启用', value: true },
  { label: '停用', value: false }
];

const config = {
  title: '因子缓存记录',
  description: '查看企业本地从厂商授权范围同步下来的排放因子缓存明细。缓存记录由同步任务维护，不在页面手工编辑。',
  permissionPrefix: 'enterprise:factorCacheRecord',
  readonly: true,
  columns: [
    { prop: 'cacheVersionId', label: '缓存版本ID', width: 120 },
    { prop: 'factorTableCode', label: '因子表类型', minWidth: 150 },
    { prop: 'factorKey', label: '样例主键', minWidth: 150 },
    { prop: 'factorCode', label: '因子编码', minWidth: 150 },
    { prop: 'factorName', label: '因子名称', minWidth: 180 },
    { prop: 'emissionSourceName', label: '排放源', minWidth: 170 },
    { prop: 'emissionSourceNameEn', label: '排放源_EN', minWidth: 170 },
    { prop: 'fuelMaterialCategory', label: '燃料/物质类别', minWidth: 170 },
    { prop: 'factorCategory', label: '因子分类', minWidth: 140 },
    { prop: 'factorValue', label: '因子值', width: 120 },
    { prop: 'factorUnit', label: '单位', width: 120 },
    { prop: 'factorGwp', label: '因子GWP', width: 120 },
    { prop: 'provinceFactor', label: '省级因子', width: 120 },
    { prop: 'convertedFactor', label: '因子（转换）', width: 130 },
    {
      prop: 'enabledFlag',
      label: '状态',
      type: 'tag',
      width: 90,
      valueMap: { true: '启用', false: '停用' },
      tagMap: { true: 'success', false: 'info' }
    },
    { prop: 'sourceRef', label: '来源引用', minWidth: 180 },
    { prop: 'syncedTime', label: '同步时间', minWidth: 170 }
  ],
  searchFields: [
    { prop: 'cacheVersionId', label: '缓存版本ID' },
    { prop: 'factorTableCode', label: '因子表类型' },
    { prop: 'factorCode', label: '因子编码' },
    { prop: 'factorName', label: '因子名称' },
    { prop: 'factorCategory', label: '因子分类' },
    { prop: 'enabledFlag', label: '状态', type: 'select', options: enabledOptions }
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
