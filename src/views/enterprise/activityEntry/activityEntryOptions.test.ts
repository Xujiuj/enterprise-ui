import { describe, expect, it } from 'vitest';
import { filteredEmissionSourceOptions, sourceOptionLabel, uniqueEmissionSourceNameOptions, uniqueSourceFieldOptions } from './options';

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

  it('builds cascading source options from selected hierarchy levels', () => {
    const sources = [
      {
        sourceIdentificationCode: 'SRC-001',
        companyName: 'Company A',
        factoryName: 'Factory 1',
        sourceCategoryKey: 'Energy',
        scopeName: 'Scope 2',
        scopeSubcategory: 'Purchased electricity',
        sourceIdentificationName: 'Meter A',
        emissionSourceName: 'Electricity'
      },
      {
        sourceIdentificationCode: 'SRC-002',
        companyName: 'Company A',
        factoryName: 'Factory 1',
        sourceCategoryKey: 'Energy',
        scopeName: 'Scope 2',
        scopeSubcategory: 'Purchased electricity',
        sourceIdentificationName: 'Meter B',
        emissionSourceName: 'Electricity'
      },
      {
        sourceIdentificationCode: 'SRC-003',
        companyName: 'Company A',
        factoryName: 'Factory 2',
        sourceCategoryKey: 'Fuel',
        scopeName: 'Scope 1',
        scopeSubcategory: 'Stationary combustion',
        sourceIdentificationName: 'Boiler',
        emissionSourceName: 'Natural gas'
      }
    ];

    expect(uniqueSourceFieldOptions(sources, 'factoryName', { companyName: 'Company A' })).toEqual([
      { label: 'Factory 1', value: 'Factory 1' },
      { label: 'Factory 2', value: 'Factory 2' }
    ]);
    expect(
      filteredEmissionSourceOptions(sources, {
        companyName: 'Company A',
        factoryName: 'Factory 1',
        sourceCategoryKey: 'Energy',
        scopeName: 'Scope 2',
        scopeSubcategory: 'Purchased electricity',
        sourceIdentificationName: 'Meter B'
      })
    ).toEqual([{ label: 'Electricity', value: 'SRC-002' }]);
  });
});
