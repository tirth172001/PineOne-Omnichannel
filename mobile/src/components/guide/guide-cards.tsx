import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Fragment, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { LocalSvg } from 'react-native-svg/css';

import { AgentThumbnail } from '@/components/agents/agent-visuals';
import { BankLogo } from '@/components/shared/bank-logo';
import { SelectionMark } from '@/components/shared/selection-mark';
import { Shape } from '@/constants/shape';
import { Fonts, OPEN_DIGITS } from '@/constants/theme';
import type { GuideAction, GuideCard, GuideChip, HealthCheckKey, KvRow } from '@/data/guide';
import { useToast } from '@/hooks/use-toast';

import { GuideDonut, GuideTrend } from './guide-charts';

// The reply cards from the playground's Guide (Figma "Guide - AI Assistant",
// "Cards"): key-value tables, option lists, device health, tickets, callback,
// VAS, charts — as white cards on the page's grey, borderless.

const SUCCESS = '#059669';
const DANGER = '#dc2626';
const GUIDE_LOGO = require('../../../assets/images/guide/guide-logo.svg');

/** The Guide mark (the web's guide-logo), in the text colour so it follows dark mode. */
export function GuideMark({ size = 24, color }: { size?: number; color?: string }) {
  const theme = useTheme();
  return <LocalSvg asset={GUIDE_LOGO} width={size} height={size} color={color ?? theme.colors.onSurface} />;
}

/** Text with **bold** spans and line breaks; a blank line starts a new paragraph. */
export function RichText({ text, style, color }: { text: string; style?: object; color?: string }) {
  const theme = useTheme();
  const tint = color ?? theme.colors.onSurface;
  return (
    <View style={styles.paragraphs}>
      {text.split('\n\n').map((paragraph, index) => (
        <Text key={index} style={[styles.body, { color: tint }, style]}>
          {paragraph.split(/(\*\*[^*]+\*\*)/g).map((part, partIndex) =>
            part.startsWith('**') && part.endsWith('**') ? (
              <Text key={partIndex} style={styles.bold}>
                {part.slice(2, -2)}
              </Text>
            ) : (
              <Fragment key={partIndex}>{part}</Fragment>
            )
          )}
        </Text>
      ))}
    </View>
  );
}

// ---- Chips and buttons ----------------------------------------------------

/** A follow-up the merchant can tap: a white pill with the bend arrow. */
export function FollowUpChip({ label, onPress, disabled, onCard = false }: { label: string; onPress: () => void; disabled?: boolean; /** On a white card: grey instead of white. */ onCard?: boolean }) {
  const theme = useTheme();
  return (
    <TouchableRipple
      onPress={onPress}
      disabled={disabled}
      borderless
      accessibilityRole="button"
      style={[styles.chip, { backgroundColor: onCard ? theme.colors.surfaceVariant : theme.colors.surface, opacity: disabled ? 0.6 : 1 }]}>
      <View style={styles.chipContent}>
        <Text style={[styles.chipLabel, { color: theme.colors.onSurface }]}>{label}</Text>
        <Icon source="arrow-bend-down-right" size={16} color={theme.colors.onSurfaceVariant} />
      </View>
    </TouchableRipple>
  );
}

/** Shuffle and Need support, under the starters and some replies. */
export function ExtraChips({ onShuffle, onSupport, disabled }: { onShuffle: () => void; onSupport: () => void; disabled?: boolean }) {
  const theme = useTheme();
  const pill = (label: string, icon: string, tint: string, onPress: () => void) => (
    <TouchableRipple
      onPress={onPress}
      disabled={disabled}
      borderless
      accessibilityRole="button"
      style={[styles.extra, { backgroundColor: tint, opacity: disabled ? 0.6 : 1 }]}>
      <View style={styles.chipContent}>
        <Icon source={icon} size={18} color={theme.colors.onSurface} />
        <Text style={[styles.chipLabel, { color: theme.colors.onSurface }]}>{label}</Text>
      </View>
    </TouchableRipple>
  );
  return (
    <View style={styles.extras}>
      {pill('Shuffle', 'shuffle', theme.dark ? 'rgba(147, 51, 234, 0.22)' : 'rgba(147, 51, 234, 0.1)', onShuffle)}
      {pill('Need support', 'headset', theme.dark ? 'rgba(22, 163, 74, 0.22)' : 'rgba(22, 163, 74, 0.1)', onSupport)}
    </View>
  );
}

