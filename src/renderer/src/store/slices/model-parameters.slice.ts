/** 模型参数状态切片：管理模型参数的状态和异步操作 */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { ModelParameter } from '../../../../shared/types/database'
import type {
  CreateModelParameterInput,
  ResetModelParameterInput,
  UpdateModelParameterInput
} from '../../../../main/database/repositories/model-parameters-repository'
import { cropModelingApi } from '../../services/ipc-client'

interface ModelParametersState {
  items: ModelParameter[]
  loading: boolean
  submitting: boolean
  error: string | null
}

const initialState: ModelParametersState = {
  items: [],
  loading: false,
  submitting: false,
  error: null
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '未知错误'
}

export const fetchModelParameters = createAsyncThunk('modelParameters/fetchAll', async () => {
  const response = await cropModelingApi.modelParameters.list()
  if (!response.success) {
    throw new Error(response.error)
  }

  return response.data
})

export const createModelParameter = createAsyncThunk('modelParameters/create', async (input: CreateModelParameterInput) => {
  const response = await cropModelingApi.modelParameters.create(input)
  if (!response.success) {
    throw new Error(response.error)
  }

  return response.data
})

export const updateModelParameter = createAsyncThunk('modelParameters/update', async (input: UpdateModelParameterInput) => {
  const response = await cropModelingApi.modelParameters.update(input)
  if (!response.success) {
    throw new Error(response.error)
  }

  return response.data
})

export const deleteModelParameter = createAsyncThunk('modelParameters/delete', async (id: number) => {
  const response = await cropModelingApi.modelParameters.remove(id)
  if (!response.success) {
    throw new Error(response.error)
  }

  return id
})

export const resetModelParameterToDefault = createAsyncThunk(
  'modelParameters/resetToDefault',
  async (input: ResetModelParameterInput) => {
    const response = await cropModelingApi.modelParameters.resetToDefault(input)
    if (!response.success) {
      throw new Error(response.error)
    }

    return response.data
  }
)

const modelParametersSlice = createSlice({
  name: 'modelParameters',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchModelParameters.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchModelParameters.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchModelParameters.rejected, (state, action) => {
        state.loading = false
        state.error = getErrorMessage(action.error)
      })
      .addCase(createModelParameter.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(createModelParameter.fulfilled, (state, action) => {
        state.submitting = false
        state.items.push(action.payload)
      })
      .addCase(createModelParameter.rejected, (state, action) => {
        state.submitting = false
        state.error = getErrorMessage(action.error)
      })
      .addCase(updateModelParameter.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(updateModelParameter.fulfilled, (state, action) => {
        state.submitting = false
        state.items = state.items.map((item) => (item.id === action.payload.id ? action.payload : item))
      })
      .addCase(updateModelParameter.rejected, (state, action) => {
        state.submitting = false
        state.error = getErrorMessage(action.error)
      })
      .addCase(deleteModelParameter.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(deleteModelParameter.fulfilled, (state, action) => {
        state.submitting = false
        state.items = state.items.filter((item) => item.id !== action.payload)
      })
      .addCase(deleteModelParameter.rejected, (state, action) => {
        state.submitting = false
        state.error = getErrorMessage(action.error)
      })
      .addCase(resetModelParameterToDefault.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(resetModelParameterToDefault.fulfilled, (state, action) => {
        state.submitting = false
        state.items = state.items.map((item) => (item.id === action.payload.id ? action.payload : item))
      })
      .addCase(resetModelParameterToDefault.rejected, (state, action) => {
        state.submitting = false
        state.error = getErrorMessage(action.error)
      })
  }
})

export default modelParametersSlice.reducer
