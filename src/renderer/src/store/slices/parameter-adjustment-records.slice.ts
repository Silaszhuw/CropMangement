/** 参数调整记录状态切片：管理参数调整记录的状态和异步操作 */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { ParameterAdjustmentRecord } from '../../../../shared/types/database'
import { cropModelingApi } from '../../services/ipc-client'

interface ParameterAdjustmentRecordsState {
  items: ParameterAdjustmentRecord[]
  loading: boolean
  error: string | null
}

const initialState: ParameterAdjustmentRecordsState = {
  items: [],
  loading: false,
  error: null
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '未知错误'
}

export const fetchParameterAdjustmentRecords = createAsyncThunk('parameterAdjustmentRecords/fetchAll', async () => {
  const response = await cropModelingApi.parameterAdjustmentRecords.list()
  if (!response.success) {
    throw new Error(response.error)
  }

  return response.data
})

const parameterAdjustmentRecordsSlice = createSlice({
  name: 'parameterAdjustmentRecords',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchParameterAdjustmentRecords.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchParameterAdjustmentRecords.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchParameterAdjustmentRecords.rejected, (state, action) => {
        state.loading = false
        state.error = getErrorMessage(action.error)
      })
  }
})

export default parameterAdjustmentRecordsSlice.reducer
