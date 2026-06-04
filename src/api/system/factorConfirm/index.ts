import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { FactorConfirmVO, FactorConfirmForm, FactorConfirmQuery } from '@/api/system/factorConfirm/types';

/**
 * 查询鎺掓斁鍥犲瓙纭??琛列表
 * @param query
 * @returns {*}
 */

export const listFactorConfirm = (query?: FactorConfirmQuery): AxiosPromise<FactorConfirmVO[]> => {
  return request({
    url: '/system/factorConfirm/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询鎺掓斁鍥犲瓙纭??琛详细
 * @param id
 */
export const getFactorConfirm = (id: string | number): AxiosPromise<FactorConfirmVO> => {
  return request({
    url: '/system/factorConfirm/' + id,
    method: 'get'
  });
};

/**
 * 新增鎺掓斁鍥犲瓙纭??琛
 * @param data
 */
export const addFactorConfirm = (data: FactorConfirmForm) => {
  return request({
    url: '/system/factorConfirm',
    method: 'post',
    data: data
  });
};

/**
 * 修改鎺掓斁鍥犲瓙纭??琛
 * @param data
 */
export const updateFactorConfirm = (data: FactorConfirmForm) => {
  return request({
    url: '/system/factorConfirm',
    method: 'put',
    data: data
  });
};

/**
 * 删除鎺掓斁鍥犲瓙纭??琛
 * @param id
 */
export const delFactorConfirm = (id: string | number | Array<string | number>) => {
  return request({
    url: '/system/factorConfirm/' + id,
    method: 'delete'
  });
};
