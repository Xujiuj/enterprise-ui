export interface FactorConfirmationVO {
  id: string | number;
  factorCode?: string;
  factorName?: string;
  factorVersionCode?: string;
  factorUnit?: string;
  factorValue?: number;
  confirmationStatus?: string;
  confirmedBy?: string;
  confirmedTime?: string;
  licenseId?: string;
  createTime?: string;
  updateTime?: string;
  remark?: string;
}

export interface FactorConfirmationForm extends BaseEntity {
  id?: string | number;
  factorCode?: string;
  factorName?: string;
  factorVersionCode?: string;
  factorUnit?: string;
  factorValue?: number;
  confirmationStatus?: string;
  confirmedBy?: string;
  confirmedTime?: string;
  licenseId?: string;
  remark?: string;
}

export interface FactorConfirmationQuery extends PageQuery {
  factorCode?: string;
  factorName?: string;
  factorVersionCode?: string;
  confirmationStatus?: string;
  licenseId?: string;
  params?: any;
}

export interface FactorSyncResult {
  licenseId?: string;
  vendorVersionId?: string;
  versionCode?: string;
  frozenFlag?: boolean;
  changed: boolean;
  recordCount: number;
  syncedTime?: string;
}

export interface FactorSyncResponse {
  code?: number;
  msg?: string;
  data?: FactorSyncResult;
}
