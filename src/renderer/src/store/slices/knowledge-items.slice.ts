/** 知识项状态切片：管理知识项的状态和异步操作 */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { KnowledgeItem } from '../../../../shared/types/database'
import type {
  CreateKnowledgeItemInput,
  UpdateKnowledgeItemInput
} from '../../../../main/database/repositories/knowledge-items-repository'
import { cropModelingApi } from '../../services/ipc-client'

interface KnowledgeItemsState {
  items: KnowledgeItem[]
  loading: boolean
  submitting: boolean
  error: string | null
}

const initialState: KnowledgeItemsState = {
  items: [],
  loading: false,
  submitting: false,
  error: null
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '未知错误'
}

export const fetchKnowledgeItems = createAsyncThunk('knowledgeItems/fetchAll', async () => {
  const response = await cropModelingApi.knowledgeItems.list()
  if (!response.success) {
    throw new Error(response.error)
  }

  return response.data
})

export const createKnowledgeItem = createAsyncThunk(
  'knowledgeItems/create',
  async (input: CreateKnowledgeItemInput) => {
    const response = await cropModelingApi.knowledgeItems.create(input)
    if (!response.success) {
      throw new Error(response.error)
    }

    return response.data
  }
)

export const updateKnowledgeItem = createAsyncThunk(
  'knowledgeItems/update',
  async (input: UpdateKnowledgeItemInput) => {
    const response = await cropModelingApi.knowledgeItems.update(input)
    if (!response.success) {
      throw new Error(response.error)
    }

    return response.data
  }
)

export const deleteKnowledgeItem = createAsyncThunk('knowledgeItems/delete', async (id: number) => {
  const response = await cropModelingApi.knowledgeItems.remove(id)
  if (!response.success) {
    throw new Error(response.error)
  }

  return id
})

const knowledgeItemsSlice = createSlice({
  name: 'knowledgeItems',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchKnowledgeItems.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchKnowledgeItems.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchKnowledgeItems.rejected, (state, action) => {
        state.loading = false
        state.error = getErrorMessage(action.error)
      })
      .addCase(createKnowledgeItem.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(createKnowledgeItem.fulfilled, (state, action) => {
        state.submitting = false
        state.items.unshift(action.payload)
      })
      .addCase(createKnowledgeItem.rejected, (state, action) => {
        state.submitting = false
        state.error = getErrorMessage(action.error)
      })
      .addCase(updateKnowledgeItem.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(updateKnowledgeItem.fulfilled, (state, action) => {
        state.submitting = false
        state.items = state.items.map((item) => (item.id === action.payload.id ? action.payload : item))
      })
      .addCase(updateKnowledgeItem.rejected, (state, action) => {
        state.submitting = false
        state.error = getErrorMessage(action.error)
      })
      .addCase(deleteKnowledgeItem.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(deleteKnowledgeItem.fulfilled, (state, action) => {
        state.submitting = false
        state.items = state.items.filter((item) => item.id !== action.payload)
      })
      .addCase(deleteKnowledgeItem.rejected, (state, action) => {
        state.submitting = false
        state.error = getErrorMessage(action.error)
      })
  }
})

export default knowledgeItemsSlice.reducer
