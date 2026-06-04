import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { TemplateVersionQuery, TemplateVersionVO } from '@/api/enterprise/templateVersion/types';

export const listTemplateVersion = (query?: TemplateVersionQuery): AxiosPromise<TemplateVersionVO[]> => {
  return request({
    url: '/enterprise/template-version/list',
    method: 'get',
    params: query
  });
};

export const getTemplateVersion = (id: string | number): AxiosPromise<TemplateVersionVO> => {
  return request({
    url: '/enterprise/template-version/' + id,
    method: 'get'
  });
};
