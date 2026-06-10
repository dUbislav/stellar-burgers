import { expect, test, describe } from '@jest/globals';
import {
  fetchIngredients,
  ingredientsReducer,
  initialState
} from '../ingredientsSlice';
import { TIngredient } from '@utils-types';

describe('init test', () => {
  test('should return unknown', () => {
    const result = ingredientsReducer(undefined, { type: 'UNKNOWN' });
    expect(result).toEqual(initialState);
  });
});

describe('extra reducers tests', () => {
  const mockIngredients: TIngredient[] = [
    {
      _id: '643d69a5c3f7b9001cfa093c',
      name: 'Краторная булка N-200i',
      type: 'bun',
      proteins: 80,
      fat: 24,
      carbohydrates: 53,
      calories: 420,
      price: 1255,
      image: 'https://code.s3.yandex.net/react/code/bun-02.png',
      image_mobile: 'https://code.s3.yandex.net/react/code/bun-02-mobile.png',
      image_large: 'https://code.s3.yandex.net/react/code/bun-02-large.png'
    },
    {
      _id: '643d69a5c3f7b9001cfa0941',
      name: 'Биокотлета из марсианской Магни КЛС',
      type: 'main',
      proteins: 420,
      fat: 142,
      carbohydrates: 242,
      calories: 4242,
      price: 424,
      image: 'https://code.s3.yandex.net/react/code/meat-01.png',
      image_mobile: 'https://code.s3.yandex.net/react/code/meat-01-mobile.png',
      image_large: 'https://code.s3.yandex.net/react/code/meat-01-large.png'
    },
    {
      _id: '643d69a5c3f7b9001cfa0942',
      name: 'Соус Фирменный Space Sauce',
      type: 'sauce',
      proteins: 50,
      fat: 22,
      carbohydrates: 11,
      calories: 14,
      price: 80,
      image: 'https://code.s3.yandex.net/react/code/sauce-04.png',
      image_mobile: 'https://code.s3.yandex.net/react/code/sauce-04-mobile.png',
      image_large: 'https://code.s3.yandex.net/react/code/sauce-04-large.png'
    },
    {
      _id: '643d69a5c3f7b9001cfa093d',
      name: 'Флюоресцентная булка R2-D2',
      type: 'bun',
      proteins: 44,
      fat: 26,
      carbohydrates: 85,
      calories: 643,
      price: 988,
      image: 'https://code.s3.yandex.net/react/code/bun-01.png',
      image_mobile: 'https://code.s3.yandex.net/react/code/bun-01-mobile.png',
      image_large: 'https://code.s3.yandex.net/react/code/bun-01-large.png'
    }
  ];
  test('should be pending during fetch ingredients', () => {
    const result = ingredientsReducer(initialState, {
      type: fetchIngredients.pending.type
    });
    expect(result.isLoading).toBe(true);
    expect(result.error).toBeNull();
  });
  test('should be fulfilled during fetch ingredients', () => {
    const result = ingredientsReducer(initialState, {
      type: fetchIngredients.fulfilled.type,
      payload: mockIngredients
    });
    expect(result.isLoading).toBe(false);
    expect(result.error).toBeNull();
    expect(result.ingredients).toEqual(mockIngredients);
  });
  test('should be rejected during fetch ingredients', () => {
    const errorMessage = 'Failed to fetch ingredients';
    const result = ingredientsReducer(initialState, {
      type: fetchIngredients.rejected.type,
      error: { message: errorMessage }
    });
    expect(result.isLoading).toBe(false);
    expect(result.error).toBe(errorMessage);
  });
});
