import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { CaptureCellQuery, CaptureCellVO } from '@/api/enterprise/captureCell/types';

export const listCaptureCell = (query?: CaptureCellQuery): AxiosPromise<CaptureCellVO[]> => {
  return request({
    url: '/enterprise/capture-cell/list',
    method: 'get',
    params: query
  });
};

export const getCaptureCell = (id: string | number): AxiosPromise<CaptureCellVO> => {
  return request({
    url: '/enterprise/capture-cell/' + id,
    method: 'get'
  });
};
