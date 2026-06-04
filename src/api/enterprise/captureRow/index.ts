import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { CaptureRowQuery, CaptureRowVO } from '@/api/enterprise/captureRow/types';

export const listCaptureRow = (query?: CaptureRowQuery): AxiosPromise<CaptureRowVO[]> => {
  return request({
    url: '/enterprise/capture-row/list',
    method: 'get',
    params: query
  });
};

export const getCaptureRow = (id: string | number): AxiosPromise<CaptureRowVO> => {
  return request({
    url: '/enterprise/capture-row/' + id,
    method: 'get'
  });
};
