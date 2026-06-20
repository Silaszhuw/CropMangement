/** Redux Hooks：提供类型安全的 Redux hooks */
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from './index'

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
