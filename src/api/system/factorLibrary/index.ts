import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { FactorLibraryVO, FactorLibraryForm, FactorLibraryQuery } from '@/api/system/factorLibrary/types';

/**
 * 查询鍥犲瓙搴撹〃列表
 * @param query
 * @returns {*}
 */

export const listFactorLibrary = (query?: FactorLibraryQuery): AxiosPromise<FactorLibraryVO[]> => {
  return request({
    url: '/system/factorLibrary/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询鍥犲瓙搴撹〃详细
 * @param id
 */
export const getFactorLibrary = (id: string | number): AxiosPromise<FactorLibraryVO> => {
  return request({
    url: '/system/factorLibrary/' + id,
    method: 'get'
  });
};

/**
 * 新增鍥犲瓙搴撹〃
 * @param data
 */
export const addFactorLibrary = (data: FactorLibraryForm) => {
  return request({
    url: '/system/factorLibrary',
    method: 'post',
    data: data
  });
};

/**
 * 修改鍥犲瓙搴撹〃
 * @param data
 */
export const updateFactorLibrary = (data: FactorLibraryForm) => {
  return request({
    url: '/system/factorLibrary',
    method: 'put',
    data: data
  });
};

/**
 * 删除鍥犲瓙搴撹〃
 * @param id
 */
export const delFactorLibrary = (id: string | number | Array<string | number>) => {
  return request({
    url: '/system/factorLibrary/' + id,
    method: 'delete'
  });
};
