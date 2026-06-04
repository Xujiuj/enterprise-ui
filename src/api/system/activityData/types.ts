export interface ActivityDataVO {
  /**
   * 涓婚敭
   */
  id: string | number;

  /**
   * 鎺掓斁婧怚D
   */
  sourceId: string | number;

  /**
   * 鏁版嵁鏈熼棿(YYYY-MM)
   */
  dataPeriod: string;

  /**
   * 鏁版嵁骞翠唤
   */
  dataYear: number;

  /**
   * 娲诲姩鏁版嵁鍊
   */
  activityValue: number;

  /**
   * 娲诲姩鏁版嵁鍗曚綅
   */
  activityUnit: string;

  /**
   * 鏁版嵁绫诲瀷(鍘熷?鏁版嵁/璁＄畻鍊?
   */
  dataType: string;

  /**
   * 鏁版嵁鏉ユ簮璇存槑
   */
  dataSource: string;

  /**
   * 璁＄畻鍏?紡
   */
  calculationFormula: string;

  /**
   * 鎺掓斁閲忚?绠楃粨鏋?tCO2e)
   */
  emissionResult: number;

  /**
   * 鏍搁獙鐘舵?(0寰呮牳楠?1宸叉牳楠?2宸查?鍥?
   */
  verificationStatus: string;

  /**
   * 鎵╁睍瀛楁?JSON
   */
  extendJson: string;

  /**
   * 澶囨敞
   */
  remark: string;

}

export interface ActivityDataForm extends BaseEntity {
  /**
   * 涓婚敭
   */
  id?: string | number;

  /**
   * 鎺掓斁婧怚D
   */
  sourceId?: string | number;

  /**
   * 鏁版嵁鏈熼棿(YYYY-MM)
   */
  dataPeriod?: string;

  /**
   * 鏁版嵁骞翠唤
   */
  dataYear?: number;

  /**
   * 娲诲姩鏁版嵁鍊
   */
  activityValue?: number;

  /**
   * 娲诲姩鏁版嵁鍗曚綅
   */
  activityUnit?: string;

  /**
   * 鏁版嵁绫诲瀷(鍘熷?鏁版嵁/璁＄畻鍊?
   */
  dataType?: string;

  /**
   * 鏁版嵁鏉ユ簮璇存槑
   */
  dataSource?: string;

  /**
   * 璁＄畻鍏?紡
   */
  calculationFormula?: string;

  /**
   * 鎺掓斁閲忚?绠楃粨鏋?tCO2e)
   */
  emissionResult?: number;

  /**
   * 鏍搁獙鐘舵?(0寰呮牳楠?1宸叉牳楠?2宸查?鍥?
   */
  verificationStatus?: string;

  /**
   * 鎵╁睍瀛楁?JSON
   */
  extendJson?: string;

  /**
   * 澶囨敞
   */
  remark?: string;

}

export interface ActivityDataQuery extends PageQuery {

  /**
   * 鎺掓斁婧怚D
   */
  sourceId?: string | number;

  /**
   * 鏁版嵁鏈熼棿(YYYY-MM)
   */
  dataPeriod?: string;

  /**
   * 鏁版嵁骞翠唤
   */
  dataYear?: number;

  /**
   * 娲诲姩鏁版嵁鍊
   */
  activityValue?: number;

  /**
   * 娲诲姩鏁版嵁鍗曚綅
   */
  activityUnit?: string;

  /**
   * 鏁版嵁绫诲瀷(鍘熷?鏁版嵁/璁＄畻鍊?
   */
  dataType?: string;

  /**
   * 鏁版嵁鏉ユ簮璇存槑
   */
  dataSource?: string;

  /**
   * 璁＄畻鍏?紡
   */
  calculationFormula?: string;

  /**
   * 鎺掓斁閲忚?绠楃粨鏋?tCO2e)
   */
  emissionResult?: number;

  /**
   * 鏍搁獙鐘舵?(0寰呮牳楠?1宸叉牳楠?2宸查?鍥?
   */
  verificationStatus?: string;

  /**
   * 鎵╁睍瀛楁?JSON
   */
  extendJson?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
