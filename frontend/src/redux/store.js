import { configureStore } from '@reduxjs/toolkit'
import counterReducer from '../redux/slices/counterSlice'

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
})  