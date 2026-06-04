export interface ReportTemplateVO {
  /**
   * 涓婚敭
   */
  id: string | number;

  /**
   * 妯℃澘缂栫爜
   */
  templateCode: string;

  /**
   * 妯℃澘鍚嶇О
   */
  templateName: string;

  /**
   * 妯℃澘绫诲瀷(鎺掓斁鎶ュ憡/纰宠冻杩?ESG/鑷?畾涔?
   */
  templateType: string;

  /**
   * 妯℃澘鏂囦欢璺?緞(.pbix)
   */
  templateFile: string;

  /**
   * 妯℃澘鐗堟湰
   */
  templateVersion: string;

  /**
   * 妯℃澘璇存槑
   */
  description: string;

  /**
   * 鎶ヨ〃杩炴帴鍙傛暟JSON(rpt瑙嗗浘/鍥犲瓙API杩炴帴淇℃伅)
   */
  rptConnectionParams: string;

  /**
   * 鏄?惁鍙戝竷(0鑽夌? 1宸插彂甯?
   */
  isPublished: string;

  /**
   * 鍙戝竷鏃堕棿
   */
  publishedTime: string;

  /**
   * 鐘舵?(0姝ｅ父 1鍋滅敤)
   */
  status: string;

  /**
   * 澶囨敞
   */
  remark: string;

}

export interface ReportTemplateForm extends BaseEntity {
  /**
   * 涓婚敭
   */
  id?: string | number;

  /**
   * 妯℃澘缂栫爜
   */
  templateCode?: string;

  /**
   * 妯℃澘鍚嶇О
   */
  templateName?: string;

  /**
   * 妯℃澘绫诲瀷(鎺掓斁鎶ュ憡/纰宠冻杩?ESG/鑷?畾涔?
   */
  templateType?: string;

  /**
   * 妯℃澘鏂囦欢璺?緞(.pbix)
   */
  templateFile?: string;

  /**
   * 妯℃澘鐗堟湰
   */
  templateVersion?: string;

  /**
   * 妯℃澘璇存槑
   */
  description?: string;

  /**
   * 鎶ヨ〃杩炴帴鍙傛暟JSON(rpt瑙嗗浘/鍥犲瓙API杩炴帴淇℃伅)
   */
  rptConnectionParams?: string;

  /**
   * 鏄?惁鍙戝竷(0鑽夌? 1宸插彂甯?
   */
  isPublished?: string;

  /**
   * 鍙戝竷鏃堕棿
   */
  publishedTime?: string;

  /**
   * 鐘舵?(0姝ｅ父 1鍋滅敤)
   */
  status?: string;

  /**
   * 澶囨敞
   */
  remark?: string;

}

export interface ReportTemplateQuery extends PageQuery {

  /**
   * 妯℃澘缂栫爜
   */
  templateCode?: string;

  /**
   * 妯℃澘鍚嶇О
   */
  templateName?: string;

  /**
   * 妯℃澘绫诲瀷(鎺掓斁鎶ュ憡/纰宠冻杩?ESG/鑷?畾涔?
   */
  templateType?: string;

  /**
   * 妯℃澘鏂囦欢璺?緞(.pbix)
   */
  templateFile?: string;

  /**
   * 妯℃澘鐗堟湰
   */
  templateVersion?: string;

  /**
   * 妯℃澘璇存槑
   */
  description?: string;

  /**
   * 鎶ヨ〃杩炴帴鍙傛暟JSON(rpt瑙嗗浘/鍥犲瓙API杩炴帴淇℃伅)
   */
  rptConnectionParams?: string;

  /**
   * 鏄?惁鍙戝竷(0鑽夌? 1宸插彂甯?
   */
  isPublished?: string;

  /**
   * 鍙戝竷鏃堕棿
   */
  publishedTime?: string;

  /**
   * 鐘舵?(0姝ｅ父 1鍋滅敤)
   */
  status?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
