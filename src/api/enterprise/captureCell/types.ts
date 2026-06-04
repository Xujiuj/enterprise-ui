export interface CaptureCellVO {
  id: string | number;
  rowId?: string | number;
  fieldId?: string | number;
  textValue?: string;
  decimalValue?: string | number;
  dateValue?: string;
  valueStatus?: string;
  createTime?: string;
  updateTime?: string;
  [key: string]: any;
}

export interface CaptureCellQuery extends PageQuery {
  rowId?: string | number;
  fieldId?: string | number;
  valueStatus?: string;
  params?: any;
}
