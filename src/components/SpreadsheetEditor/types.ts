export type SpreadsheetValue = string | number | boolean | null | undefined;

export interface SpreadsheetOption {
  label: string;
  value: SpreadsheetValue;
}

export interface SpreadsheetColumn {
  prop: string;
  label: string;
  type?: 'text' | 'number' | 'select' | 'date';
  required?: boolean;
  readonly?: boolean;
  width?: number;
  min?: number;
  precision?: number;
  placeholder?: string;
  options?: SpreadsheetOption[];
}
