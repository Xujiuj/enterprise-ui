import request from '@/utils/request';
import {
  ExtensionFieldForm,
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

export const getExtensionField = (id: string | number) => {
  return request({
    url: '/enterprise/extension-field/' + id,
    method: 'get'
  });
};

export const addExtensionField = (data: ExtensionFieldForm) => {
  return request({
    url: '/enterprise/extension-field',
    method: 'post',
    data
  });
};

export const updateExtensionField = (data: ExtensionFieldForm) => {
  return request({
    url: '/enterprise/extension-field',
    method: 'put',
    data
  });
};

export const delExtensionField = (id: string | number | Array<string | number>) => {
  return request({
    url: '/enterprise/extension-field/' + id,
    method: 'delete'
  });
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
