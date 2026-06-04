import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { GreenElectricityVO, GreenElectricityForm, GreenElectricityQuery } from '@/api/system/greenElectricity/types';

/**
 * 查询缁跨數缁胯瘉琛列表
 * @param query
 * @returns {*}
 */

export const listGreenElectricity = (query?: GreenElectricityQuery): AxiosPromise<GreenElectricityVO[]> => {
  return request({
    url: '/system/greenElectricity/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询缁跨數缁胯瘉琛详细
 * @param id
 */
export const getGreenElectricity = (id: string | number): AxiosPromise<GreenElectricityVO> => {
  return request({
    url: '/system/greenElectricity/' + id,
    method: 'get'
  });
};

/**
 * 新增缁跨數缁胯瘉琛
 * @param data
 */
export const addGreenElectricity = (data: GreenElectricityForm) => {
  return request({
    url: '/system/greenElectricity',
    method: 'post',
    data: data
  });
};

/**
 * 修改缁跨數缁胯瘉琛
 * @param data
 */
export const updateGreenElectricity = (data: GreenElectricityForm) => {
  return request({
    url: '/system/greenElectricity',
    method: 'put',
    data: data
  });
};

/**
 * 删除缁跨數缁胯瘉琛
 * @param id
 */
export const delGreenElectricity = (id: string | number | Array<string | number>) => {
  return request({
    url: '/system/greenElectricity/' + id,
    method: 'delete'
  });
};
