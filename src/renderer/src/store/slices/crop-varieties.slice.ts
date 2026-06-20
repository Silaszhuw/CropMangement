/** 作物品种状态切片：管理作物品种的状态和异步操作 */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { CropVariety } from '../../../../shared/types/database'
import type {
  CreateCropVarietyInput,
  UpdateCropVarietyInput
} from '../../../../main/database/repositories/crop-varieties-repository'
import { cropModelingApi } from '../../services/ipc-client'

interface CropVarietiesState {
  items: CropVariety[]
  loading: boolean
  submitting: boolean
  error: string | null
}

const initialState: CropVarietiesState = {
  items: [],
  loading: false,
  submitting: false,
  error: null
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '未知错误'
}

export const fetchCropVarieties = createAsyncThunk('cropVarieties/fetchAll', async () => {
  const response = await cropModelingApi.cropVarieties.list()
  if (!response.success) {
    throw new Error(response.error)
  }

  return response.data
})

export const createCropVariety = createAsyncThunk(
  'cropVarieties/create',
  async (input: CreateCropVarietyInput) => {
    const response = await cropModelingApi.cropVarieties.create(input)
    if (!response.success) {
      throw new Error(response.error)
    }

    return response.data
  }
)

export const updateCropVariety = createAsyncThunk(
  'cropVarieties/update',
  async (input: UpdateCropVarietyInput) => {
    const response = await cropModelingApi.cropVarieties.update(input)
    if (!response.success) {
      throw new Error(response.error)
    }

    return response.data
  }
)

export const deleteCropVariety = createAsyncThunk('cropVarieties/delete', async (id: number) => {
  const response = await cropModelingApi.cropVarieties.remove(id)
  if (!response.success) {
    throw new Error(response.error)
  }

  return id
})

const cropVarietiesSlice = createSlice({
  name: 'cropVarieties',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCropVarieties.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCropVarieties.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchCropVarieties.rejected, (state, action) => {
        state.loading = false
        state.error = getErrorMessage(action.error)
      })
      .addCase(createCropVariety.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(createCropVariety.fulfilled, (state, action) => {
        state.submitting = false
        state.items.unshift(action.payload)
      })
      .addCase(createCropVariety.rejected, (state, action) => {
        state.submitting = false
        state.error = getErrorMessage(action.error)
      })
      .addCase(updateCropVariety.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(updateCropVariety.fulfilled, (state, action) => {
        state.submitting = false
        state.items = state.items.map((item) => (item.id === action.payload.id ? action.payload : item))
      })
      .addCase(updateCropVariety.rejected, (state, action) => {
        state.submitting = false
        state.error = getErrorMessage(action.error)
      })
      .addCase(deleteCropVariety.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(deleteCropVariety.fulfilled, (state, action) => {
        state.submitting = false
        state.items = state.items.filter((item) => item.id !== action.payload)
      })
      .addCase(deleteCropVariety.rejected, (state, action) => {
        state.submitting = false
        state.error = getErrorMessage(action.error)
      })
  }
})

export default cropVarietiesSlice.reducer
