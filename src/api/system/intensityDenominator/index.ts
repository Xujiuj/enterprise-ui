import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { IntensityDenominatorVO, IntensityDenominatorForm, IntensityDenominatorQuery } from '@/api/system/intensityDenominator/types';

/**
 * 查询寮哄害鍒嗘瘝琛列表
 * @param query
 * @returns {*}
 */

export const listIntensityDenominator = (query?: IntensityDenominatorQuery): AxiosPromise<IntensityDenominatorVO[]> => {
  return request({
    url: '/system/intensityDenominator/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询寮哄害鍒嗘瘝琛详细
 * @param id
 */
export const getIntensityDenominator = (id: string | number): AxiosPromise<IntensityDenominatorVO> => {
  return request({
    url: '/system/intensityDenominator/' + id,
    method: 'get'
  });
};

/**
 * 新增寮哄害鍒嗘瘝琛
 * @param data
 */
export const addIntensityDenominator = (data: IntensityDenominatorForm) => {
  return request({
    url: '/system/intensityDenominator',
    method: 'post',
    data: data
  });
};

/**
 * 修改寮哄害鍒嗘瘝琛
 * @param data
 */
export const updateIntensityDenominator = (data: IntensityDenominatorForm) => {
  return request({
    url: '/system/intensityDenominator',
    method: 'put',
    data: data
  });
};

/**
 * 删除寮哄害鍒嗘瘝琛
 * @param id
 */
export const delIntensityDenominator = (id: string | number | Array<string | number>) => {
  return request({
    url: '/system/intensityDenominator/' + id,
    method: 'delete'
  });
};
