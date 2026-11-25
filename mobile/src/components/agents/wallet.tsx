import { useState } from 'react';
import { type LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import Svg, { Defs, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { AppIcon, type IconName } from '@/components/icons';
import { ListingCard } from '@/components/listing-hero/listing-card';
import { DayGroupedList, dayTotals, groupByDay } from '@/components/shared/day-groups';
import { DetailScreen } from '@/components/shared/detail-screen';
import { useSvgId } from '@/components/shared/hatch';
import { ListRow, ListRowLine, selectFilter } from '@/components/shared/listing';
import { PanelSheet, SHEET_BUTTON, SheetRow, SheetSection } from '@/components/shared/panel-sheet';
import { DotStatusBadge } from '@/components/shared/status';
import { PAGE_PADDING } from '@/components/tab-screen';
import { Fonts, OPEN_DIGITS } from '@/constants/theme';
import { MARKETPLACE_AGENTS } from '@/data/agents';
import { addCredits, AGENT_CREDIT_COST, CREDIT_PACKS, creditCostLabel, formatCredits, type LedgerEntry, RUPEES_PER_CREDIT, useWallet } from '@/data/wallet';
import { useBusiness } from '@/hooks/use-business';
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
 * The agent credits wallet (/agents/wallet), after the Wallet in Figma
 * (8217:60988) in the app's colours: credit cards peeking out of a stitched
 * green pocket with the balance, Add credits and two round actions. Under it,
 * History as the app's listings are: search and Filters, then day bands of
 * rows (icon, heading, sub text, badge at the end).
 */
export function AgentWallet() {
  const theme = useTheme();
  const toast = useToast();
  const { balance, ledger, usedToday } = useWallet();
  const [hidden, setHidden] = useState(false);
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
    <DetailScreen title="Wallet" fallbackHref="/agents" action={{ label: 'Add credits', icon: 'plus', onPress: () => setAddOpen(true) }}>
      <View style={styles.stack}>
        <WalletPocket
          balance={balance}
          usedToday={usedToday}
          hidden={hidden}
          onAdd={() => setAddOpen(true)}
          onCosts={() => setCostsOpen(true)}
          onToggleHidden={() => setHidden((current) => !current)}
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
              <ListRow key={entry.id} icon={<LedgerIcon entry={entry} />} accessibilityLabel={`${entry.credits > 0 ? 'Added' : 'Used'} ${formatCredits(entry.credits)} credits, ${entry.title}, ${entry.detail}, ${entry.time}`}>
                <ListRowLine
                  left={
                    <>
                      <Text style={[styles.rowCredits, { color: theme.colors.onSurface }]}>
                        {entry.credits > 0 ? '+' : '−'}
                        {formatCredits(entry.credits)} credits
                      </Text>
                      <Text variant="bodySmall" numberOfLines={1} style={[muted, styles.digits]}>
                        {entry.agentId ? `${entry.title} · ${entry.detail}` : entry.detail} · {entry.time}
                      </Text>
                    </>
                  }
                  right={<DotStatusBadge label={entry.credits > 0 ? 'Added' : 'Used'} tone={entry.credits > 0 ? 'success' : 'neutral'} />}
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

/** A ledger row's icon: the agent's own tile, or a credit arrow for top-ups. */
function LedgerIcon({ entry }: { entry: LedgerEntry }) {
  const theme = useTheme();
  return entry.agentId ? <AgentThumbnail agentId={entry.agentId} size={40} radius={20} glyphSize={18} /> : <AppIcon name="arrow-down-left" size={18} color={theme.colors.onSurface} />;
}

const POCKET_GREEN = ['#4d7c0f', '#365314', '#1a2e05'];

/**
 * The wallet: two Pine credit cards tucked into a stitched pocket (its top
 * dips in the middle, as a pocket's opening does), the balance on the pocket,
 * then Add credits and two round actions (credit costs, hide balance).
 */
function WalletPocket({
  balance,
  usedToday,
  hidden,
  onAdd,
  onCosts,
  onToggleHidden,
}: {
  balance: number;
  usedToday: number;
  hidden: boolean;
  onAdd: () => void;
  onCosts: () => void;
  onToggleHidden: () => void;
}) {
  const { organisation } = useBusiness();
  const [width, setWidth] = useState(0);
  const ids = { pocket: useSvgId('pocket'), glow: useSvgId('pocket-glow'), back: useSvgId('card-back'), front: useSvgId('card-front') };
  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);
  const W = width;
  const pocketTop = W * 0.22;
  const H = W * 0.86;
  const dip = W * 0.12;
  const r = 28;
  const pocket = (inset: number) => {
    const L = inset, R = W - inset, T = pocketTop + inset, B = H - inset, rr = r - inset;
    return `M ${L} ${T + rr} A ${rr} ${rr} 0 0 1 ${L + rr} ${T} C ${W * 0.32} ${T} ${W * 0.26} ${T + dip} ${W / 2} ${T + dip} C ${W * 0.74} ${T + dip} ${W * 0.68} ${T} ${R - rr} ${T} A ${rr} ${rr} 0 0 1 ${R} ${T + rr} L ${R} ${B - rr} A ${rr} ${rr} 0 0 1 ${R - rr} ${B} L ${L + rr} ${B} A ${rr} ${rr} 0 0 1 ${L} ${B - rr} Z`;
  };
  const front = { x: W * 0.06, y: W * 0.045, w: W * 0.88, h: W * 0.4 };
  return (
    <View onLayout={onLayout} style={{ height: W ? H : 300 }} accessible accessibilityLabel={hidden ? 'Agent credits wallet, balance hidden' : `Agent credits wallet, ${formatCredits(balance)} credits`}>
      {W ? (
        <>
          <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id={ids.back} x1="0" y1="0" x2="1" y2="1">
                <Stop offset={0} stopColor="#d9f99d" />
                <Stop offset={1} stopColor="#84cc16" />
              </LinearGradient>
              <LinearGradient id={ids.front} x1="0" y1="0" x2="1" y2="1">
                <Stop offset={0} stopColor="#f7fee7" />
                <Stop offset={0.55} stopColor="#d9f99d" />
                <Stop offset={1} stopColor="#bef264" />
              </LinearGradient>
              <LinearGradient id={ids.pocket} x1="0" y1="0" x2="1" y2="1">
                <Stop offset={0} stopColor={POCKET_GREEN[0]} />
                <Stop offset={0.55} stopColor={POCKET_GREEN[1]} />
                <Stop offset={1} stopColor={POCKET_GREEN[2]} />
              </LinearGradient>
              <RadialGradient id={ids.glow} cx="22%" cy="30%" rx="50%" ry="45%">
                <Stop offset={0} stopColor="#bef264" stopOpacity={0.35} />
                <Stop offset={1} stopColor="#bef264" stopOpacity={0} />
              </RadialGradient>
            </Defs>
            {/* The cards, tucked behind the pocket. */}
            <Rect x={W * 0.11} y={0} width={W * 0.78} height={W * 0.36} rx={16} fill={`url(#${ids.back})`} opacity={0.75} />
            <Rect x={front.x} y={front.y} width={front.w} height={front.h} rx={16} fill={`url(#${ids.front})`} />
            {/* The pocket, its glow, and the stitching along its edge. */}
            <Path d={pocket(0)} fill={`url(#${ids.pocket})`} />
            <Path d={pocket(0)} fill={`url(#${ids.glow})`} />
            <Path d={pocket(10)} fill="none" stroke="#ecfccb" strokeOpacity={0.55} strokeWidth={1.5} strokeDasharray="5 4" />
          </Svg>
          {/* On the front card, above the pocket's opening. */}
          <View style={[styles.cardFace, { left: front.x + 18, right: W - front.x - front.w + 18, top: front.y + 14 }]}>
            <View style={styles.flex}>
              <Text numberOfLines={1} style={styles.cardName}>
                {organisation.name}
              </Text>
              <Text style={styles.cardNumber}>•••• •••• {organisation.merchantId.slice(-4)}</Text>
            </View>
            <View style={styles.cardRight}>
              <Text style={styles.cardBrand}>PINE AI</Text>
              <Text style={styles.cardNumber}>1 credit = ₹{RUPEES_PER_CREDIT}</Text>
            </View>
          </View>
          {/* On the pocket. */}
          <View style={[styles.pocketBody, { top: pocketTop + dip + 10, height: H - pocketTop - dip - 10 }]}>
            <View>
              <Text style={styles.pocketLabel}>Credits balance</Text>
              <View style={styles.balanceRow}>
                <Text style={styles.balance}>{hidden ? '••••' : formatCredits(balance)}</Text>
                <Text style={styles.balanceUnit}>credits</Text>
              </View>
              <Text style={styles.pocketLine}>{hidden ? 'Balance hidden' : `≈ ₹${(balance * RUPEES_PER_CREDIT).toLocaleString('en-IN')} · ${usedToday} used today`}</Text>
            </View>
            <View style={styles.pocketActions}>
              <Pressable onPress={onAdd} accessibilityRole="button" accessibilityLabel="Add credits" style={({ pressed }) => [styles.addPill, pressed && styles.pressed]}>
                <AppIcon name="plus" size={18} color="#ffffff" />
                <Text style={styles.addLabel}>Add credits</Text>
              </Pressable>
              <View style={styles.roundActions}>
                <RoundButton icon="list-bullets" label="Credit costs" onPress={onCosts} />
                <RoundButton icon={hidden ? 'eye' : 'eye-slash'} label={hidden ? 'Show balance' : 'Hide balance'} onPress={onToggleHidden} />
              </View>
            </View>
          </View>
        </>
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
  cardFace: { position: 'absolute', flexDirection: 'row', gap: 12 },
  cardName: { fontFamily: Fonts.semiBold, fontSize: 16, lineHeight: 22, color: '#1a2e05' },
  cardNumber: { fontFamily: Fonts.medium, fontSize: 11, lineHeight: 16, color: 'rgba(26, 46, 5, 0.7)', letterSpacing: 1, fontVariant: OPEN_DIGITS },
  cardRight: { alignItems: 'flex-end' },
  cardBrand: { fontFamily: Fonts.bold, fontSize: 16, lineHeight: 22, color: '#1a2e05', letterSpacing: 1.5, fontStyle: 'italic' },
  pocketBody: { position: 'absolute', left: 0, right: 0, paddingHorizontal: 24, paddingBottom: 20, justifyContent: 'space-between' },
  pocketLabel: { fontFamily: Fonts.medium, fontSize: 14, lineHeight: 20, color: 'rgba(236, 252, 203, 0.85)' },
  balanceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  balance: { fontFamily: Fonts.semiBold, fontSize: 38, lineHeight: 46, color: '#ffffff', fontVariant: OPEN_DIGITS },
  balanceUnit: { fontFamily: Fonts.medium, fontSize: 18, lineHeight: 24, color: 'rgba(236, 252, 203, 0.7)' },
  pocketLine: { fontFamily: Fonts.regular, fontSize: 13, lineHeight: 18, color: 'rgba(236, 252, 203, 0.75)', fontVariant: OPEN_DIGITS },
  pocketActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  addPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(236, 252, 203, 0.35)',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  addLabel: { fontFamily: Fonts.medium, fontSize: 16, lineHeight: 22, color: '#ffffff' },
  roundActions: { flexDirection: 'row', gap: 8 },
  round: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(236, 252, 203, 0.35)',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  pressed: { opacity: 0.8 },
  rowCredits: { fontFamily: Fonts.semiBold, fontSize: 16, lineHeight: 22, fontVariant: OPEN_DIGITS },
  sheetBody: { padding: 16, gap: 12 },
  costValue: { fontFamily: Fonts.medium, fontSize: 14, lineHeight: 20, fontVariant: OPEN_DIGITS, paddingRight: 12 },
  note: { fontFamily: Fonts.regular, fontSize: 12, lineHeight: 16, paddingHorizontal: 4 },
});
