export interface EnterpriseOptionVO {
  label: string;
  value: string | number | boolean;
  record?: Record<string, any>;
}

export interface EnterpriseOptionQuery {
  dimensionCode?: string;
  field?: string;
  parentField?: string;
  parentValue?: string | number | boolean;
  companyName?: string;
  factoryName?: string;
  sourceCategoryKey?: string;
  scopeName?: string;
  scopeSubcategory?: string;
  sourceIdentificationName?: string;
  emissionSourceName?: string;
}
