export interface TemplateSheetVO {
  id: string | number;
  templateVersionId?: string | number;
  sourceFile?: string;
  sourceGroup?: string;
  sheetName?: string;
  sheetType?: string;
  headerRow?: number;
  fieldCount?: number;
  moduleCode?: string;
  targetTableCode?: string;
  allowExtension?: boolean;
  createTime?: string;
  [key: string]: any;
}

export interface TemplateSheetQuery extends PageQuery {
  templateVersionId?: string | number;
  sourceGroup?: string;
  sheetName?: string;
  moduleCode?: string;
  targetTableCode?: string;
  allowExtension?: boolean;
  params?: any;
}
