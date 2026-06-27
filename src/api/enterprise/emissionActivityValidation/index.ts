import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { EmissionActivityImportValidationRequest, EmissionActivityImportValidationResult } from './types';

export const validateEmissionActivity = (data: EmissionActivityImportValidationRequest): AxiosPromise<EmissionActivityImportValidationResult> => {
  return request({
    url: '/enterprise/activity-import/emission-activity/validate',
    method: 'post',
    data
  });
};
