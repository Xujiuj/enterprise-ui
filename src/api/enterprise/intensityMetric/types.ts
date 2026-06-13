export interface IntensityMetricVO {
  id: string | number;
  metricCode?: string;
  metricName?: string;
  metricPeriod?: string;
  numeratorEmission?: number;
  denominatorValue?: number;
  denominatorUnit?: string;
  intensityValue?: number;
  metricStatus?: string;
  createTime?: string;
  updateTime?: string;
  remark?: string;
}

export interface IntensityMetricForm extends BaseEntity {
  id?: string | number;
  metricCode?: string;
  metricName?: string;
  metricPeriod?: string;
  numeratorEmission?: number;
  denominatorValue?: number;
  denominatorUnit?: string;
  intensityValue?: number;
  metricStatus?: string;
  remark?: string;
}

export interface IntensityMetricQuery extends PageQuery {
  metricCode?: string;
  metricName?: string;
  metricPeriod?: string;
  metricStatus?: string;
  params?: any;
}
