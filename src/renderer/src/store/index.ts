/** Redux Store：配置和导出全局状态管理 store */
import { configureStore, createSlice } from '@reduxjs/toolkit'
import appSettingsReducer from './slices/app-settings.slice'
import cropVarietiesReducer from './slices/crop-varieties.slice'
import decisionsReducer from './slices/decisions.slice'
import evaluationsReducer from './slices/evaluations.slice'
import fieldsReducer from './slices/fields.slice'
import growthStageObservationsReducer from './slices/growth-stage-observations.slice'
import growthRecordsReducer from './slices/growth-records.slice'
import knowledgeItemsReducer from './slices/knowledge-items.slice'
import modelParametersReducer from './slices/model-parameters.slice'
import operationRecordsReducer from './slices/operation-records.slice'
import parameterAdjustmentRecordsReducer from './slices/parameter-adjustment-records.slice'
import plantingRecordsReducer from './slices/planting-records.slice'

const appSlice = createSlice({
  name: 'app',
  initialState: {
    initialized: true
  },
  reducers: {}
})

export const store = configureStore({
  reducer: {
    app: appSlice.reducer,
    fields: fieldsReducer,
    cropVarieties: cropVarietiesReducer,
    plantingRecords: plantingRecordsReducer,
    growthRecords: growthRecordsReducer,
    growthStageObservations: growthStageObservationsReducer,
    operationRecords: operationRecordsReducer,
    evaluations: evaluationsReducer,
    knowledgeItems: knowledgeItemsReducer,
    decisions: decisionsReducer,
    appSettings: appSettingsReducer,
    modelParameters: modelParametersReducer,
    parameterAdjustmentRecords: parameterAdjustmentRecordsReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
