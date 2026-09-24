import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, useTheme } from 'react-native-paper';

import { GenerateReportSheet } from '@/components/reports/generate-report-sheet';
import { ReportCatalog } from '@/components/reports/report-catalog';
import { ReportListing } from '@/components/reports/report-listing';
import { ScheduleReportSheet } from '@/components/reports/schedule-report-sheet';
import { useShellTabs } from '@/components/shell-tabs';
import { Shape } from '@/constants/shape';
import type { ReportKind } from '@/data/reports';
import { useToast } from '@/hooks/use-toast';

const REPORT_TABS = [
  { key: 'reports', label: 'Reports' },
  { key: 'history', label: 'History' },
  { key: 'schedule', label: 'Schedule' },
];

/**
 * Reports (web: ReportsContent): Schedule report and Generate report actions,
 * then the Reports / History / Schedule sub-tabs in the shell's top bar. The
 * web's success toasts use the shell's toast (Snackbar).
 */
export default function ReportsScreen() {
  const theme = useTheme();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const requestedKey = REPORT_TABS.some((t) => t.key === tab) ? tab : undefined;
  const [activeKey, setActiveKey] = useState(requestedKey ?? REPORT_TABS[0].key);
  // Follow a newly requested tab (adjusting state during render, not in an effect).
  const [lastRequestedKey, setLastRequestedKey] = useState(requestedKey);
  if (requestedKey !== lastRequestedKey) {
    setLastRequestedKey(requestedKey);
    if (requestedKey) setActiveKey(requestedKey);
  }
  useShellTabs({ tabs: REPORT_TABS, activeKey, onChange: setActiveKey });

  // The panel keeps its last report while closing, so its content doesn't blank mid-animation.
  const [generate, setGenerate] = useState<{ kind: ReportKind; title: string; open: boolean }>({
    kind: 'transaction',
    title: '',
    open: false,
  });
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const toast = useToast();
  const openGenerate = (kind: ReportKind, title: string) => setGenerate({ kind, title, open: true });

  return (
    <View style={styles.screen}>
      <ScrollView key={activeKey} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={() => setScheduleOpen(true)}
            textColor={theme.colors.onSurface}
            style={[styles.action, { borderColor: theme.colors.outlineVariant, backgroundColor: theme.colors.surface }]}>
            Schedule report
          </Button>
          <Button mode="contained" onPress={() => openGenerate('transaction', 'All transaction reports')} style={styles.action}>
            Generate report
          </Button>
        </View>
        {activeKey === 'reports' ? <ReportCatalog onGenerate={openGenerate} /> : <ReportListing tab={activeKey === 'history' ? 'history' : 'schedule'} />}
      </ScrollView>

      <GenerateReportSheet
        visible={generate.open}
        onDismiss={() => setGenerate((current) => ({ ...current, open: false }))}
        kind={generate.kind}
        title={generate.title}
        onGenerated={(name) => toast(`${name} is being generated — you'll find it under History shortly.`)}
      />
      <ScheduleReportSheet visible={scheduleOpen} onDismiss={() => setScheduleOpen(false)} onCreated={toast} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, paddingBottom: 32, gap: 16 },
  actions: { flexDirection: 'row', gap: 8 },
  // Standalone page-level buttons.
  action: { flex: 1, borderRadius: Shape.small },
});
