import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type { FlowTaskVO, TaskOperationBo } from './types';

export const getTask = (taskId?: string | number): AxiosPromise<FlowTaskVO> => {
  return request({
    url: `/workflow/task/${taskId}`,
    method: 'get'
  });
};

export const completeTask = (data: Record<string, any>) => {
  return request({
    url: '/workflow/task/completeTask',
    method: 'post',
    data
  });
};

export const taskOperation = (data: TaskOperationBo, path: string) => {
  return request({
    url: `/workflow/task/${path}`,
    method: 'post',
    data
  });
};

export const terminationTask = (data: Record<string, any>) => {
  return request({
    url: '/workflow/task/terminationTask',
    method: 'post',
    data
  });
};

export const currentTaskAllUser = (taskId?: string | number): AxiosPromise<Record<string, any>[]> => {
  return request({
    url: `/workflow/task/currentTaskAllUser/${taskId}`,
    method: 'get'
  });
};

export const backProcess = (data: Record<string, any>) => {
  return request({
    url: '/workflow/task/backProcess',
    method: 'post',
    data
  });
};

export const getBackTaskNode = (taskId?: string | number, nodeCode?: string): AxiosPromise<Record<string, any>[]> => {
  return request({
    url: '/workflow/task/getBackTaskNode',
    method: 'get',
    params: { taskId, nodeCode }
  });
};

export const getNextNodeList = (data: Record<string, any>): AxiosPromise<Record<string, any>[]> => {
  return request({
    url: '/workflow/task/getNextNodeList',
    method: 'post',
    data
  });
};
