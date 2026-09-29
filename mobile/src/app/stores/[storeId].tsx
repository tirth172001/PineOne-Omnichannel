import { useLocalSearchParams } from 'expo-router';

import { StoreDetail } from '@/components/account/manage-stores';
import { NotFound } from '@/components/shared/not-found';
import { STORE_RECORDS } from '@/data/stores';

export default function StoreDetailScreen() {
  const { storeId } = useLocalSearchParams<{ storeId: string }>();
  const store = STORE_RECORDS.find((entry) => entry.storeId === storeId);
  if (!store) return <NotFound title="Store details" message="Store not found." fallbackHref="/stores" />;
  return <StoreDetail key={store.storeId} store={store} />;
}
