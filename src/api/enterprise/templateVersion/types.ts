export interface TemplateVersionVO {
  id: string | number;
  templateId?: string | number;
  templateCode?: string;
  templateName?: string;
  version?: string;
  versionNo?: string;
  status?: string;
  remark?: string;
  createTime?: string;
  updateTime?: string;
  [key: string]: any;
}

export interface TemplateVersionQuery extends PageQuery {
  templateId?: string | number;
  templateCode?: string;
  templateName?: string;
  version?: string;
  versionNo?: string;
  status?: string;
  params?: any;
}
