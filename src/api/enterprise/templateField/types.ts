export interface TemplateFieldVO {
  id: string | number;
  sheetId?: string | number;
  fieldOrder?: number;
  originalFieldName?: string;
  targetColumnCode?: string;
  valueType?: string;
  requiredFlag?: boolean;
  originalFieldFlag?: boolean;
  extensibleFlag?: boolean;
  createTime?: string;
  [key: string]: any;
}

export interface TemplateFieldQuery extends PageQuery {
  sheetId?: string | number;
  params?: any;
}
