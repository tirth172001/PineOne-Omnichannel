import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

import type { TabItem } from '@/components/material3/tabs';

export type ShellTabsConfig = {
  tabs: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
};

type ShellTabsContextValue = {
  config: ShellTabsConfig | null;
  setConfig: (config: ShellTabsConfig | null) => void;
};

const ShellTabsContext = createContext<ShellTabsContextValue | null>(null);

/**
 * Lets a screen put its sub-tabs into the shell's header, docked under it
 * (see TabChrome). The screen keeps owning the
 * active-tab state; the shell only renders it.
 */
export function ShellTabsProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ShellTabsConfig | null>(null);
  return <ShellTabsContext.Provider value={{ config, setConfig }}>{children}</ShellTabsContext.Provider>;
}

export function useShellTabsConfig() {
  return useContext(ShellTabsContext)?.config ?? null;
}

/**
 * Call from a screen that needs sub-tabs; they're shown in the top bar while
 * the screen is mounted. Pass null while the screen shouldn't show any (e.g.
 * Payments' By Order / By payments, online only).
 */
export function useShellTabs(config: ShellTabsConfig | null) {
  const setConfig = useContext(ShellTabsContext)?.setConfig;
  const tabs = config?.tabs;
  const activeKey = config?.activeKey;
  const onChange = config?.onChange;

  useEffect(() => {
    setConfig?.(tabs && activeKey !== undefined && onChange ? { tabs, activeKey, onChange } : null);
  }, [setConfig, tabs, activeKey, onChange]);

  useEffect(() => () => setConfig?.(null), [setConfig]);
}
