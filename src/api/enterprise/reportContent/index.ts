import request from '@/utils/request';
import type { ReportContentVO } from '@/api/enterprise/reportContent/types';

export const listReportContent = (): Promise<{ data?: ReportContentVO[]; rows?: ReportContentVO[] }> => {
  return request({
    url: '/enterprise/report-content/list',
    method: 'get'
  }) as unknown as Promise<{ data?: ReportContentVO[]; rows?: ReportContentVO[] }>;
};
