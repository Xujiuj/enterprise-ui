import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { EnterpriseLicenseGateStatus } from '@/api/enterprise/licenseImport/types';

type EnterpriseReportLicenseState = NonNullable<EnterpriseLicenseGateStatus['licenseState']> & {
  expiresAt?: string;
  validTo?: string;
};

export type EnterpriseReportGateStatus = Omit<EnterpriseLicenseGateStatus, 'licenseState'> & {
  featureCode?: string;
  licenseState?: EnterpriseReportLicenseState;
};

export const getEnterpriseReportGate = (expectedInstallId: string): AxiosPromise<EnterpriseReportGateStatus> => {
  return request({
    url: '/enterprise/license-gate/current',
    method: 'get',
    params: {
      expectedInstallId,
      featureCode: 'report-gate'
    }
  });
};
