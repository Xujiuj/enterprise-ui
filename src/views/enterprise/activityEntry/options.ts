import type { EmissionSourceVO } from '@/api/enterprise/emissionSource/types';

type EmissionSourceOptionFields = Pick<EmissionSourceVO, 'emissionSourceName' | 'sourceIdentificationName' | 'sourceIdentificationCode'>;

export const sourceOptionLabel = (source: EmissionSourceOptionFields) =>
  source.emissionSourceName || source.sourceIdentificationName || source.sourceIdentificationCode || '';
