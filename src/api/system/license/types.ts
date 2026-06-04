export interface LicenseVO {
  /**
   * 涓婚敭
   */
  id: string | number;

  /**
   * License鍞?竴鏍囪瘑
   */
  licenseId: string | number;

  /**
   * 鎺堟潈浼佷笟鍚嶇О
   */
  companyName: string;

  /**
   * 鐗堟湰(鍩虹?鐗?鏍囧噯鐗?涓撲笟鐗?
   */
  edition: string;

  /**
   * 鍔熻兘娓呭崟JSON
   */
  features: string;

  /**
   * 璁惧?鎸囩汗
   */
  installId: string | number;

  /**
   * 绛惧彂鏃ユ湡
   */
  issuedDate: string;

  /**
   * 鏈夋晥鏈熻捣
   */
  validFrom: string | number;

  /**
   * 鏈夋晥鏈熸?
   */
  validTo: string | number;

  /**
   * 鏈?ぇ鐢ㄦ埛鏁?-1涓嶉檺)
   */
  maxUsers: number;

  /**
   * 鐘舵?(0寰呮縺娲?1鏈夋晥 2鍗冲皢鍒版湡 3宸茶繃鏈?4宸插悐閿?
   */
  status: string;

  /**
   * 鏈?繎鏍￠獙鏃堕棿
   */
  lastCheckTime: string;

  /**
   * 澶囨敞
   */
  remark: string;

}

export interface LicenseForm extends BaseEntity {
  /**
   * 涓婚敭
   */
  id?: string | number;

  /**
   * License鍞?竴鏍囪瘑
   */
  licenseId?: string | number;

  /**
   * 鎺堟潈浼佷笟鍚嶇О
   */
  companyName?: string;

  /**
   * 鐗堟湰(鍩虹?鐗?鏍囧噯鐗?涓撲笟鐗?
   */
  edition?: string;

  /**
   * 鍔熻兘娓呭崟JSON
   */
  features?: string;

  /**
   * 璁惧?鎸囩汗
   */
  installId?: string | number;

  /**
   * 绛惧彂鏃ユ湡
   */
  issuedDate?: string;

  /**
   * 鏈夋晥鏈熻捣
   */
  validFrom?: string | number;

  /**
   * 鏈夋晥鏈熸?
   */
  validTo?: string | number;

  /**
   * 鏈?ぇ鐢ㄦ埛鏁?-1涓嶉檺)
   */
  maxUsers?: number;

  /**
   * 鐘舵?(0寰呮縺娲?1鏈夋晥 2鍗冲皢鍒版湡 3宸茶繃鏈?4宸插悐閿?
   */
  status?: string;

  /**
   * 鏈?繎鏍￠獙鏃堕棿
   */
  lastCheckTime?: string;

  /**
   * 澶囨敞
   */
  remark?: string;

}

export interface LicenseQuery extends PageQuery {

  /**
   * License鍞?竴鏍囪瘑
   */
  licenseId?: string | number;

  /**
   * 鎺堟潈浼佷笟鍚嶇О
   */
  companyName?: string;

  /**
   * 鐗堟湰(鍩虹?鐗?鏍囧噯鐗?涓撲笟鐗?
   */
  edition?: string;

  /**
   * 鍔熻兘娓呭崟JSON
   */
  features?: string;

  /**
   * 璁惧?鎸囩汗
   */
  installId?: string | number;

  /**
   * 绛惧彂鏃ユ湡
   */
  issuedDate?: string;

  /**
   * 鏈夋晥鏈熻捣
   */
  validFrom?: string | number;

  /**
   * 鏈夋晥鏈熸?
   */
  validTo?: string | number;

  /**
   * 鏈?ぇ鐢ㄦ埛鏁?-1涓嶉檺)
   */
  maxUsers?: number;

  /**
   * 鐘舵?(0寰呮縺娲?1鏈夋晥 2鍗冲皢鍒版湡 3宸茶繃鏈?4宸插悐閿?
   */
  status?: string;

  /**
   * 鏈?繎鏍￠獙鏃堕棿
   */
  lastCheckTime?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
