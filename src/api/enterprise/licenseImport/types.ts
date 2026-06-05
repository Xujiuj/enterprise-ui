export type LicenseGateDenialReason = 'NO_VALID_LICENSE' | 'CLOCK_ROLLBACK' | 'EXPIRED' | 'INSTALL_ID_MISMATCH' | string;

export interface EnterpriseLicenseImportRequest {
  licenseContent: string;
}

export interface EnterpriseLicenseImportResult {
  licenseId?: string | number;
  status?: string;
  validFrom?: string;
  validTo?: string;
  edition?: string;
  features?: string[] | Record<string, unknown>;
  importTime?: string;
  message?: string;
}

export interface EnterpriseLicenseCurrentState {
  licenseId?: string | number;
  companyName?: string;
  edition?: string;
  status?: string;
  validFrom?: string;
  validTo?: string;
  maxUsers?: number;
  installId?: string | number;
  lastCheckTime?: string;
  features?: string[] | Record<string, unknown>;
}

export interface EnterpriseLicenseGateStatus {
  allowed: boolean;
  reason?: LicenseGateDenialReason;
  message?: string;
  checkedAt?: string;
  license?: EnterpriseLicenseCurrentState;
}
