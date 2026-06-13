import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { FactorCacheRecordForm, FactorCacheRecordQuery, FactorCacheRecordVO } from '@/api/enterprise/factorCacheRecord/types';

export interface FactorCacheRecordPageResponse {
  rows?: FactorCacheRecordVO[];
  data?: FactorCacheRecordVO[];
  total?: number | string;
}

export const listFactorCacheRecord = (query?: FactorCacheRecordQuery): Promise<FactorCacheRecordPageResponse> => {
  return request({
    url: '/enterprise/factor-cache-record/list',
    method: 'get',
    params: query
  }) as unknown as Promise<FactorCacheRecordPageResponse>;
};

export const getFactorCacheRecord = (id: string | number): AxiosPromise<FactorCacheRecordVO> => {
  return request({
    url: '/enterprise/factor-cache-record/' + id,
    method: 'get'
  });
};

export const addFactorCacheRecord = (data: FactorCacheRecordForm) => {
  return request({
    url: '/enterprise/factor-cache-record',
    method: 'post',
    data
  });
};

export const updateFactorCacheRecord = (data: FactorCacheRecordForm) => {
  return request({
    url: '/enterprise/factor-cache-record',
    method: 'put',
    data
  });
};

export const delFactorCacheRecord = (id: string | number | Array<string | number>) => {
  return request({
    url: '/enterprise/factor-cache-record/' + id,
    method: 'delete'
  });
};
