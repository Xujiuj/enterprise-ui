export interface EnterpriseOptionVO {
  label: string;
  value: string | number | boolean;
  record?: Record<string, any>;
}

export interface EnterpriseOptionQuery {
  dimensionCode?: string;
  field?: string;
  companyName?: string;
  factoryName?: string;
  sourceCategoryKey?: string;
  scopeName?: string;
  scopeSubcategory?: string;
  sourceIdentificationName?: string;
}
