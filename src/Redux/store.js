import { configureStore } from '@reduxjs/toolkit';
import studioReducer from './StudioSlice';
import calendarReducer from "./CaledarSlice"

export const store = configureStore({
  reducer: {
    studio: studioReducer,
    calendar : calendarReducer
  },
});