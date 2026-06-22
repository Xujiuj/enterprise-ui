import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { DimensionRecordForm, DimensionRecordQuery, DimensionRecordVO } from '@/api/enterprise/dimensionRecord/types';

export const listDimensionRecord = (query?: DimensionRecordQuery): AxiosPromise<DimensionRecordVO[]> => {
  return request({
    url: '/enterprise/dimension-record/list',
    method: 'get',
    params: query
  });
};

export const getDimensionRecord = (id: string | number, dimensionCode: string): AxiosPromise<DimensionRecordVO> => {
  return request({
    url: `/enterprise/dimension-record/${id}`,
    method: 'get',
    params: { dimensionCode }
  });
};

export const addDimensionRecord = (data: DimensionRecordForm) => {
  return request({
    url: '/enterprise/dimension-record',
    method: 'post',
    data
  });
};

export const updateDimensionRecord = (data: DimensionRecordForm) => {
  return request({
    url: '/enterprise/dimension-record',
    method: 'put',
    data
  });
};

export const delDimensionRecord = (id: string | number | Array<string | number>, dimensionCode: string) => {
  return request({
    url: `/enterprise/dimension-record/${id}`,
    method: 'delete',
    params: { dimensionCode }
  });
};
