import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { EmissionSourceForm, EmissionSourceQuery, EmissionSourceVO } from '@/api/enterprise/emissionSource/types';

export interface EmissionSourcePageResponse {
  rows?: EmissionSourceVO[];
  data?: EmissionSourceVO[];
  total?: number | string;
}

export const listEmissionSource = (query?: EmissionSourceQuery): Promise<EmissionSourcePageResponse> => {
  return request({
    url: '/enterprise/emission-source/list',
    method: 'get',
    params: query
  }) as unknown as Promise<EmissionSourcePageResponse>;
};

export const getEmissionSource = (id: string | number): AxiosPromise<EmissionSourceVO> => {
  return request({
    url: '/enterprise/emission-source/' + id,
    method: 'get'
  });
};

export const addEmissionSource = (data: EmissionSourceForm) => {
  return request({
    url: '/enterprise/emission-source',
    method: 'post',
    data
  });
};

export const updateEmissionSource = (data: EmissionSourceForm) => {
  return request({
    url: '/enterprise/emission-source',
    method: 'put',
    data
  });
};

export const delEmissionSource = (id: string | number | Array<string | number>) => {
  return request({
    url: '/enterprise/emission-source/' + id,
    method: 'delete'
  });
};
