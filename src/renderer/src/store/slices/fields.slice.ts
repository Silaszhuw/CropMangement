import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { Field } from '../../../../shared/types/database'
import type { CreateFieldInput, UpdateFieldInput } from '../../../../main/database/repositories/fields-repository'
import { cropModelingApi } from '../../services/ipc-client'

interface FieldsState {
  items: Field[]
  loading: boolean
  submitting: boolean
  error: string | null
}

const initialState: FieldsState = {
  items: [],
  loading: false,
  submitting: false,
  error: null
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '未知错误'
}

export const fetchFields = createAsyncThunk('fields/fetchAll', async () => {
  const response = await cropModelingApi.fields.list()
  if (!response.success) {
    throw new Error(response.error)
  }

  return response.data
})

export const createField = createAsyncThunk('fields/create', async (input: CreateFieldInput) => {
  const response = await cropModelingApi.fields.create(input)
  if (!response.success) {
    throw new Error(response.error)
  }

  return response.data
})

export const updateField = createAsyncThunk('fields/update', async (input: UpdateFieldInput) => {
  const response = await cropModelingApi.fields.update(input)
  if (!response.success) {
    throw new Error(response.error)
  }

  return response.data
})

export const deleteField = createAsyncThunk('fields/delete', async (id: number) => {
  const response = await cropModelingApi.fields.remove(id)
  if (!response.success) {
    throw new Error(response.error)
  }

  return id
})

const fieldsSlice = createSlice({
  name: 'fields',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFields.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchFields.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchFields.rejected, (state, action) => {
        state.loading = false
        state.error = getErrorMessage(action.error)
      })
      .addCase(createField.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(createField.fulfilled, (state, action) => {
        state.submitting = false
        state.items.unshift(action.payload)
      })
      .addCase(createField.rejected, (state, action) => {
        state.submitting = false
        state.error = getErrorMessage(action.error)
      })
      .addCase(updateField.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(updateField.fulfilled, (state, action) => {
        state.submitting = false
        state.items = state.items.map((item) => (item.id === action.payload.id ? action.payload : item))
      })
      .addCase(updateField.rejected, (state, action) => {
        state.submitting = false
        state.error = getErrorMessage(action.error)
      })
      .addCase(deleteField.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(deleteField.fulfilled, (state, action) => {
        state.submitting = false
        state.items = state.items.filter((item) => item.id !== action.payload)
      })
      .addCase(deleteField.rejected, (state, action) => {
        state.submitting = false
        state.error = getErrorMessage(action.error)
      })
  }
})

export default fieldsSlice.reducer
