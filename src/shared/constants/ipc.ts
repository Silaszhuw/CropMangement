/** IPC 通道常量定义：定义主进程与渲染进程通信的通道名称 */
export const IPC_CHANNELS = {
  fields: {
    list: 'fields:list',
    getById: 'fields:getById',
    create: 'fields:create',
    update: 'fields:update',
    remove: 'fields:remove'
  },
  cropVarieties: {
    list: 'cropVarieties:list',
    getById: 'cropVarieties:getById',
    create: 'cropVarieties:create',
    update: 'cropVarieties:update',
    remove: 'cropVarieties:remove'
  },
  plantingRecords: {
    list: 'plantingRecords:list',
    getById: 'plantingRecords:getById',
    create: 'plantingRecords:create',
    update: 'plantingRecords:update',
    remove: 'plantingRecords:remove'
  },
  growthRecords: {
    listByPlantingRecordId: 'growthRecords:listByPlantingRecordId',
    getById: 'growthRecords:getById',
    create: 'growthRecords:create',
    update: 'growthRecords:update',
    remove: 'growthRecords:remove'
  },
  operationRecords: {
    listByPlantingRecordId: 'operationRecords:listByPlantingRecordId',
    getById: 'operationRecords:getById',
    create: 'operationRecords:create',
    update: 'operationRecords:update',
    remove: 'operationRecords:remove'
  },
  evaluations: {
    listByPlantingRecordId: 'evaluations:listByPlantingRecordId',
    getById: 'evaluations:getById',
    create: 'evaluations:create',
    update: 'evaluations:update',
    remove: 'evaluations:remove'
  },
  knowledgeItems: {
    list: 'knowledgeItems:list',
    getById: 'knowledgeItems:getById',
    create: 'knowledgeItems:create',
    update: 'knowledgeItems:update',
    remove: 'knowledgeItems:remove'
  },
  decisions: {
    list: 'decisions:list',
    getById: 'decisions:getById',
    create: 'decisions:create',
    update: 'decisions:update',
    remove: 'decisions:remove'
  },
  appSettings: {
    list: 'appSettings:list',
    getById: 'appSettings:getById',
    create: 'appSettings:create',
    update: 'appSettings:update',
    remove: 'appSettings:remove'
  },
  modelParameters: {
    list: 'modelParameters:list',
    getById: 'modelParameters:getById',
    create: 'modelParameters:create',
    update: 'modelParameters:update',
    remove: 'modelParameters:remove',
    resetToDefault: 'modelParameters:resetToDefault'
  },
  growthStageObservations: {
    list: 'growthStageObservations:list',
    listByPlantingRecordId: 'growthStageObservations:listByPlantingRecordId',
    getById: 'growthStageObservations:getById',
    create: 'growthStageObservations:create',
    update: 'growthStageObservations:update',
    remove: 'growthStageObservations:remove'
  },
  parameterAdjustmentRecords: {
    list: 'parameterAdjustmentRecords:list',
    listByParameterId: 'parameterAdjustmentRecords:listByParameterId'
  }
} as const
