export interface FactorLibraryVO {
  /**
   * 涓婚敭
   */
  id: string | number;

  /**
   * 鍥犲瓙缂栫爜
   */
  factorCode: string;

  /**
   * 鍥犲瓙鍚嶇О
   */
  factorName: string;

  /**
   * 鍥犲瓙鍒嗙被(鐢靛姏/鐑?姏/鐕冩枡/浜ら?/搴熷純鐗?鍒跺喎鍓?
   */
  factorCategory: string;

  /**
   * 鍥犲瓙鍊
   */
  factorValue: number;

  /**
   * 鍥犲瓙鍗曚綅
   */
  factorUnit: string;

  /**
   * 閫傜敤鍖哄煙(鍏ㄥ浗/鍗庝笢/鍗庡寳/鍗庡崡/鍗庝腑/瑗垮寳/瑗垮崡/涓滃寳)
   */
  region: string;

  /**
   * 閫傜敤骞翠唤
   */
  factorYear: string;

  /**
   * 鍏ㄧ悆鍙樻殩娼滃娍GWP
   */
  gwpValue: number;

  /**
   * 鏁版嵁鏉ユ簮(IPCC/鍥藉?鍙戞敼濮?鍥介檯鑳芥簮缃?
   */
  dataSource: string;

  /**
   * 鏄?惁鍙戝竷(0鑽夌? 1宸插彂甯?2宸插喕缁?
   */
  isPublished: string;

  /**
   * 鍙戝竷鏃堕棿
   */
  publishedTime: string;

  /**
   * 澶囨敞
   */
  remark: string;

}

export interface FactorLibraryForm extends BaseEntity {
  /**
   * 涓婚敭
   */
  id?: string | number;

  /**
   * 鍥犲瓙缂栫爜
   */
  factorCode?: string;

  /**
   * 鍥犲瓙鍚嶇О
   */
  factorName?: string;

  /**
   * 鍥犲瓙鍒嗙被(鐢靛姏/鐑?姏/鐕冩枡/浜ら?/搴熷純鐗?鍒跺喎鍓?
   */
  factorCategory?: string;

  /**
   * 鍥犲瓙鍊
   */
  factorValue?: number;

  /**
   * 鍥犲瓙鍗曚綅
   */
  factorUnit?: string;

  /**
   * 閫傜敤鍖哄煙(鍏ㄥ浗/鍗庝笢/鍗庡寳/鍗庡崡/鍗庝腑/瑗垮寳/瑗垮崡/涓滃寳)
   */
  region?: string;

  /**
   * 閫傜敤骞翠唤
   */
  factorYear?: string;

  /**
   * 鍏ㄧ悆鍙樻殩娼滃娍GWP
   */
  gwpValue?: number;

  /**
   * 鏁版嵁鏉ユ簮(IPCC/鍥藉?鍙戞敼濮?鍥介檯鑳芥簮缃?
   */
  dataSource?: string;

  /**
   * 鏄?惁鍙戝竷(0鑽夌? 1宸插彂甯?2宸插喕缁?
   */
  isPublished?: string;

  /**
   * 鍙戝竷鏃堕棿
   */
  publishedTime?: string;

  /**
   * 澶囨敞
   */
  remark?: string;

}

export interface FactorLibraryQuery extends PageQuery {

  /**
   * 鍥犲瓙缂栫爜
   */
  factorCode?: string;

  /**
   * 鍥犲瓙鍚嶇О
   */
  factorName?: string;

  /**
   * 鍥犲瓙鍒嗙被(鐢靛姏/鐑?姏/鐕冩枡/浜ら?/搴熷純鐗?鍒跺喎鍓?
   */
  factorCategory?: string;

  /**
   * 鍥犲瓙鍊
   */
  factorValue?: number;

  /**
   * 鍥犲瓙鍗曚綅
   */
  factorUnit?: string;

  /**
   * 閫傜敤鍖哄煙(鍏ㄥ浗/鍗庝笢/鍗庡寳/鍗庡崡/鍗庝腑/瑗垮寳/瑗垮崡/涓滃寳)
   */
  region?: string;

  /**
   * 閫傜敤骞翠唤
   */
  factorYear?: string;

  /**
   * 鍏ㄧ悆鍙樻殩娼滃娍GWP
   */
  gwpValue?: number;

  /**
   * 鏁版嵁鏉ユ簮(IPCC/鍥藉?鍙戞敼濮?鍥介檯鑳芥簮缃?
   */
  dataSource?: string;

  /**
   * 鏄?惁鍙戝竷(0鑽夌? 1宸插彂甯?2宸插喕缁?
   */
  isPublished?: string;

  /**
   * 鍙戝竷鏃堕棿
   */
  publishedTime?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
