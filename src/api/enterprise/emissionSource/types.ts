export interface EmissionSourceVO {
  id: string | number;
  companyCode?: string;
  companyName?: string;
  factoryName?: string;
  sourceCategoryKey?: string;
  scopeName?: string;
  scopeSubcategory?: string;
  sourceIdentificationCode?: string;
  sourceIdentificationName?: string;
  emissionSourceName?: string;
  responsibleDept?: string;
  dataSource?: string;
  factorKey?: string;
  sourceUnit?: string;
  enabledFlag?: boolean;
  createTime?: string;
  updateTime?: string;
  remark?: string;
}

export interface EmissionSourceForm extends BaseEntity {
  id?: string | number;
  companyCode?: string;
  companyName?: string;
  factoryName?: string;
  sourceCategoryKey?: string;
  scopeName?: string;
  scopeSubcategory?: string;
  sourceIdentificationCode?: string;
  sourceIdentificationName?: string;
  emissionSourceName?: string;
  responsibleDept?: string;
  dataSource?: string;
  factorKey?: string;
  enabledFlag?: boolean;
  remark?: string;
}

export interface EmissionSourceQuery extends PageQuery {
  companyCode?: string;
  companyName?: string;
  factoryName?: string;
  sourceCategoryKey?: string;
  scopeName?: string;
  scopeSubcategory?: string;
  sourceIdentificationCode?: string;
  sourceIdentificationName?: string;
  emissionSourceName?: string;
  responsibleDept?: string;
  dataSource?: string;
  factorKey?: string;
  enabledFlag?: boolean;
  params?: any;
}
