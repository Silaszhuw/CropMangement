/** 应用设置状态切片：管理应用设置的状态和异步操作 */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { AppSetting } from '../../../../shared/types/database'
import type {
  CreateAppSettingInput,
  UpdateAppSettingInput
} from '../../../../main/database/repositories/app-settings-repository'
import { cropModelingApi } from '../../services/ipc-client'

interface AppSettingsState {
  items: AppSetting[]
  loading: boolean
  submitting: boolean
  error: string | null
}

const initialState: AppSettingsState = {
  items: [],
  loading: false,
  submitting: false,
  error: null
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '未知错误'
}

export const fetchAppSettings = createAsyncThunk('appSettings/fetchAll', async () => {
  const response = await cropModelingApi.appSettings.list()
  if (!response.success) {
    throw new Error(response.error)
  }

  return response.data
})

export const createAppSetting = createAsyncThunk('appSettings/create', async (input: CreateAppSettingInput) => {
  const response = await cropModelingApi.appSettings.create(input)
  if (!response.success) {
    throw new Error(response.error)
  }

  return response.data
})

export const updateAppSetting = createAsyncThunk('appSettings/update', async (input: UpdateAppSettingInput) => {
  const response = await cropModelingApi.appSettings.update(input)
  if (!response.success) {
    throw new Error(response.error)
  }

  return response.data
})

export const deleteAppSetting = createAsyncThunk('appSettings/delete', async (id: number) => {
  const response = await cropModelingApi.appSettings.remove(id)
  if (!response.success) {
    throw new Error(response.error)
  }

  return id
})

const appSettingsSlice = createSlice({
  name: 'appSettings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppSettings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAppSettings.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchAppSettings.rejected, (state, action) => {
        state.loading = false
        state.error = getErrorMessage(action.error)
      })
      .addCase(createAppSetting.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(createAppSetting.fulfilled, (state, action) => {
        state.submitting = false
        state.items.unshift(action.payload)
      })
      .addCase(createAppSetting.rejected, (state, action) => {
        state.submitting = false
        state.error = getErrorMessage(action.error)
      })
      .addCase(updateAppSetting.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(updateAppSetting.fulfilled, (state, action) => {
        state.submitting = false
        state.items = state.items.map((item) => (item.id === action.payload.id ? action.payload : item))
      })
      .addCase(updateAppSetting.rejected, (state, action) => {
        state.submitting = false
        state.error = getErrorMessage(action.error)
      })
      .addCase(deleteAppSetting.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(deleteAppSetting.fulfilled, (state, action) => {
        state.submitting = false
        state.items = state.items.filter((item) => item.id !== action.payload)
      })
      .addCase(deleteAppSetting.rejected, (state, action) => {
        state.submitting = false
        state.error = getErrorMessage(action.error)
      })
  }
})

export default appSettingsSlice.reducer
