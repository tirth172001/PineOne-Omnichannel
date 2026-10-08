import { createContext, type ReactNode, useContext, useEffect, useState, useSyncExternalStore } from 'react';
import { Menu, useTheme } from 'react-native-paper';

import { LazyMenu } from '@/components/shared/lazy-menu';
import { HeaderControl } from '@/components/page-header';
import { Shape } from '@/constants/shape';

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

export type HeaderActionsStore = {
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

/**
 * The page's header actions, at the end of its tab header: its main call to
 * action (e.g. New link, Add device). One action shows as its own labelled
 * button; several merge into one labelled button (with a caret) that opens
 * them as a menu (user decisions). Secondary page actions (Analytics,
 * downloads…) go in the toolbar's action row instead.
 */
export function HeaderActionsSlot({ store, tinted = false }: { store: HeaderActionsStore; tinted?: boolean }) {
  const theme = useTheme();
  const { actions, menu } = useSyncExternalStore(store.subscribe, store.get);
  const [open, setOpen] = useState(false);

  if (actions.length === 0) return null;
  if (actions.length === 1) {
    const [action] = actions;
    return (
      <HeaderControl icon={action.icon} label={action.shortLabel ?? action.label} tinted={tinted} onPress={action.onPress} accessibilityLabel={action.label} />
    );
  }
  const menuLabel = menu?.label ?? 'Actions';
  return (
    <LazyMenu
      visible={open}
      onDismiss={() => setOpen(false)}
      anchorPosition="bottom"
      contentStyle={{ borderRadius: Shape.small, backgroundColor: theme.colors.surface }}
      anchor={
        <HeaderControl
          icon={menu?.icon ?? 'dots-three-vertical'}
          label={menuLabel}
          caret
          tinted={tinted}
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
    </LazyMenu>
  );
}
