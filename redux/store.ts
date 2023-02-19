import { configureStore } from '@reduxjs/toolkit';
import {enableMapSet } from 'immer';
import user from './user';
import app from './app';
import locationNodes from './locationNodes';
import { graphApi, publicApi, userApi, userGraphApi } from './api';

enableMapSet();

export const store = configureStore({
  reducer: {
    user,
    app,
    locationNodes,
    [userApi.reducerPath]: userApi.reducer,
    [publicApi.reducerPath]: publicApi.reducer,
    [graphApi.reducerPath]: graphApi.reducer,
    [userGraphApi.reducerPath]: userGraphApi.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    })
    .concat(graphApi.middleware)
    .concat(userGraphApi.middleware)
    .concat(userApi.middleware)
    .concat(publicApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;