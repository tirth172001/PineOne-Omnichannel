import { useState } from 'react';
import { type LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import Svg, { Circle, Defs, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { AppIcon, type IconName } from '@/components/icons';
import { ListingCard } from '@/components/listing-hero/listing-card';
import { DayGroupedList, dayTotals, groupByDay } from '@/components/shared/day-groups';
import { DetailScreen } from '@/components/shared/detail-screen';
import { useSvgId } from '@/components/shared/hatch';
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
 * The agent credits wallet (/agents/wallet): a compact wallet (after Figma
 * 8217:60988, in the app's colours, no cards) with the balance, Add credits
 * and the credit costs. Under it, History as the app's listings are: search
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
        <CreditsWallet balance={balance} usedToday={usedToday} onAdd={() => setAddOpen(true)} onCosts={() => setCostsOpen(true)} />
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

/**
 * The wallet itself, compact and a little real: a green leather body with a
 * soft drop shadow, a stitched flap across the top (its shadow falling on the
 * body) closed with a snap, a sheen, then the balance, Add credits and the
 * credit costs. No cards: credits aren't a card.
 */
function CreditsWallet({ balance, usedToday, onAdd, onCosts }: { balance: number; usedToday: number; onAdd: () => void; onCosts: () => void }) {
  const [width, setWidth] = useState(0);
  const ids = { body: useSvgId('wallet-body'), flap: useSvgId('wallet-flap'), sheen: useSvgId('wallet-sheen'), snap: useSvgId('wallet-snap') };
  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);
  const W = width;
  const H = 208;
  const R = 22;
  const F = 64; // the flap's depth at its edges
  const bulge = 14; // how far its edge curves down in the middle
  const flap = (offset = 0) =>
    `M 0 ${R} A ${R} ${R} 0 0 1 ${R} 0 L ${W - R} 0 A ${R} ${R} 0 0 1 ${W} ${R} L ${W} ${F + offset} C ${W * 0.7} ${F + offset} ${W * 0.62} ${F + bulge + offset} ${W / 2} ${F + bulge + offset} C ${W * 0.38} ${F + bulge + offset} ${W * 0.3} ${F + offset} 0 ${F + offset} Z`;
  const flapStitch = `M 10 ${F - 8} C ${W * 0.3} ${F - 8} ${W * 0.38} ${F + bulge - 8} ${W / 2} ${F + bulge - 8} C ${W * 0.62} ${F + bulge - 8} ${W * 0.7} ${F - 8} ${W - 10} ${F - 8}`;
  return (
    <View onLayout={onLayout} style={[styles.wallet, { height: H }]} accessible accessibilityLabel={`Agent credits wallet, ${formatCredits(balance)} credits`}>
      {W ? (
        <View style={styles.walletClip}>
          <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id={ids.body} x1="0" y1="0" x2="0.4" y2="1">
                <Stop offset={0} stopColor="#3f6212" />
                <Stop offset={1} stopColor="#1a2e05" />
              </LinearGradient>
              <LinearGradient id={ids.flap} x1="0" y1="0" x2="0" y2="1">
                <Stop offset={0} stopColor="#4d7c0f" />
                <Stop offset={1} stopColor="#365314" />
              </LinearGradient>
              <RadialGradient id={ids.sheen} cx="18%" cy="0%" rx="60%" ry="80%">
                <Stop offset={0} stopColor="#ecfccb" stopOpacity={0.22} />
                <Stop offset={1} stopColor="#ecfccb" stopOpacity={0} />
              </RadialGradient>
              <RadialGradient id={ids.snap} cx="35%" cy="30%" rx="70%" ry="70%">
                <Stop offset={0} stopColor="#f7fee7" />
                <Stop offset={0.45} stopColor="#a3a3a3" />
                <Stop offset={1} stopColor="#525252" />
              </RadialGradient>
            </Defs>
            {/* Body, its stitching all round. */}
            <Rect width={W} height={H} rx={R} fill={`url(#${ids.body})`} />
            <Rect x={8} y={8} width={W - 16} height={H - 16} rx={R - 8} fill="none" stroke="#ecfccb" strokeOpacity={0.35} strokeWidth={1.2} strokeDasharray="5 4" />
            {/* The flap's shadow on the body (soft: three faint layers), then the flap, its stitch and the sheen. */}
            {[6, 4, 2].map((offset) => (
              <Path key={offset} d={flap(offset)} fill="#000000" opacity={0.12} />
            ))}
            <Path d={flap()} fill={`url(#${ids.flap})`} />
            <Path d={flapStitch} fill="none" stroke="#ecfccb" strokeOpacity={0.45} strokeWidth={1.2} strokeDasharray="5 4" />
            <Rect width={W} height={H} rx={R} fill={`url(#${ids.sheen})`} />
            {/* The snap closing the flap. */}
            <Circle cx={W / 2} cy={F + bulge - 1} r={9} fill="#000000" opacity={0.25} />
            <Circle cx={W / 2} cy={F + bulge - 3} r={8} fill={`url(#${ids.snap})`} />
          </Svg>
          <View style={[styles.flapContent, { height: F }]}>
            <AppIcon name="coins-fill" size={16} color="#d9f99d" />
            <Text style={styles.pocketLabel}>Agent credits</Text>
          </View>
          <View style={[styles.walletBody, { top: F + bulge + 12 }]}>
            <View style={styles.balanceRow}>
              <Text style={styles.balance}>{formatCredits(balance)}</Text>
              <Text style={styles.balanceUnit}>credits</Text>
            </View>
            <View style={styles.pocketActions}>
              <Text style={styles.pocketLine}>
                ≈ ₹{(balance * RUPEES_PER_CREDIT).toLocaleString('en-IN')} · {usedToday} used today
              </Text>
              <View style={styles.roundActions}>
                <RoundButton icon="list-bullets" label="Credit costs" onPress={onCosts} />
                <Pressable onPress={onAdd} accessibilityRole="button" accessibilityLabel="Add credits" style={({ pressed }) => [styles.addPill, pressed && styles.pressed]}>
                  <AppIcon name="plus" size={16} color="#1a2e05" />
                  <Text style={styles.addLabel}>Add</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

function RoundButton({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={4} style={({ pressed }) => [styles.round, pressed && styles.pressed]}>
      <AppIcon name={icon} size={18} color="#ffffff" />
    </Pressable>
  );
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
  wallet: {
    borderRadius: 22,
    backgroundColor: '#1a2e05',
    shadowColor: '#1a2e05',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  walletClip: { flex: 1, borderRadius: 22, overflow: 'hidden' },
  flapContent: { position: 'absolute', top: 0, left: 22, right: 22, flexDirection: 'row', alignItems: 'center', gap: 8 },
  walletBody: { position: 'absolute', left: 22, right: 18, bottom: 22, justifyContent: 'space-between' },
  pocketLabel: { fontFamily: Fonts.medium, fontSize: 14, lineHeight: 20, color: '#d9f99d' },
  balanceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  balance: { fontFamily: Fonts.semiBold, fontSize: 36, lineHeight: 44, color: '#ffffff', fontVariant: OPEN_DIGITS },
  balanceUnit: { fontFamily: Fonts.medium, fontSize: 16, lineHeight: 22, color: 'rgba(236, 252, 203, 0.7)' },
  pocketLine: { flex: 1, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 18, color: 'rgba(236, 252, 203, 0.75)', fontVariant: OPEN_DIGITS },
  pocketActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  addPill: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 40, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#d9f99d' },
  addLabel: { fontFamily: Fonts.semiBold, fontSize: 15, lineHeight: 20, color: '#1a2e05' },
  roundActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  round: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(236, 252, 203, 0.35)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  pressed: { opacity: 0.8 },
  rowTitle: { fontFamily: Fonts.medium, fontSize: 16, lineHeight: 22 },
  rowCredits: { fontFamily: Fonts.semiBold, fontSize: 16, lineHeight: 22, fontVariant: OPEN_DIGITS },
  creditsValue: { alignItems: 'flex-end' },
  sheetBody: { padding: 16, gap: 12 },
  costValue: { fontFamily: Fonts.medium, fontSize: 14, lineHeight: 20, fontVariant: OPEN_DIGITS, paddingRight: 12 },
  note: { fontFamily: Fonts.regular, fontSize: 12, lineHeight: 16, paddingHorizontal: 4 },
});
