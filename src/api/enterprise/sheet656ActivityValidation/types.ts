export interface Sheet656FieldDescriptor {
  fieldOrder: number;
  sourceColumnCode: string;
  sourceColumnName: string;
  sourceRequired: boolean;
  rowValueRequired: boolean;
  derivedField: boolean;
}

export interface Sheet656FieldValue {
  sourceColumnCode: string;
  sourceColumnName?: string;
  value?: string;
}

export interface Sheet656ValidationRequest {
  rowNumber: number;
  fieldValues: Sheet656FieldValue[];
}

export interface Sheet656ResolvedRow {
  emissionSourceCode?: string;
  companyCode?: string;
  companyName?: string;
  factoryName?: string;
  emissionSourceCategoryCode?: string;
  scope?: string;
  scopeSubcategory?: string;
  emissionSourceIdentity?: string;
  emissionSourceName?: string;
  unit?: string;
  emissionFactorCode?: string;
}

export interface Sheet656ImportValidationRequest {
  headerFields: Sheet656FieldDescriptor[];
  rows: Sheet656ValidationRequest[];
}

export interface Sheet656ValidationIssue {
  severity: 'ERROR' | 'WARNING' | string;
  code?: string;
  rowNumber?: number;
  sourceColumnCode?: string;
  sourceColumnName?: string;
  message?: string;
}

export interface Sheet656ValidationResult {
  rowNumber: number;
  valid: boolean;
  blocking: boolean;
  draftSavable: boolean;
  issues?: Sheet656ValidationIssue[];
  resolvedDerivedFieldValues?: Sheet656FieldValue[];
}

export interface Sheet656ImportValidationResult {
  headerValid: boolean;
  valid: boolean;
  blocking: boolean;
  headerIssues?: Sheet656ValidationIssue[];
  rowResults?: Sheet656ValidationResult[];
}
