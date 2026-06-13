import request from '@/utils/request';
import { listActivityData } from '@/api/enterprise/activityData';
import { ActivityDataQuery, ActivityDataVO } from '@/api/enterprise/activityData/types';
import { listEmissionSource } from '@/api/enterprise/emissionSource';
import { EmissionSourceQuery, EmissionSourceVO } from '@/api/enterprise/emissionSource/types';
import {
  Sheet656ImportValidationRequest,
  Sheet656ImportValidationResult,
  Sheet656ValidationRequest
} from '@/api/enterprise/sheet656ActivityValidation/types';

export interface LocalListResponse<T> {
  rows?: T[];
  total?: number;
  data?: T[];
}

export const listLocalActivityData = (query?: ActivityDataQuery): Promise<LocalListResponse<ActivityDataVO>> => {
  return listActivityData(query);
};

export const listLocalEmissionSource = (query?: EmissionSourceQuery): Promise<LocalListResponse<EmissionSourceVO>> => {
  return listEmissionSource(query);
};

export const validateLocalSheet656Activity = (data: Sheet656ImportValidationRequest): Promise<{ data: Sheet656ImportValidationResult }> => {
  return request({
    url: '/enterprise/activity-import/sheet-656/validate',
    method: 'post',
    data
  });
};

export const parseLocalSheet656ActivityFile = (file: File): Promise<{ data: Sheet656ImportValidationRequest }> => {
  const formData = new FormData();
  formData.append('file', file);
  return request({
    url: '/enterprise/activity-import/sheet-656/parse-file',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
      repeatSubmit: false
    }
  });
};

export interface Sheet656ActivityImportResult {
  persisted?: boolean;
  batchId?: number;
  persistedRowCount?: number;
  validationResult?: Sheet656ImportValidationResult;
}

export const saveLocalSheet656Activity = (data: Sheet656ValidationRequest): Promise<{ data: Sheet656ActivityImportResult }> => {
  return request({
    url: '/enterprise/activity-import/sheet-656/save',
    method: 'post',
    data
  });
};

export const importLocalSheet656Activity = (data: Sheet656ImportValidationRequest): Promise<{ data: Sheet656ActivityImportResult }> => {
  return request({
    url: '/enterprise/activity-import/sheet-656/import',
    method: 'post',
    data
  });
};
