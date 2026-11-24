import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Share, StyleSheet, View } from 'react-native';
import { Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { Tabs } from '@/components/material3/tabs';
import { SearchField } from '@/components/search-field';
import { DetailRow, SectionCard } from '@/components/shared/detail-rows';
import { DetailScreen } from '@/components/shared/detail-screen';
import { initialsOf } from '@/components/shared/listing';
import { NotFound } from '@/components/shared/not-found';
import { PanelSheet } from '@/components/shared/panel-sheet';
import { SheetBlock, SheetButton, SheetField, SheetSuccess } from '@/components/shared/sheet-parts';
import { DotStatusBadge, type DotTone } from '@/components/shared/status';
import { PAGE_PADDING } from '@/components/tab-screen';
import { useAppColors } from '@/constants/app-colors';
import { Shape } from '@/constants/shape';
import { Fonts, OPEN_DIGITS } from '@/constants/theme';
import { formatInr } from '@/data/common';
import {
  addReferral,
  claimRewards,
  formatPhone,
  LEADERBOARD,
  MY_RANK,
  REFERRAL_STEPS,
  type Referral,
  type ReferralCategory,
  referralSummary,
  REWARD_PER_REFERRAL,
  updateReferralPhone,
  useProfile,
} from '@/data/profile';
import { useToast } from '@/hooks/use-toast';

import { FooterButton, LinkCard, Note, profileStyles, Timeline, type TimelineStep } from './profile-ui';

const CATEGORY: Record<ReferralCategory, { label: string; tone: DotTone; line: string }> = {
  successful: { label: 'Successful', tone: 'success', line: 'Reward credited' },
  inProgress: { label: 'In progress', tone: 'info', line: 'In progress' },
  ineligible: { label: 'Ineligible', tone: 'neutral', line: 'Not reward eligible' },
};
const rupees = (amount: number) => formatInr(amount).split('.')[0];
const PREVIEW = 3;

/**
 * Referrals (profile → App support), the old app's Track referrals: what
 * you've earned and can claim, your referrals by status (a few, then View
 * all), the leaderboard, and how it works. Refer now (footer) takes a
 * friend's details in a sheet.
 */
export function Referrals() {
  const theme = useTheme();
  const appColors = useAppColors();
  const toast = useToast();
  const { referrals, claimed, phone } = useProfile();
  const summary = referralSummary(referrals, claimed);
  const [referring, setReferring] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const muted = { color: theme.colors.onSurfaceVariant };

  return (
    <DetailScreen title="Referrals" fallbackHref="/" footer={<FooterButton label="Refer now" icon="user-plus" onPress={() => setReferring(true)} />}>
      <View style={[profileStyles.stack, profileStyles.first]}>
        {/* What you've earned, and what's still to come. */}
        <View style={[profileStyles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.earnedTop}>
            <Icon source="gift" size={24} color={theme.colors.primary} />
            <Text style={[profileStyles.small, muted]}>₹{REWARD_PER_REFERRAL} per successful referral</Text>
          </View>
          <View style={styles.earnedText}>
            <Text style={[profileStyles.medium, muted]}>Money earned so far</Text>
            <Text style={[styles.amount, { color: theme.colors.onSurface }]}>{rupees(summary.earned)}</Text>
            {summary.inProgress > 0 ? (
              <Text style={[profileStyles.body, muted]}>
                {rupees(summary.pending)} unlocks when your {summary.inProgress} in-progress referrals activate
              </Text>
            ) : null}
          </View>
          {summary.available > 0 ? (
            <View style={[styles.claim, { backgroundColor: appColors.highlight }]}>
              <View style={profileStyles.flex}>
                <Text style={[profileStyles.medium, { color: theme.colors.onSurface }]}>🎉 Congratulations!</Text>
                <Text style={[profileStyles.small, { color: theme.colors.onSurface }]}>{rupees(summary.available)} is ready to claim as a gift voucher</Text>
              </View>
              <SheetButton label="Claim now" onPress={() => setClaiming(true)} />
            </View>
          ) : null}
        </View>

        <LinkCard icon="trophy" title="View leaderboard" line={`Your rank - ${MY_RANK}`} onPress={() => router.push('/referrals/leaderboard')} />

        {/* Your referrals: one tile per status, then the latest few. */}
        <View style={[profileStyles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[profileStyles.title, { color: theme.colors.onSurface }]}>Your referrals</Text>
          <View style={styles.tiles}>
            {(['successful', 'inProgress', 'ineligible'] as const).map((category) => (
              <View key={category} style={[styles.tile, { backgroundColor: theme.colors.background }]}>
                <Text style={[styles.tileCount, { color: theme.colors.onSurface }]}>{summary[category]}</Text>
                <Text style={[profileStyles.medium, { color: theme.colors.onSurface }]}>{CATEGORY[category].label}</Text>
                <Text style={[profileStyles.small, muted]}>{category === 'inProgress' && summary.needsAction > 0 ? `${summary.needsAction} needs your action` : CATEGORY[category].line}</Text>
              </View>
            ))}
          </View>
          <View style={styles.list}>
            {referrals.slice(0, PREVIEW).map((referral, index) => (
              <ReferralRow key={referral.id} referral={referral} first={index === 0} />
            ))}
          </View>
          <SheetButton mode="outline" label={`View all referrals (${summary.total})`} onPress={() => router.push('/referrals/all')} />
        </View>

        <SectionCard title="How referral works?" collapsible={false}>
          <Timeline
            steps={[
              { title: "Share your friend's details", line: "Share your friend's name and details to refer them", state: 'done' },
              { title: 'We get them set up', line: 'We will contact your referral and help them get the Mini. Once activated, you can claim your reward', state: 'done' },
              { title: 'Earn rewards', line: 'Get gift vouchers for every successful referral, and special goodies for every referral milestone unlocked!', state: 'done' },
            ]}
          />
        </SectionCard>

        <Text onPress={() => toast("The terms aren't in the prototype yet")} style={[styles.terms, { color: theme.colors.primary }]}>
          Terms & Conditions
        </Text>
      </View>

      <ReferSheet visible={referring} onDismiss={() => setReferring(false)} ownPhone={phone} />
      <ClaimSheet visible={claiming} amount={summary.available} phone={phone} onDismiss={() => setClaiming(false)} />
    </DetailScreen>
  );
}

function ReferralRow({ referral, first }: { referral: Referral; first: boolean }) {
  const theme = useTheme();
  const appColors = useAppColors();
  const status = CATEGORY[referral.category];
  return (
    <TouchableRipple
      onPress={() => router.push(`/referrals/${referral.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${referral.name}, ${referral.business}, ${status.label}`}
      style={!first ? [styles.rowRule, { borderTopColor: theme.colors.background }] : undefined}>
      <View style={styles.row}>
        <View style={[styles.avatar, { backgroundColor: appColors.highlight }]}>
          <Text style={[styles.avatarText, { color: appColors.brand }]}>{initialsOf(referral.name)}</Text>
        </View>
        <View style={profileStyles.flex}>
          <Text numberOfLines={1} style={[profileStyles.medium, { color: theme.colors.onSurface }]}>
            {referral.name}
          </Text>
          <Text numberOfLines={1} style={[profileStyles.small, { color: theme.colors.onSurfaceVariant }]}>
            {referral.business} • {referral.city}
          </Text>
        </View>
        <View style={styles.rowEnd}>
          <DotStatusBadge label={status.label} tone={status.tone} />
          {referral.needsAction ? <Text style={[profileStyles.small, { color: theme.colors.error }]}>Needs action</Text> : <Text style={[profileStyles.small, { color: theme.colors.onSurfaceVariant }]}>{referral.referredOn}</Text>}
        </View>
      </View>
    </TouchableRipple>
  );
}

/** Every referral (old app: View all referrals): by status, searchable by name, city or number. */
export function AllReferrals() {
  const theme = useTheme();
  const { referrals } = useProfile();
  const [tab, setTab] = useState<'all' | ReferralCategory>('all');
  const [query, setQuery] = useState('');
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return referrals.filter(
      (referral) =>
        (tab === 'all' || referral.category === tab) &&
        (!q || [referral.name, referral.business, referral.city, referral.phone.replace(/\s/g, '')].some((value) => value.toLowerCase().includes(q.replace(/\s/g, ''))))
    );
  }, [referrals, tab, query]);

  return (
    <DetailScreen title={`Your referrals (${referrals.length})`} fallbackHref="/referrals">
      <View style={styles.tabs}>
        <Tabs
          variant="secondary"
          scrollable
          tabs={[
            { key: 'all', label: 'All' },
            { key: 'successful', label: 'Successful' },
            { key: 'inProgress', label: 'In progress' },
            { key: 'ineligible', label: 'Ineligible' },
          ]}
          activeKey={tab}
          onChange={(key) => setTab(key as typeof tab)}
        />
      </View>
      <View style={[profileStyles.card, { backgroundColor: theme.colors.surface }]}>
        <SearchField value={query} onChangeText={setQuery} placeholder="Search by name, city or number" radius={Shape.small} height={36} />
        {rows.length ? (
          <View style={styles.list}>
            {rows.map((referral, index) => (
              <ReferralRow key={referral.id} referral={referral} first={index === 0} />
            ))}
          </View>
        ) : (
          <Text style={[profileStyles.body, styles.empty, { color: theme.colors.onSurfaceVariant }]}>No referrals found</Text>
        )}
      </View>
    </DetailScreen>
  );
}

/** One referral (old app: Referral detail): where it's got to, its details, and the five-step timeline. */
export function ReferralDetail({ id }: { id: string }) {
  const theme = useTheme();
  const { referrals } = useProfile();
  const [editing, setEditing] = useState(false);
  const referral = referrals.find((item) => item.id === id);
  if (!referral) return <NotFound title="Referral detail" message="This referral doesn't exist." fallbackHref="/referrals" />;
  const status = CATEGORY[referral.category];
  const steps: TimelineStep[] =
    referral.category === 'ineligible'
      ? [
          ...REFERRAL_STEPS.slice(0, referral.stage + 1).map((step, index) => ({ title: step.title, line: step.line, at: index === 0 ? referral.referredOn : undefined, state: 'done' as const })),
          { title: referral.reason ?? 'Ineligible', line: 'This referral can no longer earn a reward', at: referral.lastUpdate, state: 'failed' as const },
        ]
      : REFERRAL_STEPS.map((step, index) => ({
          title: step.title,
          line: step.line,
          at: index === 0 ? referral.referredOn : index === referral.stage ? referral.lastUpdate : undefined,
          state: index <= referral.stage ? ('done' as const) : index === referral.stage + 1 ? ('current' as const) : ('todo' as const),
        }));
  const stage = referral.category === 'ineligible' ? (referral.reason ?? 'Ineligible') : REFERRAL_STEPS[referral.stage].title;

  return (
    <DetailScreen
      title="Referral detail"
      fallbackHref="/referrals"
      footer={referral.needsAction ? <FooterButton label="Edit mobile no" icon="pencil-simple" onPress={() => setEditing(true)} /> : undefined}>
      <View style={[profileStyles.stack, profileStyles.first]}>
        <View style={[profileStyles.card, styles.hero, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.heroName, { color: theme.colors.onSurface }]}>{referral.name}</Text>
          <Text style={[profileStyles.medium, { color: theme.colors.onSurfaceVariant }]}>{referral.business}</Text>
          <DotStatusBadge label={status.label} tone={status.tone} />
        </View>
        {referral.needsAction ? <Note icon="warning-circle">We couldn’t reach {referral.name.split(' ')[0]} on +91 {referral.phone}. Check the number so we can get in touch.</Note> : null}
        <SectionCard title="Details" collapsible={false}>
          <DetailRow label="Current stage" value={stage} />
          <DetailRow label="Referred on" value={referral.referredOn} />
          <DetailRow label="Last update" value={referral.lastUpdate} />
          <DetailRow label="Reward" value={referral.category === 'successful' ? `₹${REWARD_PER_REFERRAL}${referral.stage === 4 ? ' · Claimed' : ''}` : referral.category === 'ineligible' ? '—' : `₹${REWARD_PER_REFERRAL} on success`} />
          <DetailRow label="Mobile no" value={`+91 ${referral.phone}`} />
          <DetailRow label="City" value={`${referral.city} ${referral.pincode}`} />
        </SectionCard>
        <SectionCard title="Referral timeline" collapsible={false}>
          <Timeline steps={steps} />
        </SectionCard>
      </View>
      <EditPhoneSheet referral={editing ? referral : null} onDismiss={() => setEditing(false)} />
    </DetailScreen>
  );
}

/** Top referrers (old app: Leaderboard), with where you stand. */
export function ReferralLeaderboard() {
  const theme = useTheme();
  const appColors = useAppColors();
  const { referrals } = useProfile();
  const medal = ['#d4a017', '#9ca3af', '#b87333'];
  return (
    <DetailScreen title="Leaderboard" fallbackHref="/referrals">
      <View style={[profileStyles.stack, profileStyles.first]}>
        <View style={[profileStyles.card, styles.rank, { backgroundColor: appColors.highlight }]}>
          <Icon source="medal" size={28} color={appColors.brand} />
          <View style={profileStyles.flex}>
            <Text style={[profileStyles.title, { color: theme.colors.onSurface }]}>Your rank - {MY_RANK}</Text>
            <Text style={[profileStyles.small, { color: theme.colors.onSurface }]}>{referrals.length} referrals · refer {LEADERBOARD[LEADERBOARD.length - 1].referrals - referrals.length + 1} more to enter the top performers</Text>
          </View>
        </View>
        <View style={[profileStyles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.boardHead}>
            <Text style={[profileStyles.title, profileStyles.flex, { color: theme.colors.onSurface }]}>Top performers</Text>
            <Text style={[profileStyles.small, { color: theme.colors.onSurfaceVariant }]}>Referrals</Text>
          </View>
          {LEADERBOARD.map((entry, index) => (
            <View key={entry.rank} style={[styles.boardRow, index > 0 && [styles.rowRule, { borderTopColor: theme.colors.background }]]}>
              <View style={[styles.rankBadge, { backgroundColor: index < 3 ? medal[index] : theme.colors.background }]}>
                <Text style={[styles.rankText, { color: index < 3 ? '#ffffff' : theme.colors.onSurface }]}>{entry.rank}</Text>
              </View>
              <View style={profileStyles.flex}>
                <Text style={[profileStyles.medium, { color: theme.colors.onSurface }]}>{entry.name}</Text>
                <Text style={[profileStyles.small, { color: theme.colors.onSurfaceVariant }]}>{entry.city}</Text>
              </View>
              <Text style={[styles.boardCount, { color: theme.colors.onSurface }]}>{entry.referrals}</Text>
            </View>
          ))}
        </View>
      </View>
    </DetailScreen>
  );
}

/** Refer now (old app: referral form sheet): the friend's name, number, business and where it is. */
function ReferSheet({ visible, onDismiss, ownPhone }: { visible: boolean; onDismiss: () => void; ownPhone: string }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [business, setBusiness] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [done, setDone] = useState(false);
  const [wasVisible, setWasVisible] = useState(false);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setName('');
      setPhone('');
      setBusiness('');
      setPincode('');
      setCity('');
      setDone(false);
    }
  }
  const digits = phone.replace(/\D/g, '');
  const phoneError =
    digits.length === 10 && formatPhone(digits) === formatPhone(ownPhone)
      ? 'Number already associated with your account'
      : phone.length > 0 && digits.length !== 10
        ? 'Please enter a valid 10-digit mobile number'
        : undefined;
  const valid = name.trim().length > 1 && digits.length === 10 && !phoneError && business.trim().length > 1 && /^\d{6}$/.test(pincode) && city.trim().length > 1;

  return (
    <PanelSheet
      visible={visible}
      onDismiss={onDismiss}
      title={done ? 'Referral submitted' : 'Refer a business'}
      fit
      footer={
        done ? (
          <View style={styles.footerRow}>
            <View style={profileStyles.flex}>
              <SheetButton mode="outline" icon="share-network" label="Share" onPress={() => Share.share({ message: 'I use Pine Labs One to accept payments at my store. I have referred you — the Pine Labs team will call you shortly to get you set up with the Mini.' })} />
            </View>
            <View style={profileStyles.flex}>
              <SheetButton label="Done" onPress={onDismiss} />
            </View>
          </View>
        ) : (
          <SheetButton
            label="Submit"
            disabled={!valid}
            onPress={() => {
              addReferral({ name: name.trim(), phone: digits, business: business.trim(), pincode, city: city.trim() });
              setDone(true);
            }}
          />
        )
      }>
      {done ? (
        <SheetSuccess title="Thank you!" body="You will receive a gift voucher once your referral is confirmed." />
      ) : (
        <SheetBlock last gap={16}>
          <Text style={profileStyles.body}>Share your referral details below</Text>
          <SheetField label="Name" value={name} onChangeText={setName} placeholder="Your friend's name" />
          <SheetField label="Mobile no" value={phone} onChangeText={setPhone} placeholder="10-digit mobile number" keyboardType="number-pad" prefix="phone" error={phoneError} />
          <SheetField label="Business name" value={business} onChangeText={setBusiness} placeholder="e.g. Sharma General Store" />
          <View style={styles.footerRow}>
            <View style={profileStyles.flex}>
              <SheetField label="Pin code" value={pincode} onChangeText={(value) => setPincode(value.replace(/\D/g, '').slice(0, 6))} placeholder="560034" keyboardType="number-pad" />
            </View>
            <View style={profileStyles.flex}>
              <SheetField label="City" value={city} onChangeText={setCity} placeholder="City" />
            </View>
          </View>
        </SheetBlock>
      )}
    </PanelSheet>
  );
}

/** Claim now (old app: reward popup): where the voucher goes, then the confirmation. */
function ClaimSheet({ visible, amount, phone, onDismiss }: { visible: boolean; amount: number; phone: string; onDismiss: () => void }) {
  const theme = useTheme();
  const { email } = useProfile();
  const [claimedAmount, setClaimedAmount] = useState<number | null>(null);
  const [wasVisible, setWasVisible] = useState(false);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setClaimedAmount(null);
  }
  return (
    <PanelSheet
      visible={visible}
      onDismiss={onDismiss}
      title="Claim reward"
      fit
      footer={
        claimedAmount !== null ? (
          <SheetButton label="Done" onPress={onDismiss} />
        ) : (
          <SheetButton
            label="Confirm"
            onPress={() => {
              setClaimedAmount(amount);
              claimRewards(amount);
            }}
          />
        )
      }>
      {claimedAmount !== null ? (
        <SheetSuccess title={`Great! Your Amazon voucher of ${rupees(claimedAmount)} is on its way`} body="Keep on referring to earn more!" />
      ) : (
        <SheetBlock last gap={12}>
          <Text style={[styles.claimAmount, { color: theme.colors.onSurface }]}>{rupees(amount)}</Text>
          <Text style={[profileStyles.body, { color: theme.colors.onSurface }]}>
            The voucher will be sent to your registered mobile number <Text style={profileStyles.medium}>+91 {phone}</Text> and email <Text style={profileStyles.medium}>{email}</Text>.
          </Text>
          <Note>If you want to change your mobile number or email, edit it from Personal details in your profile.</Note>
        </SheetBlock>
      )}
    </PanelSheet>
  );
}

