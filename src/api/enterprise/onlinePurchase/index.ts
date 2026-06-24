import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { OnlinePurchaseCreateRequest, OnlinePurchaseOrder } from './types';

export const createOnlinePurchaseOrder = (data: OnlinePurchaseCreateRequest): AxiosPromise<OnlinePurchaseOrder> => {
  return request({
    url: '/enterprise/online-purchase',
    method: 'post',
    data
  });
};

export const buildVendorCashierFallbackUrl = (payChannel: string, params: Record<string, string | number | undefined>) => {
  const cashierBaseUrl = import.meta.env.VITE_VENDOR_CASHIER_URL || 'https://www.carbondata.com/pay';
  const searchParams = new URLSearchParams();
  searchParams.set('channel', payChannel);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  });
  return `${cashierBaseUrl}?${searchParams.toString()}`;
};
