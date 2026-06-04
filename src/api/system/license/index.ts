import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { LicenseVO, LicenseForm, LicenseQuery } from '@/api/system/license/types';

/**
 * 查询License淇℃伅琛列表
 * @param query
 * @returns {*}
 */

export const listLicense = (query?: LicenseQuery): AxiosPromise<LicenseVO[]> => {
  return request({
    url: '/system/license/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询License淇℃伅琛详细
 * @param id
 */
export const getLicense = (id: string | number): AxiosPromise<LicenseVO> => {
  return request({
    url: '/system/license/' + id,
    method: 'get'
  });
};

/**
 * 新增License淇℃伅琛
 * @param data
 */
export const addLicense = (data: LicenseForm) => {
  return request({
    url: '/system/license',
    method: 'post',
    data: data
  });
};

/**
 * 修改License淇℃伅琛
 * @param data
 */
export const updateLicense = (data: LicenseForm) => {
  return request({
    url: '/system/license',
    method: 'put',
    data: data
  });
};

/**
 * 删除License淇℃伅琛
 * @param id
 */
export const delLicense = (id: string | number | Array<string | number>) => {
  return request({
    url: '/system/license/' + id,
    method: 'delete'
  });
};
