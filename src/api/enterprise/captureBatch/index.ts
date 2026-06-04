import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { CaptureBatchQuery, CaptureBatchVO } from '@/api/enterprise/captureBatch/types';

export const listCaptureBatch = (query?: CaptureBatchQuery): AxiosPromise<CaptureBatchVO[]> => {
  return request({
    url: '/enterprise/capture-batch/list',
    method: 'get',
    params: query
  });
};

export const getCaptureBatch = (id: string | number): AxiosPromise<CaptureBatchVO> => {
  return request({
    url: '/enterprise/capture-batch/' + id,
    method: 'get'
  });
};
