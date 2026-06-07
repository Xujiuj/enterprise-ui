import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { Sheet656ImportValidationRequest, Sheet656ImportValidationResult } from './types';

export const validateSheet656Activity = (data: Sheet656ImportValidationRequest): AxiosPromise<Sheet656ImportValidationResult> => {
  return request({
    url: '/enterprise/activity-import/sheet-656/validate',
    method: 'post',
    data
  });
};