export function GuideChips({ chips, onChip, disabled }: { chips: GuideChip[]; onChip: (chip: GuideChip) => void; disabled?: boolean }) {
  return (
    <View style={styles.chips}>
      {chips.map((chip) => (
        <FollowUpChip key={chip.label} label={chip.label} onPress={() => onChip(chip)} disabled={disabled} />
      ))}
    </View>
  );
}

function useActionTone() {
  const theme = useTheme();
  return (tone: GuideAction['tone'] = 'neutral') => {
    switch (tone) {
      case 'primary':
        return { backgroundColor: theme.colors.primary, color: theme.colors.onPrimary };
      case 'support':
        return { backgroundColor: theme.dark ? 'rgba(22, 163, 74, 0.22)' : 'rgba(22, 163, 74, 0.1)', color: theme.colors.onSurface };
      case 'danger':
        return { backgroundColor: theme.dark ? 'rgba(220, 38, 38, 0.22)' : 'rgba(220, 38, 38, 0.08)', color: theme.dark ? '#f87171' : DANGER };
      default:
        return { backgroundColor: theme.colors.surface, color: theme.colors.onSurface };
    }
  };
}

/** Pill buttons under a reply, e.g. Create a ticket / Edit details / Cancel. */
export function GuideActions({
  actions,
  layout = 'stack',
  onAction,
  disabled,
}: {
  actions: GuideAction[];
  layout?: 'stack' | 'row';
  onAction: (action: GuideAction) => void;
  disabled?: boolean;
}) {
  const toneOf = useActionTone();
  return (
    <View style={layout === 'row' ? styles.actionsRow : styles.actionsStack}>
      {actions.map((action) => {
        const tone = toneOf(action.tone);
        return (
          <TouchableRipple
            key={action.label}
            onPress={() => onAction(action)}
            disabled={disabled}
            borderless
            accessibilityRole="button"
            style={[styles.action, layout === 'row' ? styles.actionRowItem : styles.actionStackItem, { backgroundColor: tone.backgroundColor, opacity: disabled ? 0.6 : 1 }]}>
            <View style={styles.actionContent}>
              {action.icon === 'ticket' ? <Icon source="ticket" size={16} color={tone.color} /> : null}
              <RichText text={action.label} color={tone.color} style={styles.actionLabel} />
            </View>
          </TouchableRipple>
        );
      })}
    </View>
  );
}

// ---- Cards ----------------------------------------------------------------

function Card({ children, width, style }: { children: React.ReactNode; width?: number; style?: object }) {
  const theme = useTheme();
  return <View style={[styles.card, { backgroundColor: theme.colors.surface }, width ? { width, maxWidth: '100%' } : null, style]}>{children}</View>;
}

function Hairline() {
  const theme = useTheme();
  return <View style={[styles.hairline, { backgroundColor: theme.colors.background }]} />;
}

function KvRows({ rows }: { rows: KvRow[] }) {
  const theme = useTheme();
  return rows.map((row, index) => (
    <Fragment key={row.label}>
      {index > 0 ? <Hairline /> : null}
      <View style={styles.kvRow}>
        <Text style={[styles.kvLabel, { color: theme.colors.onSurfaceVariant }]}>{row.label}</Text>
        <Text style={[styles.kvValue, { color: theme.colors.onSurface }, row.link && styles.link]}>{row.value}</Text>
      </View>
    </Fragment>
  ));
}

function DeviceImage() {
  return (
    <>
      <View style={styles.deviceImage}>
        <Image source={require('../../../assets/images/guide/pos-terminal.png')} style={styles.terminal} contentFit="contain" accessibilityLabel="PAX A910 terminal" />
      </View>
      <Hairline />
    </>
  );
}

const HEALTH: Record<HealthCheckKey, { label: string; icon: string }> = {
  battery: { label: 'Battery', icon: 'battery-full' },
  printer: { label: 'Printer', icon: 'printer' },
  software: { label: 'Software', icon: 'cpu' },
  connectivity: { label: 'Connectivity', icon: 'wifi-high' },
};

