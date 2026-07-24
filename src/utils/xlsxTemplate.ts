import FileSaver from 'file-saver';

interface XlsxTemplateOptions {
  fileName: string;
  sheetName: string;
  headers: string[];
  validations?: Record<string, string[]>;
}

interface ZipEntry {
  path: string;
  content: string;
}

const encoder = new TextEncoder();

const crcTable = (() => {
  const table: number[] = [];
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function columnName(index: number) {
  let value = index + 1;
  let name = '';
  while (value > 0) {
    const remainder = (value - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    value = Math.floor((value - 1) / 26);
  }
  return name;
}

function normalizeOptions(options: string[] = []) {
  const seen = new Set<string>();
  return options
    .map((option) => String(option ?? '').trim())
    .filter((option) => {
      if (!option || seen.has(option)) {
        return false;
      }
      seen.add(option);
      return true;
    });
}

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function writeUint16(target: number[], value: number) {
  target.push(value & 0xff, (value >>> 8) & 0xff);
}

function writeUint32(target: number[], value: number) {
  target.push(value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff);
}

function appendBytes(target: number[], bytes: Uint8Array) {
  for (const byte of bytes) {
    target.push(byte);
  }
}

function createZip(entries: ZipEntry[]) {
  const output: number[] = [];
  const centralDirectory: number[] = [];
  const now = new Date();
  const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2);
  const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();

  entries.forEach((entry) => {
    const pathBytes = encoder.encode(entry.path);
    const contentBytes = encoder.encode(entry.content);
    const checksum = crc32(contentBytes);
    const localHeaderOffset = output.length;

    writeUint32(output, 0x04034b50);
    writeUint16(output, 20);
    writeUint16(output, 0);
    writeUint16(output, 0);
    writeUint16(output, dosTime);
    writeUint16(output, dosDate);
    writeUint32(output, checksum);
    writeUint32(output, contentBytes.length);
    writeUint32(output, contentBytes.length);
    writeUint16(output, pathBytes.length);
    writeUint16(output, 0);
    appendBytes(output, pathBytes);
    appendBytes(output, contentBytes);

    writeUint32(centralDirectory, 0x02014b50);
    writeUint16(centralDirectory, 20);
    writeUint16(centralDirectory, 20);
    writeUint16(centralDirectory, 0);
    writeUint16(centralDirectory, 0);
    writeUint16(centralDirectory, dosTime);
    writeUint16(centralDirectory, dosDate);
    writeUint32(centralDirectory, checksum);
    writeUint32(centralDirectory, contentBytes.length);
    writeUint32(centralDirectory, contentBytes.length);
    writeUint16(centralDirectory, pathBytes.length);
    writeUint16(centralDirectory, 0);
    writeUint16(centralDirectory, 0);
    writeUint16(centralDirectory, 0);
    writeUint16(centralDirectory, 0);
    writeUint32(centralDirectory, 0);
    writeUint32(centralDirectory, localHeaderOffset);
    appendBytes(centralDirectory, pathBytes);
  });

  const centralDirectoryOffset = output.length;
  output.push(...centralDirectory);
  writeUint32(output, 0x06054b50);
  writeUint16(output, 0);
  writeUint16(output, 0);
  writeUint16(output, entries.length);
  writeUint16(output, entries.length);
  writeUint32(output, centralDirectory.length);
  writeUint32(output, centralDirectoryOffset);
  writeUint16(output, 0);

  return new Blob([new Uint8Array(output)], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
}

function buildDataValidations(headers: string[], validations?: Record<string, string[]>) {
  const rules = headers
    .map((header, index) => {
      const options = normalizeOptions(validations?.[header]);
      if (!options.length) {
        return '';
      }
      const column = columnName(index);
      const optionColumn = columnName(index);
      const optionRange = `'__options'!$${optionColumn}$1:$${optionColumn}$${options.length}`;
      return `<dataValidation type="list" allowBlank="1" showErrorMessage="1" sqref="${column}2:${column}1001"><formula1>${escapeXml(optionRange)}</formula1></dataValidation>`;
    })
    .filter(Boolean)
    .join('');
  return rules ? `<dataValidations count="${(rules.match(/<dataValidation /g) ?? []).length}">${rules}</dataValidations>` : '';
}

function headerColumnRef(headers: string[], targetHeader: string, rowIndex: number) {
  const index = headers.findIndex((header) => cleanHeaderName(header) === targetHeader);
  return index >= 0 ? `${columnName(index)}${rowIndex}` : undefined;
}

function factorGwpFormula(headers: string[], rowIndex: number) {
  const factorGwpColumn = headerColumnRef(headers, '因子GWP', rowIndex);
  if (!factorGwpColumn) {
    return '';
  }
  const co2 = headerColumnRef(headers, 'CO2', rowIndex);
  const ch4 = headerColumnRef(headers, 'CH4', rowIndex);
  const n2o = headerColumnRef(headers, 'N2O', rowIndex);
  const hfcs = headerColumnRef(headers, 'HFCs', rowIndex);
  const pfcs = headerColumnRef(headers, 'PFCs', rowIndex);
  const sf6 = headerColumnRef(headers, 'SF6', rowIndex);
  const nf3 = headerColumnRef(headers, 'NF3', rowIndex);
  const gwpCh4 = headerColumnRef(headers, 'GWP_CH4', rowIndex);
  const gwpN2o = headerColumnRef(headers, 'GWP_N2O', rowIndex);
  const gwpHfcs = headerColumnRef(headers, 'GWP_HFCs', rowIndex);
  const gwpPfcs = headerColumnRef(headers, 'GWP_PFCs', rowIndex);
  const gwpSf6 = headerColumnRef(headers, 'GWP_SF6', rowIndex);
  const gwpNf3 = headerColumnRef(headers, 'GWP_NF3', rowIndex);
  if (!co2 || !ch4 || !n2o || !hfcs || !pfcs || !sf6 || !nf3 || !gwpCh4 || !gwpN2o || !gwpHfcs || !gwpPfcs || !gwpSf6 || !gwpNf3) {
    return '';
  }
  return `${co2}*1+${ch4}*${gwpCh4}+${n2o}*${gwpN2o}+${hfcs}*${gwpHfcs}+${pfcs}*${gwpPfcs}+${sf6}*${gwpSf6}+${nf3}*${gwpNf3}`;
}

function buildFormulaRows(headers: string[]) {
  const rowIndex = 2;
  const factorGwpColumnIndex = headers.findIndex((header) => cleanHeaderName(header) === '因子GWP');
  const formula = factorGwpFormula(headers, rowIndex);
  if (factorGwpColumnIndex < 0 || !formula) {
    return '';
  }
  const ref = `${columnName(factorGwpColumnIndex)}${rowIndex}`;
  return `<row r="${rowIndex}"><c r="${ref}"><f>${escapeXml(formula)}</f></c></row>`;
}

function buildWorksheet(headers: string[], validations?: Record<string, string[]>) {
  const cols = headers
    .map((header, index) => {
      const width = Math.min(Math.max(header.length + 4, 12), 28);
      return `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`;
    })
    .join('');
  const cells = headers
    .map((header, index) => {
      const ref = `${columnName(index)}1`;
      return `<c r="${ref}" t="inlineStr"><is><t>${escapeXml(header)}</t></is></c>`;
    })
    .join('');
  const lastColumn = columnName(Math.max(headers.length - 1, 0));
  const dataValidations = buildDataValidations(headers, validations);
  const formulaRows = buildFormulaRows(headers);
  const dimensionLastRow = formulaRows ? 2 : 1;

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <dimension ref="A1:${lastColumn}${dimensionLastRow}"/>
  <sheetViews><sheetView workbookViewId="0"/></sheetViews>
  <sheetFormatPr defaultRowHeight="18"/>
  <cols>${cols}</cols>
  <sheetData>
    <row r="1">${cells}</row>
    ${formulaRows}
  </sheetData>
  ${dataValidations}
  <pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/>
</worksheet>`;
}

function buildOptionsWorksheet(headers: string[], validations?: Record<string, string[]>) {
  const optionColumns = headers.map((header) => normalizeOptions(validations?.[header]));
  const maxRows = Math.max(1, ...optionColumns.map((items) => items.length));
  const rows = Array.from({ length: maxRows }, (_, rowIndex) => {
    const cells = optionColumns
      .map((items, columnIndex) => {
        const value = items[rowIndex];
        if (!value) {
          return '';
        }
        const ref = `${columnName(columnIndex)}${rowIndex + 1}`;
        return `<c r="${ref}" t="inlineStr"><is><t>${escapeXml(value)}</t></is></c>`;
      })
      .join('');
    return `<row r="${rowIndex + 1}">${cells}</row>`;
  }).join('');
  const lastColumn = columnName(Math.max(headers.length - 1, 0));

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <dimension ref="A1:${lastColumn}${maxRows}"/>
  <sheetViews><sheetView workbookViewId="0"/></sheetViews>
  <sheetFormatPr defaultRowHeight="18"/>
  <sheetData>${rows}</sheetData>
  <pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/>
</worksheet>`;
}

function cleanHeaderName(header: string) {
  return header.replace(/^(?:FK|PK|SK|BK)_/i, '').trim();
}

function fallbackExampleForHeader(header: string) {
  const cleanHeader = cleanHeaderName(header);
  const gasExamples: Record<string, string> = {
    CO2: '1000',
    CH4: '0',
    N2O: '0',
    HFCs: '0',
    PFCs: '0',
    SF6: '0',
    NF3: '0'
  };
  const gwpExamples: Record<string, string> = {
    GWP_CH4: '28',
    GWP_N2O: '265',
    GWP_HFCs: '1',
    GWP_PFCs: '1',
    GWP_SF6: '23500',
    GWP_NF3: '16100'
  };
  if (gasExamples[cleanHeader]) {
    return `填写${cleanHeader}值，单位kg，如“${gasExamples[cleanHeader]}”`;
  }
  if (gwpExamples[cleanHeader]) {
    return `填写${cleanHeader}值，如“${gwpExamples[cleanHeader]}”`;
  }
  if (cleanHeader === '因子GWP') {
    return '计算字段：CO2 + CH4*GWP_CH4 + N2O*GWP_N2O 等，如“1000”';
  }
  if (cleanHeader === '适用范围') {
    return '请从下拉选项中选择';
  }
  if (cleanHeader === '因子单位') {
    return '填写因子单位，如“kgCO2/m3”';
  }
  if (cleanHeader === '排放源单位') {
    return '填写排放源单位，如“m3”';
  }
  if (cleanHeader === '因子来源') {
    return '填写因子来源，如“实测台账”';
  }
  if (cleanHeader.includes('公司')) {
    return `填写${cleanHeader}，如“峰行智成集团”`;
  }
  if (cleanHeader.includes('工厂')) {
    return `填写${cleanHeader}，如“峰行智成（安徽）建材有限公司”`;
  }
  if (cleanHeader.includes('范围子类别')) {
    return `填写${cleanHeader}，如“1.1 固定源燃烧”`;
  }
  if (cleanHeader === '范围' || cleanHeader.includes('排放范围')) {
    return `填写${cleanHeader}，如“范围1”`;
  }
  if (cleanHeader.includes('排放源识别')) {
    return `填写${cleanHeader}，如“IT设备采购”`;
  }
  if (cleanHeader.includes('排放源')) {
    return `填写${cleanHeader.replace(/名称$/, '')}，如“天然气”`;
  }
  if (cleanHeader.includes('活动期间') || cleanHeader.includes('期间') || cleanHeader.includes('月份')) {
    return `填写${cleanHeader}，如“2026-6”`;
  }
  if (cleanHeader.includes('日期') || cleanHeader.includes('时间')) {
    return `填写${cleanHeader}，如“2026-6-2”`;
  }
  if (cleanHeader.includes('活动数据')) {
    return `填写${cleanHeader}，如“1000”`;
  }
  if (cleanHeader.includes('负责部门') || cleanHeader.includes('部门')) {
    return `填写${cleanHeader}，如“生产部”`;
  }
  if (cleanHeader.includes('数据来源') || cleanHeader.includes('来源')) {
    return `填写${cleanHeader}，如“实测台账”`;
  }
  if (cleanHeader.includes('单位')) {
    return `填写${cleanHeader}，如“吨”`;
  }
  if (cleanHeader.includes('因子')) {
    return `填写${cleanHeader}，如“柴油-移动燃烧-2024”`;
  }
  return `填写${cleanHeader}，如“${cleanHeader}示例”`;
}

function exampleForHeader(header: string, validations?: Record<string, string[]>) {
  return normalizeOptions(validations?.[header]).length ? '请从下拉选项中选择' : fallbackExampleForHeader(header);
}

function inlineCell(ref: string, value: string) {
  return `<c r="${ref}" t="inlineStr"><is><t>${escapeXml(value)}</t></is></c>`;
}

function buildGuideWorksheet(headers: string[], validations?: Record<string, string[]>) {
  const guideHeaders = ['字段名称', '填写示例'];
  const rows = [
    `<row r="1">${guideHeaders.map((header, index) => inlineCell(`${columnName(index)}1`, header)).join('')}</row>`,
    ...headers.map((header, index) => {
      const rowIndex = index + 2;
      return `<row r="${rowIndex}">${[
        inlineCell(`A${rowIndex}`, cleanHeaderName(header)),
        inlineCell(`B${rowIndex}`, exampleForHeader(header, validations))
      ].join('')}</row>`;
    })
  ].join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <dimension ref="A1:B${Math.max(headers.length + 1, 1)}"/>
  <sheetViews><sheetView workbookViewId="0"/></sheetViews>
  <sheetFormatPr defaultRowHeight="18"/>
  <cols>
    <col min="1" max="1" width="24" customWidth="1"/>
    <col min="2" max="2" width="32" customWidth="1"/>
  </cols>
  <sheetData>${rows}</sheetData>
  <pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/>
</worksheet>`;
}

export function createXlsxTemplateBlob(options: Pick<XlsxTemplateOptions, 'sheetName' | 'headers' | 'validations'>) {
  const safeSheetName = escapeXml(options.sheetName.slice(0, 31) || 'Sheet1');
  const entries: ZipEntry[] = [
    {
      path: '[Content_Types].xml',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet3.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`
    },
    {
      path: '_rels/.rels',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`
    },
    {
      path: 'xl/workbook.xml',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="${safeSheetName}" sheetId="1" r:id="rId1"/>
    <sheet name="数据说明" sheetId="2" r:id="rId3"/>
    <sheet name="__options" sheetId="3" state="hidden" r:id="rId4"/>
  </sheets>
  <calcPr calcId="0" calcMode="auto" fullCalcOnLoad="1"/>
</workbook>`
    },
    {
      path: 'xl/_rels/workbook.xml.rels',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
  <Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet3.xml"/>
</Relationships>`
    },
    {
      path: 'xl/styles.xml',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>
  <fills count="1"><fill><patternFill patternType="none"/></fill></fills>
  <borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs>
</styleSheet>`
    },
    {
      path: 'xl/worksheets/sheet1.xml',
      content: buildWorksheet(options.headers, options.validations)
    },
    {
      path: 'xl/worksheets/sheet2.xml',
      content: buildGuideWorksheet(options.headers, options.validations)
    },
    {
      path: 'xl/worksheets/sheet3.xml',
      content: buildOptionsWorksheet(options.headers, options.validations)
    }
  ];

  return createZip(entries);
}

export function downloadXlsxTemplate(options: XlsxTemplateOptions) {
  FileSaver.saveAs(createXlsxTemplateBlob(options), options.fileName);
}
