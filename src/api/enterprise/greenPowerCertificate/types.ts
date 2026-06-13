export interface GreenPowerCertificateVO {
  id: string | number;
  certificateCode?: string;
  certificateType?: string;
  energyPeriod?: string;
  energyAmount?: number;
  energyUnit?: string;
  issuingOrg?: string;
  purchaseDate?: string;
  expiryDate?: string;
  offsetSourceCode?: string;
  proofStatus?: string;
  createTime?: string;
  updateTime?: string;
  remark?: string;
}

export interface GreenPowerCertificateForm extends BaseEntity {
  id?: string | number;
  certificateCode?: string;
  certificateType?: string;
  energyPeriod?: string;
  energyAmount?: number;
  energyUnit?: string;
  issuingOrg?: string;
  purchaseDate?: string;
  expiryDate?: string;
  offsetSourceCode?: string;
  proofStatus?: string;
  remark?: string;
}

export interface GreenPowerCertificateQuery extends PageQuery {
  certificateCode?: string;
  certificateType?: string;
  energyPeriod?: string;
  issuingOrg?: string;
  offsetSourceCode?: string;
  proofStatus?: string;
  params?: any;
}
