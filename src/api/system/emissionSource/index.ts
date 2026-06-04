import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { EmissionSourceVO, EmissionSourceForm, EmissionSourceQuery } from '@/api/system/emissionSource/types';

/**
 * 查询鎺掓斁婧愰厤缃?〃列表
 * @param query
 * @returns {*}
 */

export const listEmissionSource = (query?: EmissionSourceQuery): AxiosPromise<EmissionSourceVO[]> => {
  return request({
    url: '/system/emissionSource/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询鎺掓斁婧愰厤缃?〃详细
 * @param id
 */
export const getEmissionSource = (id: string | number): AxiosPromise<EmissionSourceVO> => {
  return request({
    url: '/system/emissionSource/' + id,
    method: 'get'
  });
};

/**
 * 新增鎺掓斁婧愰厤缃?〃
 * @param data
 */
export const addEmissionSource = (data: EmissionSourceForm) => {
  return request({
    url: '/system/emissionSource',
    method: 'post',
    data: data
  });
};

/**
 * 修改鎺掓斁婧愰厤缃?〃
 * @param data
 */
export const updateEmissionSource = (data: EmissionSourceForm) => {
  return request({
    url: '/system/emissionSource',
    method: 'put',
    data: data
  });
};

/**
 * 删除鎺掓斁婧愰厤缃?〃
 * @param id
 */
export const delEmissionSource = (id: string | number | Array<string | number>) => {
  return request({
    url: '/system/emissionSource/' + id,
    method: 'delete'
  });
};
