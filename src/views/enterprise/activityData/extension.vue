<template>
  <EnterpriseCrudPage :config="config" :api="api" />
</template>

<script setup name="EnterpriseActivityDataExtension" lang="ts">
import EnterpriseCrudPage from '@/views/enterprise/components/EnterpriseCrudPage.vue';
import { delActivityData, getActivityData, listActivityData, updateActivityData } from '@/api/enterprise/activityData';
import {
  loadActivityDataStatusOptions,
  loadDataSourceOptions,
  loadFactoryNameOptions,
  loadResponsibleDeptOptions,
  loadSourceCategoryOptions,
  loadYearOptions
} from '@/utils/enterpriseFieldOptions';

const config = {
  title: '排放活动数据扩展字段',
  description: '在不修改原始活动数据字段的前提下，为已保存的活动数据维护企业自定义补充字段。',
  permissionPrefix: 'enterprise:activityData',
  readonly: true,
  extension: {
    moduleCode: 'activity_data',
    ownerTableCode: 'ce_activity_data'
  },
  columns: [
    { prop: 'companyName', label: '公司', minWidth: 180 },
    { prop: 'factoryName', label: '工厂', minWidth: 160 },
    { prop: 'sourceIdentificationName', label: '排放源识别', minWidth: 180 },
    { prop: 'emissionSourceName', label: '排放源名称', minWidth: 180 },
    { prop: 'activityPeriod', label: '活动期间', width: 110 },
    { prop: 'activityDate', label: '日期', width: 120 },
    { prop: 'activityValue', label: '活动数据', width: 120 },
    { prop: 'responsibleDept', label: '负责部门', minWidth: 140 },
    { prop: 'dataSource', label: '数据来源', minWidth: 140 },
    { prop: 'dataStatus', label: '状态', width: 100 }
  ],
  searchFields: [
    { prop: 'factoryName', label: '工厂', type: 'select', loadOptions: loadFactoryNameOptions },
    { prop: 'sourceCategoryKey', label: '排放源分类', type: 'select', loadOptions: loadSourceCategoryOptions },
    { prop: 'activityYear', label: '年度', type: 'select', loadOptions: loadYearOptions },
    { prop: 'responsibleDept', label: '负责部门', type: 'select', loadOptions: loadResponsibleDeptOptions },
    { prop: 'dataSource', label: '数据来源', type: 'select', loadOptions: loadDataSourceOptions },
    { prop: 'dataStatus', label: '状态', type: 'select', loadOptions: loadActivityDataStatusOptions }
  ],
  formFields: [],
  emptyForm: {}
};

const api = {
  list: listActivityData,
  get: getActivityData,
  add: updateActivityData,
  update: updateActivityData,
  remove: delActivityData
};
</script>
