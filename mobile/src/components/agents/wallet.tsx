import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';

import { AppIcon } from '@/components/icons';
import { SummaryCard } from '@/components/listing-hero/answer-hero';
import { ListingCard } from '@/components/listing-hero/listing-card';
import { DayGroupedList, dayTotals, groupByDay } from '@/components/shared/day-groups';
import { DetailScreen } from '@/components/shared/detail-screen';
import { ListRow, ListRowLine, selectFilter } from '@/components/shared/listing';
import { PanelSheet, SHEET_BUTTON, SheetRow, SheetSection } from '@/components/shared/panel-sheet';
import { PAGE_PADDING } from '@/components/tab-screen';
import { Fonts, OPEN_DIGITS } from '@/constants/theme';
import { MARKETPLACE_AGENTS } from '@/data/agents';
import { addCredits, AGENT_CREDIT_COST, CREDIT_PACKS, creditCostLabel, formatCredits, type LedgerEntry, RUPEES_PER_CREDIT, useWallet } from '@/data/wallet';
import { useToast } from '@/hooks/use-toast';

import { AgentThumbnail } from './agent-visuals';

const TYPE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'used', label: 'Used by agents' },
  { value: 'added', label: 'Added' },
] as const;
type TypeFilter = (typeof TYPE_OPTIONS)[number]['value'];
const NOUN = { one: 'entry', other: 'entries' };

/**
 * The agent credits wallet (/agents/wallet): the balance in the app's
 * summary card (as on the other listing pages), with Credit costs and Add
 * credits in its footer. Under it, History as the app's listings are: search
 * and Filters, then day bands of rows — the agent's tile, its name and what
 * it did, and the credits at the end (green when added).
 */
