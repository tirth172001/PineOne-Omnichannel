import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Icon, Text, useTheme } from 'react-native-paper';

import { ActivityTimeline } from '@/components/payments/activity-timeline';
import { DetailSections } from '@/components/shared/detail-rows';
import { CollapsingDetailScreen, DETAIL_FOOTER_BUTTON_RADIUS, type StatusGradientTone } from '@/components/shared/detail-screen';
import { HelpCard } from '@/components/shared/help-card';
import { OutlineTag, StatusPill } from '@/components/shared/status';
import { concentric, Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import {
  type DisputeFlowState,
  type DisputeRecord,
  type EvidenceDocuments,
  type EvidencePanelMode,
  FLOW_BANNER_COLOR,
  FLOW_STATUS_PILL,
  getDisputeActivity,
  getDisputeSections,
  initialDocuments,
  initialFlowState,
  REJECTED_FLAGGED_FIELD,
} from '@/data/disputes';
import { useToast } from '@/hooks/use-toast';

import { AcceptDisputeDialog, DisputeEvidenceSheet } from './dispute-sheets';

const GRADIENT: Record<DisputeFlowState, StatusGradientTone> = {
  pending: 'processing',
  rejected: 'processing',
  submitted: 'info',
  won: 'success',
  lost: 'failed',
};

const BANNER_PADDING = 12;
const BANNER_INNER_RADIUS = concentric(Shape.max, BANNER_PADDING, 24);

/**
 * Dispute detail (web: DisputeDetailContent), laid out like Transaction
 * details: a collapsing header over a centred hero (mode tile, amount, status,
 * meta), then cards — the flow-state banner, Activity, the dispute /
 * transaction / merchant / customer sections, and Help. The flow runs
 * pending → defend or accept → in review (or re-upload when documents were
 * rejected) → won / lost. The banner's actions (Accept / Defend, View
 * documents, Re-upload documents) sit in the pinned footer.
 */
export function DisputeDetail({ record }: { record: DisputeRecord }) {
  const theme = useTheme();
  const toast = useToast();
  const [flowState, setFlowState] = useState<DisputeFlowState>(() => initialFlowState(record));
  const [documents, setDocuments] = useState<EvidenceDocuments>(() => initialDocuments(initialFlowState(record)));
  const [comment, setComment] = useState('');
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<EvidencePanelMode>('defend');
  const [acceptOpen, setAcceptOpen] = useState(false);
  const pill = FLOW_STATUS_PILL[flowState];
  const muted = { color: theme.colors.onSurfaceVariant };

  const openPanel = (mode: EvidencePanelMode) => {
    setPanelMode(mode);
    setPanelOpen(true);
  };

  const banner: { message: string; badge?: string } =
    flowState === 'pending'
      ? { message: `Dispute due on ${record.dueDate}`, badge: `Due ${record.dueDate}` }
      : flowState === 'submitted'
        ? { message: 'Documents uploaded successfully, our team is reviewing your documents' }
        : flowState === 'rejected'
          ? { message: 'Some documents are not visible please re-upload some documents' }
          : flowState === 'won'
            ? { message: 'Disputes went in your favour, amount will be settled in the next settlement cycle' }
            : { message: `You've accepted this dispute. ${record.amount} will be adjusted from your upcoming settlement.` };

  const outlined = { textColor: theme.colors.onSurface, style: [styles.footerButton, { borderColor: theme.colors.outlineVariant }] };
  const footer =
    flowState === 'pending' ? (
      <>
        <Button mode="outlined" onPress={() => setAcceptOpen(true)} {...outlined}>
          Accept
        </Button>
        <Button mode="contained" onPress={() => openPanel('defend')} style={styles.footerButton}>
          Defend
        </Button>
      </>
    ) : flowState === 'submitted' ? (
      <Button mode="contained" onPress={() => openPanel('view')} style={styles.footerButton}>
        View documents
      </Button>
    ) : flowState === 'rejected' ? (
      <Button mode="contained" onPress={() => openPanel('reupload')} style={styles.footerButton}>
        Re-upload documents
      </Button>
    ) : undefined;

  // Centred summary; it collapses into the header (amount + pay mode + dispute ID) on scroll.
  const hero = (
    <View style={styles.hero}>
      <View style={[styles.modeTile, { backgroundColor: theme.colors.primary }]}>
        <Icon source={record.paymentMode === 'card' ? 'credit-card' : 'qr-code'} size={32} color={theme.colors.onPrimary} />
      </View>
      <Text style={styles.amount}>{record.amount}</Text>
      {/* Wrapped so the pill (which aligns itself to the start) centres in the hero. */}
      <View>
        <StatusPill label={pill.label} tone={pill.tone} radius={Shape.max} />
      </View>
      <Text variant="bodyMedium" style={[styles.meta, muted]}>
        Payment mode: {record.paymentLabel}
        {'\n'}
        Transaction on: {record.createdOn}, {record.time}
      </Text>
    </View>
  );

  return (
    <CollapsingDetailScreen
      fallbackHref="/disputes"
      gradient={GRADIENT[flowState]}
      hero={hero}
      compactTitle={record.amount}
      compactSubtitle={`${record.paymentLabel} · ${record.id}`}
      footer={footer}>
      {/* One card per segment, evenly spaced: the flow banner, Activity first, details, then Help. */}
      <View style={styles.cards}>
        <View style={[styles.banner, { borderColor: theme.colors.outlineVariant, backgroundColor: theme.colors.surface }]}>
          <Icon source="lightning-fill" size={16} color={FLOW_BANNER_COLOR[flowState]} />
          <View style={styles.bannerBody}>
            <Text variant="bodyMedium">{banner.message}</Text>
            {banner.badge ? <OutlineTag label={banner.badge} radius={BANNER_INNER_RADIUS} /> : null}
          </View>
        </View>
        <ActivityTimeline events={getDisputeActivity(record)} carded />
        <DetailSections carded sections={getDisputeSections(record)} />
        <HelpCard subject="dispute" carded />
      </View>

      <DisputeEvidenceSheet
        visible={panelOpen}
        onDismiss={() => setPanelOpen(false)}
        mode={panelMode}
        amount={record.amount.replace(/[^\d,]/g, '')}
        documents={documents}
        onDocumentsChange={setDocuments}
        flaggedField={flowState === 'rejected' ? REJECTED_FLAGGED_FIELD : null}
        issueMessage={record.evidenceIssue}
        comment={comment}
        onCommentChange={setComment}
        onSubmit={() => {
          setFlowState('submitted');
          setPanelOpen(false);
          setComment('');
          toast('Documents submitted successfully');
        }}
      />
      <AcceptDisputeDialog
        visible={acceptOpen}
        onDismiss={() => setAcceptOpen(false)}
        amount={record.amount}
        onConfirm={() => {
          setFlowState('lost');
          toast('Dispute accepted — refund adjusted from your upcoming settlement.');
        }}
      />
    </CollapsingDetailScreen>
  );
}

const styles = StyleSheet.create({
  banner: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: BANNER_PADDING, borderWidth: 1, borderRadius: Shape.max },
  bannerBody: { flex: 1, gap: 8, alignItems: 'flex-start' },
  hero: { gap: 10, alignItems: 'center', paddingBottom: 8 },
  cards: { gap: 12 },
  modeTile: { width: 48, height: 48, borderRadius: Shape.small, alignItems: 'center', justifyContent: 'center' },
  // Web: text-[36px] font-semibold (the amount is a preformatted "₹ 20,000" string).
  amount: { fontFamily: Fonts.semiBold, fontSize: 32, lineHeight: 38 },
  meta: { fontFamily: Fonts.regular, lineHeight: 22, textAlign: 'center' },
  footerButton: { flex: 1, borderRadius: DETAIL_FOOTER_BUTTON_RADIUS },
});
