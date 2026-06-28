import request from '@/utils/request';
import type { ReportContentSyncResponse, ReportContentVO } from '@/api/enterprise/reportContent/types';

export const listReportContent = (): Promise<{ data?: ReportContentVO[]; rows?: ReportContentVO[] }> => {
  return request({
    url: '/enterprise/report-content/list',
    method: 'get'
  }) as unknown as Promise<{ data?: ReportContentVO[]; rows?: ReportContentVO[] }>;
};

export const syncReportContent = (): Promise<ReportContentSyncResponse> => {
  return request({
    url: '/enterprise/report-content/sync',
    method: 'post'
  }) as unknown as Promise<ReportContentSyncResponse>;
};
