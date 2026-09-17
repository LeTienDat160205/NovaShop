import { configureStore } from '@reduxjs/toolkit'
import counterReducer from '../redux/slides/counterSlide'

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
})  