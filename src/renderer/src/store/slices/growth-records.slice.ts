/** 生长记录状态切片：管理生长记录的状态和异步操作 */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { GrowthRecord } from '../../../../shared/types/database'
import type {
  CreateGrowthRecordInput,
  UpdateGrowthRecordInput
} from '../../../../main/database/repositories/growth-records-repository'
import { cropModelingApi } from '../../services/ipc-client'

interface GrowthRecordsState {
  items: GrowthRecord[]
  loading: boolean
  submitting: boolean
  error: string | null
}

const initialState: GrowthRecordsState = {
  items: [],
  loading: false,
  submitting: false,
  error: null
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '未知错误'
}

export const fetchGrowthRecordsByPlantingRecordId = createAsyncThunk(
  'growthRecords/fetchByPlantingRecordId',
  async (plantingRecordId: number) => {
    const response = await cropModelingApi.growthRecords.listByPlantingRecordId(plantingRecordId)
    if (!response.success) {
      throw new Error(response.error)
    }

    return response.data
  }
)

export const createGrowthRecord = createAsyncThunk('growthRecords/create', async (input: CreateGrowthRecordInput) => {
  const response = await cropModelingApi.growthRecords.create(input)
  if (!response.success) {
    throw new Error(response.error)
  }

  return response.data
})

export const updateGrowthRecord = createAsyncThunk('growthRecords/update', async (input: UpdateGrowthRecordInput) => {
  const response = await cropModelingApi.growthRecords.update(input)
  if (!response.success) {
    throw new Error(response.error)
  }

  return response.data
})

export const deleteGrowthRecord = createAsyncThunk('growthRecords/delete', async (id: number) => {
  const response = await cropModelingApi.growthRecords.remove(id)
  if (!response.success) {
    throw new Error(response.error)
  }

  return id
})

const growthRecordsSlice = createSlice({
  name: 'growthRecords',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGrowthRecordsByPlantingRecordId.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchGrowthRecordsByPlantingRecordId.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchGrowthRecordsByPlantingRecordId.rejected, (state, action) => {
        state.loading = false
        state.error = getErrorMessage(action.error)
      })
      .addCase(createGrowthRecord.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(createGrowthRecord.fulfilled, (state, action) => {
        state.submitting = false
        state.items.unshift(action.payload)
      })
      .addCase(createGrowthRecord.rejected, (state, action) => {
        state.submitting = false
        state.error = getErrorMessage(action.error)
      })
      .addCase(updateGrowthRecord.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(updateGrowthRecord.fulfilled, (state, action) => {
        state.submitting = false
        state.items = state.items.map((item) => (item.id === action.payload.id ? action.payload : item))
      })
      .addCase(updateGrowthRecord.rejected, (state, action) => {
        state.submitting = false
        state.error = getErrorMessage(action.error)
      })
      .addCase(deleteGrowthRecord.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(deleteGrowthRecord.fulfilled, (state, action) => {
        state.submitting = false
        state.items = state.items.filter((item) => item.id !== action.payload)
      })
      .addCase(deleteGrowthRecord.rejected, (state, action) => {
        state.submitting = false
        state.error = getErrorMessage(action.error)
      })
  }
})

export default growthRecordsSlice.reducer
