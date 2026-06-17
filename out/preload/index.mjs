import { contextBridge, ipcRenderer } from "electron";
const IPC_CHANNELS = {
  fields: {
    list: "fields:list",
    getById: "fields:getById",
    create: "fields:create",
    update: "fields:update",
    remove: "fields:remove"
  },
  cropVarieties: {
    list: "cropVarieties:list",
    getById: "cropVarieties:getById",
    create: "cropVarieties:create",
    update: "cropVarieties:update",
    remove: "cropVarieties:remove"
  },
  plantingRecords: {
    list: "plantingRecords:list",
    getById: "plantingRecords:getById",
    create: "plantingRecords:create",
    update: "plantingRecords:update",
    remove: "plantingRecords:remove"
  }
};
const cropModelingApi = {
  version: "0.1.0",
  fields: {
    list: () => ipcRenderer.invoke(IPC_CHANNELS.fields.list),
    getById: (id) => ipcRenderer.invoke(IPC_CHANNELS.fields.getById, id),
    create: (input) => ipcRenderer.invoke(IPC_CHANNELS.fields.create, input),
    update: (input) => ipcRenderer.invoke(IPC_CHANNELS.fields.update, input),
    remove: (id) => ipcRenderer.invoke(IPC_CHANNELS.fields.remove, id)
  },
  cropVarieties: {
    list: () => ipcRenderer.invoke(IPC_CHANNELS.cropVarieties.list),
    getById: (id) => ipcRenderer.invoke(IPC_CHANNELS.cropVarieties.getById, id),
    create: (input) => ipcRenderer.invoke(IPC_CHANNELS.cropVarieties.create, input),
    update: (input) => ipcRenderer.invoke(IPC_CHANNELS.cropVarieties.update, input),
    remove: (id) => ipcRenderer.invoke(IPC_CHANNELS.cropVarieties.remove, id)
  },
  plantingRecords: {
    list: () => ipcRenderer.invoke(IPC_CHANNELS.plantingRecords.list),
    getById: (id) => ipcRenderer.invoke(IPC_CHANNELS.plantingRecords.getById, id),
    create: (input) => ipcRenderer.invoke(IPC_CHANNELS.plantingRecords.create, input),
    update: (input) => ipcRenderer.invoke(IPC_CHANNELS.plantingRecords.update, input),
    remove: (id) => ipcRenderer.invoke(IPC_CHANNELS.plantingRecords.remove, id)
  }
};
contextBridge.exposeInMainWorld("cropModeling", cropModelingApi);
