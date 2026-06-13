export interface ReportTemplateFileVO {
  id: string | number;
  templateCode?: string;
  templateName?: string;
  templateType?: string;
  fileName?: string;
  filePath?: string;
  enabledFlag?: boolean;
  createTime?: string;
  updateTime?: string;
  remark?: string;
}

export interface ReportTemplateFileForm extends BaseEntity {
  id?: string | number;
  templateCode?: string;
  templateName?: string;
  templateType?: string;
  fileName?: string;
  filePath?: string;
  enabledFlag?: boolean;
  remark?: string;
}

export interface ReportTemplateFileQuery extends PageQuery {
  templateCode?: string;
  templateName?: string;
  templateType?: string;
  fileName?: string;
  enabledFlag?: boolean;
  params?: any;
}

export interface ReportTemplateSyncResult {
  licenseId?: string;
  templateCount: number;
  syncedTime?: string;
}

export interface ReportTemplateSyncResponse {
  code?: number;
  msg?: string;
  data?: ReportTemplateSyncResult;
}
