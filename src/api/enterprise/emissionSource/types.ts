export interface EmissionSourceVO {
  id: string | number;
  sourceCode?: string;
  sourceName?: string;
  sourceCategoryCode?: string;
  sourceCategoryName?: string;
  facilityName?: string;
  boundaryScope?: string;
  enabledFlag?: boolean;
  createTime?: string;
  updateTime?: string;
  remark?: string;
}

export interface EmissionSourceForm extends BaseEntity {
  id?: string | number;
  sourceCode?: string;
  sourceName?: string;
  sourceCategoryCode?: string;
  sourceCategoryName?: string;
  facilityName?: string;
  boundaryScope?: string;
  enabledFlag?: boolean;
  remark?: string;
}

export interface EmissionSourceQuery extends PageQuery {
  sourceCode?: string;
  sourceName?: string;
  sourceCategoryCode?: string;
  sourceCategoryName?: string;
  facilityName?: string;
  boundaryScope?: string;
  enabledFlag?: boolean;
  params?: any;
}
