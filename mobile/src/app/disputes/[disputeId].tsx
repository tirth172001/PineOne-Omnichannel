import { useLocalSearchParams } from 'expo-router';

import { DisputeDetail } from '@/components/disputes/dispute-detail';
import { NotFound } from '@/components/shared/not-found';
import { findDisputeById } from '@/data/disputes';

/** /disputes/[disputeId] (web: /disputes/[id]). */
export default function DisputeDetailScreen() {
  const { disputeId } = useLocalSearchParams<{ disputeId: string }>();
  const record = findDisputeById(disputeId);
  if (!record) {
    return <NotFound title="Dispute details" message={`No dispute with ID ${disputeId}.`} fallbackHref="/disputes" />;
  }
  // Keyed so opening another dispute starts from its own flow state.
  return <DisputeDetail key={record.id} record={record} />;
}
