import type { EmissionSourceVO } from '@/api/enterprise/emissionSource/types';

export type EmissionSourceHierarchyField =
  | 'companyName'
  | 'factoryName'
  | 'sourceCategoryKey'
  | 'scopeName'
  | 'scopeSubcategory'
  | 'sourceIdentificationName';

export type EmissionSourceHierarchyFilters = Partial<Record<EmissionSourceHierarchyField, string>>;

type EmissionSourceOptionFields = Pick<
  EmissionSourceVO,
  | 'companyName'
  | 'factoryName'
  | 'sourceCategoryKey'
  | 'scopeName'
  | 'scopeSubcategory'
  | 'sourceIdentificationName'
  | 'sourceIdentificationCode'
  | 'emissionSourceName'
>;
type SourceSelectOption = { label: string; value: string };

export const sourceOptionLabel = (source: EmissionSourceOptionFields) =>
  source.emissionSourceName || source.sourceIdentificationName || source.sourceIdentificationCode || '';

const normalizedSourceFieldValue = (
  source: EmissionSourceOptionFields,
  field: EmissionSourceHierarchyField | 'emissionSourceName' | 'sourceIdentificationCode'
) => String(source[field] ?? '').trim();

export const sourceMatchesHierarchyFilters = (source: EmissionSourceOptionFields, filters: EmissionSourceHierarchyFilters = {}) =>
  Object.entries(filters).every(
    ([field, value]) =>
      !String(value ?? '').trim() || normalizedSourceFieldValue(source, field as EmissionSourceHierarchyField) === String(value).trim()
  );

export const uniqueSourceFieldOptions = (
  sources: EmissionSourceOptionFields[],
  field: EmissionSourceHierarchyField,
  filters: EmissionSourceHierarchyFilters = {}
): SourceSelectOption[] => {
  const seen = new Set<string>();
  return sources
    .filter((source) => sourceMatchesHierarchyFilters(source, filters))
    .map((source) => normalizedSourceFieldValue(source, field))
    .filter((value) => {
      if (!value || seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    })
    .map((value) => ({ label: value, value }));
};

export const filteredEmissionSourceOptions = (
  sources: EmissionSourceOptionFields[],
  filters: EmissionSourceHierarchyFilters = {}
): SourceSelectOption[] =>
  sources
    .filter((source) => sourceMatchesHierarchyFilters(source, filters))
    .map((source) => {
      const value = normalizedSourceFieldValue(source, 'sourceIdentificationCode');
      const label =
        normalizedSourceFieldValue(source, 'emissionSourceName') || normalizedSourceFieldValue(source, 'sourceIdentificationName') || value;
      return { label, value };
    })
    .filter((option) => option.value && option.label);

export const uniqueEmissionSourceNameOptions = (sources: EmissionSourceOptionFields[]) => {
  const seen = new Set<string>();
  return sources
    .map((source) => source.emissionSourceName || '')
    .map((name) => name.trim())
    .filter((name) => {
      if (!name || seen.has(name)) {
        return false;
      }
      seen.add(name);
      return true;
    })
    .map((name) => ({ label: name, value: name }));
};
