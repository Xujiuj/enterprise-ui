import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ActivityDataForm, ActivityDataQuery, ActivityDataValidationDashboard, ActivityDataVO } from '@/api/enterprise/activityData/types';

export interface ActivityDataPageResponse {
  rows?: ActivityDataVO[];
  data?: ActivityDataVO[];
  total?: number | string;
}

export const listActivityData = (query?: ActivityDataQuery): Promise<ActivityDataPageResponse> => {
  return request({
    url: '/enterprise/activity-data/list',
    method: 'get',
    params: query
  }) as unknown as Promise<ActivityDataPageResponse>;
};

export const getActivityDataValidationDashboard = (query?: ActivityDataQuery): Promise<{ data: ActivityDataValidationDashboard }> => {
  return request({
    url: '/enterprise/data-validation/dashboard',
    method: 'get',
    params: query
  });
};

export const getActivityData = (id: string | number): AxiosPromise<ActivityDataVO> => {
  return request({
    url: '/enterprise/activity-data/' + id,
    method: 'get'
  });
};

export const addActivityData = (data: ActivityDataForm) => {
  return request({
    url: '/enterprise/activity-data',
    method: 'post',
    data
  });
};

export const updateActivityData = (data: ActivityDataForm) => {
  return request({
    url: '/enterprise/activity-data',
    method: 'put',
    data
  });
};

export const delActivityData = (id: string | number | Array<string | number>) => {
  return request({
    url: '/enterprise/activity-data/' + id,
    method: 'delete'
  });
};
