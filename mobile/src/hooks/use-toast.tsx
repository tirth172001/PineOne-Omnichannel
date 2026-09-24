import { createContext, type ReactNode, useCallback, useContext, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Snackbar } from 'react-native-paper';

import { Shape } from '@/constants/shape';

type ShowToast = (message: string) => void;

const ToastContext = createContext<ShowToast | null>(null);

/**
 * App-wide confirmation messages (web: sonner's toast / toast.success). Wraps
 * the shell's content area, so the Snackbar sits just above the navigation bar.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ message: string; key: number } | null>(null);
  const show = useCallback<ShowToast>((message) => setToast({ message, key: Date.now() }), []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <Snackbar
        key={toast?.key}
        visible={toast !== null}
        onDismiss={() => setToast(null)}
        duration={4000}
        style={styles.snackbar}>
        {toast?.message ?? ''}
      </Snackbar>
    </ToastContext.Provider>
  );
}

/** Returns show(message). Outside a ToastProvider (e.g. in Storybook) it's a no-op. */
export function useToast(): ShowToast {
  return useContext(ToastContext) ?? noop;
}

function noop() {}

const styles = StyleSheet.create({
  // Standalone floating container.
  snackbar: { borderRadius: Shape.small },
});
