import { createContext, type ReactNode, useContext, useEffect, useState, useSyncExternalStore } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Menu, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { concentric, Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';

export type HeaderAction = {
  label: string;
  icon: string;
  /** Short text shown beside the icon in the header (e.g. "Analytics"); the full label is the menu / accessibility text. */
  shortLabel?: string;
  onPress?: () => void;
};

/** How several actions merged into one header button are named (e.g. "Bulk" on Refunds). */
export type HeaderActionsMenu = { label: string; icon: string };

type HeaderActionsState = { actions: HeaderAction[]; menu?: HeaderActionsMenu };
const EMPTY: HeaderActionsState = { actions: [] };

type HeaderActionsStore = {
  get: () => HeaderActionsState;
  set: (state: HeaderActionsState) => void;
  subscribe: (listener: () => void) => () => void;
};

function createHeaderActionsStore(): HeaderActionsStore {
  let state = EMPTY;
  const listeners = new Set<() => void>();
  return {
    get: () => state,
    set: (next) => {
      state = next;
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

const HeaderActionsContext = createContext<HeaderActionsStore | null>(null);

/** For the tab chrome: the store its page publishes header actions to. */
export function useHeaderActionsStore() {
  const [store] = useState(createHeaderActionsStore);
  return store;
}

export function HeaderActionsProvider({ store, children }: { store: HeaderActionsStore; children: ReactNode }) {
  return <HeaderActionsContext.Provider value={store}>{children}</HeaderActionsContext.Provider>;
}

/**
 * Puts a page's own actions in the tab header (e.g. Change settlement
 * preferences, Bulk refunds) instead of buttons in the page body. Called by
 * the page on every render so the actions stay current with its state.
 */
export function useHeaderActions(actions: HeaderAction[], menu?: HeaderActionsMenu) {
  const store = useContext(HeaderActionsContext);
  useEffect(() => {
    store?.set({ actions, menu });
  });
  useEffect(() => () => store?.set(EMPTY), [store]);
}

// Header buttons: 36dp tall, 12dp inside the rounded top bar.
const BUTTON_HEIGHT = 36;
const BUTTON_RADIUS = concentric(Shape.max, 12, BUTTON_HEIGHT);

/** An outlined header button: icon plus a short label (and a caret when it opens a menu), so it says what it does. */
function HeaderButton({
  icon,
  label,
  menu = false,
  onPress,
  accessibilityLabel,
}: {
  icon: string;
  label: string;
  menu?: boolean;
  onPress?: () => void;
  accessibilityLabel: string;
}) {
  const theme = useTheme();
  return (
    <TouchableRipple
      onPress={onPress}
      borderless
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[styles.button, { borderColor: theme.colors.outlineVariant }]}>
      <View style={styles.buttonContent}>
        <Icon source={icon} size={18} color={theme.colors.onSurface} />
        <Text variant="labelLarge" style={styles.buttonLabel}>
          {label}
        </Text>
        {menu ? <Icon source="caret-down" size={14} color={theme.colors.onSurfaceVariant} /> : null}
      </View>
    </TouchableRipple>
  );
}

/**
 * The page's header actions: one action shows as its own labelled button;
 * several merge into one labelled button (with a caret) that opens them as a
 * menu (user decisions).
 */
export function HeaderActionsSlot({ store }: { store: HeaderActionsStore }) {
  const theme = useTheme();
  const { actions, menu } = useSyncExternalStore(store.subscribe, store.get);
  const [open, setOpen] = useState(false);

  if (actions.length === 0) return null;
  if (actions.length === 1) {
    const [action] = actions;
    return (
      <HeaderButton icon={action.icon} label={action.shortLabel ?? action.label} onPress={action.onPress} accessibilityLabel={action.label} />
    );
  }
  const menuLabel = menu?.label ?? 'Actions';
  return (
    <Menu
      visible={open}
      onDismiss={() => setOpen(false)}
      anchorPosition="bottom"
      contentStyle={{ borderRadius: Shape.small, backgroundColor: theme.colors.surface }}
      anchor={
        <HeaderButton
          icon={menu?.icon ?? 'dots-three-vertical'}
          label={menuLabel}
          menu
          onPress={() => setOpen(true)}
          accessibilityLabel={`${menuLabel}: ${actions.map((action) => action.label).join(', ')}`}
        />
      }>
      {actions.map((action) => (
        <Menu.Item
          key={action.label}
          title={action.label}
          leadingIcon={action.icon}
          onPress={() => {
            setOpen(false);
            action.onPress?.();
          }}
        />
      ))}
    </Menu>
  );
}

const styles = StyleSheet.create({
  button: { height: BUTTON_HEIGHT, borderWidth: 1, borderRadius: BUTTON_RADIUS, justifyContent: 'center' },
  buttonContent: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12 },
  buttonLabel: { fontFamily: Fonts.medium },
});
