import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { GenerateReportSheet } from '@/components/reports/generate-report-sheet';
import { ReportCatalog } from '@/components/reports/report-catalog';
import { ReportListing } from '@/components/reports/report-listing';
import { ScheduleReportSheet } from '@/components/reports/schedule-report-sheet';
import { useShellTabs } from '@/components/shell-tabs';
import { TabScreen } from '@/components/tab-screen';
import type { ReportKind } from '@/data/reports';
import { useToast } from '@/hooks/use-toast';

const REPORT_TABS = [
  { key: 'reports', label: 'Reports' },
  { key: 'history', label: 'History' },
  { key: 'schedule', label: 'Schedule' },
];

/**
 * Reports (web: ReportsContent): the Reports / History / Schedule sub-tabs
 * under the title, with Generate report and Schedule report in the header's
 * New menu. The web's success toasts use the shell's toast (Snackbar).
 */
export default function ReportsScreen() {
  const { tab, generate: generateRequest } = useLocalSearchParams<{ tab?: string; generate?: string }>();
  const requestedKey = REPORT_TABS.some((t) => t.key === tab) ? tab : undefined;
  const [activeKey, setActiveKey] = useState(requestedKey ?? REPORT_TABS[0].key);
  // Follow a newly requested tab (adjusting state during render, not in an effect).
  const [lastRequestedKey, setLastRequestedKey] = useState(requestedKey);
  if (requestedKey !== lastRequestedKey) {
    setLastRequestedKey(requestedKey);
    if (requestedKey) setActiveKey(requestedKey);
  }

  // The panel keeps its last report while closing, so its content doesn't blank mid-animation.
  const [generate, setGenerate] = useState<{ kind: ReportKind; title: string; open: boolean }>(() => ({
    kind: 'transaction',
    title: generateRequest ? 'All transaction reports' : '',
    open: Boolean(generateRequest),
  }));
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const toast = useToast();
  const openGenerate = (kind: ReportKind, title: string) => setGenerate({ kind, title, open: true });
  // `?generate=<token>` (Overview's Download report quick action) opens the Generate panel;
  // each tap sends a new token so it reopens even while this tab stays mounted.
  const [lastGenerateRequest, setLastGenerateRequest] = useState(generateRequest);
  if (generateRequest && generateRequest !== lastGenerateRequest) {
    setLastGenerateRequest(generateRequest);
    setGenerate({ kind: 'transaction', title: 'All transaction reports', open: true });
  }

  useShellTabs({ tabs: REPORT_TABS, activeKey, onChange: setActiveKey });

  return (
    <TabScreen
      tab="reports"
      actions={[
        { label: 'Generate report', icon: 'download-simple', onPress: () => openGenerate('transaction', 'All transaction reports') },
        { label: 'Schedule report', icon: 'calendar-check', onPress: () => setScheduleOpen(true) },
      ]}
      actionsMenu={{ label: 'New', icon: 'plus' }}>
      {/* Keyed by tab so each sub-tab starts with its own search and filters. */}
      {activeKey === 'reports' ? (
        <ReportCatalog onGenerate={openGenerate} />
      ) : (
        <ReportListing key={activeKey} tab={activeKey === 'history' ? 'history' : 'schedule'} />
      )}

      <GenerateReportSheet
        visible={generate.open}
        onDismiss={() => setGenerate((current) => ({ ...current, open: false }))}
        kind={generate.kind}
        title={generate.title}
        onGenerated={(name) => toast(`${name} is being generated — you'll find it under History shortly.`)}
      />
      <ScheduleReportSheet visible={scheduleOpen} onDismiss={() => setScheduleOpen(false)} onCreated={toast} />
    </TabScreen>
  );
}
