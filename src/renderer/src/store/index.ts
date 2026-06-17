import { configureStore, createSlice } from '@reduxjs/toolkit'
import cropVarietiesReducer from './slices/crop-varieties.slice'
import fieldsReducer from './slices/fields.slice'
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
    plantingRecords: plantingRecordsReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
