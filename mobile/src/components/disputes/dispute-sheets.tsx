import * as DocumentPicker from 'expo-document-picker';
import { StyleSheet, TextInput, View } from 'react-native';
import { Button, Dialog, Icon, Portal, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { FormField, FormTextInput } from '@/components/shared/form-fields';
import { PANEL_INNER_RADIUS, PanelSection, PanelSheet } from '@/components/shared/panel-sheet';
import { concentric, Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import {
  EVIDENCE_FIELDS,
  EVIDENCE_PANEL_COPY,
  type EvidenceDocuments,
  type EvidenceFieldKey,
  type EvidencePanelMode,
} from '@/data/disputes';
import { useToast } from '@/hooks/use-toast';

const DESTRUCTIVE = '#dc2626';

/**
 * Defend / Re-upload / Response details panel (web: DisputeEvidencePanel):
 * defend amount, the re-upload issue note, one uploader per proof (picked
 * with the system document picker: JPG, JPEG or PDF), comments, and Submit
 * response. View mode lists the submitted documents for download.
 */
export function DisputeEvidenceSheet({
  visible,
  onDismiss,
  mode,
  amount,
  documents,
  onDocumentsChange,
  flaggedField,
  issueMessage,
  comment,
  onCommentChange,
  onSubmit,
}: {
  visible: boolean;
  onDismiss: () => void;
  mode: EvidencePanelMode;
  amount: string;
  documents: EvidenceDocuments;
  onDocumentsChange: (documents: EvidenceDocuments) => void;
  flaggedField?: EvidenceFieldKey | null;
  issueMessage?: string;
  comment: string;
  onCommentChange: (value: string) => void;
  onSubmit: () => void;
}) {
  const theme = useTheme();
  const toast = useToast();
  const isView = mode === 'view';
  const copy = EVIDENCE_PANEL_COPY[mode];
  const hasAnyDocument = Object.keys(documents).length > 0;
  const muted = { color: theme.colors.onSurfaceVariant };

  const pick = async (key: EvidenceFieldKey) => {
    const result = await DocumentPicker.getDocumentAsync({ type: ['image/jpeg', 'application/pdf'], copyToCacheDirectory: false });
    if (result.canceled || !result.assets[0]) return;
    onDocumentsChange({ ...documents, [key]: { fileName: result.assets[0].name } });
  };
  const remove = (key: EvidenceFieldKey) => {
    const next = { ...documents };
    delete next[key];
    onDocumentsChange(next);
  };

  return (
    <PanelSheet
      visible={visible}
      onDismiss={onDismiss}
      title={copy.title}
      footer={
        isView ? undefined : (
          <Button mode="contained" onPress={onSubmit} disabled={!hasAnyDocument} style={styles.button}>
            Submit response
          </Button>
        )
      }>
      <PanelSection>
        <FormField label="Defend amount" hint={isView ? undefined : 'Change amount to partially defend'}>
          <View style={[styles.amountField, { borderColor: theme.colors.outlineVariant }]}>
            <Text variant="bodyMedium" style={muted}>
              ₹
            </Text>
            <TextInput
              defaultValue={amount}
              editable={!isView}
              keyboardType="number-pad"
              accessibilityLabel="Defend amount"
              style={[styles.amountInput, { color: theme.colors.onSurface }]}
            />
          </View>
        </FormField>
      </PanelSection>
      <PanelSection last={isView}>
        {mode === 'reupload' && issueMessage ? (
          <View style={styles.issue}>
            <Icon source="info-fill" size={16} color="#d97706" />
            <Text variant="bodyMedium" style={[styles.flex, { color: '#78350f' }]}>
              {issueMessage}
            </Text>
          </View>
        ) : null}
        <View>
          <Text variant="titleSmall" style={styles.semiBold}>
            {copy.sectionTitle}
          </Text>
          <Text variant="bodySmall" style={muted}>
            Supported file format is .JPG, .JPEG, .PDF Upload the certificates in the uploaders below.
          </Text>
        </View>
        {EVIDENCE_FIELDS.map((field) => {
          const document = documents[field.key];
          const flagged = mode === 'reupload' && flaggedField === field.key;
          const action = isView
            ? document
              ? { label: 'Download', color: theme.colors.primary, onPress: () => toast(`Downloading ${document.fileName}...`) }
              : null
            : document
              ? { label: 'Remove', color: DESTRUCTIVE, onPress: () => remove(field.key) }
              : { label: 'Upload', color: theme.colors.primary, onPress: () => pick(field.key) };
          return (
            <FormField key={field.key} label={field.label}>
              <View
                style={[
                  styles.uploader,
                  flagged
                    ? { borderColor: 'rgba(220, 38, 38, 0.6)', backgroundColor: 'rgba(220, 38, 38, 0.05)' }
                    : { borderColor: theme.colors.outlineVariant },
                ]}>
                <Icon source="upload-simple" size={16} color={document ? theme.colors.onSurface : theme.colors.onSurfaceVariant} />
                <Text variant="bodyMedium" numberOfLines={1} style={[styles.flex, { color: document ? theme.colors.onSurface : theme.colors.onSurfaceVariant }]}>
                  {document?.fileName ?? field.placeholder}
                </Text>
                {action ? (
                  <TouchableRipple onPress={action.onPress} borderless accessibilityRole="button" accessibilityLabel={`${action.label} ${field.label}`} style={styles.action}>
                    <Text variant="labelLarge" style={{ color: action.color }}>
                      {action.label}
                    </Text>
                  </TouchableRipple>
                ) : null}
              </View>
              {flagged ? (
                <Text variant="bodySmall" style={{ color: DESTRUCTIVE }}>
                  Please re-upload previous document was blurry
                </Text>
              ) : null}
            </FormField>
          );
        })}
      </PanelSection>
      {!isView ? (
        <PanelSection last>
          <FormField label="Additional comments">
            <FormTextInput value={comment} onChangeText={onCommentChange} placeholder="Add your comment" accessibilityLabel="Additional comments" multiline />
          </FormField>
        </PanelSection>
      ) : null}
    </PanelSheet>
  );
}

const DIALOG_PADDING = 24;
const DIALOG_INNER_RADIUS = concentric(Shape.max, DIALOG_PADDING);

/** "Accept the dispute and refund?" confirmation (web: AcceptDisputeDialog). */
export function AcceptDisputeDialog({
  visible,
  onDismiss,
  amount,
  onConfirm,
}: {
  visible: boolean;
  onDismiss: () => void;
  amount: string;
  onConfirm: () => void;
}) {
  const theme = useTheme();
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={[styles.dialog, { backgroundColor: theme.colors.surface }]}>
        <Dialog.Content style={styles.dialogContent}>
          <Text variant="bodyMedium" style={[styles.dialogKicker, { color: theme.colors.onSurfaceVariant }]}>
            Accept dispute
          </Text>
          <View style={[styles.questionIcon, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Icon source="question" size={16} color={theme.colors.onSurfaceVariant} />
          </View>
          <Text variant="titleMedium" style={[styles.semiBold, styles.center]}>
            Accept the dispute and refund?
          </Text>
          <Text variant="bodyMedium" style={[styles.center, styles.body, { color: theme.colors.onSurfaceVariant }]}>
            By accepting this dispute, {amount} will be adjusted from your upcoming settlement. Please note, once confirmed, this action cannot
            be undone.
          </Text>
          <Button
            mode="contained"
            onPress={() => {
              onConfirm();
              onDismiss();
            }}
            style={[styles.dialogButton, { borderRadius: DIALOG_INNER_RADIUS }]}>
            Accept dispute
          </Button>
        </Dialog.Content>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  semiBold: { fontFamily: Fonts.semiBold },
  center: { textAlign: 'center' },
  body: { lineHeight: 22 },
  button: { borderRadius: PANEL_INNER_RADIUS },
  amountField: { height: 40, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, borderWidth: 1, borderRadius: PANEL_INNER_RADIUS },
  amountInput: { flex: 1, height: '100%', fontFamily: Fonts.regular, fontSize: 14 },
  issue: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: PANEL_INNER_RADIUS,
  },
  uploader: { height: 40, flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 12, paddingRight: 4, borderWidth: 1, borderRadius: PANEL_INNER_RADIUS },
  action: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: PANEL_INNER_RADIUS },
  // Paper dialogs default to a 28dp corner; capped at the 12dp maximum.
  dialog: { borderRadius: Shape.max },
  dialogContent: { alignItems: 'center', gap: 12, paddingTop: DIALOG_PADDING, paddingHorizontal: DIALOG_PADDING, paddingBottom: DIALOG_PADDING },
  dialogKicker: { alignSelf: 'flex-start', marginBottom: 4 },
  questionIcon: { width: 36, height: 36, borderRadius: DIALOG_INNER_RADIUS, alignItems: 'center', justifyContent: 'center' },
  dialogButton: { alignSelf: 'stretch', marginTop: 8 },
});
