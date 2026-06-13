import axios, { AxiosPromise, AxiosResponse } from 'axios';
import request, { globalHeaders } from '@/utils/request';
import {
  ReportTemplateFileForm,
  ReportTemplateFileQuery,
  ReportTemplateFileVO,
  ReportTemplateSyncResponse
} from '@/api/enterprise/reportTemplateFile/types';

export interface ReportTemplateFilePageResponse {
  rows?: ReportTemplateFileVO[];
  data?: ReportTemplateFileVO[];
  total?: number | string;
}

export const listReportTemplateFile = (query?: ReportTemplateFileQuery): Promise<ReportTemplateFilePageResponse> => {
  return request({
    url: '/enterprise/report-template-file/list',
    method: 'get',
    params: query
  }) as unknown as Promise<ReportTemplateFilePageResponse>;
};

export const getReportTemplateFile = (id: string | number): AxiosPromise<ReportTemplateFileVO> => {
  return request({
    url: '/enterprise/report-template-file/' + id,
    method: 'get'
  });
};

export const downloadReportTemplateFile = (id: string | number): Promise<AxiosResponse<Blob>> => {
  return axios({
    url: `${import.meta.env.VITE_APP_BASE_API}/enterprise/report-template-file/download/${id}`,
    method: 'get',
    responseType: 'blob',
    headers: globalHeaders()
  });
};

export const syncReportTemplates = (): Promise<ReportTemplateSyncResponse> => {
  return request({
    url: '/enterprise/report-template-sync/run',
    method: 'post'
  }) as unknown as Promise<ReportTemplateSyncResponse>;
};

export const addReportTemplateFile = (data: ReportTemplateFileForm) => {
  return request({
    url: '/enterprise/report-template-file',
    method: 'post',
    data
  });
};

export const updateReportTemplateFile = (data: ReportTemplateFileForm) => {
  return request({
    url: '/enterprise/report-template-file',
    method: 'put',
    data
  });
};

export const delReportTemplateFile = (id: string | number | Array<string | number>) => {
  return request({
    url: '/enterprise/report-template-file/' + id,
    method: 'delete'
  });
};
