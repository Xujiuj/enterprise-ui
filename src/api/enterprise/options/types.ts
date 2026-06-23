export interface EnterpriseOptionVO {
  label: string;
  value: string | number | boolean;
}

export interface EnterpriseOptionQuery {
  dimensionCode?: string;
  field?: string;
}