function HealthCard({ checks }: { checks: { key: HealthCheckKey; ok: boolean }[] }) {
  const theme = useTheme();
  const toast = useToast();
  return (
    <Card width={220}>
      <DeviceImage />
      {checks.map(({ key, ok }, index) => (
        <Fragment key={key}>
          {index > 0 ? <Hairline /> : null}
          <View style={styles.kvRow}>
            <Icon source={HEALTH[key].icon} size={20} color={theme.colors.onSurface} />
            <Text style={[styles.kvLabel, styles.flex, { color: theme.colors.onSurface }]}>{HEALTH[key].label}</Text>
            <Icon source={ok ? 'check-circle-fill' : 'x-circle-fill'} size={20} color={ok ? SUCCESS : DANGER} />
          </View>
        </Fragment>
      ))}
      <Hairline />
      <TouchableRipple onPress={() => toast('Health report downloaded')} accessibilityRole="button">
        <View style={styles.cardButton}>
          <Icon source="download-simple" size={16} color={theme.colors.onSurface} />
          <Text style={[styles.cardButtonLabel, { color: theme.colors.onSurface }]}>Download report</Text>
        </View>
      </TouchableRipple>
    </Card>
  );
}

function OptionsCard({ options, onPick, disabled }: { options: string[]; onPick: (option: string) => void; disabled?: boolean }) {
  const theme = useTheme();
  return (
    <Card width={240}>
      {options.map((option, index) => (
        <Fragment key={option}>
          {index > 0 ? <Hairline /> : null}
          <TouchableRipple onPress={() => onPick(option)} disabled={disabled} accessibilityRole="button">
            <View style={styles.option}>
              <Text numberOfLines={1} style={[styles.optionLabel, { color: theme.colors.onSurface }]}>
                {option}
              </Text>
              <Icon source="caret-right" size={16} color={theme.colors.onSurface} />
            </View>
          </TouchableRipple>
        </Fragment>
      ))}
    </Card>
  );
}

