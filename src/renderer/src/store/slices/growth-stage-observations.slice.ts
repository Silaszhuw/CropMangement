/** 生长阶段观测状态切片：管理生长阶段观测的状态和异步操作 */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { GrowthStageObservation } from '../../../../shared/types/database'
import type {
  CreateGrowthStageObservationInput,
  UpdateGrowthStageObservationInput
} from '../../../../main/database/repositories/growth-stage-observations-repository'
import { cropModelingApi } from '../../services/ipc-client'

interface GrowthStageObservationsState {
  items: GrowthStageObservation[]
  loading: boolean
  submitting: boolean
  error: string | null
}

const initialState: GrowthStageObservationsState = {
  items: [],
  loading: false,
  submitting: false,
  error: null
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '未知错误'
}

export const fetchGrowthStageObservationsByPlantingRecordId = createAsyncThunk(
  'growthStageObservations/fetchByPlantingRecordId',
  async (plantingRecordId: number) => {
    const response = await cropModelingApi.growthStageObservations.listByPlantingRecordId(plantingRecordId)
    if (!response.success) {
      throw new Error(response.error)
    }

    return response.data
  }
)

export const createGrowthStageObservation = createAsyncThunk(
  'growthStageObservations/create',
  async (input: CreateGrowthStageObservationInput) => {
    const response = await cropModelingApi.growthStageObservations.create(input)
    if (!response.success) {
      throw new Error(response.error)
    }

    return response.data
  }
)

export const updateGrowthStageObservation = createAsyncThunk(
  'growthStageObservations/update',
  async (input: UpdateGrowthStageObservationInput) => {
    const response = await cropModelingApi.growthStageObservations.update(input)
    if (!response.success) {
      throw new Error(response.error)
    }

    return response.data
  }
)

export const deleteGrowthStageObservation = createAsyncThunk(
  'growthStageObservations/delete',
  async (id: number) => {
    const response = await cropModelingApi.growthStageObservations.remove(id)
    if (!response.success) {
      throw new Error(response.error)
    }

    return id
  }
)

const growthStageObservationsSlice = createSlice({
  name: 'growthStageObservations',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGrowthStageObservationsByPlantingRecordId.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchGrowthStageObservationsByPlantingRecordId.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchGrowthStageObservationsByPlantingRecordId.rejected, (state, action) => {
        state.loading = false
        state.error = getErrorMessage(action.error)
      })
      .addCase(createGrowthStageObservation.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(createGrowthStageObservation.fulfilled, (state, action) => {
        state.submitting = false
        state.items.unshift(action.payload)
      })
      .addCase(createGrowthStageObservation.rejected, (state, action) => {
        state.submitting = false
        state.error = getErrorMessage(action.error)
      })
      .addCase(updateGrowthStageObservation.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(updateGrowthStageObservation.fulfilled, (state, action) => {
        state.submitting = false
        state.items = state.items.map((item) => (item.id === action.payload.id ? action.payload : item))
      })
      .addCase(updateGrowthStageObservation.rejected, (state, action) => {
        state.submitting = false
        state.error = getErrorMessage(action.error)
      })
      .addCase(deleteGrowthStageObservation.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(deleteGrowthStageObservation.fulfilled, (state, action) => {
        state.submitting = false
        state.items = state.items.filter((item) => item.id !== action.payload)
      })
      .addCase(deleteGrowthStageObservation.rejected, (state, action) => {
        state.submitting = false
        state.error = getErrorMessage(action.error)
      })
  }
})

export default growthStageObservationsSlice.reducer
