import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { SubmissionTrackingVO, SubmissionTrackingForm, SubmissionTrackingQuery } from '@/api/system/submissionTracking/types';

/**
 * 查询鎻愪氦鐘舵?璺熻釜琛列表
 * @param query
 * @returns {*}
 */

export const listSubmissionTracking = (query?: SubmissionTrackingQuery): AxiosPromise<SubmissionTrackingVO[]> => {
  return request({
    url: '/system/submissionTracking/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询鎻愪氦鐘舵?璺熻釜琛详细
 * @param id
 */
export const getSubmissionTracking = (id: string | number): AxiosPromise<SubmissionTrackingVO> => {
  return request({
    url: '/system/submissionTracking/' + id,
    method: 'get'
  });
};

/**
 * 新增鎻愪氦鐘舵?璺熻釜琛
 * @param data
 */
export const addSubmissionTracking = (data: SubmissionTrackingForm) => {
  return request({
    url: '/system/submissionTracking',
    method: 'post',
    data: data
  });
};

/**
 * 修改鎻愪氦鐘舵?璺熻釜琛
 * @param data
 */
export const updateSubmissionTracking = (data: SubmissionTrackingForm) => {
  return request({
    url: '/system/submissionTracking',
    method: 'put',
    data: data
  });
};

/**
 * 删除鎻愪氦鐘舵?璺熻釜琛
 * @param id
 */
export const delSubmissionTracking = (id: string | number | Array<string | number>) => {
  return request({
    url: '/system/submissionTracking/' + id,
    method: 'delete'
  });
};
