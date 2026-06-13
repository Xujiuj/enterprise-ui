export interface WorkbenchMetricCard {
  label: string;
  value?: string;
  note?: string;
  valueClass?: string;
  badge?: string;
  badgeTone?: string;
}

export interface WorkbenchCycleStage {
  label: string;
  value?: string;
  detail?: string;
  tone?: string;
}

export interface WorkbenchScopeEmission {
  label: string;
  value?: number;
  unit?: string;
  percent?: number;
}

export interface WorkbenchTodoItem {
  type: string;
  content?: string;
  status?: string;
  tone?: string;
  path?: string;
  action?: string;
}

export interface WorkbenchRecentActivity {
  title: string;
  time?: string;
  detail?: string;
  tone?: string;
}

export interface WorkbenchSystemNotice {
  noticeId: string | number;
  noticeTitle?: string;
  noticeType?: string;
  noticeContent?: string;
  status?: string;
  remark?: string;
  createTime?: string;
}

export interface WorkbenchOverview {
  currentPeriod?: string;
  statusCards?: WorkbenchMetricCard[];
  cycleStages?: WorkbenchCycleStage[];
  scopeEmissions?: WorkbenchScopeEmission[];
  todoItems?: WorkbenchTodoItem[];
  recentActivities?: WorkbenchRecentActivity[];
  systemNotices?: WorkbenchSystemNotice[];
}
