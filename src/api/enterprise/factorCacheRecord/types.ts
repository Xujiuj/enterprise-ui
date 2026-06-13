export interface FactorCacheRecordVO {
  id: string | number;
  cacheVersionId?: string | number;
  factorCode?: string;
  factorName?: string;
  factorCategory?: string;
  factorValue?: number;
  factorUnit?: string;
  sourceRef?: string;
  enabledFlag?: boolean;
  syncedTime?: string;
}

export interface FactorCacheRecordForm extends BaseEntity {
  id?: string | number;
  cacheVersionId?: string | number;
  factorCode?: string;
  factorName?: string;
  factorCategory?: string;
  factorValue?: number;
  factorUnit?: string;
  sourceRef?: string;
  enabledFlag?: boolean;
  syncedTime?: string;
}

export interface FactorCacheRecordQuery extends PageQuery {
  cacheVersionId?: string | number;
  factorCode?: string;
  factorName?: string;
  factorCategory?: string;
  enabledFlag?: boolean;
  params?: any;
}
