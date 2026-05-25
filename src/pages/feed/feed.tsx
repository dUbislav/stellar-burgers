import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { TOrder } from '@utils-types';
import { FC } from 'react';
import {
  fetchFeed,
  selectFeedError,
  selectFeedLoading,
  selectFeedOrders
} from '../../services/feedSlice';
import { useDispatch, useSelector } from '../../services/store';

export const Feed: FC = () => {
  const orders: TOrder[] = useSelector(selectFeedOrders);
  const feedError = useSelector(selectFeedError);
  const loadingFeed = useSelector(selectFeedLoading);
  const dispatch = useDispatch();

  if (!orders.length || feedError || loadingFeed) {
    return <Preloader />;
  }

  return (
    <FeedUI
      orders={orders}
      handleGetFeeds={() => {
        dispatch(fetchFeed());
      }}
    />
  );
};
