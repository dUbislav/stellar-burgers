import { expect, test, describe } from '@jest/globals';
import {
  addIngredient,
  clearConstructor,
  clearOrderModal,
  constructorReducer,
  createOrder,
  initialConstructorState,
  moveIngredient,
  removeIngredient,
  TConstructorState
} from '../constructorSlice';
import { TConstructorIngredient, TIngredient } from '@utils-types';

describe('init test', () => {
  test('should return unknown', () => {
    const result = constructorReducer(undefined, { type: 'UNKNOWN' });
    expect(result).toEqual(initialConstructorState);
  });
});

describe('action tests', () => {
  const mockBun: TIngredient = {
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
  };

  const mockConstructorIngredient: TConstructorIngredient = {
    _id: '643d69a5c3f7b9001cfa0941',
    id: 'mock-id-123',
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
  };

  const mockConstructorState: TConstructorState = {
    constructorItems: {
      bun: mockBun,
      ingredients: [mockConstructorIngredient]
    },
    orderRequest: false,
    orderModalData: null,
    error: null
  };
  test('should add bun', () => {
    const result = constructorReducer(initialConstructorState, {
      type: addIngredient.type,
      payload: mockBun
    });
    expect(result.constructorItems.bun).toEqual(mockBun);
  });
  test('should add ingredient', () => {
    const result = constructorReducer(initialConstructorState, {
      type: addIngredient.type,
      payload: mockConstructorIngredient
    });
    expect(result.constructorItems.ingredients).toEqual([
      mockConstructorIngredient
    ]);
  });
  test('should remove ingredient', () => {
    const result = constructorReducer(mockConstructorState, {
      type: removeIngredient.type,
      payload: mockConstructorIngredient.id
    });
    expect(result.constructorItems.ingredients).not.toContainEqual(
      mockConstructorIngredient
    );
  });
  test('should move ingredient', () => {
    const mockConstructorIngredient2: TConstructorIngredient = {
      ...mockConstructorIngredient,
      _id: '643d69a5c3f7b9001cfa0942',
      id: 'mock-id-456',
      name: 'Соус фирменный'
    };
    const stateWithTwoIngredients: TConstructorState = {
      ...mockConstructorState,
      constructorItems: {
        bun: mockBun,
        ingredients: [mockConstructorIngredient, mockConstructorIngredient2]
      }
    };

    const result = constructorReducer(stateWithTwoIngredients, {
      type: moveIngredient.type,
      payload: { fromIndex: 0, toIndex: 1 }
    });
    expect(result.constructorItems.ingredients).toEqual([
      mockConstructorIngredient2,
      mockConstructorIngredient
    ]);
  });
  test('should clear constructor', () => {
    const result = constructorReducer(mockConstructorState, {
      type: clearConstructor.type
    });
    expect(result).toEqual(initialConstructorState);
  });
  test('should clear modal data', () => {
    const result = constructorReducer(mockConstructorState, {
      type: clearOrderModal.type
    });
    expect(result.orderModalData).toBeNull();
  });
});

describe('extra reducers tests', () => {
  test('should be pending during create order', () => {
    const result = constructorReducer(initialConstructorState, {
      type: createOrder.pending.type
    });
    expect(result.orderRequest).toBe(true);
    expect(result.error).toBeNull();
  });
  test('should be fulfilled during create order', () => {
    const result = constructorReducer(initialConstructorState, {
      type: createOrder.fulfilled.type,
      payload: { number: 12345 }
    });
    expect(result.orderRequest).toBe(false);
    expect(result.orderModalData).toEqual({ number: 12345 });
    expect(result.constructorItems).toEqual({
      bun: null,
      ingredients: []
    });
  });
  test('should be rejected during create order', () => {
    const result = constructorReducer(initialConstructorState, {
      type: createOrder.rejected.type,
      error: { message: 'Failed to create order' }
    });
    expect(result.orderRequest).toBe(false);
    expect(result.error).toBe('Failed to create order');
  });
});
