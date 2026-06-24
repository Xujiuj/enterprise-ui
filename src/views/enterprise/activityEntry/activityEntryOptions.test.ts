import { describe, expect, it } from 'vitest';
import { sourceOptionLabel, uniqueEmissionSourceNameOptions } from './options';

describe('activity entry option labels', () => {
  it('shows the emission source name instead of the aggregated source path', () => {
    expect(
      sourceOptionLabel({
        sourceIdentificationCode: 'SRC-001',
        sourceIdentificationName: 'Kitchen range',
        emissionSourceName: 'Natural gas'
      })
    ).toBe('Natural gas');
  });

  it('falls back to identification name and code only when the emission source name is absent', () => {
    expect(sourceOptionLabel({ sourceIdentificationCode: 'SRC-001', sourceIdentificationName: 'Kitchen range' })).toBe('Kitchen range');
    expect(sourceOptionLabel({ sourceIdentificationCode: 'SRC-001' })).toBe('SRC-001');
  });

  it('deduplicates query options by emission source name', () => {
    expect(
      uniqueEmissionSourceNameOptions([
        { sourceIdentificationCode: 'SRC-001', sourceIdentificationName: 'A', emissionSourceName: 'Electricity' },
        { sourceIdentificationCode: 'SRC-002', sourceIdentificationName: 'B', emissionSourceName: 'Electricity' },
        { sourceIdentificationCode: 'SRC-003', sourceIdentificationName: 'C', emissionSourceName: 'Steam' },
        { sourceIdentificationCode: 'SRC-004', sourceIdentificationName: 'D', emissionSourceName: ' ' }
      ])
    ).toEqual([
      { label: 'Electricity', value: 'Electricity' },
      { label: 'Steam', value: 'Steam' }
    ]);
  });
});
