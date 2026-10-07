import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { type ReactNode, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Button, Card, Checkbox, Divider, Icon, RadioButton, Switch, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { OrganisationSwitcher } from '@/components/account/organisation-switcher';
import { SearchField } from '@/components/search-field';
import { CompactSegmentedButtons, OutlinedActionButton } from '@/components/shared/controls';
import { SelectField } from '@/components/shared/form-fields';
import { DetailScreen } from '@/components/shared/detail-screen';
import { NotFound } from '@/components/shared/not-found';
import { PANEL_INNER_RADIUS, PanelSheet } from '@/components/shared/panel-sheet';
import { concentric, Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import { CURRENT_USER, ORGANISATIONS } from '@/data/businesses';
import { STORE_IDENTITIES } from '@/data/terminal-devices';
import { INITIAL_ROSTER, type RosterEntry } from '@/data/user-roster';
import { useBusiness } from '@/hooks/use-business';
import { useToast } from '@/hooks/use-toast';

type SectionKey = 'personal-details' | 'credentials' | 'webhooks' | 'refunds' | 'online-payments';

type Section = {
  key: SectionKey;
  title: string;
  icon: string;
  /** Under the title on its page: what the section is for. */
  description: string;
  /** Under the title in the list: what's inside, so the right row is easy to find. */
  summary: string;
  Content: () => ReactNode;
};

/** The web's Account settings tabs, each a page of its own on mobile, in the list's groups. */
const SECTIONS: Record<SectionKey, Section> = {
  'personal-details': {
    key: 'personal-details',
    title: 'Personal details',
    icon: 'user-circle',
    description: 'Your organisation and the details you sign in with',
    summary: 'Organisation, name, phone and email',
    Content: PersonalDetails,
  },
  refunds: {
    key: 'refunds',
    title: 'Refunds',
    icon: 'arrow-u-up-left',
    description: 'Who can refund, the checks before a refund, and which payment modes support it',
    summary: 'Permissions, user access and security checks',
    Content: RefundSettings,
  },
  'online-payments': {
    key: 'online-payments',
    title: 'Online payment settings',
    icon: 'globe',
    description: 'Payouts, subscriptions and limits for online payments',
    summary: 'Payouts, subscriptions, payment link limit',
    Content: OnlinePaymentSettings,
  },
  credentials: {
    key: 'credentials',
    title: 'Credentials',
    icon: 'key',
    description: 'Keys for connecting your systems to Pine Labs',
    summary: 'Merchant ID, client ID and secret key',
    Content: Credentials,
  },
  webhooks: {
    key: 'webhooks',
    title: 'Webhooks',
    icon: 'plug',
    description: 'Where Pine Labs sends payment status updates',
    summary: 'pinelabs.com/updates',
    Content: Webhooks,
  },
};

const GROUPS: { label: string; keys: SectionKey[] }[] = [
  { label: 'Account', keys: ['personal-details'] },
  { label: 'Payments', keys: ['refunds', 'online-payments'] },
  { label: 'Developers', keys: ['credentials', 'webhooks'] },
];

/** The settings sections in their groups, for the profile panel, which lists them directly. */
export const SETTINGS_GROUPS = GROUPS.map((group) => ({
  label: group.label,
  sections: group.keys.map((key) => ({ key, title: SECTIONS[key].title, icon: SECTIONS[key].icon })),
}));

const CARD_PADDING = 16;
const INNER_RADIUS = concentric(Shape.max, CARD_PADDING);
/** Web's Tirth Trivedi roster entry — the signed-in mobile user. */
const USER_EMAIL = INITIAL_ROSTER.find((entry) => entry.name === CURRENT_USER.name)?.email ?? '';

function SectionIntro({ title, description }: { title: string; description: string }) {
  const theme = useTheme();
  return (
    <View style={styles.intro}>
      <Text variant="titleMedium" style={styles.semiBold}>
        {title}
      </Text>
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
        {description}
      </Text>
    </View>
  );
}

/** A setting row: icon, label and value, and a trailing action (web: FieldRow / GroupedFieldRow). */
function FieldRow({ icon, label, value, action, children }: { icon: string; label: string; value: ReactNode; action?: ReactNode; children?: ReactNode }) {
  const theme = useTheme();
  return (
    <View style={styles.field}>
      <View style={styles.fieldTop}>
        <Icon source={icon} size={20} color={theme.colors.onSurfaceVariant} />
        <View style={styles.flex}>
          <Text variant="bodyMedium" style={styles.semiBold}>
            {label}
          </Text>
          {typeof value === 'string' ? (
            <Text variant="bodyMedium" numberOfLines={2} style={{ color: theme.colors.onSurfaceVariant }}>
              {value}
            </Text>
          ) : (
            value
          )}
        </View>
        {action}
      </View>
      {children}
    </View>
  );
}

/** Rows grouped in one bordered card with hairlines between (web: FieldRowGroup; a lone FieldRow is a group of one). */
function FieldGroup({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const rows = (Array.isArray(children) ? children : [children]).filter(Boolean);
  return (
    <Card mode="contained" style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      {rows.map((row, index) => (
        <View key={index}>
          {index > 0 ? <Divider /> : null}
          {row}
        </View>
      ))}
    </Card>
  );
}

function PersonalDetails() {
  const toast = useToast();
  const business = useBusiness();
  const [switching, setSwitching] = useState(false);
  const organisation = business.organisation;
  return (
    <>
      {/* The organisation lives with the profile, not in the header's channel / store switcher (user decision). */}
      <SectionIntro title="Organisation" description="The business you're signed in to. Everything in the app shows this organisation's data" />
      <FieldGroup>
        <FieldRow
          icon="buildings"
          label={organisation.name}
          value={`${organisation.shops.length} stores`}
          action={ORGANISATIONS.length > 1 ? <OutlinedActionButton label="Switch" icon="arrows-left-right" onPress={() => setSwitching(true)} /> : undefined}
        />
      </FieldGroup>
      <OrganisationSwitcher
        visible={switching}
        onDismiss={() => setSwitching(false)}
        organisations={ORGANISATIONS}
        currentId={organisation.id}
        onApply={(organisationId) => {
          business.applyScope({ organisationId, shopIds: [], channel: business.channel });
          toast(`Switched to ${ORGANISATIONS.find((org) => org.id === organisationId)?.name ?? 'organisation'}`);
        }}
      />

      <SectionIntro title="Basic details" description="All your personal details related to your login" />
      <FieldGroup>
        <FieldRow icon="user-circle" label="Name" value={CURRENT_USER.name} action={<OutlinedActionButton label="Update" />} />
        <FieldRow icon="phone" label="Registered number" value="+91 98765 43210" action={<OutlinedActionButton label="Update" />} />
        <FieldRow icon="envelope-simple" label="Registered email" value={USER_EMAIL} action={<OutlinedActionButton label="Update" />} />
      </FieldGroup>
    </>
  );
}

function Credentials() {
  const toast = useToast();
  const copy = (value: string, label: string) => {
    void Clipboard.setStringAsync(value);
    toast(`${label} copied to clipboard`);
  };
  const merchantId = '2874783427443743984';
  const clientId = '2874783427443743984';
  const secretKey = 'sk_live_9F72xLp84QzTn5W1yRVdKt';
  return (
    <>
      <SectionIntro title="Production credentials" description="You can use this credentials for live product" />
      <FieldGroup>
        <FieldRow icon="hard-drives" label="Merchant ID" value={merchantId} action={<OutlinedActionButton label="Copy" icon="copy" onPress={() => copy(merchantId, 'Merchant ID')} />} />
        <FieldRow icon="hard-drives" label="Client ID" value={clientId} action={<OutlinedActionButton label="Copy" icon="copy" onPress={() => copy(clientId, 'Client ID')} />} />
        <FieldRow icon="key" label="Secret key" value={'*'.repeat(28)} action={<OutlinedActionButton label="Copy" icon="copy" onPress={() => copy(secretKey, 'Secret key')} />} />
      </FieldGroup>
    </>
  );
}

function Webhooks() {
  const toast = useToast();
  return (
    <>
      <SectionIntro title="Webhook URL" description="Your transaction status and other information will be provided on this URL" />
      <FieldGroup>
        <FieldRow
          icon="globe"
          label="Added URL"
          value="https://www.pinelabs.com/updates"
          action={<OutlinedActionButton label="Update" onPress={() => toast('URL added successfully')} />}
        />
      </FieldGroup>
    </>
  );
}

/** Grants refund access to individual Store Managers and Accountants (web: RefundAccessDialog). */
function RefundAccessSheet({
  visible,
  onDismiss,
  storeManagers,
  accountants,
  selectedIds,
  onApply,
}: {
  visible: boolean;
  onDismiss: () => void;
  storeManagers: RosterEntry[];
  accountants: RosterEntry[];
  selectedIds: string[];
  onApply: (ids: string[]) => void;
}) {
  const theme = useTheme();
  const toast = useToast();
  const [group, setGroup] = useState<'store-managers' | 'accountants'>('store-managers');
  const [search, setSearch] = useState('');
  const [store, setStore] = useState('all');
  const [draft, setDraft] = useState<string[]>(selectedIds);
  const [wasVisible, setWasVisible] = useState(false);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setDraft(selectedIds);
      setSearch('');
      setStore('all');
      setGroup('store-managers');
    }
  }
  const groupUsers = group === 'store-managers' ? storeManagers : accountants;
  const query = search.trim().toLowerCase();
  const filtered = groupUsers.filter(
    (user) => (store === 'all' || user.storeIds?.includes(store)) && (!query || `${user.name} ${user.email}`.toLowerCase().includes(query))
  );
  const allSelected = filtered.length > 0 && filtered.every((user) => draft.includes(user.id));
  const selectedInGroup = groupUsers.filter((user) => draft.includes(user.id)).length;
  const toggle = (id: string) => setDraft((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  const toggleAll = () => {
    const ids = filtered.map((user) => user.id);
    setDraft((current) => (allSelected ? current.filter((id) => !ids.includes(id)) : Array.from(new Set([...current, ...ids]))));
  };

  return (
    <PanelSheet
      visible={visible}
      onDismiss={onDismiss}
      title="Select users"
      scroll={false}
      footer={
        <View style={styles.sheetFooter}>
          <Button
            mode="outlined"
            onPress={() => setDraft(selectedIds)}
            textColor={theme.colors.onSurface}
            style={[styles.panelButton, { borderColor: theme.colors.outlineVariant }]}>
            Reset
          </Button>
          <Button
            mode="contained"
            onPress={() => {
              onApply(draft);
              onDismiss();
              toast('Refund access updated');
            }}
            style={styles.panelButton}>
            Apply
          </Button>
        </View>
      }>
      <View style={styles.sheetBody}>
        <SearchField value={search} onChangeText={setSearch} placeholder="Search users" radius={PANEL_INNER_RADIUS} />
        <SelectField
          value={store}
          onValueChange={setStore}
          options={[{ value: 'all', label: 'All stores' }, ...STORE_IDENTITIES.map((entry) => ({ value: entry.storeId, label: entry.name }))]}
          accessibilityLabel="Filter by store"
        />
        <CompactSegmentedButtons
          value={group}
          onValueChange={setGroup}
          options={[
            { value: 'store-managers', label: `Store Managers (${storeManagers.length})` },
            { value: 'accountants', label: `Accountants (${accountants.length})` },
          ]}
          radius={PANEL_INNER_RADIUS}
          grow
        />
        <View style={[styles.note, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            List also contains store managers managing more than 1 store
          </Text>
        </View>
        <View style={styles.selectAll}>
          <TouchableRipple onPress={toggleAll} accessibilityRole="checkbox" aria-checked={allSelected} borderless style={styles.checkTouch}>
            <View style={styles.inline}>
              <Checkbox status={allSelected ? 'checked' : 'unchecked'} onPress={toggleAll} />
              <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Select all
              </Text>
            </View>
          </TouchableRipple>
          <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {selectedInGroup}/{groupUsers.length} users selected
          </Text>
        </View>
        <ScrollView style={[styles.userList, { borderColor: theme.colors.outlineVariant }]}>
          {filtered.length === 0 ? (
            <Text variant="bodySmall" style={[styles.empty, { color: theme.colors.onSurfaceVariant }]}>
              No users found.
            </Text>
          ) : (
            filtered.map((user, index) => (
              <View key={user.id}>
                {index > 0 ? <Divider /> : null}
                <TouchableRipple onPress={() => toggle(user.id)} accessibilityRole="checkbox" aria-checked={draft.includes(user.id)} accessibilityLabel={user.name}>
                  <View style={styles.userRow}>
                    <Text variant="bodyMedium" numberOfLines={1} style={styles.flex}>
                      {user.name}
                    </Text>
                    <Checkbox status={draft.includes(user.id) ? 'checked' : 'unchecked'} onPress={() => toggle(user.id)} />
                  </View>
                </TouchableRipple>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </PanelSheet>
  );
}

function InlineAmount({ value, onChange, editing, onDone, width = 128 }: { value: string; onChange: (value: string) => void; editing: boolean; onDone: () => void; width?: number }) {
  const theme = useTheme();
  if (!editing) return null;
  return (
    <View style={[styles.amountInput, { width, borderColor: theme.colors.outlineVariant }]}>
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
        ₹
      </Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType="number-pad"
        autoFocus
        onBlur={onDone}
        onSubmitEditing={onDone}
        accessibilityLabel="Amount"
        style={[styles.amountText, { color: theme.colors.onSurface }]}
      />
    </View>
  );
}

function RefundSettings() {
  const theme = useTheme();
  const [refundsEnabled, setRefundsEnabled] = useState(false);
  const [partialEnabled, setPartialEnabled] = useState(false);
  const [security, setSecurity] = useState<'admin-approval' | 'otp'>('admin-approval');
  const [modes, setModes] = useState({ upi: true, card: true, smsPay: true });
  const [limit, setLimit] = useState('1');
  const [limitEditing, setLimitEditing] = useState(false);
  const [accessIds, setAccessIds] = useState<string[]>([]);
  const [editUsersOpen, setEditUsersOpen] = useState(false);

  const active = INITIAL_ROSTER.filter((user) => user.status !== 'Deactivated');
  const storeManagers = active.filter((user) => user.role === 'Store Manager');
  const accountants = active.filter((user) => user.role === 'Accountant');
  const ownerCount = active.filter((user) => user.role === 'Owner').length;
  const adminCount = active.filter((user) => user.role === 'Admin').length;
  const selectedManagers = storeManagers.filter((user) => accessIds.includes(user.id)).length;
  const selectedAccountants = accountants.filter((user) => accessIds.includes(user.id)).length;
  const allModes = modes.upi && modes.card && modes.smsPay;
  const muted = { color: theme.colors.onSurfaceVariant };
  const check = (checked: boolean, onPress: () => void, label: string) => (
    <TouchableRipple onPress={onPress} accessibilityRole="checkbox" aria-checked={checked} accessibilityLabel={label} borderless style={styles.checkTouch}>
      <Checkbox status={checked ? 'checked' : 'unchecked'} onPress={onPress} />
    </TouchableRipple>
  );
  const subRow = (content: ReactNode, action: ReactNode) => (
    <View style={[styles.subRow, { backgroundColor: theme.colors.surfaceVariant }]}>
      <View style={styles.flex}>{content}</View>
      {action}
    </View>
  );

  return (
    <>
      <SectionIntro title="Permissions" description="Enable refunds to get settings and options to initiate refunds for transactions" />
      <FieldGroup>
        <FieldRow
          icon="arrow-counter-clockwise"
          label="Allow refunds"
          value="Allow refunding transaction amount"
          action={<Switch value={refundsEnabled} onValueChange={setRefundsEnabled} accessibilityLabel="Allow refunds" />}
        />
        <FieldRow
          icon="circle-half"
          label="Allow partial refunds"
          value="Allow refunding less than the full transaction amount"
          action={<Switch value={partialEnabled} onValueChange={setPartialEnabled} accessibilityLabel="Allow partial refunds" />}
        />
      </FieldGroup>

      {/* Like the web, the rest is dimmed and locked until refunds are allowed. */}
      <View style={[styles.stack, !refundsEnabled && styles.disabled]} pointerEvents={refundsEnabled ? 'auto' : 'none'}>
        <SectionIntro title="User access" description="Owners and admins always have refund access. Grant it to store managers and accountants here." />
        <FieldGroup>
          <FieldRow
            icon="users"
            label={`${ownerCount + adminCount + selectedManagers + selectedAccountants} users have access`}
            value={`${ownerCount} Owner · ${adminCount} Admins · ${selectedManagers} Store Managers · ${selectedAccountants} Accountant`}
            action={<OutlinedActionButton label="Edit users" onPress={() => setEditUsersOpen(true)} />}
          />
        </FieldGroup>

        <SectionIntro title="Security controls" description="Add extra checks before a refund is processed." />
        <FieldGroup>
          <FieldRow
            icon="user-circle-gear"
            label="Admin approval required"
            value="Requires an admin to approve refunds initiated by store managers or accountants"
            action={<RadioButton.Android value="admin-approval" status={security === 'admin-approval' ? 'checked' : 'unchecked'} onPress={() => setSecurity('admin-approval')} />}>
            {security === 'admin-approval' ? (
              <View style={styles.subRows}>
                {subRow(
                  <Text variant="bodyMedium">
                    <Text style={styles.medium}>{adminCount}</Text> <Text style={muted}>Admin has access for approval</Text>
                  </Text>,
                  <OutlinedActionButton label="Edit access" />
                )}
                {subRow(
                  limitEditing ? (
                    <InlineAmount value={limit} onChange={(value) => setLimit(value.replace(/[^0-9]/g, ''))} editing onDone={() => setLimitEditing(false)} />
                  ) : (
                    <Text variant="bodyMedium">
                      <Text style={styles.medium}>₹ {limit || 0}</Text> <Text style={muted}>Allowed without approval</Text>
                    </Text>
                  ),
                  <OutlinedActionButton label="Edit limit" onPress={() => setLimitEditing(true)} />
                )}
              </View>
            ) : null}
          </FieldRow>
          <FieldRow
            icon="device-mobile"
            label="OTP based authentication"
            value="Send an OTP to the customer before processing their refund"
            action={<RadioButton.Android value="otp" status={security === 'otp' ? 'checked' : 'unchecked'} onPress={() => setSecurity('otp')} />}
          />
        </FieldGroup>

        <SectionIntro title="Payment modes" description="Choose which payment modes support refunds." />
        <FieldGroup>
          <FieldRow
            icon="wallet"
            label="All payment modes"
            value="Enable refunds across every supported payment mode"
            action={check(allModes, () => setModes({ upi: !allModes, card: !allModes, smsPay: !allModes }), 'All payment modes')}
          />
          <FieldRow icon="qr-code" label="UPI" value="Refunds for transactions paid via UPI" action={check(modes.upi, () => setModes((m) => ({ ...m, upi: !m.upi })), 'UPI')} />
          <FieldRow icon="credit-card" label="Card" value="Refunds for transactions paid via card" action={check(modes.card, () => setModes((m) => ({ ...m, card: !m.card })), 'Card')} />
          <FieldRow icon="phone" label="SMS Pay" value="Refunds for transactions paid via SMS Pay" action={check(modes.smsPay, () => setModes((m) => ({ ...m, smsPay: !m.smsPay })), 'SMS Pay')} />
        </FieldGroup>
      </View>

      <RefundAccessSheet
        visible={editUsersOpen}
        onDismiss={() => setEditUsersOpen(false)}
        storeManagers={storeManagers}
        accountants={accountants}
        selectedIds={accessIds}
        onApply={setAccessIds}
      />
    </>
  );
}

function OnlinePaymentSettings() {
  const theme = useTheme();
  const [payouts, setPayouts] = useState(false);
  const [subscriptions, setSubscriptions] = useState(false);
  const [feeRefunds, setFeeRefunds] = useState(false);
  const [maxAmount, setMaxAmount] = useState('1,00,000');
  const [editing, setEditing] = useState(false);
  return (
    <>
      <SectionIntro title="Payouts" description="Payouts are the payments to your vendors" />
      <FieldGroup>
        <FieldRow
          icon="money-wavy"
          label="Allow payouts"
          value="Allow payout from the settlements directly"
          action={<Switch value={payouts} onValueChange={setPayouts} accessibilityLabel="Allow payouts" />}
        />
      </FieldGroup>
      <SectionIntro title="Subscriptions" description="Subscriptions are recurring payment that you want to collect from users" />
      <FieldGroup>
        <FieldRow
          icon="calendar-check"
          label="Allow subscription"
          value="Users should be able to create payment links for the recurring payments"
          action={<Switch value={subscriptions} onValueChange={setSubscriptions} accessibilityLabel="Allow subscription" />}
        />
      </FieldGroup>
      <SectionIntro title="Convenience fee refunds" description="Subscriptions are recurring payment that you want to collect from users" />
      <FieldGroup>
        <FieldRow
          icon="money-wavy"
          label="Allow convenience fee refunds"
          value="Users should be able to create payment links for the recurring payments"
          action={<Switch value={feeRefunds} onValueChange={setFeeRefunds} accessibilityLabel="Allow convenience fee refunds" />}
        />
      </FieldGroup>
      <SectionIntro title="Max payment link amount" description="Adjust limits for payment link creation" />
      <FieldGroup>
        <FieldRow
          icon="wallet"
          label={editing ? '' : `₹${maxAmount}`}
          value={
            <>
              <InlineAmount value={maxAmount} onChange={(value) => setMaxAmount(value.replace(/[^0-9,]/g, ''))} editing={editing} onDone={() => setEditing(false)} width={160} />
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Payment link creation above this amount won’t be allowed
              </Text>
            </>
          }
          action={<OutlinedActionButton label="Edit" onPress={() => setEditing(true)} />}
        />
      </FieldGroup>
    </>
  );
}

/**
 * Account settings (web: AccountSettingsContent), as a list: each of the
 * web's tabs — Personal details, Refunds, Online payment settings,
 * Credentials and Webhooks — is a row in a grouped card, opening its own
 * page. Opened from the profile panel (Overview's avatar), so it's an inner
 * page: Back, no navigation bar. Log out is in the profile panel.
 */
export function AccountSettings() {
  const theme = useTheme();
  const { organisation } = useBusiness();
  // The organisation is the first thing people look for here, so its row says which one is active.
  const summaryOf = (section: Section) => (section.key === 'personal-details' ? `${CURRENT_USER.name} · ${organisation.name}` : section.summary);
  return (
    <DetailScreen title="Settings" fallbackHref="/">
      {GROUPS.map((group) => (
        <View key={group.label} style={styles.group}>
          <Text accessibilityRole="header" style={[styles.groupLabel, { color: theme.colors.onSurfaceVariant }]}>
            {group.label.toUpperCase()}
          </Text>
          <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            {group.keys.map((key, index) => {
              const section = SECTIONS[key];
              return (
                <View key={key}>
                  {index > 0 ? <View style={[styles.rowDivider, { backgroundColor: theme.colors.surfaceVariant }]} /> : null}
                  <TouchableRipple
                    onPress={() => router.push({ pathname: '/account-settings/[section]', params: { section: key } })}
                    accessibilityRole="button"
                    accessibilityLabel={`${section.title}. ${summaryOf(section)}`}>
                    <View style={styles.row}>
                      <View style={[styles.rowTile, { backgroundColor: theme.colors.surfaceVariant }]}>
                        <Icon source={section.icon} size={18} color={theme.colors.onSurface} />
                      </View>
                      <View style={styles.flex}>
                        <Text numberOfLines={1} style={[styles.rowTitle, { color: theme.colors.onSurface }]}>
                          {section.title}
                        </Text>
                        <Text numberOfLines={1} style={[styles.rowSummary, { color: theme.colors.onSurfaceVariant }]}>
                          {summaryOf(section)}
                        </Text>
                      </View>
                      <Icon source="caret-right" size={16} color={theme.colors.onSurfaceVariant} />
                    </View>
                  </TouchableRipple>
                </View>
              );
            })}
          </View>
        </View>
      ))}
    </DetailScreen>
  );
}

/** One section of Account settings on its own page (an inner page: Back, no navigation bar). */
export function AccountSettingsSection({ sectionKey }: { sectionKey: string }) {
  const section = SECTIONS[sectionKey as SectionKey];
  if (!section) return <NotFound title="Settings" message="This settings page doesn't exist." fallbackHref="/account-settings" />;
  const { Content } = section;
  return (
    <DetailScreen title={section.title} subtitle={section.description} fallbackHref="/">
      <Content />
    </DetailScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  medium: { fontFamily: Fonts.medium },
  semiBold: { fontFamily: Fonts.semiBold },
  group: { gap: 8 },
  groupLabel: { fontFamily: Fonts.medium, fontSize: 12, lineHeight: 16, letterSpacing: 0.6, paddingHorizontal: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 64, paddingHorizontal: 12, paddingVertical: 12 },
  rowTile: { width: 32, height: 32, borderRadius: Shape.small, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontFamily: Fonts.medium, fontSize: 14, lineHeight: 20 },
  rowSummary: { fontFamily: Fonts.regular, fontSize: 12, lineHeight: 16 },
  // Starts under the row's text, so the icon tiles read as one column.
  rowDivider: { height: 1, marginLeft: 12 + 32 + 12 },
  intro: { gap: 4, marginBottom: -12 },
  stack: { gap: 24 },
  disabled: { opacity: 0.5 },
  card: { borderRadius: Shape.max, overflow: 'hidden' },
  field: { padding: CARD_PADDING, gap: 12 },
  fieldTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  subRows: { gap: 8 },
  subRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: INNER_RADIUS, paddingHorizontal: 12, paddingVertical: 8 },
  amountInput: { height: 32, flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: INNER_RADIUS, paddingHorizontal: 8 },
  amountText: { flex: 1, height: '100%', fontFamily: Fonts.regular, fontSize: 14 },
  sheetFooter: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  panelButton: { borderRadius: PANEL_INNER_RADIUS },
  sheetBody: { flex: 1, padding: 16, gap: 12 },
  note: { borderRadius: PANEL_INNER_RADIUS, paddingHorizontal: 12, paddingVertical: 8 },
  selectAll: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  checkTouch: { borderRadius: PANEL_INNER_RADIUS },
  userList: { flex: 1, borderWidth: 1, borderRadius: PANEL_INNER_RADIUS },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 12, paddingRight: 4, minHeight: 44 },
  empty: { textAlign: 'center', paddingVertical: 24 },
});
