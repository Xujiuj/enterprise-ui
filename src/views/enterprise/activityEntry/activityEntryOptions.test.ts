import { describe, expect, it } from 'vitest';
import { sourceOptionLabel } from './options';

describe('activity entry option labels', () => {
  it('shows the emission source name instead of the aggregated source path', () => {
    expect(
      sourceOptionLabel({
        sourceIdentificationCode: 'SRC-001',
        sourceIdentificationName: '食堂炊具',
        emissionSourceName: '天然气'
      })
    ).toBe('天然气');
  });

  it('falls back to identification name and code only when the emission source name is absent', () => {
    expect(sourceOptionLabel({ sourceIdentificationCode: 'SRC-001', sourceIdentificationName: '食堂炊具' })).toBe('食堂炊具');
    expect(sourceOptionLabel({ sourceIdentificationCode: 'SRC-001' })).toBe('SRC-001');
  });
});
