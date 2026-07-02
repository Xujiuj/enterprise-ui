export interface FlowTaskButtonVO {
  code?: string;
  show?: boolean;
}

export interface FlowCopyVo {
  userId?: string | number;
  nickName?: string;
  [key: string]: any;
}

export interface FlowTaskVO {
  id?: string | number;
  createTime?: string;
  updateTime?: string;
  tenantId?: string | number;
  definitionId?: string | number;
  instanceId?: string | number;
  flowName?: string;
  businessId?: string | number;
  nodeCode?: string;
  nodeName?: string;
  flowCode?: string;
  flowStatus?: string;
  formCustom?: string;
  formPath?: string;
  nodeType?: string;
  nodeRatio?: string | number;
  version?: string | number;
  applyNode?: boolean;
  buttonList?: FlowTaskButtonVO[];
  copyList?: FlowCopyVo[];
  varList?: Map<string, string>;
  businessCode?: string;
  businessTitle?: string;
  [key: string]: any;
}

export interface TaskOperationBo {
  taskId?: string | number;
  userId?: string | number;
  userIds?: Array<string | number>;
  message?: string;
  messageType?: string[];
  [key: string]: any;
}
