import { usePathname } from 'expo-router';
import { createContext, type ReactNode, useContext, useState } from 'react';

import { BusinessSwitcher } from '@/components/business-switcher';
import { ORGANISATIONS } from '@/data/businesses';
import { useBusiness } from '@/hooks/use-business';

const ScopeSwitcherContext = createContext<(() => void) | null>(null);

/**
 * Owns the one org / store / channel switcher sheet so any screen can open it:
 * the home header, and inner pages whose data follows the scope (their title
 * row shows the scope with an arrow). Global switching only — pages never
 * filter by store or channel themselves.
 */
export function ScopeSwitcherProvider({ children }: { children: ReactNode }) {
  const business = useBusiness();
  const [open, setOpen] = useState(false);
  // "All channels" is an Overview-only view; everywhere else picks In-store or Online.
  const allowAllChannels = usePathname() === '/';
  return (
    <ScopeSwitcherContext.Provider value={() => setOpen(true)}>
      {children}
      <BusinessSwitcher
        visible={open}
        onDismiss={() => setOpen(false)}
        organisations={ORGANISATIONS}
        scope={{
          organisationId: business.organisation.id,
          shopIds: business.shopIds,
          channel: allowAllChannels ? business.channel : business.specificChannel,
        }}
        onApply={business.applyScope}
        allowAllChannels={allowAllChannels}
      />
    </ScopeSwitcherContext.Provider>
  );
}

/** Opens the switcher; a no-op outside the shell (e.g. Storybook). */
export function useOpenScopeSwitcher() {
  return useContext(ScopeSwitcherContext) ?? noop;
}

function noop() {}
