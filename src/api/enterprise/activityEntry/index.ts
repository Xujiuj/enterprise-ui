import request from '@/utils/request';
import { listActivityData } from '@/api/enterprise/activityData';
import { ActivityDataQuery, ActivityDataVO } from '@/api/enterprise/activityData/types';
import { listEmissionSource } from '@/api/enterprise/emissionSource';
import { EmissionSourceQuery, EmissionSourceVO } from '@/api/enterprise/emissionSource/types';
import { EmissionActivityImportValidationRequest, EmissionActivityImportValidationResult, EmissionActivityValidationRequest } from '@/api/enterprise/emissionActivityValidation/types';

export interface LocalListResponse<T> {
  rows?: T[];
  total?: number | string;
  data?: T[];
}

export const listLocalActivityData = (query?: ActivityDataQuery): Promise<LocalListResponse<ActivityDataVO>> => {
  return listActivityData(query);
};

export const listLocalEmissionSource = (query?: EmissionSourceQuery): Promise<LocalListResponse<EmissionSourceVO>> => {
  return listEmissionSource(query);
};

export const validateLocalEmissionActivity = (data: EmissionActivityImportValidationRequest): Promise<{ data: EmissionActivityImportValidationResult }> => {
  return request({
    url: '/enterprise/activity-import/emission-activity/validate',
    method: 'post',
    data
  });
};

export const parseLocalEmissionActivityFile = (file: File): Promise<{ data: EmissionActivityImportValidationRequest }> => {
  const formData = new FormData();
  formData.append('file', file);
  return request({
    url: '/enterprise/activity-import/emission-activity/parse-file',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
      repeatSubmit: false
    }
  });
};

export interface EmissionActivityImportResult {
  persisted?: boolean;
  batchId?: number;
  persistedRowCount?: number;
  validationResult?: EmissionActivityImportValidationResult;
}

export const saveLocalEmissionActivity = (data: EmissionActivityValidationRequest): Promise<{ data: EmissionActivityImportResult }> => {
  return request({
    url: '/enterprise/activity-import/emission-activity/save',
    method: 'post',
    data
  });
};

export const importLocalEmissionActivity = (data: EmissionActivityImportValidationRequest): Promise<{ data: EmissionActivityImportResult }> => {
  return request({
    url: '/enterprise/activity-import/emission-activity/import',
    method: 'post',
    data
  });
};