export function AgentWallet() {
  const theme = useTheme();
  const toast = useToast();
  const { balance, ledger, usedToday } = useWallet();
  const [addOpen, setAddOpen] = useState(false);
  const [costsOpen, setCostsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [type, setType] = useState<TypeFilter>('all');
  const query = search.trim().toLowerCase();
  const rows = ledger.filter(
    (entry) =>
      (type === 'all' || (type === 'used' ? entry.credits < 0 : entry.credits > 0)) && (!query || `${entry.title} ${entry.detail}`.toLowerCase().includes(query)),
  );
  const muted = { color: theme.colors.onSurfaceVariant };

  return (
    <DetailScreen title="Wallet" fallbackHref="/agents">
      <View style={styles.stack}>
        {/* The app's summary card, as on the other listing pages: the balance, a line, then its actions. */}
        <SummaryCard
          icon="coins"
          title="Credits balance"
          count={{ value: balance }}
          line={`≈ ₹${(balance * RUPEES_PER_CREDIT).toLocaleString('en-IN')} · ${usedToday} credits used today`}
          actions={
            <>
              <Button mode="outlined" icon="list-bullets" onPress={() => setCostsOpen(true)} textColor={theme.colors.onSurface} style={[styles.cardButton, { borderColor: theme.colors.outlineVariant }]} labelStyle={styles.cardButtonLabel}>
                Credit costs
              </Button>
              <Button mode="contained" icon="plus" onPress={() => setAddOpen(true)} style={styles.cardButton} labelStyle={styles.cardButtonLabel}>
                Add credits
              </Button>
            </>
          }
        />
        <ListingCard
          belowHero
          title="History"
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search agent or task"
          filters={[selectFilter({ label: 'Type', options: TYPE_OPTIONS, value: type, onApply: (value) => setType(value as TypeFilter) })]}
          totals={{ all: ledger.length, shown: rows.length }}
          noun={NOUN}>
          <DayGroupedList
            flat
            groups={groupByDay(rows, (entry) => entry.day)}
            totals={dayTotals(rows, (entry) => entry.day)}
            noun={NOUN}
            empty={ledger.length ? 'Nothing matches. Try clearing the search or filters.' : 'No credits used or added yet.'}
            renderRow={(entry) => (
              <ListRow key={entry.id} icon={<LedgerIcon entry={entry} />} accessibilityLabel={`${entry.title}, ${entry.detail}, ${entry.time}, ${entry.credits > 0 ? 'added' : 'used'} ${formatCredits(entry.credits)} credits`}>
                <ListRowLine
                  left={
                    <>
                      <Text numberOfLines={1} style={[styles.rowTitle, { color: theme.colors.onSurface }]}>
                        {entry.title}
                      </Text>
                      <Text variant="bodySmall" numberOfLines={1} style={[muted, styles.digits]}>
                        {entry.detail} · {entry.time}
                      </Text>
                    </>
                  }
                  right={<CreditsValue credits={entry.credits} />}
                  centered
                />
              </ListRow>
            )}
          />
        </ListingCard>
      </View>

      <AddCreditsSheet
        visible={addOpen}
        onDismiss={() => setAddOpen(false)}
        onAdd={(credits) => {
          addCredits(credits);
          setAddOpen(false);
          toast(`${formatCredits(credits)} credits added`);
        }}
      />
      <CreditCostsSheet visible={costsOpen} onDismiss={() => setCostsOpen(false)} />
    </DetailScreen>
  );
}

/** A row's credits: added in green with a plus; used as a plain number (no minus). */
function CreditsValue({ credits }: { credits: number }) {
  const theme = useTheme();
  const added = credits > 0;
  return (
    <View style={styles.creditsValue}>
      <Text style={[styles.rowCredits, { color: added ? (theme.dark ? '#4ade80' : '#16a34a') : theme.colors.onSurface }]}>
        {added ? '+' : ''}
        {formatCredits(credits)}
      </Text>
      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
        credits
      </Text>
    </View>
  );
}

/** A ledger row's icon: the agent's own tile, or a credit arrow for top-ups. */
function LedgerIcon({ entry }: { entry: LedgerEntry }) {
  const theme = useTheme();
  return entry.agentId ? <AgentThumbnail agentId={entry.agentId} size={40} radius={20} glyphSize={18} /> : <AppIcon name="arrow-down-left" size={18} color={theme.colors.onSurface} />;
}

/** Add credits: the packs as radio rows, then the 48dp button with the price. */
function AddCreditsSheet({ visible, onDismiss, onAdd }: { visible: boolean; onDismiss: () => void; onAdd: (credits: number) => void }) {
  const [pack, setPack] = useState<number>(CREDIT_PACKS[1]);
  const { balance } = useWallet();
  return (
    <PanelSheet
      visible={visible}
      onDismiss={onDismiss}
      title="Add credits"
      fit
      footer={
        <Button mode="contained" {...SHEET_BUTTON} onPress={() => onAdd(pack)}>
          {`Add ${formatCredits(pack)} credits · ₹${(pack * RUPEES_PER_CREDIT).toLocaleString('en-IN')}`}
        </Button>
      }>
      <View style={styles.sheetBody}>
        <SheetSection label="Choose a pack" trailing={`1 credit = ₹${RUPEES_PER_CREDIT}`}>
          {CREDIT_PACKS.map((credits, index) => (
            <SheetRow
              key={credits}
              first={index === 0}
              icon="coins"
              title={`${formatCredits(credits)} credits`}
              description={`₹${(credits * RUPEES_PER_CREDIT).toLocaleString('en-IN')} · ${formatCredits(balance + credits)} after`}
              role="radio"
              selected={credits === pack}
              onPress={() => setPack(credits)}
            />
          ))}
        </SheetSection>
      </View>
    </PanelSheet>
  );
}

/** What each agent's run costs. */
function CreditCostsSheet({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
  const theme = useTheme();
  return (
    <PanelSheet visible={visible} onDismiss={onDismiss} title="Credit costs" fit>
      <View style={styles.sheetBody}>
        <SheetSection label="Each run uses">
          {MARKETPLACE_AGENTS.map((agent, index) => (
            <SheetRow
              key={agent.id}
              first={index === 0}
              title={agent.name}
              trailing={
                <Text style={[styles.costValue, { color: theme.colors.onSurface }]}>
                  {AGENT_CREDIT_COST[agent.id].credits} / {AGENT_CREDIT_COST[agent.id].per}
                </Text>
              }
            />
          ))}
        </SheetSection>
        <Text style={[styles.note, { color: theme.colors.onSurfaceVariant }]}>
          You see the cost before any agent runs ({creditCostLabel('chargeback')} for the Chargeback Agent).
        </Text>
      </View>
    </PanelSheet>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  stack: { gap: 8, marginTop: PAGE_PADDING },
  digits: { fontVariant: OPEN_DIGITS },
  cardButton: { flex: 1, borderRadius: 8 },
  cardButtonLabel: { fontFamily: Fonts.medium, fontSize: 14 },
  rowTitle: { fontFamily: Fonts.medium, fontSize: 16, lineHeight: 22 },
  rowCredits: { fontFamily: Fonts.semiBold, fontSize: 16, lineHeight: 22, fontVariant: OPEN_DIGITS },
  creditsValue: { alignItems: 'flex-end' },
  sheetBody: { padding: 16, gap: 12 },
  costValue: { fontFamily: Fonts.medium, fontSize: 14, lineHeight: 20, fontVariant: OPEN_DIGITS, paddingRight: 12 },
  note: { fontFamily: Fonts.regular, fontSize: 12, lineHeight: 16, paddingHorizontal: 4 },
});
