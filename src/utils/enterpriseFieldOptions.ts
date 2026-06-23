import { listDimensionRecord } from '@/api/enterprise/dimensionRecord';
import type { DimensionRecordVO } from '@/api/enterprise/dimensionRecord/types';
import { listEnterpriseOptions } from '@/api/enterprise/options';

export interface SelectOption {
  label: string;
  value: string | number | boolean;
  record?: Record<string, any>;
}

const uniqueByValue = (options: SelectOption[]) => {
  const seen = new Set<string>();
  return options.filter((option) => {
    const key = String(option.value);
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

export const loadEnterpriseOptions = async (
  optionCode: string,
  params?: {
    dimensionCode?: string;
    field?: string;
  }
) => {
  const res = await listEnterpriseOptions(optionCode, params);
  return uniqueByValue(
    (res.data ?? [])
      .map((record) => {
        const label = String(record.label ?? '').trim();
        const value = record.value;
        const rawValue = String(value ?? '').trim();
        if (!label || !rawValue) {
          return undefined;
        }
        return {
          label,
          value,
          record
        };
      })
      .filter((option): option is SelectOption => Boolean(option))
  );
};

export const dimensionRecordLabel = (record: DimensionRecordVO) =>
  [record.recordCode, record.recordName].filter(Boolean).join(' / ') || record.recordCode || record.recordName;

export const loadDimensionOptions = async (
  dimensionCode: string,
  mapper: (record: DimensionRecordVO) => SelectOption | undefined = (record) => ({
    label: dimensionRecordLabel(record),
    value: record.recordCode,
    record
  })
) => {
  const res = await listDimensionRecord({
    dimensionCode,
    status: '0',
    pageNum: 1,
    pageSize: 1000
  });
  return uniqueByValue((res.rows ?? res.data ?? []).map(mapper).filter((option): option is SelectOption => Boolean(option)));
};

export const loadCompanyCodeOptions = () => loadEnterpriseOptions('company-code');
export const loadCompanyNameOptions = () => loadEnterpriseOptions('company-name');
export const loadFactoryCodeOptions = () => loadEnterpriseOptions('factory-code');
export const loadFactoryNameOptions = () => loadEnterpriseOptions('factory-name');
export const loadFactoryOptions = loadFactoryCodeOptions;
export const loadSourceCategoryOptions = () => loadEnterpriseOptions('source-category-key');
export const loadResponsibleDeptOptions = () => loadEnterpriseOptions('responsible-dept');
export const loadEmissionSourceCodeOptions = () => loadEnterpriseOptions('emission-source-code');
export const loadFactorOptions = () => loadDimensionOptions('ef-factor');
export const loadIntensityRuleOptions = () => loadDimensionOptions('intensity-denominator-rule');
export const loadIntensityTargetOptions = () => loadDimensionOptions('intensity-target');
export const loadDataSourceOptions = () => loadEnterpriseOptions('data-source');
export const loadActivityDataStatusOptions = () => loadEnterpriseOptions('activity-data-status');
export const loadBooleanStatusOptions = () => loadEnterpriseOptions('boolean-status');
export const loadFactorTableOptions = () => loadEnterpriseOptions('factor-table-code');
export const loadYearOptions = () => loadEnterpriseOptions('activity-year');
export const loadMonthOptions = () => loadEnterpriseOptions('activity-month');
export const loadElectricityTypeOptions = () => loadEnterpriseOptions('electricity-type');
export const loadProofStatusOptions = () => loadEnterpriseOptions('proof-status');
export const loadIntensityMetricStatusOptions = () => loadEnterpriseOptions('intensity-metric-status');
export const loadFactorConfirmationStatusOptions = () => loadEnterpriseOptions('factor-confirmation-status');
export const loadTemplateTypeOptions = () => loadEnterpriseOptions('template-type');
export const loadValidationStatusOptions = () => loadEnterpriseOptions('validation-status');
export const loadRecordStatusOptions = () => loadEnterpriseOptions('record-status');
export const loadDimensionFieldOptions = (dimensionCode: string, field: string) => loadEnterpriseOptions('dimension-field', { dimensionCode, field });
