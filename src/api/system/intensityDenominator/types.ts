export interface IntensityDenominatorVO {
  /**
   * 涓婚敭
   */
  id: string | number;

  /**
   * 寮哄害鎸囨爣ID
   */
  intensityId: string | number;

  /**
   * 鍒嗘瘝缂栫爜
   */
  denominatorCode: string;

  /**
   * 鍒嗘瘝鍚嶇О(濡?钀ヤ笟鏀跺叆/浜у搧浜ч噺/寤虹瓚闈㈢Н)
   */
  denominatorName: string;

  /**
   * 鍒嗘瘝鏁板?
   */
  denominatorValue: number;

  /**
   * 鍒嗘瘝鍗曚綅
   */
  denominatorUnit: string;

  /**
   * 鏁版嵁鏈熼棿
   */
  dataPeriod: string;

  /**
   * 鎵╁睍瀛楁?JSON
   */
  extendJson: string;

  /**
   * 澶囨敞
   */
  remark: string;

}

export interface IntensityDenominatorForm extends BaseEntity {
  /**
   * 涓婚敭
   */
  id?: string | number;

  /**
   * 寮哄害鎸囨爣ID
   */
  intensityId?: string | number;

  /**
   * 鍒嗘瘝缂栫爜
   */
  denominatorCode?: string;

  /**
   * 鍒嗘瘝鍚嶇О(濡?钀ヤ笟鏀跺叆/浜у搧浜ч噺/寤虹瓚闈㈢Н)
   */
  denominatorName?: string;

  /**
   * 鍒嗘瘝鏁板?
   */
  denominatorValue?: number;

  /**
   * 鍒嗘瘝鍗曚綅
   */
  denominatorUnit?: string;

  /**
   * 鏁版嵁鏈熼棿
   */
  dataPeriod?: string;

  /**
   * 鎵╁睍瀛楁?JSON
   */
  extendJson?: string;

  /**
   * 澶囨敞
   */
  remark?: string;

}

export interface IntensityDenominatorQuery extends PageQuery {

  /**
   * 寮哄害鎸囨爣ID
   */
  intensityId?: string | number;

  /**
   * 鍒嗘瘝缂栫爜
   */
  denominatorCode?: string;

  /**
   * 鍒嗘瘝鍚嶇О(濡?钀ヤ笟鏀跺叆/浜у搧浜ч噺/寤虹瓚闈㈢Н)
   */
  denominatorName?: string;

  /**
   * 鍒嗘瘝鏁板?
   */
  denominatorValue?: number;

  /**
   * 鍒嗘瘝鍗曚綅
   */
  denominatorUnit?: string;

  /**
   * 鏁版嵁鏈熼棿
   */
  dataPeriod?: string;

  /**
   * 鎵╁睍瀛楁?JSON
   */
  extendJson?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
