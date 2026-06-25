import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ActivityDataVO, ActivityDataForm, ActivityDataQuery, ActivityDataPageResult } from '@/api/system/activityData/types';

/**
 * 查询娲诲姩鏁版嵁琛列表
 * @param query
 * @returns {*}
 */

export const listActivityData = (query?: ActivityDataQuery): AxiosPromise<ActivityDataPageResult> => {
  return request({
    url: '/system/activityData/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询娲诲姩鏁版嵁琛详细
 * @param id
 */
export const getActivityData = (id: string | number): AxiosPromise<ActivityDataVO> => {
  return request({
    url: '/system/activityData/' + id,
    method: 'get'
  });
};

/**
 * 新增娲诲姩鏁版嵁琛
 * @param data
 */
export const addActivityData = (data: ActivityDataForm) => {
  return request({
    url: '/system/activityData',
    method: 'post',
    data: data
  });
};

/**
 * 修改娲诲姩鏁版嵁琛
 * @param data
 */
export const updateActivityData = (data: ActivityDataForm) => {
  return request({
    url: '/system/activityData',
    method: 'put',
    data: data
  });
};

/**
 * 删除娲诲姩鏁版嵁琛
 * @param id
 */
export const delActivityData = (id: string | number | Array<string | number>) => {
  return request({
    url: '/system/activityData/' + id,
    method: 'delete'
  });
};
