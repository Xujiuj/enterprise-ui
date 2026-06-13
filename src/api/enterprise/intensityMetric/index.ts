import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { IntensityMetricForm, IntensityMetricQuery, IntensityMetricVO } from '@/api/enterprise/intensityMetric/types';

export interface IntensityMetricPageResponse {
  rows?: IntensityMetricVO[];
  data?: IntensityMetricVO[];
  total?: number | string;
}

export const listIntensityMetric = (query?: IntensityMetricQuery): Promise<IntensityMetricPageResponse> => {
  return request({
    url: '/enterprise/intensity-metric/list',
    method: 'get',
    params: query
  }) as unknown as Promise<IntensityMetricPageResponse>;
};

export const getIntensityMetric = (id: string | number): AxiosPromise<IntensityMetricVO> => {
  return request({
    url: '/enterprise/intensity-metric/' + id,
    method: 'get'
  });
};

export const addIntensityMetric = (data: IntensityMetricForm) => {
  return request({
    url: '/enterprise/intensity-metric',
    method: 'post',
    data
  });
};

export const updateIntensityMetric = (data: IntensityMetricForm) => {
  return request({
    url: '/enterprise/intensity-metric',
    method: 'put',
    data
  });
};

export const delIntensityMetric = (id: string | number | Array<string | number>) => {
  return request({
    url: '/enterprise/intensity-metric/' + id,
    method: 'delete'
  });
};
