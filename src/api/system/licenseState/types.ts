export interface LicenseStateVO {
  /**
   * 涓婚敭
   */
  id: string | number;

  /**
   * License鏍囪瘑
   */
  licenseId: string | number;

  /**
   * 鏈?悗蹇冭烦鏃堕棿
   */
  lastHeartbeat: string;

  /**
   * 涓婃?绯荤粺鏃堕棿(闃插洖鎷?
   */
  lastSystemTime: string;

  /**
   * 鎿嶄綔璁℃暟
   */
  operationCount: number;

  /**
   * 鏄?惁琚??鏀?0鍚?1鏄?
   */
  isTampered: string;

  /**
   * 澶囨敞
   */
  remark: string;

}

export interface LicenseStateForm extends BaseEntity {
  /**
   * 涓婚敭
   */
  id?: string | number;

  /**
   * License鏍囪瘑
   */
  licenseId?: string | number;

  /**
   * 鏈?悗蹇冭烦鏃堕棿
   */
  lastHeartbeat?: string;

  /**
   * 涓婃?绯荤粺鏃堕棿(闃插洖鎷?
   */
  lastSystemTime?: string;

  /**
   * 鎿嶄綔璁℃暟
   */
  operationCount?: number;

  /**
   * 鏄?惁琚??鏀?0鍚?1鏄?
   */
  isTampered?: string;

  /**
   * 澶囨敞
   */
  remark?: string;

}

export interface LicenseStateQuery extends PageQuery {

  /**
   * License鏍囪瘑
   */
  licenseId?: string | number;

  /**
   * 鏈?悗蹇冭烦鏃堕棿
   */
  lastHeartbeat?: string;

  /**
   * 涓婃?绯荤粺鏃堕棿(闃插洖鎷?
   */
  lastSystemTime?: string;

  /**
   * 鎿嶄綔璁℃暟
   */
  operationCount?: number;

  /**
   * 鏄?惁琚??鏀?0鍚?1鏄?
   */
  isTampered?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
