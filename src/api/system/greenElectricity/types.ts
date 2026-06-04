export interface GreenElectricityVO {
  /**
   * 涓婚敭
   */
  id: string | number;

  /**
   * 缁胯瘉缂栫爜
   */
  certificateCode: string;

  /**
   * 绫诲瀷(缁跨數/缁胯瘉/纰虫姷娑?
   */
  certificateType: string;

  /**
   * 璐?拱鏃ユ湡
   */
  purchaseDate: string;

  /**
   * 鐢甸噺(MWh)
   */
  electricityAmount: number;

  /**
   * 缁胯瘉閲?寮?
   */
  certificateAmount: number;

  /**
   * 鍗曚环
   */
  pricePerUnit: number;

  /**
   * 鎬讳环
   */
  totalPrice: number;

  /**
   * 渚涘簲鍟
   */
  supplier: string;

  /**
   * 鏈夋晥鏈熻捣
   */
  validFrom: string | number;

  /**
   * 鏈夋晥鏈熸?
   */
  validTo: string | number;

  /**
   * 鍑忔帓閲?tCO2e)
   */
  emissionReduction: number;

  /**
   * 鎵╁睍瀛楁?JSON
   */
  extendJson: string;

  /**
   * 澶囨敞
   */
  remark: string;

}

export interface GreenElectricityForm extends BaseEntity {
  /**
   * 涓婚敭
   */
  id?: string | number;

  /**
   * 缁胯瘉缂栫爜
   */
  certificateCode?: string;

  /**
   * 绫诲瀷(缁跨數/缁胯瘉/纰虫姷娑?
   */
  certificateType?: string;

  /**
   * 璐?拱鏃ユ湡
   */
  purchaseDate?: string;

  /**
   * 鐢甸噺(MWh)
   */
  electricityAmount?: number;

  /**
   * 缁胯瘉閲?寮?
   */
  certificateAmount?: number;

  /**
   * 鍗曚环
   */
  pricePerUnit?: number;

  /**
   * 鎬讳环
   */
  totalPrice?: number;

  /**
   * 渚涘簲鍟
   */
  supplier?: string;

  /**
   * 鏈夋晥鏈熻捣
   */
  validFrom?: string | number;

  /**
   * 鏈夋晥鏈熸?
   */
  validTo?: string | number;

  /**
   * 鍑忔帓閲?tCO2e)
   */
  emissionReduction?: number;

  /**
   * 鎵╁睍瀛楁?JSON
   */
  extendJson?: string;

  /**
   * 澶囨敞
   */
  remark?: string;

}

export interface GreenElectricityQuery extends PageQuery {

  /**
   * 缁胯瘉缂栫爜
   */
  certificateCode?: string;

  /**
   * 绫诲瀷(缁跨數/缁胯瘉/纰虫姷娑?
   */
  certificateType?: string;

  /**
   * 璐?拱鏃ユ湡
   */
  purchaseDate?: string;

  /**
   * 鐢甸噺(MWh)
   */
  electricityAmount?: number;

  /**
   * 缁胯瘉閲?寮?
   */
  certificateAmount?: number;

  /**
   * 鍗曚环
   */
  pricePerUnit?: number;

  /**
   * 鎬讳环
   */
  totalPrice?: number;

  /**
   * 渚涘簲鍟
   */
  supplier?: string;

  /**
   * 鏈夋晥鏈熻捣
   */
  validFrom?: string | number;

  /**
   * 鏈夋晥鏈熸?
   */
  validTo?: string | number;

  /**
   * 鍑忔帓閲?tCO2e)
   */
  emissionReduction?: number;

  /**
   * 鎵╁睍瀛楁?JSON
   */
  extendJson?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
