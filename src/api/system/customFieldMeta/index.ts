import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { CustomFieldMetaVO, CustomFieldMetaForm, CustomFieldMetaQuery } from '@/api/system/customFieldMeta/types';

/**
 * 查询鑷?畾涔夊瓧娈靛厓鏁版嵁琛列表
 * @param query
 * @returns {*}
 */

export const listCustomFieldMeta = (query?: CustomFieldMetaQuery): AxiosPromise<CustomFieldMetaVO[]> => {
  return request({
    url: '/system/customFieldMeta/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询鑷?畾涔夊瓧娈靛厓鏁版嵁琛详细
 * @param id
 */
export const getCustomFieldMeta = (id: string | number): AxiosPromise<CustomFieldMetaVO> => {
  return request({
    url: '/system/customFieldMeta/' + id,
    method: 'get'
  });
};

/**
 * 新增鑷?畾涔夊瓧娈靛厓鏁版嵁琛
 * @param data
 */
export const addCustomFieldMeta = (data: CustomFieldMetaForm) => {
  return request({
    url: '/system/customFieldMeta',
    method: 'post',
    data: data
  });
};

/**
 * 修改鑷?畾涔夊瓧娈靛厓鏁版嵁琛
 * @param data
 */
export const updateCustomFieldMeta = (data: CustomFieldMetaForm) => {
  return request({
    url: '/system/customFieldMeta',
    method: 'put',
    data: data
  });
};

/**
 * 删除鑷?畾涔夊瓧娈靛厓鏁版嵁琛
 * @param id
 */
export const delCustomFieldMeta = (id: string | number | Array<string | number>) => {
  return request({
    url: '/system/customFieldMeta/' + id,
    method: 'delete'
  });
};