function EditPhoneSheet({ referral, onDismiss }: { referral: Referral | null; onDismiss: () => void }) {
  const toast = useToast();
  const [phone, setPhone] = useState('');
  const [shown, setShown] = useState<string | null>(null);
  if ((referral?.id ?? null) !== shown) {
    setShown(referral?.id ?? null);
    if (referral) setPhone(referral.phone.replace(/\s/g, ''));
  }
  const digits = phone.replace(/\D/g, '');
  return (
    <PanelSheet
      visible={referral !== null}
      onDismiss={onDismiss}
      title="Edit mobile no"
      fit
      footer={
        <SheetButton
          label="Update details"
          disabled={digits.length !== 10}
          onPress={() => {
            if (!referral) return;
            updateReferralPhone(referral.id, digits);
            onDismiss();
            toast('Mobile no updated. We’ll call them again shortly.');
          }}
        />
      }>
      <SheetBlock last>
        <SheetField label="Mobile no" value={phone} onChangeText={setPhone} keyboardType="number-pad" prefix="phone" error={phone.length > 0 && digits.length !== 10 ? 'Please enter a valid 10-digit mobile number' : undefined} />
      </SheetBlock>
    </PanelSheet>
  );
}

const styles = StyleSheet.create({
  earnedTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  earnedText: { gap: 2 },
  amount: { fontFamily: Fonts.semiBold, fontSize: 28, lineHeight: 36, fontVariant: OPEN_DIGITS },
  claim: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 10 },
  tiles: { flexDirection: 'row', gap: 8 },
  tile: { flex: 1, borderRadius: 10, padding: 10, gap: 2 },
  tileCount: { fontFamily: Fonts.semiBold, fontSize: 20, lineHeight: 28, fontVariant: OPEN_DIGITS },
  list: { marginHorizontal: -12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingVertical: 12 },
  rowRule: { borderTopWidth: 1 },
  rowEnd: { alignItems: 'flex-end', gap: 4 },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: Fonts.semiBold, fontSize: 13, lineHeight: 16 },
  terms: { fontFamily: Fonts.medium, fontSize: 12, lineHeight: 16, textAlign: 'center', paddingVertical: 16 },
  tabs: { marginHorizontal: -PAGE_PADDING, marginTop: -PAGE_PADDING },
  empty: { textAlign: 'center', paddingVertical: 24 },
  hero: { alignItems: 'center', gap: 4, paddingVertical: 20 },
  heroName: { fontFamily: Fonts.semiBold, fontSize: 20, lineHeight: 28 },
  rank: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  boardHead: { flexDirection: 'row', alignItems: 'center' },
  boardRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  rankBadge: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  rankText: { fontFamily: Fonts.semiBold, fontSize: 12, lineHeight: 16 },
  boardCount: { fontFamily: Fonts.semiBold, fontSize: 16, lineHeight: 24, fontVariant: OPEN_DIGITS },
  footerRow: { flexDirection: 'row', gap: 8 },
  claimAmount: { fontFamily: Fonts.semiBold, fontSize: 28, lineHeight: 36, fontVariant: OPEN_DIGITS },
});
