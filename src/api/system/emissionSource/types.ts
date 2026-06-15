export interface EmissionSourceVO {
  /**
   * 涓婚敭
   */
  id: string | number;

  /**
   * 鎺掓斁婧愮紪鐮
   */
  sourceCode: string;

  /**
   * 鎺掓斁婧愬悕绉
   */
  sourceName: string;

  /**
   * 鎺掓斁婧愬垎绫?鍥哄畾鐕冪儳/绉诲姩鐕冪儳/杩囩▼鎺掓斁/閫告暎鎺掓斁/闂存帴鎺掓斁)
   */
  category: string;

  /**
   * 鑼冨洿(鑼冨洿1/鑼冨洿2/鑼冨洿3)
   */
  scopeType: string;

  /**
   * 鑼冨洿鏄庣粏
   */
  scopeDetail: string;

  /**
   * 娓╁?姘斾綋绫诲瀷(CO2/CH4/N2O/HFCs/PFCs/SF6)
   */
  ghgType: string;

  /**
   * 鎺掓斁婧愭弿杩
   */
  description: string;

  /**
   * 璐熻矗閮ㄩ棬
   */
  responsibleDept: string;

  /**
   * 璐熻矗浜
   */
  responsiblePerson: string;

  /**
   * 鏇存柊棰戠巼(鏈堝害/瀛ｅ害/骞村害)
   */
  updateFrequency: string;

  /**
   * 鏁版嵁鏉冮檺绫诲瀷(1浼佷笟鍙?紪杈?2绯荤粺棰勭疆鍙?? 3閾炬帴鍘傚晢鍙??)
   */
  dataPermission: string;

  /**
   * 鐘舵?(0姝ｅ父 1鍋滅敤)
   */
  status: string;

  /**
   * 澶囨敞
   */
  remark: string;

}

export interface EmissionSourceForm extends BaseEntity {
  /**
   * 涓婚敭
   */
  id?: string | number;

  /**
   * 鎺掓斁婧愮紪鐮
   */
  sourceCode?: string;

  /**
   * 鎺掓斁婧愬悕绉
   */
  sourceName?: string;

  /**
   * 鎺掓斁婧愬垎绫?鍥哄畾鐕冪儳/绉诲姩鐕冪儳/杩囩▼鎺掓斁/閫告暎鎺掓斁/闂存帴鎺掓斁)
   */
  category?: string;

  /**
   * 鑼冨洿(鑼冨洿1/鑼冨洿2/鑼冨洿3)
   */
  scopeType?: string;

  /**
   * 鑼冨洿鏄庣粏
   */
  scopeDetail?: string;

  /**
   * 娓╁?姘斾綋绫诲瀷(CO2/CH4/N2O/HFCs/PFCs/SF6)
   */
  ghgType?: string;

  /**
   * 鎺掓斁婧愭弿杩
   */
  description?: string;

  /**
   * 璐熻矗閮ㄩ棬
   */
  responsibleDept?: string;

  /**
   * 璐熻矗浜
   */
  responsiblePerson?: string;

  /**
   * 鏇存柊棰戠巼(鏈堝害/瀛ｅ害/骞村害)
   */
  updateFrequency?: string;

  /**
   * 鏁版嵁鏉冮檺绫诲瀷(1浼佷笟鍙?紪杈?2绯荤粺棰勭疆鍙?? 3閾炬帴鍘傚晢鍙??)
   */
  dataPermission?: string;

  /**
   * 鐘舵?(0姝ｅ父 1鍋滅敤)
   */
  status?: string;

  /**
   * 澶囨敞
   */
  remark?: string;

}

export interface EmissionSourceQuery extends PageQuery {

  /**
   * 鎺掓斁婧愮紪鐮
   */
  sourceCode?: string;

  /**
   * 鎺掓斁婧愬悕绉
   */
  sourceName?: string;

  /**
   * 鎺掓斁婧愬垎绫?鍥哄畾鐕冪儳/绉诲姩鐕冪儳/杩囩▼鎺掓斁/閫告暎鎺掓斁/闂存帴鎺掓斁)
   */
  category?: string;

  /**
   * 鑼冨洿(鑼冨洿1/鑼冨洿2/鑼冨洿3)
   */
  scopeType?: string;

  /**
   * 鑼冨洿鏄庣粏
   */
  scopeDetail?: string;

  /**
   * 娓╁?姘斾綋绫诲瀷(CO2/CH4/N2O/HFCs/PFCs/SF6)
   */
  ghgType?: string;

  /**
   * 鎺掓斁婧愭弿杩
   */
  description?: string;

  /**
   * 璐熻矗閮ㄩ棬
   */
  responsibleDept?: string;

  /**
   * 璐熻矗浜
   */
  responsiblePerson?: string;

  /**
   * 鏇存柊棰戠巼(鏈堝害/瀛ｅ害/骞村害)
   */
  updateFrequency?: string;

  /**
   * 鏁版嵁鏉冮檺绫诲瀷(1浼佷笟鍙?紪杈?2绯荤粺棰勭疆鍙?? 3閾炬帴鍘傚晢鍙??)
   */
  dataPermission?: string;

  /**
   * 鐘舵?(0姝ｅ父 1鍋滅敤)
   */
  status?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
