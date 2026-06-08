import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { CaptureBatchQuery, CaptureBatchVO } from '@/api/enterprise/captureBatch/types';

export interface CaptureBatchPageResponse {
  rows?: CaptureBatchVO[];
  data?: CaptureBatchVO[];
  total?: number | string;
}

export const listCaptureBatch = (query?: CaptureBatchQuery): Promise<CaptureBatchPageResponse> => {
  return request({
    url: '/enterprise/capture-batch/list',
    method: 'get',
    params: query
  }) as unknown as Promise<CaptureBatchPageResponse>;
};

export const getCaptureBatch = (id: string | number): AxiosPromise<CaptureBatchVO> => {
  return request({
    url: '/enterprise/capture-batch/' + id,
    method: 'get'
  });
};
