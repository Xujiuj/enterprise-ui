import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { GreenPowerCertificateForm, GreenPowerCertificateQuery, GreenPowerCertificateVO } from '@/api/enterprise/greenPowerCertificate/types';

export interface GreenPowerCertificatePageResponse {
  rows?: GreenPowerCertificateVO[];
  data?: GreenPowerCertificateVO[];
  total?: number | string;
}

export const listGreenPowerCertificate = (query?: GreenPowerCertificateQuery): Promise<GreenPowerCertificatePageResponse> => {
  return request({
    url: '/enterprise/green-power-certificate/list',
    method: 'get',
    params: query
  }) as unknown as Promise<GreenPowerCertificatePageResponse>;
};

export const getGreenPowerCertificate = (id: string | number): AxiosPromise<GreenPowerCertificateVO> => {
  return request({
    url: '/enterprise/green-power-certificate/' + id,
    method: 'get'
  });
};

export const addGreenPowerCertificate = (data: GreenPowerCertificateForm) => {
  return request({
    url: '/enterprise/green-power-certificate',
    method: 'post',
    data
  });
};

export const updateGreenPowerCertificate = (data: GreenPowerCertificateForm) => {
  return request({
    url: '/enterprise/green-power-certificate',
    method: 'put',
    data
  });
};

export const delGreenPowerCertificate = (id: string | number | Array<string | number>) => {
  return request({
    url: '/enterprise/green-power-certificate/' + id,
    method: 'delete'
  });
};
