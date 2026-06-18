import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const source = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), 'index.vue'), 'utf8');

function readonlyDimensionCodes() {
  const match = source.match(/const vendorOnlyDimensionCodes = new Set\(\[([\s\S]*?)\]\);/);
  expect(match).not.toBeNull();
  return Array.from(match?.[1].matchAll(/'([^']+)'/g) ?? []).map((item) => item[1]);
}

describe('enterprise dimension edit permissions', () => {
  it('keeps document-defined enterprise editable vendor-provided dimensions editable', () => {
    expect(readonlyDimensionCodes()).not.toEqual(expect.arrayContaining(['base-year', 'ef-electricity-version']));
  });

  it('keeps document-defined enterprise readonly dimensions readonly', () => {
    expect(readonlyDimensionCodes()).toEqual(expect.arrayContaining(['ef-electricity-scope', 'greenhouse-gas']));
  });
});
