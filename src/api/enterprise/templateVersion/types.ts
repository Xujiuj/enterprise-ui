export interface TemplateVersionVO {
  id: string | number;
  versionCode?: string;
  versionName?: string;
  sourceDir?: string;
  workbookCount?: number;
  sheetCount?: number;
  fieldCount?: number;
  status?: string;
  importedBy?: string;
  importedTime?: string;
  remark?: string;
  createTime?: string;
  updateTime?: string;
  [key: string]: any;
}

export interface TemplateVersionQuery extends PageQuery {
  versionCode?: string;
  versionName?: string;
  status?: string;
  params?: any;
}
