import request from '@/utils/request';
import type { AxiosPromise } from 'axios';

export interface FlowHistoryTaskResponse {
  instanceId?: string | number;
  list?: Record<string, any>[];
}

export const flowHisTaskList = (businessId: string | number): AxiosPromise<FlowHistoryTaskResponse> => {
  return request({
    url: `/workflow/instance/flowHisTaskList/${businessId}`,
    method: 'get'
  });
};
