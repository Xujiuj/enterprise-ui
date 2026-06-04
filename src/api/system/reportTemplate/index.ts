import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ReportTemplateVO, ReportTemplateForm, ReportTemplateQuery } from '@/api/system/reportTemplate/types';

/**
 * 查询鎶ヨ〃妯℃澘琛列表
 * @param query
 * @returns {*}
 */

export const listReportTemplate = (query?: ReportTemplateQuery): AxiosPromise<ReportTemplateVO[]> => {
  return request({
    url: '/system/reportTemplate/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询鎶ヨ〃妯℃澘琛详细
 * @param id
 */
export const getReportTemplate = (id: string | number): AxiosPromise<ReportTemplateVO> => {
  return request({
    url: '/system/reportTemplate/' + id,
    method: 'get'
  });
};

/**
 * 新增鎶ヨ〃妯℃澘琛
 * @param data
 */
export const addReportTemplate = (data: ReportTemplateForm) => {
  return request({
    url: '/system/reportTemplate',
    method: 'post',
    data: data
  });
};

/**
 * 修改鎶ヨ〃妯℃澘琛
 * @param data
 */
export const updateReportTemplate = (data: ReportTemplateForm) => {
  return request({
    url: '/system/reportTemplate',
    method: 'put',
    data: data
  });
};

/**
 * 删除鎶ヨ〃妯℃澘琛
 * @param id
 */
export const delReportTemplate = (id: string | number | Array<string | number>) => {
  return request({
    url: '/system/reportTemplate/' + id,
    method: 'delete'
  });
};
