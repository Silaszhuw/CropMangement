import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PlantingRecord } from '../../../../shared/types/database'
import type {
  CreatePlantingRecordInput,
  UpdatePlantingRecordInput
} from '../../../../main/database/repositories/planting-records-repository'
import { cropModelingApi } from '../../services/ipc-client'

interface PlantingRecordsState {
  items: PlantingRecord[]
  loading: boolean
  submitting: boolean
  error: string | null
}

const initialState: PlantingRecordsState = {
  items: [],
  loading: false,
  submitting: false,
  error: null
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '未知错误'
}

export const fetchPlantingRecords = createAsyncThunk('plantingRecords/fetchAll', async () => {
  const response = await cropModelingApi.plantingRecords.list()
  if (!response.success) {
    throw new Error(response.error)
  }

  return response.data
})

export const createPlantingRecord = createAsyncThunk(
  'plantingRecords/create',
  async (input: CreatePlantingRecordInput) => {
    const response = await cropModelingApi.plantingRecords.create(input)
    if (!response.success) {
      throw new Error(response.error)
    }

    return response.data
  }
)

export const updatePlantingRecord = createAsyncThunk(
  'plantingRecords/update',
  async (input: UpdatePlantingRecordInput) => {
    const response = await cropModelingApi.plantingRecords.update(input)
    if (!response.success) {
      throw new Error(response.error)
    }

    return response.data
  }
)

export const deletePlantingRecord = createAsyncThunk('plantingRecords/delete', async (id: number) => {
  const response = await cropModelingApi.plantingRecords.remove(id)
  if (!response.success) {
    throw new Error(response.error)
  }

  return id
})

const plantingRecordsSlice = createSlice({
  name: 'plantingRecords',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlantingRecords.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPlantingRecords.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchPlantingRecords.rejected, (state, action) => {
        state.loading = false
        state.error = getErrorMessage(action.error)
      })
      .addCase(createPlantingRecord.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(createPlantingRecord.fulfilled, (state, action) => {
        state.submitting = false
        state.items.unshift(action.payload)
      })
      .addCase(createPlantingRecord.rejected, (state, action) => {
        state.submitting = false
        state.error = getErrorMessage(action.error)
      })
      .addCase(updatePlantingRecord.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(updatePlantingRecord.fulfilled, (state, action) => {
        state.submitting = false
        state.items = state.items.map((item) => (item.id === action.payload.id ? action.payload : item))
      })
      .addCase(updatePlantingRecord.rejected, (state, action) => {
        state.submitting = false
        state.error = getErrorMessage(action.error)
      })
      .addCase(deletePlantingRecord.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(deletePlantingRecord.fulfilled, (state, action) => {
        state.submitting = false
        state.items = state.items.filter((item) => item.id !== action.payload)
      })
      .addCase(deletePlantingRecord.rejected, (state, action) => {
        state.submitting = false
        state.error = getErrorMessage(action.error)
      })
  }
})

export default plantingRecordsSlice.reducer
