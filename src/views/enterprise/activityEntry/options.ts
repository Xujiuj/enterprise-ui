import type { EmissionSourceVO } from '@/api/enterprise/emissionSource/types';

type EmissionSourceOptionFields = Pick<EmissionSourceVO, 'emissionSourceName' | 'sourceIdentificationName' | 'sourceIdentificationCode'>;

export const sourceOptionLabel = (source: EmissionSourceOptionFields) =>
  source.emissionSourceName || source.sourceIdentificationName || source.sourceIdentificationCode || '';

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
