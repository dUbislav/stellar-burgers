import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RootState } from './store';
import { orderBurgerApi } from '../utils/burger-api';
import { TIngredient, TConstructorIngredient, TOrder } from '../utils/types';

export type TConstructorState = {
  constructorItems: {
    bun: TIngredient | null;
    ingredients: TConstructorIngredient[];
  };
  orderRequest: boolean;
  orderModalData: TOrder | null;
  error: string | null;
};

export const initialConstructorState: TConstructorState = {
  constructorItems: {
    bun: null,
    ingredients: []
  },
  orderRequest: false,
  orderModalData: null,
  error: null
};

export const createOrder = createAsyncThunk(
  'constructor/createOrder',
  async (ingredientsIds: string[]) => {
    const response = await orderBurgerApi(ingredientsIds);
    return {
      _id: response.order._id,
      status: response.order.status,
      name: response.order.name,
      createdAt: response.order.createdAt,
      updatedAt: response.order.updatedAt,
      number: response.order.number,
      ingredients: ingredientsIds
    };
  }
);

const constructorSlice = createSlice({
  name: 'constructor',
  initialState: initialConstructorState,
  reducers: {
    addIngredient: (state, action) => {
      const ingredient = action.payload;

      if (ingredient.type === 'bun') {
        return {
          ...state,
          constructorItems: {
            ...state.constructorItems,
            bun: ingredient
          }
        };
      } else {
        const newIngredient: TConstructorIngredient = {
          ...ingredient,
          id: `${ingredient._id}-${Date.now()}`
        };
        return {
          ...state,
          constructorItems: {
            ...state.constructorItems,
            ingredients: [...state.constructorItems.ingredients, newIngredient]
          }
        };
      }
    },
    removeIngredient: (state, action) => {
      if (!state.constructorItems) {
        state.constructorItems = { bun: null, ingredients: [] };
      }
      if (!state.constructorItems.ingredients) {
        state.constructorItems.ingredients = [];
      }

      const id = action.payload;
      const index = state.constructorItems.ingredients.findIndex(
        (ingredient) => ingredient.id === id
      );

      if (index !== -1) {
        state.constructorItems.ingredients.splice(index, 1);
      }
    },
    moveIngredient: (state, action) => {
      if (!state.constructorItems) {
        state.constructorItems = { bun: null, ingredients: [] };
      }
      if (!state.constructorItems.ingredients) {
        state.constructorItems.ingredients = [];
      }
      if (state.constructorItems.ingredients.length > 1) {
        const { fromIndex, toIndex } = action.payload;
        const ingredients = state.constructorItems.ingredients;
        const [movedIngredient] = ingredients.splice(fromIndex, 1);
        ingredients.splice(toIndex, 0, movedIngredient);
      }
    },
    clearConstructor: (state) => {
      state.constructorItems = {
        bun: null,
        ingredients: []
      };
      state.orderModalData = null;
    },
    clearOrderModal: (state) => {
      state.orderModalData = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.orderRequest = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orderRequest = false;
        state.orderModalData = action.payload;
        state.constructorItems = {
          bun: null,
          ingredients: []
        };
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to create order';
        state.orderRequest = false;
      });
  }
});

export const constructorReducer = constructorSlice.reducer;

export const {
  addIngredient,
  removeIngredient,
  moveIngredient,
  clearConstructor,
  clearOrderModal
} = constructorSlice.actions;
export const selectConstructorItems = (state: RootState) =>
  state.burgerConstructor?.constructorItems ??
  initialConstructorState.constructorItems;
export const selectOrderModalData = (state: RootState) =>
  state.burgerConstructor?.orderModalData ??
  initialConstructorState.orderModalData;
export const selectOrderRequest = (state: RootState) =>
  state.burgerConstructor?.orderRequest ?? initialConstructorState.orderRequest;
export default constructorSlice.reducer;