function TicketCard({ status, title, when }: { status: 'Open' | 'Resolved'; title: string; when: string }) {
  const theme = useTheme();
  const open = status === 'Open';
  return (
    <TouchableRipple onPress={() => router.push('/support/tickets')} borderless accessibilityRole="button" style={[styles.card, styles.ticket, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.ticketContent}>
        <View style={styles.rowBetween}>
          <View style={[styles.badge, { backgroundColor: open ? 'rgba(250, 204, 21, 0.35)' : 'rgba(22, 163, 74, 0.12)' }]}>
            <Text style={[styles.badgeLabel, { color: open ? (theme.dark ? '#fde68a' : '#713f12') : theme.dark ? '#4ade80' : '#15803d' }]}>{status}</Text>
          </View>
          <Icon source="caret-right" size={16} color={theme.colors.onSurface} />
        </View>
        <Text style={[styles.optionLabel, { color: theme.colors.onSurface }]}>{title}</Text>
        <Text style={[styles.small, { color: theme.colors.onSurfaceVariant }]}>{when}</Text>
      </View>
    </TouchableRipple>
  );
}

function CallbackCard() {
  const theme = useTheme();
  return (
    <Card width={320} style={styles.callback}>
      <Image source={require('../../../assets/images/guide/support-agent.png')} style={styles.agent} contentFit="cover" contentPosition="top" accessibilityIgnoresInvertColors />
      <View style={styles.flex}>
        <Text style={[styles.optionLabel, styles.medium, { color: theme.colors.onSurface }]}>Callback request created</Text>
        <Text style={[styles.small, { color: theme.colors.onSurfaceVariant }]}>Support team will follow up through the available support channel within 1-2 hrs</Text>
      </View>
    </Card>
  );
}

function NoticeCard({
  tone,
  text,
  actions,
  onAction,
}: {
  tone: 'vas' | 'success';
  text: string;
  actions?: GuideAction[];
  onAction?: (action: GuideAction) => void;
}) {
  const toneOf = useActionTone();
  return (
    <Card width={300} style={styles.notice}>
      {tone === 'vas' ? (
        <View style={styles.vasIcon}>
          <Icon source="credit-card-fill" size={16} color="#4f46e5" />
        </View>
      ) : (
        <Icon source="check-circle-fill" size={20} color={SUCCESS} />
      )}
      <RichText text={text} style={styles.optionLabel} />
      {actions?.length ? (
        <View style={styles.noticeActions}>
          {actions.map((action) => {
            const colors = toneOf(action.tone === 'primary' ? 'primary' : 'neutral');
            return (
              <TouchableRipple
                key={action.label}
                onPress={() => onAction?.(action)}
                borderless
                accessibilityRole="button"
                style={[styles.noticeButton, { backgroundColor: action.tone === 'primary' ? colors.backgroundColor : undefined }, action.tone !== 'primary' && styles.noticeOutline]}>
                <Text style={[styles.cardButtonLabel, { color: colors.color }]}>{action.label}</Text>
              </TouchableRipple>
            );
          })}
        </View>
      ) : null}
    </Card>
  );
}

function DevicesCard({ devices, initial, active, onSubmit }: { devices: string[]; initial: string[]; active: boolean; onSubmit: (selected: string[]) => void }) {
  const theme = useTheme();
  const [selected, setSelected] = useState(initial);
  return (
    <Card width={220}>
      {devices.map((device, index) => {
        const checked = selected.includes(device);
        return (
          <Fragment key={device}>
            {index > 0 ? <Hairline /> : null}
            <TouchableRipple
              onPress={() => setSelected((current) => (checked ? current.filter((item) => item !== device) : [...current, device]))}
              disabled={!active}
              accessibilityRole="checkbox"
              accessibilityState={{ checked, disabled: !active }}>
              <View style={styles.kvRow}>
                <SelectionMark type="checkbox" checked={checked} />
                <Text style={[styles.kvLabel, { color: theme.colors.onSurface }]}>{device}</Text>
              </View>
            </TouchableRipple>
          </Fragment>
        );
      })}
      {active ? (
        <>
          <Hairline />
          <View style={styles.cardFooter}>
            <TouchableRipple
              onPress={() => onSubmit(selected)}
              disabled={selected.length === 0}
              borderless
              accessibilityRole="button"
              style={[styles.noticeButton, { backgroundColor: theme.colors.primary, opacity: selected.length ? 1 : 0.5 }]}>
              <Text style={[styles.cardButtonLabel, { color: theme.colors.onPrimary }]}>Enable VAS</Text>
            </TouchableRipple>
          </View>
        </>
      ) : null}
    </Card>
  );
}

function MethodsTable({ rows }: { rows: { method: string; count: number; amount: string }[] }) {
  const theme = useTheme();
  const cell = [styles.kvLabel, { color: theme.colors.onSurface }];
  return (
    <Card width={300}>
      <View style={[styles.kvRow, { backgroundColor: theme.colors.surfaceVariant }]}>
        <Text style={[cell, styles.flex, styles.medium]}>Method</Text>
        <Text style={[cell, styles.countCol, styles.medium]}>Transactions</Text>
        <Text style={[cell, styles.amountCol, styles.medium]}>Amount</Text>
      </View>
      {rows.map((row) => (
        <Fragment key={row.method}>
          <Hairline />
          <View style={styles.kvRow}>
            <Text style={[cell, styles.flex]}>{row.method}</Text>
            <Text style={[cell, styles.countCol, styles.digits]}>{row.count}</Text>
            <Text style={[cell, styles.amountCol, styles.digits]}>{row.amount}</Text>
          </View>
        </Fragment>
      ))}
    </Card>
  );
}

// ---- One card, by kind ----------------------------------------------------

export function GuideCardView({
  card,
  active,
  actions,
  onAction,
  onPick,
  onDevices,
}: {
  card: GuideCard;
  /** Only the latest reply can still be acted on. */
  active: boolean;
  actions?: GuideAction[];
  onAction: (action: GuideAction) => void;
  onPick: (option: string) => void;
  onDevices: (selected: string[]) => void;
}) {
  const theme = useTheme();
  switch (card.kind) {
    case 'kv':
      return (
        <Card width={320}>
          <KvRows rows={card.rows} />
          {card.footer ? (
            <>
              <Hairline />
              <View style={styles.kvRow}>
                <BankLogo bank={card.footer.bank} />
                <Text style={[styles.kvLabel, styles.medium, { color: theme.colors.onSurface }]}>{card.footer.label}</Text>
              </View>
            </>
          ) : null}
        </Card>
      );
    case 'options':
      return <OptionsCard options={card.options} onPick={onPick} disabled={!active} />;
    case 'health':
      return <HealthCard checks={card.checks} />;
    case 'device':
      return (
        <Card width={220}>
          <DeviceImage />
          <KvRows rows={card.rows} />
        </Card>
      );
    case 'ticket-draft':
      return (
        <Card width={320}>
          <DeviceImage />
          <Text style={[styles.optionLabel, styles.padded, { color: theme.colors.onSurface }]}>{card.title}</Text>
          <Hairline />
          <KvRows rows={card.rows} />
        </Card>
      );
    case 'ticket':
      return <TicketCard status={card.status} title={card.title} when={card.when} />;
    case 'callback':
      return <CallbackCard />;
    case 'vas':
      return (
        <NoticeCard
          tone="vas"
          text="To accept payments from international cards you need to enable the “**International Card**” value aided service (VAS)."
          actions={active ? actions : undefined}
          onAction={onAction}
        />
      );
    case 'success':
      return <NoticeCard tone="success" text={card.text} />;
    case 'devices':
      return <DevicesCard devices={card.devices} initial={card.selected} active={active} onSubmit={onDevices} />;
    case 'methods':
      return <MethodsTable rows={card.rows} />;
    case 'txn':
      return (
        <Card style={styles.txn}>
          {card.lines.map((line) => (
            <Text key={line} style={[styles.optionLabel, { color: theme.colors.onSurface }]}>
              {line}
            </Text>
          ))}
        </Card>
      );
    case 'donut':
      return <GuideDonut />;
    case 'trend':
      return <GuideTrend />;
    case 'agent-credits':
      return <AgentCreditsCard card={card} actions={active ? actions : undefined} onAction={onAction} />;
  }
}

/**
 * Guide handing work to an agent: the agent and the task, what it costs in
 * credits, the wallet balance and what's left after, then Not now / Use agent.
 * The wallet link opens the credits wallet (Agents).
 */
function AgentCreditsCard({
  card,
  actions,
  onAction,
}: {
  card: Extract<GuideCard, { kind: 'agent-credits' }>;
  actions?: GuideAction[];
  onAction?: (action: GuideAction) => void;
}) {
  const theme = useTheme();
  const toneOf = useActionTone();
  const short = card.balance < card.credits;
  const rows: [string, string, boolean?][] = [
    ['Uses', `${card.credits.toLocaleString('en-IN')} credits · ${card.rate}`],
    ['Your balance', `${card.balance.toLocaleString('en-IN')} credits`],
    ['Left after', short ? 'Not enough credits' : `${(card.balance - card.credits).toLocaleString('en-IN')} credits`, true],
  ];
  return (
    <Card width={320}>
      <View style={styles.agentHead}>
        <AgentThumbnail agentId={card.agentId} size={40} radius={8} glyphSize={18} />
        <View style={styles.flex}>
          <Text style={[styles.optionLabel, styles.medium, { color: theme.colors.onSurface }]}>{card.agentName}</Text>
          <Text style={[styles.small, { color: theme.colors.onSurfaceVariant }]}>{card.task}</Text>
        </View>
        <Icon source="coins-fill" size={18} color={theme.colors.primary} />
      </View>
      {rows.map(([label, value, strong]) => (
        <Fragment key={label}>
          <Hairline />
          <View style={styles.kvRow}>
            <Text style={[styles.kvLabel, styles.flex, { color: theme.colors.onSurfaceVariant }]}>{label}</Text>
            <Text style={[styles.kvLabel, styles.digits, strong && styles.medium, { color: short && strong ? theme.colors.error : theme.colors.onSurface }]}>{value}</Text>
          </View>
        </Fragment>
      ))}
      <Hairline />
      <TouchableRipple onPress={() => router.push('/agents/wallet')} accessibilityRole="link">
        <View style={styles.kvRow}>
          <Text style={[styles.kvLabel, styles.flex, styles.medium, { color: theme.colors.primary }]}>Open wallet</Text>
          <Icon source="caret-right" size={16} color={theme.colors.primary} />
        </View>
      </TouchableRipple>
      {actions?.length ? (
        <View style={[styles.noticeActions, styles.agentActions]}>
          {actions.map((action) => {
            const colors = toneOf(action.tone === 'primary' ? 'primary' : 'neutral');
            return (
              <TouchableRipple
                key={action.label}
                onPress={() => onAction?.(action)}
                borderless
                accessibilityRole="button"
                style={[styles.noticeButton, { backgroundColor: action.tone === 'primary' ? colors.backgroundColor : undefined }, action.tone !== 'primary' && styles.noticeOutline]}>
                <Text style={[styles.cardButtonLabel, { color: colors.color }]}>{action.label}</Text>
              </TouchableRipple>
            );
          })}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  agentHead: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  agentActions: { padding: 12 },
  fullWidth: { alignSelf: 'stretch' },
  medium: { fontFamily: Fonts.medium },
  bold: { fontFamily: Fonts.bold },
  paragraphs: { gap: 16 },
  body: { fontFamily: Fonts.regular, fontSize: 16, lineHeight: 24 },
  small: { fontFamily: Fonts.regular, fontSize: 12, lineHeight: 16 },
  link: { textDecorationLine: 'underline' },
  digits: { fontVariant: OPEN_DIGITS },
  chips: { gap: 8, alignItems: 'flex-start' },
  chip: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
  chipContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chipLabel: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20, flexShrink: 1 },
  extras: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  extra: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 8 },
  actionsStack: { gap: 8, alignItems: 'flex-start' },
  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  // Grows with its label: long actions wrap onto a second line inside the pill.
  action: { borderRadius: 20, minHeight: 40, paddingHorizontal: 16, paddingVertical: 8, justifyContent: 'center' },
  actionStackItem: { minWidth: 200 },
  actionRowItem: { minWidth: 140 },
  actionContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, flexShrink: 1 },
  actionLabel: { fontSize: 14, lineHeight: 20, textAlign: 'center', flexShrink: 1 },
  card: { borderRadius: Shape.max, overflow: 'hidden' },
  hairline: { height: 1 },
  kvRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44, paddingHorizontal: 12 },
  kvLabel: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20 },
  kvValue: { flex: 1, textAlign: 'right', fontFamily: Fonts.semiBold, fontSize: 14, lineHeight: 20, fontVariant: OPEN_DIGITS },
  deviceImage: { height: 72, alignItems: 'center', justifyContent: 'center' },
  terminal: { width: 56, height: 42 },
  cardButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 44 },
  cardButtonLabel: { fontFamily: Fonts.medium, fontSize: 14, lineHeight: 20, textAlign: 'center' },
  option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, height: 44, paddingHorizontal: 12 },
  optionLabel: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20 },
  padded: { paddingHorizontal: 12, paddingVertical: 12 },
  ticket: { width: 300, maxWidth: '100%' },
  ticketContent: { padding: 12, gap: 8 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: { borderRadius: 10, paddingHorizontal: 8 },
  badgeLabel: { fontFamily: Fonts.medium, fontSize: 12, lineHeight: 20 },
  callback: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  agent: { width: 64, height: 64, borderRadius: Shape.small },
  notice: { padding: 12, gap: 12 },
  vasIcon: { width: 32, height: 32, borderRadius: Shape.small, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(79, 70, 229, 0.1)' },
  noticeActions: { flexDirection: 'row', gap: 8 },
  noticeButton: { flex: 1, minHeight: 40, paddingHorizontal: 12, paddingVertical: 8, borderRadius: Shape.small, alignItems: 'center', justifyContent: 'center' },
  noticeOutline: { borderWidth: 1, borderColor: 'rgba(127, 127, 127, 0.3)' },
  cardFooter: { padding: 8, flexDirection: 'row' },
  countCol: { width: 92, textAlign: 'right' },
  amountCol: { width: 72, textAlign: 'right' },
  txn: { padding: 12, gap: 8, alignSelf: 'flex-start' },
});
