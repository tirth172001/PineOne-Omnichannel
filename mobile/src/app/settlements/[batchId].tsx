import { useLocalSearchParams } from 'expo-router';

import { SettlementDetail } from '@/components/payments/settlement-detail';
import { findSettlement } from '@/data/settlements';

/** /settlements/[batchId] (web: /settlements/[batchId], which also falls back to the first batch). */
export default function SettlementDetailScreen() {
  const { batchId } = useLocalSearchParams<{ batchId: string }>();
  return <SettlementDetail settlement={findSettlement(batchId)} />;
}
