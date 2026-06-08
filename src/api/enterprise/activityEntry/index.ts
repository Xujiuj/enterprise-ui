import request from '@/utils/request';
import { ActivityDataForm, ActivityDataQuery, ActivityDataVO } from '@/api/system/activityData/types';
import { EmissionSourceQuery, EmissionSourceVO } from '@/api/system/emissionSource/types';
import { Sheet656ImportValidationRequest, Sheet656ImportValidationResult } from '@/api/enterprise/sheet656ActivityValidation/types';

export interface LocalListResponse<T> {
  rows?: T[];
  total?: number;
  data?: T[];
}

export const listLocalActivityData = (query?: ActivityDataQuery): Promise<LocalListResponse<ActivityDataVO>> => {
  return request({
    url: '/system/activityData/list',
    method: 'get',
    params: query
  });
};

export const createLocalActivityData = (data: ActivityDataForm) => {
  return request({
    url: '/system/activityData',
    method: 'post',
    data
  });
};

export const listLocalEmissionSource = (query?: EmissionSourceQuery): Promise<LocalListResponse<EmissionSourceVO>> => {
  return request({
    url: '/system/emissionSource/list',
    method: 'get',
    params: query
  });
};

export const validateLocalSheet656Activity = (data: Sheet656ImportValidationRequest): Promise<{ data: Sheet656ImportValidationResult }> => {
  return request({
    url: '/enterprise/activity-import/sheet-656/validate',
    method: 'post',
    data
  });
};
