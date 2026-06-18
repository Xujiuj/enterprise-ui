import { describe, expect, it } from 'vitest';
import { createXlsxTemplateBlob } from './xlsxTemplate';

const sheet656Headers = [
  'PK_排放源识别编号',
  'FK_公司编号',
  '公司名称',
  '工厂',
  'FK_排放源分类',
  '范围',
  '范围子类别',
  '排放源识别',
  '排放源',
  '单位',
  '年度',
  '月份',
  '日期',
  '活动数据',
  '负责部门',
  '数据来源',
  '备注',
  'FK_排放因子'
];

describe('createXlsxTemplateBlob', () => {
  it('creates an xlsx package with sheet_656 headers', async () => {
    const blob = createXlsxTemplateBlob({
      sheetName: 'sheet_656',
      headers: sheet656Headers
    });

    const bytes = new Uint8Array(await blob.arrayBuffer());
    const text = new TextDecoder().decode(bytes);

    expect(blob.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    expect([...bytes.slice(0, 4)]).toEqual([0x50, 0x4b, 0x03, 0x04]);
    expect(text).toContain('xl/worksheets/sheet1.xml');
    expect(text).toContain('sheet_656');
    sheet656Headers.forEach((header) => {
      expect(text).toContain(header);
    });
  });
});
