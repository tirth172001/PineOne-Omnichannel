import { createContext, type ReactNode, useContext, useEffect, useState, useSyncExternalStore } from 'react';
import { StyleSheet } from 'react-native';
import { IconButton, Menu, useTheme } from 'react-native-paper';

import { concentric, Shape } from '@/constants/shape';

export type HeaderAction = { label: string; icon: string; onPress?: () => void };

type HeaderActionsStore = {
  get: () => HeaderAction[];
  set: (actions: HeaderAction[]) => void;
  subscribe: (listener: () => void) => () => void;
};

function createHeaderActionsStore(): HeaderActionsStore {
  let actions: HeaderAction[] = [];
  const listeners = new Set<() => void>();
  return {
    get: () => actions,
    set: (next) => {
      actions = next;
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
export function useHeaderActions(actions: HeaderAction[]) {
  const store = useContext(HeaderActionsContext);
  useEffect(() => {
    store?.set(actions);
  });
  useEffect(() => () => store?.set([]), [store]);
}

// Header buttons: 40dp targets 12dp inside the rounded top bar (as in AppHeader).
const BUTTON_RADIUS = concentric(Shape.max, 12, 40);

/**
 * The page's header actions: one action shows as its own icon button; several
 * merge into one button that opens them as a menu (user decision).
 */
export function HeaderActionsSlot({ store }: { store: HeaderActionsStore }) {
  const theme = useTheme();
  const actions = useSyncExternalStore(store.subscribe, store.get);
  const [open, setOpen] = useState(false);

  if (actions.length === 0) return null;
  if (actions.length === 1) {
    const [action] = actions;
    return (
      <IconButton
        icon={action.icon}
        size={24}
        iconColor={theme.colors.onSurface}
        onPress={action.onPress}
        accessibilityLabel={action.label}
        style={styles.button}
      />
    );
  }
  return (
    <Menu
      visible={open}
      onDismiss={() => setOpen(false)}
      anchorPosition="bottom"
      contentStyle={{ borderRadius: Shape.small, backgroundColor: theme.colors.surface }}
      anchor={
        <IconButton
          icon="dots-three-vertical"
          size={24}
          iconColor={theme.colors.onSurface}
          onPress={() => setOpen(true)}
          accessibilityLabel={`More actions: ${actions.map((action) => action.label).join(', ')}`}
          style={styles.button}
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
  button: { margin: 0, borderRadius: BUTTON_RADIUS },
});
