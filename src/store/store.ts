import { configureStore } from '@reduxjs/toolkit';
import boardReducer  from './boardSlice';
import repoReducer from './repoSlice';

export const store = configureStore({
  reducer: {
    board: boardReducer,
    repo: repoReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
