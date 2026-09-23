import { StyleSheet, View } from 'react-native';
import { IconButton, Text, useTheme } from 'react-native-paper';

import { Shape } from '@/constants/shape';

import { FilterMenuButton } from './controls';

type PaginationBarProps = {
  page: number;
  totalPages: number;
  rowsPerPage: number;
  totalRows: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  rowsPerPageOptions?: number[];
};

/**
 * Listing pagination (web: PaginationControls): total rows, rows per page,
 * "Page x of y", and first / previous / next / last. Wraps onto two lines on a
 * phone.
 */
export function PaginationBar({
  page,
  totalPages,
  rowsPerPage,
  totalRows,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [10, 25, 50],
}: PaginationBarProps) {
  const theme = useTheme();
  const nav = (icon: string, label: string, target: number, disabled: boolean) => (
    <IconButton
      icon={icon}
      mode="outlined"
      size={16}
      disabled={disabled}
      // Full-contrast icon when enabled, so it reads clearly apart from the 38% disabled state.
      iconColor={disabled ? undefined : theme.colors.onSurface}
      onPress={() => onPageChange(target)}
      accessibilityLabel={label}
      style={[styles.navButton, { borderColor: theme.colors.outlineVariant }]}
    />
  );

  return (
    <View style={styles.bar}>
      <View style={styles.row}>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          Total {totalRows} row(s)
        </Text>
        <View style={styles.rowsPerPage}>
          <Text variant="labelMedium">Rows per page</Text>
          <FilterMenuButton
            value={String(rowsPerPage)}
            onValueChange={(value) => onRowsPerPageChange(Number(value))}
            options={rowsPerPageOptions.map((option) => ({ value: String(option), label: String(option) }))}
            accessibilityLabel="Rows per page"
          />
        </View>
      </View>
      <View style={styles.row}>
        <Text variant="labelMedium">
          Page {page} of {totalPages}
        </Text>
        <View style={styles.nav}>
          {nav('caret-double-left', 'First page', 1, page <= 1)}
          {nav('caret-left', 'Previous page', Math.max(1, page - 1), page <= 1)}
          {nav('caret-right', 'Next page', Math.min(totalPages, page + 1), page >= totalPages)}
          {nav('caret-double-right', 'Last page', totalPages, page >= totalPages)}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { gap: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  rowsPerPage: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nav: { flexDirection: 'row', gap: 8 },
  // Standalone page-level control.
  navButton: { margin: 0, borderRadius: Shape.small, width: 36, height: 36 },
});
