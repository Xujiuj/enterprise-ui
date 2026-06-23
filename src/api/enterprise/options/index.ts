import request from '@/utils/request';
import type { EnterpriseOptionQuery, EnterpriseOptionVO } from './types';

export const listEnterpriseOptions = (optionCode: string, params?: EnterpriseOptionQuery): Promise<{ data: EnterpriseOptionVO[] }> => {
  return request({
    url: `/enterprise/options/${optionCode}`,
    method: 'get',
    params
  });
};
