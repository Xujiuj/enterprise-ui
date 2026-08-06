import request from '@/utils/request';
import type { DynamicGenerateRequest, DynamicGenerateResult, DynamicModuleSchema, DynamicPageResponse, DynamicWorkbookPreview } from './types';

export const previewDynamicWorkbook = (file: File) => {
  const data = new FormData();
  data.append('file', file);
  return request<DynamicWorkbookPreview>({
    url: '/enterprise/dynamic-module/preview',
    method: 'post',
    data
  });
};

export const generateDynamicModules = (file: File, definition: DynamicGenerateRequest) => {
  const data = new FormData();
  data.append('file', file);
  data.append('definition', JSON.stringify(definition));
  return request<DynamicGenerateResult>({
    url: '/enterprise/dynamic-module/generate',
    method: 'post',
    data
  });
};

export const listDynamicModules = () => {
  return request<DynamicModuleSchema[]>({
    url: '/enterprise/dynamic-module/list',
    method: 'get'
  });
};

export const archiveDynamicModules = (moduleCodes: string | string[]) => {
  return request({
    url: '/enterprise/dynamic-module/' + (Array.isArray(moduleCodes) ? moduleCodes.join(',') : moduleCodes),
    method: 'delete'
  });
};

export const restoreDynamicModule = (moduleCode: string) => {
  return request<DynamicModuleSchema>({
    url: `/enterprise/dynamic-module/${moduleCode}/restore`,
    method: 'put'
  });
};

export const getDynamicSchema = (moduleCode: string) => {
  return request<DynamicModuleSchema>({
    url: `/enterprise/dynamic/${moduleCode}/schema`,
    method: 'get'
  });
};

export const listDynamicRecords = (moduleCode: string, params?: Record<string, any>): Promise<DynamicPageResponse> => {
  return request({
    url: `/enterprise/dynamic/${moduleCode}/list`,
    method: 'get',
    params
  }) as unknown as Promise<DynamicPageResponse>;
};

export const getDynamicRecord = (moduleCode: string, id: string | number) => {
  return request({
    url: `/enterprise/dynamic/${moduleCode}/${id}`,
    method: 'get'
  });
};

export const addDynamicRecord = (moduleCode: string, data: Record<string, any>) => {
  return request({
    url: `/enterprise/dynamic/${moduleCode}`,
    method: 'post',
    data
  });
};

export const updateDynamicRecord = (moduleCode: string, data: Record<string, any>) => {
  return request({
    url: `/enterprise/dynamic/${moduleCode}`,
    method: 'put',
    data
  });
};

export const deleteDynamicRecord = (moduleCode: string, ids: string | number | Array<string | number>) => {
  return request({
    url: `/enterprise/dynamic/${moduleCode}/${ids}`,
    method: 'delete'
  });
};

export const importDynamicRecords = (moduleCode: string, file: File) => {
  const data = new FormData();
  data.append('file', file);
  return request({
    url: `/enterprise/dynamic/${moduleCode}/import`,
    method: 'post',
    data
  });
};
