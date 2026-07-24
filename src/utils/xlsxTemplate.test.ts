import { describe, expect, it } from 'vitest';
import { createXlsxTemplateBlob } from './xlsxTemplate';

const emissionActivityEntryHeaders = [
  '公司名称',
  '工厂',
  '范围',
  '范围子类别',
  '排放源识别',
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
        公司名称: ['峰行智成集团', '峰行智成科技有限公司'],
        工厂: ['峰行智成（安徽）建材有限公司'],
        范围: ['范围1', '范围2'],
        范围子类别: ['1.1 固定源燃烧', '1.2 移动源燃烧'],
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
    expect(text).toContain('xl/worksheets/sheet3.xml');
    expect(text).toContain('emission_activity');
    expect(text).toContain('数据说明');
    expect(text).toContain('__options');
    expect(text).toContain('<dataValidations count="7">');
    expect(text).toContain('&apos;__options&apos;!$A$1:$A$2');
    expect(text).toContain('峰行智成集团');
    expect(text).toContain('峰行智成（安徽）建材有限公司');
    expect(text).toContain('填写示例');
    expect(text).not.toContain('填写说明');
    expect(text).toContain('请从下拉选项中选择');
    expect(text).not.toContain('按业务实际情况填写。');
    expect(text).toContain('填写排放源识别，如“IT设备采购”');
    expect(text).toContain('填写活动期间，如“2026-6”');
    expect(text).toContain('填写日期，如“2026-6-2”');
    expect(text).toContain('填写活动数据，如“1000”');
    expect(text).not.toContain('填写排放源，如“天然气”');
    expect(text).not.toContain('如业务允许手动新增');
    expect(text).not.toContain('活动期间示例');
    expect(text).not.toContain('日期示例');
    emissionActivityEntryHeaders.forEach((header) => {
      expect(text).toContain(header);
    });
    ['排放源识别编号', '公司编号', '年度', '月份', '排放因子'].forEach((header) => {
      expect(text).not.toContain(header);
    });
  });

  it('uses business examples for EF factor template guide', async () => {
    const blob = createXlsxTemplateBlob({
      sheetName: 'EF排放因子维度表',
      headers: ['排放源名称', '排放源英文名', '燃料/物质类别', '排放源单位', 'CO2', 'CH4', 'N2O', '适用范围', '因子来源', 'GWP_CH4', 'GWP_N2O', '因子GWP', '因子单位', '状态'],
      validations: {
        适用范围: ['范围1', '范围2'],
        状态: ['启用', '停用']
      }
    });

    const text = new TextDecoder().decode(new Uint8Array(await blob.arrayBuffer()));

    expect(text).toContain('填写CO2值，单位kg，如“1000”');
    expect(text).toContain('填写CH4值，单位kg，如“0”');
    expect(text).toContain('填写N2O值，单位kg，如“0”');
    expect(text).toContain('填写GWP_CH4值，如“28”');
    expect(text).toContain('填写GWP_N2O值，如“265”');
    expect(text).toContain('计算字段：CO2 + CH4*GWP_CH4 + N2O*GWP_N2O 等，如“1000”');
    expect(text).toContain('填写因子单位，如“kgCO2/m3”');
    expect(text).toContain('请从下拉选项中选择');
    expect(text).toContain('&apos;__options&apos;!$H$1:$H$2');
    expect(text).not.toContain('填写CO2，如“CO2示例”');
    expect(text).not.toContain('填写GWP_CH4，如“GWP_CH4示例”');
  });
});
