export interface DimensionRecordVO {
  id: string | number;
  dimensionCode: string;
  recordCode: string;
  recordName: string;
  parentCode?: string;
  sourceType?: string;
  field01?: string;
  field02?: string;
  field03?: string;
  field04?: string;
  field05?: string;
  field06?: string;
  sortOrder?: number;
  status?: string;
  createTime?: string;
  updateTime?: string;
  remark?: string;
}

export interface DimensionRecordForm extends BaseEntity {
  id?: string | number;
  dimensionCode?: string;
  recordCode?: string;
  recordName?: string;
  parentCode?: string;
  sourceType?: string;
  field01?: string;
  field02?: string;
  field03?: string;
  field04?: string;
  field05?: string;
  field06?: string;
  sortOrder?: number;
  status?: string;
  remark?: string;
}

export interface DimensionRecordQuery extends PageQuery {
  dimensionCode?: string;
  recordCode?: string;
  recordName?: string;
  parentCode?: string;
  sourceType?: string;
  status?: string;
}
