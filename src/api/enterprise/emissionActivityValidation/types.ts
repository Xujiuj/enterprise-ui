export interface EmissionActivityFieldDescriptor {
  fieldOrder: number;
  fieldCode: string;
  fieldName: string;
  sourceRequired: boolean;
  rowValueRequired: boolean;
  derivedField: boolean;
}

export interface EmissionActivityFieldValue {
  fieldCode: string;
  fieldName?: string;
  value?: string;
}

export interface EmissionActivityValidationRequest {
  rowNumber: number;
  fieldValues: EmissionActivityFieldValue[];
}

export interface EmissionActivityResolvedRow {
  emissionSourceCode?: string;
  companyCode?: string;
  companyName?: string;
  factoryCode?: string;
  factoryName?: string;
  emissionSourceCategoryCode?: string;
  scope?: string;
  scopeSubcategory?: string;
  emissionSourceIdentity?: string;
  emissionSourceName?: string;
  unit?: string;
  emissionFactorCode?: string;
  responsibleDept?: string;
  dataSource?: string;
}

export interface EmissionActivityImportValidationRequest {
  headerFields: EmissionActivityFieldDescriptor[];
  rows: EmissionActivityValidationRequest[];
}

export interface EmissionActivityValidationIssue {
  severity: 'ERROR' | 'WARNING' | string;
  code?: string;
  rowNumber?: number;
  fieldCode?: string;
  fieldName?: string;
  message?: string;
}

export interface EmissionActivityValidationResult {
  rowNumber: number;
  valid: boolean;
  blocking: boolean;
  draftSavable: boolean;
  issues?: EmissionActivityValidationIssue[];
  resolvedDerivedFieldValues?: EmissionActivityFieldValue[];
}

export interface EmissionActivityImportValidationResult {
  headerValid: boolean;
  valid: boolean;
  blocking: boolean;
  headerIssues?: EmissionActivityValidationIssue[];
  rowResults?: EmissionActivityValidationResult[];
}
