import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import {
  EnterpriseLicenseCurrentState,
  EnterpriseLicenseGateStatus,
  EnterpriseLicenseImportRequest,
  EnterpriseLicenseImportResult
} from '@/api/enterprise/licenseImport/types';

export const ENTERPRISE_LICENSE_IMPORT_ENDPOINTS = {
  import: '/enterprise/license-import/import',
  currentState: '/enterprise/license-import/current',
  gateStatus: '/enterprise/license-import/gate-status'
} as const;

export const importEnterpriseLicense = (data: EnterpriseLicenseImportRequest): AxiosPromise<EnterpriseLicenseImportResult> => {
  return request({
    url: ENTERPRISE_LICENSE_IMPORT_ENDPOINTS.import,
    method: 'post',
    data
  });
};

export const getCurrentLicenseState = (): AxiosPromise<EnterpriseLicenseCurrentState> => {
  return request({
    url: ENTERPRISE_LICENSE_IMPORT_ENDPOINTS.currentState,
    method: 'get'
  });
};

export const getLicenseGateStatus = (): AxiosPromise<EnterpriseLicenseGateStatus> => {
  return request({
    url: ENTERPRISE_LICENSE_IMPORT_ENDPOINTS.gateStatus,
    method: 'get'
  });
};
