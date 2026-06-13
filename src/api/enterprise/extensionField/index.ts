import request from '@/utils/request';
import {
  ExtensionFieldQuery,
  ExtensionFieldVO,
  ExtensionFieldValueForm,
  ExtensionFieldValueQuery,
  ExtensionFieldValueVO
} from '@/api/enterprise/extensionField/types';

export interface ExtensionFieldPageResponse {
  rows?: ExtensionFieldVO[];
  data?: ExtensionFieldVO[];
  total?: number | string;
}

export interface ExtensionFieldValuePageResponse {
  rows?: ExtensionFieldValueVO[];
  data?: ExtensionFieldValueVO[];
  total?: number | string;
}

export const listExtensionFields = (query?: ExtensionFieldQuery): Promise<ExtensionFieldPageResponse> => {
  return request({
    url: '/enterprise/extension-field/list',
    method: 'get',
    params: query
  }) as unknown as Promise<ExtensionFieldPageResponse>;
};

export const listExtensionFieldValues = (query?: ExtensionFieldValueQuery): Promise<ExtensionFieldValuePageResponse> => {
  return request({
    url: '/enterprise/extension-field-value/list',
    method: 'get',
    params: query
  }) as unknown as Promise<ExtensionFieldValuePageResponse>;
};

export const addExtensionFieldValue = (data: ExtensionFieldValueForm) => {
  return request({
    url: '/enterprise/extension-field-value',
    method: 'post',
    data
  });
};

export const updateExtensionFieldValue = (data: ExtensionFieldValueForm) => {
  return request({
    url: '/enterprise/extension-field-value',
    method: 'put',
    data
  });
};

export const saveExtensionFieldValuesBatch = (data: ExtensionFieldValueForm[]) => {
  return request({
    url: '/enterprise/extension-field-value/batch',
    method: 'put',
    data
  });
};
