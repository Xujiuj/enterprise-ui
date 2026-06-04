export interface CaptureRowVO {
  id: string | number;
  batchId?: string | number;
  sheetId?: string | number;
  sourceRowNo?: number;
  rowStatus?: string;
  validationLevel?: string;
  createTime?: string;
  updateTime?: string;
  [key: string]: any;
}

export interface CaptureRowQuery extends PageQuery {
  batchId?: string | number;
  sheetId?: string | number;
  rowStatus?: string;
  validationLevel?: string;
  params?: any;
}
