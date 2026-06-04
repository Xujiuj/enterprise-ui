export interface SubmissionTrackingVO {
  /**
   * 涓婚敭
   */
  id: string | number;

  /**
   * 妯″潡鍚嶇О
   */
  moduleName: string;

  /**
   * 鏁版嵁鏈熼棿
   */
  dataPeriod: string;

  /**
   * 閮ㄩ棬ID
   */
  deptId: string | number;

  /**
   * 璐ｄ换浜
   */
  responsiblePerson: string;

  /**
   * 鎻愪氦鐘舵?(0鏈?彁浜?1宸叉彁浜?2宸查?鍥?3宸插?鏍?
   */
  submissionStatus: string;

  /**
   * 鎻愪氦鏃堕棿
   */
  submittedTime: string;

  /**
   * 瀹℃牳浜
   */
  auditedBy: string;

  /**
   * 瀹℃牳鏃堕棿
   */
  auditedTime: string;

  /**
   * 鍌?姙娆℃暟
   */
  remindCount: number;

  /**
   * 鏈?繎鍌?姙鏃堕棿
   */
  lastRemindTime: string;

  /**
   * 澶囨敞
   */
  remark: string;

}

export interface SubmissionTrackingForm extends BaseEntity {
  /**
   * 涓婚敭
   */
  id?: string | number;

  /**
   * 妯″潡鍚嶇О
   */
  moduleName?: string;

  /**
   * 鏁版嵁鏈熼棿
   */
  dataPeriod?: string;

  /**
   * 閮ㄩ棬ID
   */
  deptId?: string | number;

  /**
   * 璐ｄ换浜
   */
  responsiblePerson?: string;

  /**
   * 鎻愪氦鐘舵?(0鏈?彁浜?1宸叉彁浜?2宸查?鍥?3宸插?鏍?
   */
  submissionStatus?: string;

  /**
   * 鎻愪氦鏃堕棿
   */
  submittedTime?: string;

  /**
   * 瀹℃牳浜
   */
  auditedBy?: string;

  /**
   * 瀹℃牳鏃堕棿
   */
  auditedTime?: string;

  /**
   * 鍌?姙娆℃暟
   */
  remindCount?: number;

  /**
   * 鏈?繎鍌?姙鏃堕棿
   */
  lastRemindTime?: string;

  /**
   * 澶囨敞
   */
  remark?: string;

}

export interface SubmissionTrackingQuery extends PageQuery {

  /**
   * 妯″潡鍚嶇О
   */
  moduleName?: string;

  /**
   * 鏁版嵁鏈熼棿
   */
  dataPeriod?: string;

  /**
   * 閮ㄩ棬ID
   */
  deptId?: string | number;

  /**
   * 璐ｄ换浜
   */
  responsiblePerson?: string;

  /**
   * 鎻愪氦鐘舵?(0鏈?彁浜?1宸叉彁浜?2宸查?鍥?3宸插?鏍?
   */
  submissionStatus?: string;

  /**
   * 鎻愪氦鏃堕棿
   */
  submittedTime?: string;

  /**
   * 瀹℃牳浜
   */
  auditedBy?: string;

  /**
   * 瀹℃牳鏃堕棿
   */
  auditedTime?: string;

  /**
   * 鍌?姙娆℃暟
   */
  remindCount?: number;

  /**
   * 鏈?繎鍌?姙鏃堕棿
   */
  lastRemindTime?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
