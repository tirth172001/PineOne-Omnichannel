import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Dialog, Portal, Text, useTheme } from 'react-native-paper';

import { concentric, Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';

const PADDING = 24;
const INNER_RADIUS = concentric(Shape.max, PADDING);

/**
 * Confirmation dialog (web: AlertDialog): title, description, optional extra
 * content (e.g. a replacement-role picker), Cancel and a confirm action.
 * Paper's 28dp dialog corner is capped at the 12dp maximum.
 */
export function ConfirmDialog({
  visible,
  onDismiss,
  title,
  description,
  confirmLabel,
  onConfirm,
  confirmDisabled = false,
  destructive = false,
  children,
}: {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  confirmDisabled?: boolean;
  destructive?: boolean;
  children?: ReactNode;
}) {
  const theme = useTheme();
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={[styles.dialog, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.body}>
          <Text variant="titleMedium" style={styles.title}>
            {title}
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {description}
          </Text>
          {children}
          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={onDismiss}
              textColor={theme.colors.onSurface}
              style={[styles.button, { borderColor: theme.colors.outlineVariant }]}>
              Cancel
            </Button>
            <Button
              mode="contained"
              disabled={confirmDisabled}
              buttonColor={destructive ? theme.colors.error : undefined}
              onPress={() => {
                onConfirm();
                onDismiss();
              }}
              style={styles.button}>
              {confirmLabel}
            </Button>
          </View>
        </View>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: { borderRadius: Shape.max },
  body: { padding: PADDING, gap: 12 },
  title: { fontFamily: Fonts.semiBold },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 },
  button: { borderRadius: INNER_RADIUS },
});
