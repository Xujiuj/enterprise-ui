import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { TemplateSheetQuery, TemplateSheetVO } from '@/api/enterprise/templateSheet/types';

export const listTemplateSheet = (query?: TemplateSheetQuery): AxiosPromise<TemplateSheetVO[]> => {
  return request({
    url: '/enterprise/template-sheet/list',
    method: 'get',
    params: query
  });
};

export const getTemplateSheet = (id: string | number): AxiosPromise<TemplateSheetVO> => {
  return request({
    url: '/enterprise/template-sheet/' + id,
    method: 'get'
  });
};
