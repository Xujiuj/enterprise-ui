export interface FactorConfirmVO {
  /**
   * 涓婚敭
   */
  id: string | number;

  /**
   * 鎺掓斁婧怚D
   */
  sourceId: string | number;

  /**
   * 鍥犲瓙缂栫爜
   */
  factorCode: string;

  /**
   * 鍥犲瓙鍚嶇О
   */
  factorName: string;

  /**
   * 鍥犲瓙鍊
   */
  factorValue: number;

  /**
   * 鍥犲瓙鍗曚綅
   */
  factorUnit: string;

  /**
   * 鍥犲瓙鏉ユ簮(榛樿?鍊?鍘傚晢API/鎵嬪姩褰曞叆)
   */
  factorSource: string;

  /**
   * 鍥犲瓙鐗堟湰
   */
  factorVersion: string;

  /**
   * 閫傜敤骞翠唤
   */
  applicableYear: string;

  /**
   * 鍏ㄧ悆鍙樻殩娼滃娍GWP
   */
  gwpValue: number;

  /**
   * 纭??浜
   */
  confirmedBy: string;

  /**
   * 纭??鏃堕棿
   */
  confirmedTime: string;

  /**
   * 鐘舵?(0寰呯‘璁?1宸茬‘璁?2宸茶繃鏈?
   */
  status: string;

  /**
   * 澶囨敞
   */
  remark: string;

}

export interface FactorConfirmForm extends BaseEntity {
  /**
   * 涓婚敭
   */
  id?: string | number;

  /**
   * 鎺掓斁婧怚D
   */
  sourceId?: string | number;

  /**
   * 鍥犲瓙缂栫爜
   */
  factorCode?: string;

  /**
   * 鍥犲瓙鍚嶇О
   */
  factorName?: string;

  /**
   * 鍥犲瓙鍊
   */
  factorValue?: number;

  /**
   * 鍥犲瓙鍗曚綅
   */
  factorUnit?: string;

  /**
   * 鍥犲瓙鏉ユ簮(榛樿?鍊?鍘傚晢API/鎵嬪姩褰曞叆)
   */
  factorSource?: string;

  /**
   * 鍥犲瓙鐗堟湰
   */
  factorVersion?: string;

  /**
   * 閫傜敤骞翠唤
   */
  applicableYear?: string;

  /**
   * 鍏ㄧ悆鍙樻殩娼滃娍GWP
   */
  gwpValue?: number;

  /**
   * 纭??浜
   */
  confirmedBy?: string;

  /**
   * 纭??鏃堕棿
   */
  confirmedTime?: string;

  /**
   * 鐘舵?(0寰呯‘璁?1宸茬‘璁?2宸茶繃鏈?
   */
  status?: string;

  /**
   * 澶囨敞
   */
  remark?: string;

}

export interface FactorConfirmQuery extends PageQuery {

  /**
   * 鎺掓斁婧怚D
   */
  sourceId?: string | number;

  /**
   * 鍥犲瓙缂栫爜
   */
  factorCode?: string;

  /**
   * 鍥犲瓙鍚嶇О
   */
  factorName?: string;

  /**
   * 鍥犲瓙鍊
   */
  factorValue?: number;

  /**
   * 鍥犲瓙鍗曚綅
   */
  factorUnit?: string;

  /**
   * 鍥犲瓙鏉ユ簮(榛樿?鍊?鍘傚晢API/鎵嬪姩褰曞叆)
   */
  factorSource?: string;

  /**
   * 鍥犲瓙鐗堟湰
   */
  factorVersion?: string;

  /**
   * 閫傜敤骞翠唤
   */
  applicableYear?: string;

  /**
   * 鍏ㄧ悆鍙樻殩娼滃娍GWP
   */
  gwpValue?: number;

  /**
   * 纭??浜
   */
  confirmedBy?: string;

  /**
   * 纭??鏃堕棿
   */
  confirmedTime?: string;

  /**
   * 鐘舵?(0寰呯‘璁?1宸茬‘璁?2宸茶繃鏈?
   */
  status?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
