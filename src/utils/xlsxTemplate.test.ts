import { describe, expect, it } from 'vitest';
import { createXlsxTemplateBlob } from './xlsxTemplate';

const emissionActivityEntryHeaders = [
  '公司名称',
  '工厂',
  '范围',
  '范围子类别',
  '排放源名称',
  '活动期间',
  '日期',
  '活动数据',
  '负责部门',
  '数据来源'
];

describe('createXlsxTemplateBlob', () => {
  it('creates an xlsx package with emission_activity headers', async () => {
    const blob = createXlsxTemplateBlob({
      sheetName: 'emission_activity',
      headers: emissionActivityEntryHeaders,
      validations: {
        公司名称: ['Company One', 'Company Two'],
        排放源名称: ['天然气', '柴油'],
        负责部门: ['生产部'],
        数据来源: ['实测']
      }
    });

    const bytes = new Uint8Array(await blob.arrayBuffer());
    const text = new TextDecoder().decode(bytes);

    expect(blob.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    expect([...bytes.slice(0, 4)]).toEqual([0x50, 0x4b, 0x03, 0x04]);
    expect(text).toContain('xl/worksheets/sheet1.xml');
    expect(text).toContain('xl/worksheets/sheet2.xml');
    expect(text).toContain('emission_activity');
    expect(text).toContain('__options');
    expect(text).toContain('<dataValidations count="4">');
    expect(text).toContain('&apos;__options&apos;!$A$1:$A$2');
    expect(text).toContain('Company One');
    emissionActivityEntryHeaders.forEach((header) => {
      expect(text).toContain(header);
    });
    ['排放源识别编号', '公司编号', '年度', '月份', '排放因子'].forEach((header) => {
      expect(text).not.toContain(header);
    });
  });
});
