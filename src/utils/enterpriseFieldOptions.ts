import { listDimensionRecord } from '@/api/enterprise/dimensionRecord';
import type { DimensionRecordVO } from '@/api/enterprise/dimensionRecord/types';
import { listEnterpriseOptions } from '@/api/enterprise/options';
import type { EnterpriseOptionQuery } from '@/api/enterprise/options/types';

export interface SelectOption {
  label: string;
  value: string | number | boolean;
  record?: Record<string, any>;
}

const OPTION_CACHE_TTL = 60_000;
const optionCache = new Map<string, { expiresAt: number; promise: Promise<SelectOption[]> }>();

const stableStringify = (value: unknown): string => {
  if (!value || typeof value !== 'object') {
    return String(value ?? '');
  }
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }
  return `{${Object.keys(value as Record<string, unknown>)
    .sort()
    .map((key) => `${key}:${stableStringify((value as Record<string, unknown>)[key])}`)
    .join(',')}}`;
};

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

export const valueOnlyOptions = (loader: () => Promise<SelectOption[]>) => async () =>
  (await loader()).map((option) => ({
    ...option,
    label: String(option.value)
  }));

export const loadEnterpriseOptions = async (optionCode: string, params?: EnterpriseOptionQuery) => {
  const cacheKey = `${optionCode}:${stableStringify(params)}`;
  const cached = optionCache.get(cacheKey);
  const now = Date.now();
  if (cached && cached.expiresAt > now) {
    return cached.promise;
  }

  const promise = loadEnterpriseOptionsUncached(optionCode, params);
  optionCache.set(cacheKey, { expiresAt: now + OPTION_CACHE_TTL, promise });
  try {
    return await promise;
  } catch (error) {
    optionCache.delete(cacheKey);
    throw error;
  }
};

const loadEnterpriseOptionsUncached = async (optionCode: string, params?: EnterpriseOptionQuery) => {
  const res = await listEnterpriseOptions(optionCode, params);
  return uniqueByValue(
    (res.data ?? [])
      .map<SelectOption | undefined>((record) => {
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
  record.recordName || record.recordCode;

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
export const loadSourceScopeOptions = () => loadEnterpriseOptions('source-scope');
export const loadSourceSubcategoryOptions = (params?: EnterpriseOptionQuery) => loadEnterpriseOptions('source-subcategory', params);
export const loadResponsibleDeptOptions = (params?: EnterpriseOptionQuery) => loadEnterpriseOptions('responsible-dept', params);
export const loadDataFrequencyOptions = () => loadEnterpriseOptions('data-frequency');
export const loadResponsibleUserOptions = () => loadEnterpriseOptions('responsible-user');
export const loadEmissionSourceCodeOptions = () => loadEnterpriseOptions('emission-source-code');
export const loadEmissionSourceNameOptions = () => loadEnterpriseOptions('emission-source-name');
export const loadFactorOptions = () => loadEnterpriseOptions('factor-key');
export const loadEfFactorEmissionSourceOptions = () => loadEnterpriseOptions('ef-factor-emission-source');
const efFactorRecordValue = (record: Record<string, any>, prop: string, fallback?: unknown) => String(record[prop] ?? fallback ?? '').trim();
export const loadEmissionSourceNameFromFactorOptions = async () => {
  const seen = new Set<string>();
  return (await loadEfFactorEmissionSourceOptions())
    .map<SelectOption | undefined>((option) => {
      const record = option.record ?? {};
      const emissionSourceName = efFactorRecordValue(record, 'fuelMaterialCategory', option.value);
      if (!emissionSourceName || seen.has(emissionSourceName)) {
        return undefined;
      }
      seen.add(emissionSourceName);
      return {
        ...option,
        label: emissionSourceName,
        value: emissionSourceName,
        record
      };
    })
    .filter((option): option is SelectOption => Boolean(option));
};
export const loadSourceUnitFromFactorOptions = async () => {
  const seen = new Set<string>();
  return (await loadEfFactorEmissionSourceOptions())
    .map<SelectOption | undefined>((option) => {
      const record = option.record ?? {};
      const unit = efFactorRecordValue(record, 'sourceUnit', record.factorUnit);
      if (!unit || seen.has(unit)) {
        return undefined;
      }
      seen.add(unit);
      return {
        label: unit,
        value: unit,
        record
      };
    })
    .filter((option): option is SelectOption => Boolean(option));
};
export const loadEmissionSourceIdentificationFromFactorOptions = async () =>
  (await loadEfFactorEmissionSourceOptions())
    .map<SelectOption | undefined>((option) => {
      const record = option.record ?? {};
      const sourceIdentificationName = efFactorRecordValue(record, 'recordName', option.value);
      if (!sourceIdentificationName) {
        return undefined;
      }
      return {
        ...option,
        label: sourceIdentificationName,
        value: sourceIdentificationName,
        record
      };
    })
    .filter((option): option is SelectOption => Boolean(option));
export const loadIntensityRuleOptions = () => loadEnterpriseOptions('intensity-rule-code');
export const loadIntensityTargetOptions = () => loadEnterpriseOptions('intensity-target-code');
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
export const loadDimensionFieldOptions = (dimensionCode: string, field: string, params?: EnterpriseOptionQuery) =>
  loadEnterpriseOptions('dimension-field', { dimensionCode, field, ...params });
export const loadActivityEntryEmissionSourceNameOptions = (params?: EnterpriseOptionQuery) =>
  loadEnterpriseOptions('activity-entry-emission-source-name', params);
export const loadActivityEntrySourceCompanyOptions = (params?: EnterpriseOptionQuery) =>
  loadEnterpriseOptions('activity-entry-source-company', params);
export const loadActivityEntrySourceFactoryOptions = (params?: EnterpriseOptionQuery) =>
  loadEnterpriseOptions('activity-entry-source-factory', params);
export const loadActivityEntrySourceScopeOptions = (params?: EnterpriseOptionQuery) => loadEnterpriseOptions('activity-entry-source-scope', params);
export const loadActivityEntrySourceSubcategoryOptions = (params?: EnterpriseOptionQuery) =>
  loadEnterpriseOptions('activity-entry-source-subcategory', params);
export const loadActivityEntrySourceIdentificationOptions = (params?: EnterpriseOptionQuery) =>
  loadEnterpriseOptions('activity-entry-source-identification', params);
export const loadActivityEntrySourceCategoryOptions = (params?: EnterpriseOptionQuery) =>
  loadEnterpriseOptions('activity-entry-source-category', params);
export const loadActivityEntrySourceLeafOptions = (params?: EnterpriseOptionQuery) => loadEnterpriseOptions('activity-entry-source-leaf', params);

export const loadDenominatorUnitOptions = () => loadEnterpriseOptions('denominator-unit');

export const loadPowerGridRegionOptions = () => loadEnterpriseOptions('power-grid-region');
export const loadOffsetPowerSourceOptions = () => loadEnterpriseOptions('offset-power-source');
export const loadIssuingOrgOptions = () => loadEnterpriseOptions('issuing-org');
export const loadConfirmedByOptions = () => loadEnterpriseOptions('confirmed-by');
export const loadLicenseIdOptions = () => loadEnterpriseOptions('license-id');
