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

describe('enterprise dimension required field UX', () => {
  it('only binds validation rules to fields marked required', () => {
    expect(source).toContain(':prop="page.parentRequired ? \'parentCode\' : undefined"');
    expect(source).toContain(':prop="field.required ? field.prop : undefined"');
    expect(source).toContain(':required="page.parentRequired"');
    expect(source).toContain(':required="field.required"');
  });

  it('marks company factory fields required before submit', () => {
    expect(source).toContain('parentRequired: true');
    expect(source).toContain("{ prop: 'factoryName', label: '工厂', placeholder: '请输入工厂名称', required: true }");
    expect(source).toContain("parentCode: [{ required: true, message: '工厂编号不能为空', trigger: 'change' }]");
    expect(source).toContain("factoryName: [{ required: true, message: '工厂名称不能为空', trigger: 'blur' }]");
  });
});
