import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { IntensityVO, IntensityForm, IntensityQuery } from '@/api/system/intensity/types';

/**
 * 查询寮哄害绠＄悊琛列表
 * @param query
 * @returns {*}
 */

export const listIntensity = (query?: IntensityQuery): AxiosPromise<IntensityVO[]> => {
  return request({
    url: '/system/intensity/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询寮哄害绠＄悊琛详细
 * @param id
 */
export const getIntensity = (id: string | number): AxiosPromise<IntensityVO> => {
  return request({
    url: '/system/intensity/' + id,
    method: 'get'
  });
};

/**
 * 新增寮哄害绠＄悊琛
 * @param data
 */
export const addIntensity = (data: IntensityForm) => {
  return request({
    url: '/system/intensity',
    method: 'post',
    data: data
  });
};

/**
 * 修改寮哄害绠＄悊琛
 * @param data
 */
export const updateIntensity = (data: IntensityForm) => {
  return request({
    url: '/system/intensity',
    method: 'put',
    data: data
  });
};

/**
 * 删除寮哄害绠＄悊琛
 * @param id
 */
export const delIntensity = (id: string | number | Array<string | number>) => {
  return request({
    url: '/system/intensity/' + id,
    method: 'delete'
  });
};
