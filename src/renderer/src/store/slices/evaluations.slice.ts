/** 评价状态切片：管理评价的状态和异步操作 */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { Evaluation } from '../../../../shared/types/database'
import type {
  CreateEvaluationInput,
  UpdateEvaluationInput
} from '../../../../main/database/repositories/evaluations-repository'
import { cropModelingApi } from '../../services/ipc-client'

interface EvaluationsState {
  items: Evaluation[]
  loading: boolean
  submitting: boolean
  error: string | null
}

const initialState: EvaluationsState = {
  items: [],
  loading: false,
  submitting: false,
  error: null
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '未知错误'
}

export const fetchEvaluationsByPlantingRecordId = createAsyncThunk(
  'evaluations/fetchByPlantingRecordId',
  async (plantingRecordId: number) => {
    const response = await cropModelingApi.evaluations.listByPlantingRecordId(plantingRecordId)
    if (!response.success) {
      throw new Error(response.error)
    }

    return response.data
  }
)

export const createEvaluation = createAsyncThunk('evaluations/create', async (input: CreateEvaluationInput) => {
  const response = await cropModelingApi.evaluations.create(input)
  if (!response.success) {
    throw new Error(response.error)
  }

  return response.data
})

export const updateEvaluation = createAsyncThunk('evaluations/update', async (input: UpdateEvaluationInput) => {
  const response = await cropModelingApi.evaluations.update(input)
  if (!response.success) {
    throw new Error(response.error)
  }

  return response.data
})

export const deleteEvaluation = createAsyncThunk('evaluations/delete', async (id: number) => {
  const response = await cropModelingApi.evaluations.remove(id)
  if (!response.success) {
    throw new Error(response.error)
  }

  return id
})

const evaluationsSlice = createSlice({
  name: 'evaluations',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvaluationsByPlantingRecordId.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEvaluationsByPlantingRecordId.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchEvaluationsByPlantingRecordId.rejected, (state, action) => {
        state.loading = false
        state.error = getErrorMessage(action.error)
      })
      .addCase(createEvaluation.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(createEvaluation.fulfilled, (state, action) => {
        state.submitting = false
        state.items.unshift(action.payload)
      })
      .addCase(createEvaluation.rejected, (state, action) => {
        state.submitting = false
        state.error = getErrorMessage(action.error)
      })
      .addCase(updateEvaluation.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(updateEvaluation.fulfilled, (state, action) => {
        state.submitting = false
        state.items = state.items.map((item) => (item.id === action.payload.id ? action.payload : item))
      })
      .addCase(updateEvaluation.rejected, (state, action) => {
        state.submitting = false
        state.error = getErrorMessage(action.error)
      })
      .addCase(deleteEvaluation.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(deleteEvaluation.fulfilled, (state, action) => {
        state.submitting = false
        state.items = state.items.filter((item) => item.id !== action.payload)
      })
      .addCase(deleteEvaluation.rejected, (state, action) => {
        state.submitting = false
        state.error = getErrorMessage(action.error)
      })
  }
})

export default evaluationsSlice.reducer
