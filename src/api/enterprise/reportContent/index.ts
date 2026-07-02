import request from '@/utils/request';
import type { ReportContentForm, ReportContentSyncResponse, ReportContentVO } from '@/api/enterprise/reportContent/types';

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

export const getReportContent = (id: string | number): Promise<{ data?: ReportContentVO }> => {
  return request({
    url: `/enterprise/report-content/${id}`,
    method: 'get'
  }) as unknown as Promise<{ data?: ReportContentVO }>;
};

export const addReportContent = (data: ReportContentForm): Promise<unknown> => {
  return request({
    url: '/enterprise/report-content',
    method: 'post',
    data
  });
};

export const updateReportContent = (data: ReportContentForm): Promise<unknown> => {
  return request({
    url: '/enterprise/report-content',
    method: 'put',
    data
  });
};

export const deleteReportContent = (ids: string | number | Array<string | number>): Promise<unknown> => {
  return request({
    url: `/enterprise/report-content/${ids}`,
    method: 'delete'
  });
};
