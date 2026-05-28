import { configureStore } from '@reduxjs/toolkit';

import { ingredientsReducer } from './ingredientsSlice';
import { userReducer } from './userSlice';
import { constructorReducer } from './constructorSlice';
import { profileOrdersReducer } from './profileOrderSlice';
import { feedReducer } from './feedSlice';
import {
  TypedUseSelectorHook,
  useDispatch as dispatchHook,
  useSelector as selectorHook
} from 'react-redux';
import { BurgerConstructor } from '@components';

const store = configureStore({
  reducer: {
    ingredients: ingredientsReducer,
    user: userReducer,
    burgerConstructor: constructorReducer,
    profileOrders: profileOrdersReducer,
    feed: feedReducer
  },
  devTools: process.env.NODE_ENV !== 'production'
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export const useDispatch: () => AppDispatch = () => dispatchHook();
export const useSelector: TypedUseSelectorHook<RootState> = selectorHook;

export default store;
