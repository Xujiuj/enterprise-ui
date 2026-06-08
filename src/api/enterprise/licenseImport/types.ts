export type LicenseGateDenialReason = 'NO_VALID_LICENSE' | 'CLOCK_ROLLBACK' | 'EXPIRED' | 'INSTALL_ID_MISMATCH' | string;

export interface EnterpriseLicenseImportRequest {
  licenseContent: string;
  expectedInstallId: string;
}

export interface EnterpriseLicenseState {
  id?: string | number;
  licenseId?: string | number;
  customerId?: string | number;
  installId?: string | number;
  keyId?: string;
  algorithm?: string;
  schemaVersion?: string;
  validFrom?: string;
  validTo?: string;
  lastVerifiedTime?: string;
  maxObservedTime?: string;
  licenseStatus?: string;
}

export interface EnterpriseLicenseImportResult {
  valid: boolean;
  status?: string;
  message?: string;
  licenseState?: EnterpriseLicenseState;
}

export type EnterpriseLicenseCurrentState = EnterpriseLicenseState;

export interface EnterpriseLicenseGateStatus {
  decision: 'ALLOW' | 'DENY' | string;
  reason?: LicenseGateDenialReason;
  message?: string;
  licenseState?: EnterpriseLicenseState;
}
