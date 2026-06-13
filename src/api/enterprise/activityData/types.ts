export interface ActivityDataVO {
  id: string | number;
  batchId?: string | number;
  emissionSourceId?: string | number;
  activityPeriod?: string;
  activityValue?: number;
  activityUnit?: string;
  factorConfirmationId?: string | number;
  calculatedEmission?: number;
  dataStatus?: string;
  createTime?: string;
  updateTime?: string;
  remark?: string;
}

export interface ActivityDataForm extends BaseEntity {
  id?: string | number;
  batchId?: string | number;
  emissionSourceId?: string | number;
  activityPeriod?: string;
  activityValue?: number;
  activityUnit?: string;
  factorConfirmationId?: string | number;
  calculatedEmission?: number;
  dataStatus?: string;
  remark?: string;
}

export interface ActivityDataQuery extends PageQuery {
  batchId?: string | number;
  emissionSourceId?: string | number;
  activityPeriod?: string;
  activityUnit?: string;
  factorConfirmationId?: string | number;
  dataStatus?: string;
  params?: any;
}

export interface ActivityDataValidationSubmission {
  department?: string;
  responsiblePerson?: string;
  facilityName?: string;
  moduleName?: string;
  expectedCount?: number;
  submittedCount?: number;
  missingCount?: number;
  warningCount?: number;
  emissionSourceId?: string | number;
  emissionSourceCode?: string;
  emissionSourceName?: string;
  activityPeriod?: string;
  dueDate?: string;
  submissionStatus?: string;
  submittedTime?: string;
  accuracyRate?: number;
}

export interface ActivityDataValidationIssue {
  ruleCode?: string;
  ruleName?: string;
  severity?: 'ERROR' | 'WARNING' | string;
  emissionSourceId?: string | number;
  emissionSourceCode?: string;
  objectName?: string;
  activityPeriod?: string;
  description?: string;
  suggestion?: string;
  issueStatus?: string;
}

export interface ActivityDataValidationDashboard {
  activityPeriod?: string;
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
