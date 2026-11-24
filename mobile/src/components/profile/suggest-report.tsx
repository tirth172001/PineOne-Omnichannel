import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Icon, IconButton, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { DetailScreen } from '@/components/shared/detail-screen';
import { NotFound } from '@/components/shared/not-found';
import { PanelSheet } from '@/components/shared/panel-sheet';
import { OptionCard, SheetBlock, SheetButton, SheetSuccess } from '@/components/shared/sheet-parts';
import { Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import { FEEDBACK_CATEGORIES, FEEDBACK_LIMITS, FEEDBACK_TYPES, type FeedbackType } from '@/data/profile';
import { useToast } from '@/hooks/use-toast';

import { FeatureCard, FooterButton, Note, profileStyles } from './profile-ui';

/** Suggest & Report (profile → App support), the old app's three ways in. */
export function SuggestReport() {
  return (
    <DetailScreen title="Suggest & Report" fallbackHref="/">
      <View style={[profileStyles.stack, profileStyles.first]}>
        {(Object.keys(FEEDBACK_TYPES) as FeedbackType[]).map((type) => (
          <FeatureCard key={type} icon={FEEDBACK_TYPES[type].icon} title={FEEDBACK_TYPES[type].title} line={FEEDBACK_TYPES[type].line} onPress={() => router.push(`/suggest-report/${type}`)} />
        ))}
        <Note icon="lifebuoy">Need help with a payment or settlement? Raise a ticket from Support for a faster resolution.</Note>
      </View>
    </DetailScreen>
  );
}

const MOODS = [
  { icon: 'smiley-x-eyes', label: 'Terrible' },
  { icon: 'smiley-sad', label: 'Bad' },
  { icon: 'smiley-meh', label: 'Okay' },
  { icon: 'smiley', label: 'Good' },
  { icon: 'smiley-wink', label: 'Great' },
];

type Attachment = { name: string; size: number };

/**
 * One form per kind (old app: suggestion_feedback_form): feedback starts with
 * a mood; all three pick a category and describe it; bugs need a screenshot
 * or recording, the others take one optionally. Submit shows the thanks.
 */
export function SuggestReportForm({ type }: { type: string }) {
  const theme = useTheme();
  const toast = useToast();
  const [mood, setMood] = useState<number | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [description, setDescription] = useState('');
  const [benefit, setBenefit] = useState('');
  const [files, setFiles] = useState<Attachment[]>([]);
  const [sent, setSent] = useState(false);
  if (!(type in FEEDBACK_TYPES)) return <NotFound title="Suggest & Report" message="This form doesn't exist." fallbackHref="/suggest-report" />;
  const kind = type as FeedbackType;
  const copy = FEEDBACK_TYPES[kind];
  const valid = (kind !== 'feedback' || mood !== null) && category !== null && (kind === 'feedback' || description.trim().length > 0) && (kind !== 'bug' || files.length > 0);
  const muted = { color: theme.colors.onSurfaceVariant };

  const attach = async () => {
    if (files.length >= FEEDBACK_LIMITS.files) {
      toast(`You can only attach up to ${FEEDBACK_LIMITS.files} files.`);
      return;
    }
    const result = await DocumentPicker.getDocumentAsync({ type: ['image/*', 'video/*', 'application/pdf'], multiple: true, copyToCacheDirectory: false });
    if (result.canceled) return;
    const picked = result.assets.map((asset) => ({ name: asset.name, size: asset.size ?? 0 }));
    const tooBig = picked.find((file) => file.size > FEEDBACK_LIMITS.sizeMb * 1024 * 1024);
    if (tooBig) toast(`File exceeds ${FEEDBACK_LIMITS.sizeMb} MB. Please choose a smaller file.`);
    setFiles((current) => [...current, ...picked.filter((file) => file !== tooBig)].slice(0, FEEDBACK_LIMITS.files));
  };

  return (
    <DetailScreen title={copy.title} fallbackHref="/suggest-report" footer={<FooterButton label={kind === 'feedback' ? 'Submit feedback' : 'Submit'} disabled={!valid} onPress={() => setSent(true)} />}>
      <View style={[profileStyles.stack, profileStyles.first]}>
        <View style={[profileStyles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[profileStyles.title, { color: theme.colors.onSurface }]}>{copy.heading}</Text>
          {kind === 'feedback' ? (
            <>
              <Text style={[profileStyles.body, muted]}>Tap an emoji to rate your experience</Text>
              <View accessibilityRole="radiogroup" style={styles.moods}>
                {MOODS.map((item, index) => {
                  const active = mood === index;
                  return (
                    <TouchableRipple
                      key={item.label}
                      onPress={() => setMood(index)}
                      borderless
                      accessibilityRole="radio"
                      accessibilityState={{ checked: active }}
                      accessibilityLabel={item.label}
                      style={[styles.mood, { backgroundColor: active ? theme.colors.primary : theme.colors.background }]}>
                      <View style={styles.moodInner}>
                        <Icon source={active ? `${item.icon}-fill` : item.icon} size={28} color={active ? theme.colors.onPrimary : theme.colors.onSurfaceVariant} />
                        <Text style={[styles.moodLabel, { color: active ? theme.colors.onPrimary : theme.colors.onSurfaceVariant }]}>{item.label}</Text>
                      </View>
                    </TouchableRipple>
                  );
                })}
              </View>
            </>
          ) : null}
        </View>

        <View style={[profileStyles.card, { backgroundColor: theme.colors.surface }]}>
          <Label text="Category" />
          <TouchableRipple onPress={() => setPicking(true)} borderless accessibilityRole="button" accessibilityLabel={`Category${category ? `, ${category}` : ''}`} style={[styles.select, { borderColor: theme.colors.outlineVariant }]}>
            <View style={styles.selectInner}>
              <Text style={[profileStyles.body, profileStyles.flex, category ? { color: theme.colors.onSurface } : muted]}>{category ?? 'Select category'}</Text>
              <Icon source="caret-down" size={16} color={theme.colors.onSurfaceVariant} />
            </View>
          </TouchableRipple>

          <Label text={kind === 'bug' ? 'Describe the issue' : kind === 'feature' ? 'Tell us what feature you would like' : 'Share your thoughts'} optional={kind === 'feedback'} />
          <Area value={description} onChangeText={setDescription} placeholder={kind === 'feedback' ? 'What went well or what could be better? We are all ears!' : kind === 'bug' ? 'What happened, and what did you expect?' : 'Describe the feature'} />

          {kind === 'feature' ? (
            <>
              <Label text="How would this help you?" optional />
              <Area value={benefit} onChangeText={setBenefit} placeholder="e.g. It would save me 10 minutes at closing every day" />
            </>
          ) : null}
        </View>

        <View style={[profileStyles.card, { backgroundColor: theme.colors.surface }]}>
          <Label text="Attach files" optional={kind !== 'bug'} />
          <Text style={[profileStyles.small, muted]}>
            Up to {FEEDBACK_LIMITS.files} files, {FEEDBACK_LIMITS.sizeMb} MB each · {FEEDBACK_LIMITS.extensions.join(', ').toUpperCase()}
          </Text>
          {files.map((file, index) => (
            <View key={`${file.name}-${index}`} style={[styles.file, { backgroundColor: theme.colors.background }]}>
              <Icon source={/\.(mp4|mov)$/i.test(file.name) ? 'play-circle' : /\.pdf$/i.test(file.name) ? 'file-pdf' : 'image-square'} size={20} color={theme.colors.onSurface} />
              <View style={profileStyles.flex}>
                <Text numberOfLines={1} style={[profileStyles.medium, { color: theme.colors.onSurface }]}>
                  {file.name}
                </Text>
                <Text style={[profileStyles.small, muted]}>{(file.size / 1024 / 1024).toFixed(1)} MB</Text>
              </View>
              <IconButton icon="x" size={16} onPress={() => setFiles((current) => current.filter((_, at) => at !== index))} accessibilityLabel={`Remove ${file.name}`} style={styles.remove} />
            </View>
          ))}
          {files.length < FEEDBACK_LIMITS.files ? <SheetButton mode="outline" icon="paperclip" label={files.length ? 'Add more' : 'Add files'} onPress={attach} /> : null}
        </View>
      </View>

      <PanelSheet visible={picking} onDismiss={() => setPicking(false)} title="Select category" fit>
        <SheetBlock last>
          {FEEDBACK_CATEGORIES.map((item) => (
            <OptionCard
              key={item}
              title={item}
              selected={category === item}
              onPress={() => {
                setCategory(item);
                setPicking(false);
              }}
            />
          ))}
        </SheetBlock>
      </PanelSheet>

      <PanelSheet
        visible={sent}
        onDismiss={() => router.back()}
        title={copy.title}
        fit
        footer={
          <SheetButton
            label="Done"
            onPress={() => {
              setSent(false);
              router.back();
            }}
          />
        }>
        <SheetSuccess title={copy.thanks} body={copy.next} />
      </PanelSheet>
    </DetailScreen>
  );
}

function Label({ text, optional = false }: { text: string; optional?: boolean }) {
  const theme = useTheme();
  return (
    <Text style={[profileStyles.medium, { color: theme.colors.onSurface }]}>
      {text}
      {optional ? <Text style={{ color: theme.colors.onSurfaceVariant }}> (Optional)</Text> : null}
    </Text>
  );
}

function Area({ value, onChangeText, placeholder }: { value: string; onChangeText: (value: string) => void; placeholder: string }) {
  const theme = useTheme();
  return (
    <View>
      <TextInput
        value={value}
        onChangeText={(next) => onChangeText(next.slice(0, 500))}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.onSurfaceVariant}
        multiline
        textAlignVertical="top"
        accessibilityLabel={placeholder}
        style={[styles.area, { borderColor: theme.colors.outlineVariant, color: theme.colors.onSurface }]}
      />
      <Text style={[profileStyles.small, styles.count, { color: theme.colors.onSurfaceVariant }]}>{value.length}/500</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  moods: { flexDirection: 'row', gap: 6 },
  mood: { flex: 1, borderRadius: Shape.small },
  moodInner: { alignItems: 'center', gap: 4, paddingVertical: 10 },
  moodLabel: { fontFamily: Fonts.medium, fontSize: 11, lineHeight: 14 },
  select: { borderWidth: 1, borderRadius: 10 },
  selectInner: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 40, paddingHorizontal: 10 },
  area: { minHeight: 104, borderWidth: 1, borderRadius: 10, padding: 10, fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20 },
  count: { textAlign: 'right', marginTop: 4 },
  file: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 10, borderRadius: 10 },
  remove: { margin: 0 },
});
