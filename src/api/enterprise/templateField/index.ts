import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { TemplateFieldQuery, TemplateFieldVO } from '@/api/enterprise/templateField/types';

export const listTemplateField = (query?: TemplateFieldQuery): AxiosPromise<TemplateFieldVO[]> => {
  return request({
    url: '/enterprise/template-field/list',
    method: 'get',
    params: query
  });
};

export const getTemplateField = (id: string | number): AxiosPromise<TemplateFieldVO> => {
  return request({
    url: '/enterprise/template-field/' + id,
    method: 'get'
  });
};
