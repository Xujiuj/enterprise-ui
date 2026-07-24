import request from '@/utils/request';

export interface PowerBiConfig {
  embedUrl: string;
  updateBy?: string | number;
  updateTime?: string;
}

export const getPowerBiConfig = () =>
  request<PowerBiConfig>({
    url: '/enterprise/report-config/powerbi',
    method: 'get'
  });

export const updatePowerBiConfig = (data: Pick<PowerBiConfig, 'embedUrl'>) =>
  request<PowerBiConfig>({
    url: '/enterprise/report-config/powerbi',
    method: 'put',
    data
  });
