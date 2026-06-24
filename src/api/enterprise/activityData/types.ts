export interface ActivityDataVO {
  id: string | number;
  batchId?: string | number;
  sourceSheetCode?: string;
  sourceIdentificationCode?: string;
  companyCode?: string;
  companyName?: string;
  factoryName?: string;
  sourceCategoryKey?: string;
  scopeName?: string;
  scopeSubcategory?: string;
  sourceIdentificationName?: string;
  emissionSourceName?: string;
  activityUnit?: string;
  activityYear?: number;
  activityMonth?: number;
  activityDate?: string;
  activityValue?: number;
  responsibleDept?: string;
  dataSource?: string;
  sourceRemark?: string;
  factorKey?: string;
  calculatedEmission?: number;
  dataStatus?: string;
  createTime?: string;
  updateTime?: string;
  remark?: string;
}

export interface ActivityDataForm extends BaseEntity {
  id?: string | number;
  batchId?: string | number;
  sourceSheetCode?: string;
  sourceIdentificationCode?: string;
  companyCode?: string;
  companyName?: string;
  factoryName?: string;
  sourceCategoryKey?: string;
  scopeName?: string;
  scopeSubcategory?: string;
  sourceIdentificationName?: string;
  emissionSourceName?: string;
  activityUnit?: string;
  activityYear?: number;
  activityMonth?: number;
  activityDate?: string;
  activityValue?: number;
  responsibleDept?: string;
  dataSource?: string;
  sourceRemark?: string;
  factorKey?: string;
  calculatedEmission?: number;
  dataStatus?: string;
  remark?: string;
}

export interface ActivityDataQuery extends PageQuery {
  batchId?: string | number;
  sourceSheetCode?: string;
  sourceIdentificationCode?: string;
  companyCode?: string;
  companyName?: string;
  factoryName?: string;
  sourceCategoryKey?: string;
  scopeName?: string;
  scopeSubcategory?: string;
  sourceIdentificationName?: string;
  emissionSourceName?: string;
  activityUnit?: string;
  responsibleDept?: string;
  dataSource?: string;
  activityYear?: number;
  activityMonth?: number;
  dataStatus?: string;
  params?: any;
}

export interface ActivityDataValidationSubmission {
  department?: string;
  responsiblePerson?: string;
  factoryName?: string;
  moduleName?: string;
  expectedCount?: number;
  submittedCount?: number;
  missingCount?: number;
  warningCount?: number;
  sourceIdentificationCode?: string;
  sourceIdentificationName?: string;
  emissionSourceName?: string;
  activityYear?: number;
  activityMonth?: number;
  dueDate?: string;
  submissionStatus?: string;
  submittedTime?: string;
  accuracyRate?: number;
}

export interface ActivityDataValidationIssue {
  ruleCode?: string;
  ruleName?: string;
  severity?: 'ERROR' | 'WARNING' | string;
  sourceIdentificationCode?: string;
  sourceIdentificationName?: string;
  objectName?: string;
  activityYear?: number;
  activityMonth?: number;
  description?: string;
  suggestion?: string;
  issueStatus?: string;
}

export interface ActivityDataValidationDashboard {
  activityYear?: number;
  activityMonth?: number;
  dueDate?: string;
  expectedItems?: number;
  validatedRecordCount?: number;
  submittedItems?: number;
  abnormalItems?: number;
  missingItems?: number;
  draftItems?: number;
  accuracyRate?: number;
  passRate?: number;
  submissions?: ActivityDataValidationSubmission[];
  issues?: ActivityDataValidationIssue[];
}
