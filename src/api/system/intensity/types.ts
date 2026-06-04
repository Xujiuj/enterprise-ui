export interface IntensityVO {
  /**
   * 涓婚敭
   */
  id: string | number;

  /**
   * 寮哄害鎸囨爣缂栫爜
   */
  intensityCode: string;

  /**
   * 寮哄害鎸囨爣鍚嶇О
   */
  intensityName: string;

  /**
   * 寮哄害绫诲瀷(钀ユ敹寮哄害/浜ч噺寮哄害/闈㈢Н寮哄害)
   */
  intensityType: string;

  /**
   * 鐩?爣骞翠唤
   */
  targetYear: number;

  /**
   * 鐩?爣鍊
   */
  targetValue: number;

  /**
   * 瀹為檯鍊
   */
  actualValue: number;

  /**
   * 寮哄害鍗曚綅(tCO2e/涓囧厓鎴杢CO2e/鍚ㄤ骇鍝?
   */
  intensityUnit: string;

  /**
   * 瀹屾垚鐜?%)
   */
  completionRate: number;

  /**
   * 瓒嬪娍鏂瑰悜(涓婂崌/涓嬮檷/鎸佸钩)
   */
  trendDirection: string;

  /**
   * 鐘舵?(0姝ｅ父 1鍋滅敤)
   */
  status: string;

  /**
   * 澶囨敞
   */
  remark: string;

}

export interface IntensityForm extends BaseEntity {
  /**
   * 涓婚敭
   */
  id?: string | number;

  /**
   * 寮哄害鎸囨爣缂栫爜
   */
  intensityCode?: string;

  /**
   * 寮哄害鎸囨爣鍚嶇О
   */
  intensityName?: string;

  /**
   * 寮哄害绫诲瀷(钀ユ敹寮哄害/浜ч噺寮哄害/闈㈢Н寮哄害)
   */
  intensityType?: string;

  /**
   * 鐩?爣骞翠唤
   */
  targetYear?: number;

  /**
   * 鐩?爣鍊
   */
  targetValue?: number;

  /**
   * 瀹為檯鍊
   */
  actualValue?: number;

  /**
   * 寮哄害鍗曚綅(tCO2e/涓囧厓鎴杢CO2e/鍚ㄤ骇鍝?
   */
  intensityUnit?: string;

  /**
   * 瀹屾垚鐜?%)
   */
  completionRate?: number;

  /**
   * 瓒嬪娍鏂瑰悜(涓婂崌/涓嬮檷/鎸佸钩)
   */
  trendDirection?: string;

  /**
   * 鐘舵?(0姝ｅ父 1鍋滅敤)
   */
  status?: string;

  /**
   * 澶囨敞
   */
  remark?: string;

}

export interface IntensityQuery extends PageQuery {

  /**
   * 寮哄害鎸囨爣缂栫爜
   */
  intensityCode?: string;

  /**
   * 寮哄害鎸囨爣鍚嶇О
   */
  intensityName?: string;

  /**
   * 寮哄害绫诲瀷(钀ユ敹寮哄害/浜ч噺寮哄害/闈㈢Н寮哄害)
   */
  intensityType?: string;

  /**
   * 鐩?爣骞翠唤
   */
  targetYear?: number;

  /**
   * 鐩?爣鍊
   */
  targetValue?: number;

  /**
   * 瀹為檯鍊
   */
  actualValue?: number;

  /**
   * 寮哄害鍗曚綅(tCO2e/涓囧厓鎴杢CO2e/鍚ㄤ骇鍝?
   */
  intensityUnit?: string;

  /**
   * 瀹屾垚鐜?%)
   */
  completionRate?: number;

  /**
   * 瓒嬪娍鏂瑰悜(涓婂崌/涓嬮檷/鎸佸钩)
   */
  trendDirection?: string;

  /**
   * 鐘舵?(0姝ｅ父 1鍋滅敤)
   */
  status?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
