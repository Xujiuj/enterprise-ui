import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import {
  FactorConfirmationForm,
  FactorConfirmationQuery,
  FactorConfirmationVO,
  FactorSyncResponse
} from '@/api/enterprise/factorConfirmation/types';

export interface FactorConfirmationPageResponse {
  rows?: FactorConfirmationVO[];
  data?: FactorConfirmationVO[];
  total?: number | string;
}

export const listFactorConfirmation = (query?: FactorConfirmationQuery): Promise<FactorConfirmationPageResponse> => {
  return request({
    url: '/enterprise/factor-confirmation/list',
    method: 'get',
    params: query
  }) as unknown as Promise<FactorConfirmationPageResponse>;
};

export const getFactorConfirmation = (id: string | number): AxiosPromise<FactorConfirmationVO> => {
  return request({
    url: '/enterprise/factor-confirmation/' + id,
    method: 'get'
  });
};

export const syncFactors = (): Promise<FactorSyncResponse> => {
  return request({
    url: '/enterprise/factor-sync/run',
    method: 'post'
  }) as unknown as Promise<FactorSyncResponse>;
};

export const addFactorConfirmation = (data: FactorConfirmationForm) => {
  return request({
    url: '/enterprise/factor-confirmation',
    method: 'post',
    data
  });
};

export const updateFactorConfirmation = (data: FactorConfirmationForm) => {
  return request({
    url: '/enterprise/factor-confirmation',
    method: 'put',
    data
  });
};

export const delFactorConfirmation = (id: string | number | Array<string | number>) => {
  return request({
    url: '/enterprise/factor-confirmation/' + id,
    method: 'delete'
  });
};
