export interface ReportContentVO {
  id: string | number;
  directoryNo?: number;
  directoryName?: string;
  subdirectoryNo?: number;
  subdirectoryName?: string;
  displayOrder?: number;
  createTime?: string;
  updateTime?: string;
  remark?: string;
}

export interface ReportContentForm {
  id?: string | number;
  directoryNo?: number;
  directoryName: string;
  subdirectoryNo?: number;
  subdirectoryName: string;
  displayOrder?: number;
  remark?: string;
}

export interface ReportContentSyncResult {
  licenseId?: string;
  contentCount: number;
  syncedTime?: string;
}

export interface ReportContentSyncResponse {
  data?: ReportContentSyncResult;
}
