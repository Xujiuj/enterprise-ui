export interface CustomFieldMetaVO {
  /**
   * 涓婚敭
   */
  id: string | number;

  /**
   * 妯″潡鍚嶇О(activity_data/green_electricity/intensity_denominator)
   */
  moduleName: string;

  /**
   * 瀛楁?閿?悕
   */
  fieldKey: string;

  /**
   * 瀛楁?鏄剧ず鍚嶇О
   */
  fieldLabel: string;

  /**
   * 瀛楁?绫诲瀷(text/number/date/select/boolean)
   */
  fieldType: string;

  /**
   * 瀛楁?閫夐」JSON(select绫诲瀷)
   */
  fieldOptions: string;

  /**
   * 鏄?惁蹇呭～(0鍚?1鏄?
   */
  isRequired: string;

  /**
   * 鎺掑簭
   */
  sortOrder: number;

  /**
   * 鐘舵?(0鍚?敤 1鍋滅敤)
   */
  status: string;

  /**
   * 澶囨敞
   */
  remark: string;

}

export interface CustomFieldMetaForm extends BaseEntity {
  /**
   * 涓婚敭
   */
  id?: string | number;

  /**
   * 妯″潡鍚嶇О(activity_data/green_electricity/intensity_denominator)
   */
  moduleName?: string;

  /**
   * 瀛楁?閿?悕
   */
  fieldKey?: string;

  /**
   * 瀛楁?鏄剧ず鍚嶇О
   */
  fieldLabel?: string;

  /**
   * 瀛楁?绫诲瀷(text/number/date/select/boolean)
   */
  fieldType?: string;

  /**
   * 瀛楁?閫夐」JSON(select绫诲瀷)
   */
  fieldOptions?: string;

  /**
   * 鏄?惁蹇呭～(0鍚?1鏄?
   */
  isRequired?: string;

  /**
   * 鎺掑簭
   */
  sortOrder?: number;

  /**
   * 鐘舵?(0鍚?敤 1鍋滅敤)
   */
  status?: string;

  /**
   * 澶囨敞
   */
  remark?: string;

}

export interface CustomFieldMetaQuery extends PageQuery {

  /**
   * 妯″潡鍚嶇О(activity_data/green_electricity/intensity_denominator)
   */
  moduleName?: string;

  /**
   * 瀛楁?閿?悕
   */
  fieldKey?: string;

  /**
   * 瀛楁?鏄剧ず鍚嶇О
   */
  fieldLabel?: string;

  /**
   * 瀛楁?绫诲瀷(text/number/date/select/boolean)
   */
  fieldType?: string;

  /**
   * 瀛楁?閫夐」JSON(select绫诲瀷)
   */
  fieldOptions?: string;

  /**
   * 鏄?惁蹇呭～(0鍚?1鏄?
   */
  isRequired?: string;

  /**
   * 鎺掑簭
   */
  sortOrder?: number;

  /**
   * 鐘舵?(0鍚?敤 1鍋滅敤)
   */
  status?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
