import request from '@/utils/request';
import type { AxiosPromise } from 'axios';

export interface DimensionSyncResponse {
  dimensionCode: string;
  recordCount: number;
  success: boolean;
  errorMessage?: string;
}

export interface DimensionSyncStatus {
  lastSyncTime: string;
  results: DimensionSyncResponse[];
}

export function refreshDimension(dimensionCode: string): AxiosPromise<DimensionSyncResponse> {
  return request({
    url: '/enterprise/dimension-sync/refresh',
    method: 'post',
    params: { dimensionCode }
  });
}

export function refreshAllDimensions(): AxiosPromise<DimensionSyncStatus> {
  return request({
    url: '/enterprise/dimension-sync/refresh-all',
    method: 'post'
  });
}

export function getSyncStatus(): AxiosPromise<DimensionSyncStatus> {
  return request({
    url: '/enterprise/dimension-sync/status',
    method: 'get'
  });
}
