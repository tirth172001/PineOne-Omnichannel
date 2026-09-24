import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Button, Chip, Icon, Text, useTheme } from 'react-native-paper';

import { ChoiceControl, CollapsibleSection, FormField, FormTextInput, SelectField } from '@/components/shared/form-fields';
import { PANEL_INNER_RADIUS, PanelSection, PanelSheet } from '@/components/shared/panel-sheet';
import { Fonts } from '@/constants/theme';
import {
  isValidEmail,
  MAX_SCHEDULE_EMAILS,
  nextDeliveryDate,
  REPORT_TITLES,
  SCHEDULE_FREQUENCY_NOTE,
  type ScheduleFrequency,
} from '@/data/reports';

const FILE_FORMATS = ['Excel', 'Csv'] as const;
const FREQUENCIES: ScheduleFrequency[] = ['Daily', 'Weekly', 'Monthly'];
const REPORT_OPTIONS = REPORT_TITLES.map((title) => ({ value: title, label: title }));
const NAME_PLACEHOLDER = 'E.g. "Daily/ Weekly/ Monthly/ Quarterly - XYZ report schedule"';

function initialForm() {
  return {
    reportType: REPORT_TITLES[0] ?? '',
    fileFormat: 'Excel' as (typeof FILE_FORMATS)[number],
    recipientEmail: true,
    recipientSftp: false,
    fileName: '',
    scheduleName: '',
    frequency: 'Daily' as ScheduleFrequency,
    emails: [] as string[],
    emailInput: '',
    sftpHost: '',
    sftpPort: '',
    sftpUserId: '',
    sftpPassword: '',
  };
}

/**
 * "Schedule a report" panel (web: ScheduleReportPanel): report type, file
 * format, recipient (Email / SFTP), file and schedule names, frequency with
 * its delivery note, then the recipient details — email chips (up to 15) or
 * SFTP credentials. The form resets whenever the panel closes.
 */
