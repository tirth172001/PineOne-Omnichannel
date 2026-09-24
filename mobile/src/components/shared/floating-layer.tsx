import { createContext, type ReactNode, useContext, useEffect, useState, useSyncExternalStore } from 'react';
import { StyleSheet, View } from 'react-native';

type FloatingStore = {
  get: () => ReactNode;
  set: (node: ReactNode) => void;
  subscribe: (listener: () => void) => () => void;
};

function createFloatingStore(): FloatingStore {
  let node: ReactNode = null;
  const listeners = new Set<() => void>();
  return {
    get: () => node,
    set: (next) => {
      node = next;
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

const FloatingContext = createContext<FloatingStore | null>(null);

/** For a screen with a floating layer: pass the store to FloatingLayerProvider, FloatingLayerHost and FloatingLayerSpacer. */
export function useFloatingLayer() {
  const [store] = useState(createFloatingStore);
  return store;
}

export function FloatingLayerProvider({ store, children }: { store: FloatingStore; children: ReactNode }) {
  return <FloatingContext.Provider value={store}>{children}</FloatingContext.Provider>;
}

/**
 * Where floating content is drawn: pinned 16dp above the bottom of the
 * screen's content area — so just above the navigation bar on a tab, or the
 * pinned footer on an inner page — over the scrolling content.
 */
export function FloatingLayerHost({ store }: { store: FloatingStore }) {
  const node = useSyncExternalStore(store.subscribe, store.get);
  if (!node) return null;
  return (
    <View pointerEvents="box-none" style={styles.host}>
      {node}
    </View>
  );
}

/** Space at the end of the scrolling content so the last rows can scroll clear of the floating content. */
export function FloatingLayerSpacer({ store }: { store: FloatingStore }) {
  const node = useSyncExternalStore(store.subscribe, store.get);
  return node ? <View style={styles.spacer} /> : null;
}

/**
 * Lifts its children out of the scrolling content into the screen's floating
 * layer (e.g. a listing's search and export actions). Without a host (e.g. in
 * Storybook) it renders them in place.
 */
export function Floating({ children }: { children: ReactNode }) {
  const store = useContext(FloatingContext);
  // Re-publish on every render so the floating copy stays current with the caller's state.
  useEffect(() => {
    store?.set(children);
  });
  useEffect(() => () => store?.set(null), [store]);
  return store ? null : children;
}

const styles = StyleSheet.create({
  host: { position: 'absolute', left: 16, right: 16, bottom: 16 },
  spacer: { height: 72 },
});
