import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Button, Chip, Icon, IconButton, Text, useTheme } from 'react-native-paper';

import { Fonts } from '@/constants/theme';

import { PANEL_INNER_RADIUS, PanelSection, PanelSheet } from './panel-sheet';

/** Web: the suggested and pre-added email IDs in transactions-content.tsx. */
const SUGGESTED_EMAILS = [
  'tirthtrivedi17@gmail.com',
  'jane.doe@example.com',
  'john.smith@mail.com',
  'alice.jones@domain.com',
  'bob.brown@service.org',
];
const INITIAL_EMAILS = ['tirth@setu.co', 'passport130872@gmail.com'];

/**
 * "Email transaction report" panel (web: the Email filtered side panel): type
 * or pick email IDs, review the added list, and send.
 */
export function EmailReportSheet({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
  const theme = useTheme();
  const [draft, setDraft] = useState('');
  const [emails, setEmails] = useState(INITIAL_EMAILS);

  const add = (email: string) => {
    const normalized = email.trim().toLowerCase();
    if (!normalized || emails.some((existing) => existing.toLowerCase() === normalized)) return;
    setEmails((current) => [...current, email.trim()]);
    setDraft('');
  };

  return (
    <PanelSheet visible={visible} onDismiss={onDismiss} title="Email transaction report" footer={<Button mode="contained" style={styles.button}>Send email</Button>}>
      <PanelSection>
        <Text variant="titleMedium" style={styles.heading}>
          Email IDs
        </Text>
        <View style={[styles.input, { borderColor: theme.colors.outlineVariant }]}>
          <Icon source="envelope-simple" size={16} color={theme.colors.onSurfaceVariant} />
          <TextInput
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={() => add(draft)}
            placeholder="Enter email ID"
            placeholderTextColor={theme.colors.onSurfaceVariant}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="done"
            accessibilityLabel="Enter email ID"
            style={[styles.textInput, { color: theme.colors.onSurface }]}
          />
        </View>
        <View style={styles.chips}>
          {SUGGESTED_EMAILS.map((email) => (
            <Chip key={email} mode="outlined" compact onPress={() => add(email)} style={styles.chip}>
              {email}
            </Chip>
          ))}
        </View>
      </PanelSection>
      <PanelSection last>
        <Text variant="titleMedium" style={styles.heading}>
          Added email IDs
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          Email with transaction excel will be sent to all below email IDs
        </Text>
        {emails.map((email) => (
          <View key={email} style={[styles.added, { borderColor: theme.colors.outlineVariant, backgroundColor: theme.colors.surfaceVariant }]}>
            <Text variant="bodyMedium" style={styles.addedText}>
              {email}
            </Text>
            <IconButton
              icon="x"
              size={18}
              onPress={() => setEmails((current) => current.filter((item) => item !== email))}
              accessibilityLabel={`Remove ${email}`}
              style={styles.remove}
            />
          </View>
        ))}
      </PanelSection>
    </PanelSheet>
  );
}

const styles = StyleSheet.create({
  heading: { fontFamily: Fonts.semiBold },
  input: { height: 40, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, borderWidth: 1, borderRadius: PANEL_INNER_RADIUS },
  textInput: { flex: 1, height: '100%', fontFamily: Fonts.regular, fontSize: 14 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: PANEL_INNER_RADIUS },
  added: { height: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 12, borderWidth: 1, borderRadius: PANEL_INNER_RADIUS },
  addedText: { fontFamily: Fonts.regular },
  remove: { margin: 0, borderRadius: PANEL_INNER_RADIUS },
  button: { borderRadius: PANEL_INNER_RADIUS },
});
