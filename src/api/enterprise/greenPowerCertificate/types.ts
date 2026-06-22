export interface GreenPowerCertificateVO {
  id: string | number;
  rowNo?: number;
  factoryCode?: string;
  factoryName?: string;
  activityYear?: number;
  activityMonth?: number;
  sourceCategoryKey?: string;
  scopeName?: string;
  scopeSubcategory?: string;
  electricityType?: string;
  electricityTypeDesc?: string;
  quantityKwh?: number;
  certificateCode?: string;
  issuingOrg?: string;
  purchaseDate?: string;
  expiryDate?: string;
  powerGridRegion?: string;
  offsetPowerSource?: string;
  dataSource?: string;
  sourceRemark?: string;
  emissionSourceName?: string;
  factorKey?: string;
  proofStatus?: string;
  createTime?: string;
  updateTime?: string;
  remark?: string;
}

export interface GreenPowerCertificateForm extends BaseEntity {
  id?: string | number;
  rowNo?: number;
  factoryCode?: string;
  factoryName?: string;
  activityYear?: number;
  activityMonth?: number;
  sourceCategoryKey?: string;
  scopeName?: string;
  scopeSubcategory?: string;
  electricityType?: string;
  electricityTypeDesc?: string;
  quantityKwh?: number;
  certificateCode?: string;
  issuingOrg?: string;
  purchaseDate?: string;
  expiryDate?: string;
  powerGridRegion?: string;
  offsetPowerSource?: string;
  dataSource?: string;
  sourceRemark?: string;
  emissionSourceName?: string;
  factorKey?: string;
  proofStatus?: string;
  remark?: string;
}

export interface GreenPowerCertificateQuery extends PageQuery {
  rowNo?: number;
  factoryCode?: string;
  factoryName?: string;
  activityYear?: number;
  activityMonth?: number;
  sourceCategoryKey?: string;
  scopeName?: string;
  electricityType?: string;
  certificateCode?: string;
  issuingOrg?: string;
  powerGridRegion?: string;
  offsetPowerSource?: string;
  proofStatus?: string;
  params?: any;
}
