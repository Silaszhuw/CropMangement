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
  }
} as const
