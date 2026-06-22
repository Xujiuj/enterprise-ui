export interface IntensityMetricVO {
  id: string | number;
  metricCode?: string;
  metricName?: string;
  ruleCode?: string;
  metricPeriod?: string;
  numeratorEmission?: number;
  denominatorFactId?: string | number;
  denominatorValue?: number;
  denominatorUnit?: string;
  intensityValue?: number;
  targetCode?: string;
  metricStatus?: string;
  createTime?: string;
  updateTime?: string;
  remark?: string;
}

export interface IntensityMetricForm extends BaseEntity {
  id?: string | number;
  metricCode?: string;
  metricName?: string;
  ruleCode?: string;
  metricPeriod?: string;
  numeratorEmission?: number;
  denominatorFactId?: string | number;
  denominatorValue?: number;
  denominatorUnit?: string;
  intensityValue?: number;
  targetCode?: string;
  metricStatus?: string;
  remark?: string;
}

export interface IntensityMetricQuery extends PageQuery {
  metricCode?: string;
  metricName?: string;
  ruleCode?: string;
  metricPeriod?: string;
  denominatorFactId?: string | number;
  targetCode?: string;
  metricStatus?: string;
  params?: any;
}