export function ScheduleReportSheet({
  visible,
  onDismiss,
  onCreated,
}: {
  visible: boolean;
  onDismiss: () => void;
  /** Called with the confirmation message (web: the success toast). */
  onCreated: (message: string) => void;
}) {
  const theme = useTheme();
  const [form, setForm] = useState(initialForm);
  const set = <K extends keyof ReturnType<typeof initialForm>>(key: K, value: ReturnType<typeof initialForm>[K]) =>
    setForm((current) => ({ ...current, [key]: value }));
  const muted = { color: theme.colors.onSurfaceVariant };

  const close = () => {
    onDismiss();
    setForm(initialForm());
  };

  const commitEmails = (raw: string) => {
    const candidates = raw
      .split(/[,\s]+/)
      .map((value) => value.trim())
      .filter(Boolean);
    if (candidates.length === 0) {
      set('emailInput', '');
      return;
    }
    setForm((current) => {
      const next = new Set(current.emails);
      for (const candidate of candidates) {
        if (isValidEmail(candidate) && next.size < MAX_SCHEDULE_EMAILS) next.add(candidate);
      }
      return { ...current, emails: Array.from(next), emailInput: '' };
    });
  };

  const canCreate =
    Boolean(form.reportType) &&
    (form.recipientEmail || form.recipientSftp) &&
    Boolean(form.scheduleName.trim()) &&
    (!form.recipientEmail || form.emails.length > 0) &&
    (!form.recipientSftp ||
      Boolean(form.sftpHost.trim() && form.sftpPort.trim() && form.sftpUserId.trim() && form.sftpPassword.trim()));

  const create = () => {
    if (!canCreate) return;
    onCreated(`"${form.scheduleName}" schedule created — first report delivers on ${nextDeliveryDate(form.frequency)}.`);
    close();
  };

  const sftpField = (label: string, key: 'sftpHost' | 'sftpPort' | 'sftpUserId' | 'sftpPassword') => (
    <View style={styles.half}>
      <FormField label={label} required>
        <FormTextInput
          value={form[key]}
          onChangeText={(value) => set(key, value)}
          placeholder="Enter details"
          accessibilityLabel={label}
          secureTextEntry={key === 'sftpPassword'}
          keyboardType={key === 'sftpPort' ? 'number-pad' : undefined}
        />
      </FormField>
    </View>
  );

  return (
    <PanelSheet
      visible={visible}
      onDismiss={close}
      title="Schedule a report"
      footer={
        <>
          <View style={styles.note}>
            <Icon source="info" size={14} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodySmall" style={muted}>
              First report will be delivered on {nextDeliveryDate(form.frequency)}
            </Text>
          </View>
          <Button mode="contained" onPress={create} disabled={!canCreate} style={styles.button}>
            Create schedule
          </Button>
        </>
      }>
      <PanelSection>
        <Text variant="bodyMedium" style={muted}>
          Scheduled reports will be delivered to the specified emails as per the chosen frequency.
        </Text>
        <Text variant="titleSmall" style={styles.heading}>
          Select report type
        </Text>
        <FormField label="Report" required>
          <SelectField value={form.reportType} onValueChange={(value) => set('reportType', value)} options={REPORT_OPTIONS} accessibilityLabel="Report" />
        </FormField>
        <FormField label="File format" required>
          <View style={styles.choices}>
            {FILE_FORMATS.map((format) => (
              <ChoiceControl key={format} type="radio" label={format} checked={form.fileFormat === format} onPress={() => set('fileFormat', format)} />
            ))}
          </View>
        </FormField>
        <FormField label="Recipient" required>
          <View style={styles.choices}>
            <ChoiceControl type="checkbox" label="Email" checked={form.recipientEmail} onPress={() => set('recipientEmail', !form.recipientEmail)} />
            <ChoiceControl type="checkbox" label="SFTP" checked={form.recipientSftp} onPress={() => set('recipientSftp', !form.recipientSftp)} />
          </View>
        </FormField>
        <FormField label="File name (optional)">
          <FormTextInput value={form.fileName} onChangeText={(value) => set('fileName', value)} placeholder={NAME_PLACEHOLDER} accessibilityLabel="File name" />
        </FormField>
        <FormField label="Schedule name" required>
          <FormTextInput value={form.scheduleName} onChangeText={(value) => set('scheduleName', value)} placeholder={NAME_PLACEHOLDER} accessibilityLabel="Schedule name" />
        </FormField>
      </PanelSection>

      <PanelSection>
        <View>
          <Text variant="titleSmall" style={styles.heading}>
            Schedule details
          </Text>
          <Text variant="bodySmall" style={muted}>
            Select the frequency & when the report is to be delivered.
          </Text>
        </View>
        <FormField label="Frequency" required>
          <View style={styles.choices}>
            {FREQUENCIES.map((option) => (
              <ChoiceControl key={option} type="radio" label={option} checked={form.frequency === option} onPress={() => set('frequency', option)} />
            ))}
          </View>
          <View style={[styles.info, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Icon source="info" size={14} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodySmall" style={[styles.flex, muted]}>
              {SCHEDULE_FREQUENCY_NOTE[form.frequency]}
            </Text>
          </View>
        </FormField>
      </PanelSection>

      <PanelSection last>
        <View>
          <Text variant="titleSmall" style={styles.heading}>
            Recipient details
          </Text>
          <Text variant="bodySmall" style={muted}>
            Select the mode via which the reports will be sent.
          </Text>
        </View>

        {form.recipientEmail ? (
          <FormField label="Emails" required hint="Enter upto 15 email IDs, separated by comma or space.">
            <View style={[styles.emailBox, { borderColor: theme.colors.outlineVariant }]}>
              {form.emails.map((email) => (
                <Chip
                  key={email}
                  compact
                  onClose={() => set('emails', form.emails.filter((value) => value !== email))}
                  closeIcon="x"
                  accessibilityLabel={email}
                  style={[styles.chip, { backgroundColor: theme.colors.surfaceVariant }]}
                  textStyle={styles.chipText}>
                  {email}
                </Chip>
              ))}
              <TextInput
                value={form.emailInput}
                // Typing a comma or space commits the address, like the web's Enter / comma.
                onChangeText={(value) => (/[,\s]$/.test(value) ? commitEmails(value) : set('emailInput', value))}
                onSubmitEditing={() => commitEmails(form.emailInput)}
                onBlur={() => commitEmails(form.emailInput)}
                blurOnSubmit={false}
                editable={form.emails.length < MAX_SCHEDULE_EMAILS}
                placeholder={form.emails.length === 0 ? 'Enter email and press Enter' : ''}
                placeholderTextColor={theme.colors.onSurfaceVariant}
                keyboardType="email-address"
                autoCapitalize="none"
                accessibilityLabel="Add email"
                style={[styles.emailInput, { color: theme.colors.onSurface }]}
              />
            </View>
          </FormField>
        ) : null}

        {form.recipientSftp ? (
          <CollapsibleSection title="SFTP details">
            <View style={styles.grid}>
              {sftpField('IP/Hostname', 'sftpHost')}
              {sftpField('Port', 'sftpPort')}
              {sftpField('User ID', 'sftpUserId')}
              {sftpField('User password', 'sftpPassword')}
            </View>
          </CollapsibleSection>
        ) : null}
      </PanelSection>
    </PanelSheet>
  );
}

const CHIP_RADIUS = PANEL_INNER_RADIUS;

const styles = StyleSheet.create({
  heading: { fontFamily: Fonts.semiBold },
  flex: { flex: 1 },
  button: { borderRadius: PANEL_INNER_RADIUS },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginLeft: -8 },
  info: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: PANEL_INNER_RADIUS },
  note: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  emailBox: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, padding: 8, borderWidth: 1, borderRadius: PANEL_INNER_RADIUS },
  chip: { borderRadius: CHIP_RADIUS },
  chipText: { fontSize: 12 },
  emailInput: { flexGrow: 1, minWidth: 128, height: 32, paddingHorizontal: 4, fontFamily: Fonts.regular, fontSize: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  half: { flexBasis: '45%', flexGrow: 1 },
});
