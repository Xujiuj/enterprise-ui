import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { LicenseStateVO, LicenseStateForm, LicenseStateQuery } from '@/api/system/licenseState/types';

/**
 * 查询License杩愯?鐘舵?琛列表
 * @param query
 * @returns {*}
 */

export const listLicenseState = (query?: LicenseStateQuery): AxiosPromise<LicenseStateVO[]> => {
  return request({
    url: '/system/licenseState/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询License杩愯?鐘舵?琛详细
 * @param id
 */
export const getLicenseState = (id: string | number): AxiosPromise<LicenseStateVO> => {
  return request({
    url: '/system/licenseState/' + id,
    method: 'get'
  });
};

/**
 * 新增License杩愯?鐘舵?琛
 * @param data
 */
export const addLicenseState = (data: LicenseStateForm) => {
  return request({
    url: '/system/licenseState',
    method: 'post',
    data: data
  });
};

/**
 * 修改License杩愯?鐘舵?琛
 * @param data
 */
export const updateLicenseState = (data: LicenseStateForm) => {
  return request({
    url: '/system/licenseState',
    method: 'put',
    data: data
  });
};

/**
 * 删除License杩愯?鐘舵?琛
 * @param id
 */
export const delLicenseState = (id: string | number | Array<string | number>) => {
  return request({
    url: '/system/licenseState/' + id,
    method: 'delete'
  });
};
