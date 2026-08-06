<template>
  <EnterpriseCrudPage :config="config" :api="api" />
</template>

<script setup name="EnterpriseEmissionSource" lang="ts">
import EnterpriseCrudPage from '@/views/enterprise/components/EnterpriseCrudPage.vue';
import { addEmissionSource, delEmissionSource, getEmissionSource, importEmissionSource, listEmissionSource, updateEmissionSource } from '@/api/enterprise/emissionSource';
import {
  loadBooleanStatusOptions,
  loadCompanyCodeOptions,
  loadCompanyNameOptions,
  loadDataFrequencyOptions,
  loadDataSourceOptions,
  loadEmissionSourceIdentificationFromFactorOptions,
  loadEmissionSourceNameFromFactorOptions,
  loadFactoryNameOptions,
  loadResponsibleDeptOptions,
  loadResponsibleUserOptions,
  loadSourceUnitFromFactorOptions,
  loadSourceScopeOptions as loadSourceScopeOptionList,
  loadSourceSubcategoryOptions as loadSourceSubcategoryOptionList
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

const optionRecord = (option?: { record?: Record<string, any> }) => option?.record?.record ?? option?.record;
const sameValue = (left: unknown, right: unknown) => String(left ?? '') === String(right ?? '');
const recordValue = (record: Record<string, any> | undefined, prop: string) => record?.[prop];

const filterByRecord = (
  options: Array<{ label: string; value: string | number | boolean; record?: Record<string, any> }>,
  model: Record<string, any>,
  filters: Record<string, unknown>
) =>
  options.filter((option) => {
    const record = optionRecord(option);
    return Object.entries(filters).every(([key, fallbackValue]) => {
      const value = fallbackValue ?? model[key];
      return value === undefined || value === null || value === '' || sameValue(recordValue(record, key), value);
    });
  });

const applyCompany = (_value: unknown, form: Record<string, any>, option?: { record?: Record<string, any> }) => {
  const record = optionRecord(option);
  assignFromRecord(form, record, ['companyName']);
};

const applyFactory = (_value: unknown, form: Record<string, any>, option?: { record?: Record<string, any> }) => {
  assignFromRecord(form, optionRecord(option), ['companyCode', 'companyName', 'factoryCode', 'factoryName']);
};

const loadDeptOptionsByFactory = (model?: Record<string, any>) =>
  loadResponsibleDeptOptions({
    factoryName: typeof model?.factoryName === 'string' ? model.factoryName : undefined
  });

const applySourceCategory = (_value: unknown, form: Record<string, any>, option?: { record?: Record<string, any> }) => {
  const record = optionRecord(option);
  assignFromRecord(form, record, ['sourceCategoryKey', 'scopeName', 'scopeSubcategory']);
};

const uniqueByValue = (options: Array<{ label: string; value: string | number | boolean; record?: Record<string, any> }>) => {
  const seen = new Set<string>();
  return options.filter((option) => {
    const key = String(option.value ?? '');
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

const loadSourceScopeOptions = () => loadSourceScopeOptionList();

const loadSourceSubcategoryOptions = async () => {
  return loadSourceSubcategoryOptionList();
};

const loadSearchSubcategoryOptions = async () => {
  const options = await loadSourceSubcategoryOptionList();
  return uniqueByValue(
    options
      .map((option) => {
        const record = optionRecord(option);
        const subcategory = record?.scopeSubcategory || option.label;
        return {
          ...option,
          label: String(subcategory),
          value: String(subcategory)
        };
      })
      .filter((option) => Boolean(option.value))
  );
};

const applyScope = (value: unknown, form: Record<string, any>) => {
  form.scopeName = value;
};

const applyFactor = (_value: unknown, form: Record<string, any>, option?: { record?: Record<string, any> }) => {
  const record = optionRecord(option);
  if (!record) return;
  const sourceIdentificationName = record.recordName || record.emissionSourceName || record.factorName;
  const emissionSourceName = record.fuelMaterialCategory || record.emissionSourceName || record.recordName || record.factorName;
  form.sourceIdentificationName = sourceIdentificationName || form.sourceIdentificationName;
  form.emissionSourceName = emissionSourceName || form.emissionSourceName;
  form.factorKey = record.factorKey || record.factorCode || record.recordCode || form.factorKey;
  form.sourceUnit = record.sourceUnit || record.factorUnit || form.sourceUnit;
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
  description: '先在104维护排放源识别、排放源和范围信息，再关联或补充201 EF排放因子。',
  permissionPrefix: 'enterprise:emissionSource',
  extension: {
    moduleCode: 'emission_source',
    ownerTableCode: 'ce_emission_source'
  },
  columns: [
    { prop: 'companyCode', label: '公司编号', minWidth: 150, formatOptions: false },
    { prop: 'companyName', label: '公司名称', minWidth: 180 },
    { prop: 'factoryCode', label: '工厂编号', minWidth: 150, formatOptions: false },
    { prop: 'factoryName', label: '工厂', minWidth: 180 },
    { prop: 'scopeName', label: '范围', width: 110 },
    { prop: 'scopeSubcategory', label: '范围子类别', minWidth: 170 },
    { prop: 'sourceUnit', label: '单位', width: 110, formatOptions: false },
    { prop: 'sourceIdentificationCode', label: '排放源识别编号', minWidth: 180 },
    { prop: 'sourceIdentificationName', label: '排放源识别', minWidth: 180 },
    { prop: 'emissionSourceName', label: '排放源', minWidth: 180 },
    { prop: 'dataFrequency', label: '数据频次', width: 110, valueMap: { monthly: '月报', daily: '日报', quarterly: '季报' } },
    { prop: 'responsibleUserName', label: '负责人', minWidth: 130 },
    { prop: 'responsibleDept', label: '负责部门', minWidth: 150 },
    { prop: 'dataSource', label: '数据来源', minWidth: 150 },
    { prop: 'factorKey', label: '适用因子', minWidth: 180 }
  ],
  searchFields: [
    { prop: 'companyName', label: '公司', type: 'select', loadOptions: loadCompanyNameOptions },
    { prop: 'factoryName', label: '工厂', type: 'select', loadOptions: loadFactoryNameOptions },
    { prop: 'scopeName', label: '范围', type: 'select', loadOptions: loadSourceScopeOptions },
    {
      prop: 'scopeSubcategory',
      label: '范围子类别',
      type: 'select',
      loadOptions: loadSearchSubcategoryOptions,
      filterOptions: (options: any[], model: Record<string, any>) => filterByRecord(options, model, { scopeName: model.scopeName })
    },
    { prop: 'sourceIdentificationName', label: '排放源识别', type: 'select', loadOptions: loadEmissionSourceIdentificationFromFactorOptions },
    { prop: 'emissionSourceName', label: '排放源', type: 'select', loadOptions: loadEmissionSourceNameFromFactorOptions },
    { prop: 'responsibleUserId', label: '负责人', type: 'select', loadOptions: loadResponsibleUserOptions },
    { prop: 'responsibleDept', label: '负责部门', type: 'select', loadOptions: loadResponsibleDeptOptions },
    { prop: 'enabledFlag', label: '状态', type: 'select', loadOptions: loadBooleanStatusOptions }
  ],
  formFields: [
    {
      prop: 'companyCode',
      label: '公司',
      type: 'select',
      loadOptions: loadCompanyCodeOptions,
      onChange: applyCompany,
      clearFields: ['factoryCode', 'factoryName'],
      required: true
    },
    {
      prop: 'factoryName',
      label: '工厂',
      type: 'select',
      loadOptions: loadFactoryNameOptions,
      filterOptions: (options: any[], model: Record<string, any>) =>
        filterByRecord(options, model, { companyCode: model.companyCode, companyName: model.companyName }),
      onChange: applyFactory,
      required: true
    },
    {
      prop: 'scopeName',
      label: '范围',
      type: 'select',
      loadOptions: loadSourceScopeOptions,
      onChange: applyScope,
      clearFields: ['sourceCategoryKey', 'scopeSubcategory', 'sourceIdentificationCode'],
      required: true
    },
    {
      prop: 'sourceCategoryKey',
      label: '范围子类别',
      type: 'select',
      loadOptions: loadSourceSubcategoryOptions,
      filterOptions: (options: any[], model: Record<string, any>) => filterByRecord(options, model, { scopeName: model.scopeName }),
      onChange: applySourceCategory,
      required: true
    },
    { prop: 'companyName', label: '公司名称', hidden: true },
    { prop: 'factoryCode', label: '工厂编号', hidden: true },
    { prop: 'scopeSubcategory', label: '范围子类别', hidden: true },
    { prop: 'sourceIdentificationCode', label: '排放源识别编号', hidden: true },
    {
      prop: 'sourceIdentificationName',
      label: '排放源识别',
      type: 'select',
      loadOptions: loadEmissionSourceIdentificationFromFactorOptions,
      onChange: applyFactor,
      clearFields: ['factorKey', 'sourceUnit'],
      required: true
    },
    { prop: 'emissionSourceName', label: '排放源', type: 'select', loadOptions: loadEmissionSourceNameFromFactorOptions, disabled: true, placeholder: '选择排放源识别后自动带出' },
    { prop: 'sourceUnit', label: '单位', type: 'select', loadOptions: loadSourceUnitFromFactorOptions, disabled: true, placeholder: '选择排放源后自动带出' },
    { prop: 'dataFrequency', label: '数据频次', type: 'select', loadOptions: loadDataFrequencyOptions, required: true },
    { prop: 'responsibleUserId', label: '负责人', type: 'select', loadOptions: loadResponsibleUserOptions, onChange: applyResponsibleUser },
    { prop: 'responsibleUserName', label: '负责人姓名', hidden: true },
    { prop: 'responsibleDept', label: '负责部门', type: 'select', loadOptions: loadResponsibleDeptOptions },
    { prop: 'dataSource', label: '数据来源', type: 'select', loadOptions: loadDataSourceOptions, allowCreate: true },
  ],
  emptyForm: {
    dataFrequency: 'monthly',
    enabledFlag: true
  }
};

(config.searchFields as any[])
  .filter((field) => field.prop === 'responsibleDept')
  .forEach((field) => {
    field.loadOptions = loadDeptOptionsByFactory;
    field.reloadOnProps = ['factoryName'];
  });

(config.formFields as any[])
  .filter((field) => field.prop === 'responsibleDept')
  .forEach((field) => {
    field.loadOptions = loadDeptOptionsByFactory;
    field.reloadOnProps = ['factoryName'];
  });

(config.formFields as any[])
  .filter((field) => field.prop === 'companyCode' || field.prop === 'factoryName')
  .forEach((field) => {
    field.clearFields = Array.from(new Set([...(field.clearFields ?? []), 'responsibleDept']));
  });

const api = {
  list: listEmissionSource,
  get: getEmissionSource,
  add: addEmissionSource,
  update: updateEmissionSource,
  remove: delEmissionSource,
  importRows: importEmissionSource
};
</script>
