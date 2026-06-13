import request from '@/utils/request';
import type { WorkbenchOverview } from './types';

export const getWorkbenchOverview = (): Promise<{ data: WorkbenchOverview }> => {
  return request({
    url: '/enterprise/workbench/overview',
    method: 'get'
  });
};
