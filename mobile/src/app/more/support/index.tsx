import { DetailScreen } from '@/components/shared/detail-screen';
import { SupportLanding } from '@/components/support/support-landing';

/** /more/support: the Support landing, opened from More. */
export default function SupportScreen() {
  return (
    <DetailScreen title="Support" fallbackHref="/more">
      <SupportLanding />
    </DetailScreen>
  );
}
