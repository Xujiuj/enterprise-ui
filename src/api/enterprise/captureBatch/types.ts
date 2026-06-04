export interface CaptureBatchVO {
  id: string | number;
  templateVersionId?: string | number;
  moduleCode?: string;
  sourceMode?: string;
  batchStatus?: string;
  validationStatus?: string;
  submittedBy?: string;
  submittedTime?: string;
  createTime?: string;
  updateTime?: string;
  remark?: string;
  [key: string]: any;
}

export interface CaptureBatchQuery extends PageQuery {
  templateVersionId?: string | number;
  moduleCode?: string;
  sourceMode?: string;
  batchStatus?: string;
  validationStatus?: string;
  params?: any;
}
