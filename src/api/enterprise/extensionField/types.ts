export interface ExtensionFieldVO {
  id: string | number;
  templateVersionId?: string | number;
  moduleCode?: string;
  sheetId?: string | number;
  fieldCode?: string;
  fieldName?: string;
  valueType?: string;
  enabledFlag?: boolean;
  createTime?: string;
}

export interface ExtensionFieldQuery extends PageQuery {
  templateVersionId?: string | number;
  moduleCode?: string;
  sheetId?: string | number;
  fieldCode?: string;
  enabledFlag?: boolean;
  params?: any;
}

export interface ExtensionFieldValueVO {
  id: string | number;
  ownerTableCode?: string;
  ownerRecordId?: string | number;
  extensionFieldId?: string | number;
  textValue?: string | null;
  decimalValue?: number | null;
  dateValue?: string | null;
  booleanValue?: boolean | null;
  createTime?: string;
  updateTime?: string;
}

export interface ExtensionFieldValueForm extends BaseEntity {
  id?: string | number;
  ownerTableCode?: string;
  ownerRecordId?: string | number;
  extensionFieldId?: string | number;
  textValue?: string | null;
  decimalValue?: number | null;
  dateValue?: string | null;
  booleanValue?: boolean | null;
}

export interface ExtensionFieldValueQuery extends PageQuery {
  ownerTableCode?: string;
  ownerRecordId?: string | number;
  extensionFieldId?: string | number;
  params?: any;
}
