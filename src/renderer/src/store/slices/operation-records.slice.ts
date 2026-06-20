/** 操作记录状态切片：管理操作记录的状态和异步操作 */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { OperationRecord } from '../../../../shared/types/database'
import type {
  CreateOperationRecordInput,
  UpdateOperationRecordInput
} from '../../../../main/database/repositories/operation-records-repository'
import { cropModelingApi } from '../../services/ipc-client'

interface OperationRecordsState {
  items: OperationRecord[]
  loading: boolean
  submitting: boolean
  error: string | null
}

const initialState: OperationRecordsState = {
  items: [],
  loading: false,
  submitting: false,
  error: null
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '未知错误'
}

export const fetchOperationRecordsByPlantingRecordId = createAsyncThunk(
  'operationRecords/fetchByPlantingRecordId',
  async (plantingRecordId: number) => {
    const response = await cropModelingApi.operationRecords.listByPlantingRecordId(plantingRecordId)
    if (!response.success) {
      throw new Error(response.error)
    }

    return response.data
  }
)

export const createOperationRecord = createAsyncThunk(
  'operationRecords/create',
  async (input: CreateOperationRecordInput) => {
    const response = await cropModelingApi.operationRecords.create(input)
    if (!response.success) {
      throw new Error(response.error)
    }

    return response.data
  }
)

export const updateOperationRecord = createAsyncThunk(
  'operationRecords/update',
  async (input: UpdateOperationRecordInput) => {
    const response = await cropModelingApi.operationRecords.update(input)
    if (!response.success) {
      throw new Error(response.error)
    }

    return response.data
  }
)

export const deleteOperationRecord = createAsyncThunk('operationRecords/delete', async (id: number) => {
  const response = await cropModelingApi.operationRecords.remove(id)
  if (!response.success) {
    throw new Error(response.error)
  }

  return id
})

const operationRecordsSlice = createSlice({
  name: 'operationRecords',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOperationRecordsByPlantingRecordId.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOperationRecordsByPlantingRecordId.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchOperationRecordsByPlantingRecordId.rejected, (state, action) => {
        state.loading = false
        state.error = getErrorMessage(action.error)
      })
      .addCase(createOperationRecord.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(createOperationRecord.fulfilled, (state, action) => {
        state.submitting = false
        state.items.unshift(action.payload)
      })
      .addCase(createOperationRecord.rejected, (state, action) => {
        state.submitting = false
        state.error = getErrorMessage(action.error)
      })
      .addCase(updateOperationRecord.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(updateOperationRecord.fulfilled, (state, action) => {
        state.submitting = false
        state.items = state.items.map((item) => (item.id === action.payload.id ? action.payload : item))
      })
      .addCase(updateOperationRecord.rejected, (state, action) => {
        state.submitting = false
        state.error = getErrorMessage(action.error)
      })
      .addCase(deleteOperationRecord.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(deleteOperationRecord.fulfilled, (state, action) => {
        state.submitting = false
        state.items = state.items.filter((item) => item.id !== action.payload)
      })
      .addCase(deleteOperationRecord.rejected, (state, action) => {
        state.submitting = false
        state.error = getErrorMessage(action.error)
      })
  }
})

export default operationRecordsSlice.reducer
