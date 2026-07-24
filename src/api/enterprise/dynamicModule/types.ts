export type DynamicValueType = 'text' | 'number' | 'date' | 'boolean';
export type DynamicUiType = 'input' | 'textarea' | 'number' | 'date' | 'switch';

export interface DynamicFieldDefinition {
  fieldCode: string;
  fieldName: string;
  dbColumn?: string;
  valueType: DynamicValueType;
  uiType: DynamicUiType;
  required: boolean;
  searchable: boolean;
  listVisible: boolean;
  formVisible: boolean;
  sortOrder?: number;
  maxLength?: number;
  precision?: number;
  scale?: number;
}

export interface DynamicSheetDefinition {
  sheetNo: number;
  sheetName: string;
  moduleName: string;
  moduleCode: string;
  selected: boolean;
  rowCount: number;
  fields: DynamicFieldDefinition[];
  sampleRows: Array<Record<string, unknown>>;
}

export interface DynamicWorkbookPreview {
  fileName: string;
  sheets: DynamicSheetDefinition[];
}

export interface DynamicGenerateRequest {
  sheets: DynamicSheetDefinition[];
}

export interface DynamicModuleSchema {
  id: string | number;
  moduleCode: string;
  moduleName: string;
  tableName: string;
  sheetName?: string;
  permissionPrefix: string;
  menuId?: string | number;
  status: string;
  fields: DynamicFieldDefinition[];
}

export interface DynamicGenerateResult {
  modules: DynamicModuleSchema[];
}

export interface DynamicPageResponse {
  rows?: Array<Record<string, any>>;
  data?: Array<Record<string, any>>;
  total?: number | string;
}
