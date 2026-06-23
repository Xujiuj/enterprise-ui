import { listDimensionRecord } from '@/api/enterprise/dimensionRecord';
import type { DimensionRecordVO } from '@/api/enterprise/dimensionRecord/types';
import { listDept } from '@/api/system/dept';
import type { DeptVO } from '@/api/system/dept/types';

export interface SelectOption {
  label: string;
  value: string | number | boolean;
  record?: Record<string, any>;
}

export const DATA_SOURCE_OPTIONS: SelectOption[] = [
  { label: '发票', value: '发票' },
  { label: '系统', value: '系统' },
  { label: '仪表', value: '仪表' },
  { label: '合同', value: '合同' },
  { label: '台账', value: '台账' },
  { label: 'ERP', value: 'ERP' },
  { label: '抄表记录', value: '抄表记录' }
];

export const FACTOR_TABLE_OPTIONS: SelectOption[] = [
  { label: '201 EF排放因子维度表', value: '201ef' },
  { label: '202 EF电力因子维度表', value: '202ef' },
  { label: '203 EF电力因子版本对应', value: '203ef' },
  { label: '204 EF燃料因子计算', value: '204ef' },
  { label: '205 EF电力因子口径维度', value: '205ef' },
  { label: '206 温室气体维度', value: '206' }
];

export const MONTH_OPTIONS: SelectOption[] = Array.from({ length: 12 }, (_, index) => {
  const month = index + 1;
  return { label: `${month}月`, value: month };
});

const uniqueByValue = (options: SelectOption[]) => {
  const seen = new Set<string>();
  return options.filter((option) => {
    const key = String(option.value);
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

export const dimensionRecordLabel = (record: DimensionRecordVO) =>
  [record.recordCode, record.recordName].filter(Boolean).join(' / ') || record.recordCode || record.recordName;

export const loadDimensionOptions = async (
  dimensionCode: string,
  mapper: (record: DimensionRecordVO) => SelectOption | undefined = (record) => ({
    label: dimensionRecordLabel(record),
    value: record.recordCode,
    record
  })
) => {
  const res = await listDimensionRecord({
    dimensionCode,
    status: '0',
    pageNum: 1,
    pageSize: 1000
  });
  return uniqueByValue((res.rows ?? res.data ?? []).map(mapper).filter((option): option is SelectOption => Boolean(option)));
};

export const loadDeptOptions = async () => {
  const res = await listDept({ status: 0, pageNum: 1, pageSize: 1000 });
  return uniqueByValue(
    (res.data ?? res.rows ?? []).map((dept: DeptVO) => ({
      label: dept.deptName,
      value: dept.deptName,
      record: dept
    }))
  );
};
