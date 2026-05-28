import { FC, useEffect, useMemo, useState } from 'react';
import { Preloader } from '../ui/preloader';
import { OrderInfoUI } from '../ui/order-info';
import { TIngredient, TOrder } from '@utils-types';
import {
  fetchProfileOrders,
  selectProfileOrders
} from '../../services/profileOrderSlice';
import { useDispatch, useSelector } from '../../services/store';
import { useParams } from 'react-router-dom';
import { selectIngredients } from '../../services/ingredientsSlice';
import { selectFeedOrders } from '../../services/feedSlice';
import { getOrderByNumberApi } from '@api';

export const OrderInfo: FC = () => {
  const { number } = useParams();

  const ingredients: TIngredient[] = useSelector(selectIngredients);
  const feedOrders = useSelector(selectFeedOrders);
  const profileOrders = useSelector(selectProfileOrders);

  const [loadedOrder, setLoadedOrder] = useState<TOrder | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const orderData =
    feedOrders.find((order) => order.number === Number(number)) ||
    profileOrders.find((order) => order.number === Number(number)) ||
    loadedOrder;

  useEffect(() => {
    if (orderData || !number) return;

    setIsLoading(true);
    getOrderByNumberApi(Number(number))
      .then((data) => {
        setLoadedOrder(data.orders[0]);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load order');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [number, orderData]);

  const orderInfo = useMemo(() => {
    if (!orderData || !ingredients.length) return null;

    const date = new Date(orderData.createdAt);

    type TIngredientsWithCount = {
      [key: string]: TIngredient & { count: number };
    };

    const ingredientsInfo = orderData.ingredients.reduce(
      (acc: TIngredientsWithCount, item) => {
        if (!acc[item]) {
          const ingredient = ingredients.find((ing) => ing._id === item);
          if (ingredient) {
            acc[item] = {
              ...ingredient,
              count: 1
            };
          }
        } else {
          acc[item].count++;
        }

        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );

    return {
      ...orderData,
      ingredientsInfo,
      date,
      total
    };
  }, [orderData, ingredients]);

  if (!orderInfo) {
    return <Preloader />;
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};
