export type OnlinePurchasePayChannel = 'WECHAT' | 'ALIPAY';

export interface OnlinePurchaseCreateRequest {
  packageId: string | number;
  payChannel: OnlinePurchasePayChannel;
  customerName: string;
  customerCode?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  licenseId?: string | number;
  installId?: string | number;
  idempotencyKey?: string;
  returnUrl?: string;
}

export interface OnlinePurchaseOrder {
  orderNo: string;
  packageId: string | number;
  packageName: string;
  payChannel: OnlinePurchasePayChannel;
  amount: number;
  currency: string;
  orderStatus: string;
  issueStatus: string;
  payUrl?: string;
  payForm?: string;
  issuedLicenseId?: string;
}
