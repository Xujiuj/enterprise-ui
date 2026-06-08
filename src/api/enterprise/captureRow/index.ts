import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { CaptureRowQuery, CaptureRowVO } from '@/api/enterprise/captureRow/types';

export interface CaptureRowPageResponse {
  rows?: CaptureRowVO[];
  data?: CaptureRowVO[];
  total?: number | string;
}

export const listCaptureRow = (query?: CaptureRowQuery): Promise<CaptureRowPageResponse> => {
  return request({
    url: '/enterprise/capture-row/list',
    method: 'get',
    params: query
  }) as unknown as Promise<CaptureRowPageResponse>;
};

export const getCaptureRow = (id: string | number): AxiosPromise<CaptureRowVO> => {
  return request({
    url: '/enterprise/capture-row/' + id,
    method: 'get'
  });
};
