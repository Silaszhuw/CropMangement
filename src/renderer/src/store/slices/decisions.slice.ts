/** 决策状态切片：管理决策的状态和异步操作 */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { Decision } from '../../../../shared/types/database'
import type {
  CreateDecisionInput,
  UpdateDecisionInput
} from '../../../../main/database/repositories/decisions-repository'
import { cropModelingApi } from '../../services/ipc-client'

interface DecisionsState {
  items: Decision[]
  loading: boolean
  submitting: boolean
  error: string | null
}

const initialState: DecisionsState = {
  items: [],
  loading: false,
  submitting: false,
  error: null
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '未知错误'
}

export const fetchDecisions = createAsyncThunk('decisions/fetchAll', async () => {
  const response = await cropModelingApi.decisions.list()
  if (!response.success) {
    throw new Error(response.error)
  }

  return response.data
})

export const createDecision = createAsyncThunk('decisions/create', async (input: CreateDecisionInput) => {
  const response = await cropModelingApi.decisions.create(input)
  if (!response.success) {
    throw new Error(response.error)
  }

  return response.data
})

export const updateDecision = createAsyncThunk('decisions/update', async (input: UpdateDecisionInput) => {
  const response = await cropModelingApi.decisions.update(input)
  if (!response.success) {
    throw new Error(response.error)
  }

  return response.data
})

export const deleteDecision = createAsyncThunk('decisions/delete', async (id: number) => {
  const response = await cropModelingApi.decisions.remove(id)
  if (!response.success) {
    throw new Error(response.error)
  }

  return id
})

const decisionsSlice = createSlice({
  name: 'decisions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDecisions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDecisions.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchDecisions.rejected, (state, action) => {
        state.loading = false
        state.error = getErrorMessage(action.error)
      })
      .addCase(createDecision.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(createDecision.fulfilled, (state, action) => {
        state.submitting = false
        state.items.unshift(action.payload)
      })
      .addCase(createDecision.rejected, (state, action) => {
        state.submitting = false
        state.error = getErrorMessage(action.error)
      })
      .addCase(updateDecision.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(updateDecision.fulfilled, (state, action) => {
        state.submitting = false
        state.items = state.items.map((item) => (item.id === action.payload.id ? action.payload : item))
      })
      .addCase(updateDecision.rejected, (state, action) => {
        state.submitting = false
        state.error = getErrorMessage(action.error)
      })
      .addCase(deleteDecision.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(deleteDecision.fulfilled, (state, action) => {
        state.submitting = false
        state.items = state.items.filter((item) => item.id !== action.payload)
      })
      .addCase(deleteDecision.rejected, (state, action) => {
        state.submitting = false
        state.error = getErrorMessage(action.error)
      })
  }
})

export default decisionsSlice.reducer
