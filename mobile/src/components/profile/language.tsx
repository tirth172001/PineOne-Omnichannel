import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';

import { PanelSheet } from '@/components/shared/panel-sheet';
import { SelectionMark } from '@/components/shared/selection-mark';
import { SheetBlock, SheetButton } from '@/components/shared/sheet-parts';
import { Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import { type LanguageCode, LANGUAGES, setLanguage, useProfile } from '@/data/profile';

import { profileStyles } from './profile-ui';

/**
 * Language (profile → Preferences), the old app's language picker as a
 * sheet: each language in its own script, Update language to switch.
 * `onUpdated` is told, so the caller can confirm (the profile renders in a
 * portal, outside the toast provider's reach for sheets).
 */
export function LanguageSheet({ visible, onDismiss, onUpdated }: { visible: boolean; onDismiss: () => void; onUpdated: () => void }) {
  const theme = useTheme();
  const current = useProfile().language;
  const [picked, setPicked] = useState<LanguageCode>(current);
  const [wasVisible, setWasVisible] = useState(false);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setPicked(current);
  }

  return (
    <PanelSheet
      visible={visible}
      onDismiss={onDismiss}
      title="Choose your preferred language"
      fit
      footer={
        <SheetButton
          label="Update language"
          disabled={picked === current}
          onPress={() => {
            setLanguage(picked);
            onDismiss();
            onUpdated();
          }}
        />
      }>
      <SheetBlock last gap={0}>
        <View accessibilityRole="radiogroup">
          {LANGUAGES.map((language, index) => {
            const selected = picked === language.code;
            return (
              <TouchableRipple
                key={language.code}
                onPress={() => setPicked(language.code)}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={language.label}
                style={index > 0 ? [styles.rule, { borderTopColor: theme.colors.background }] : undefined}>
                <View style={styles.row}>
                  <View style={[styles.glyph, { backgroundColor: selected ? theme.colors.primary : theme.colors.surfaceVariant }]}>
                    <Text style={[styles.glyphText, { color: selected ? theme.colors.onPrimary : theme.colors.onSurface }]}>{language.native.slice(0, language.code === 'en' ? 2 : 1)}</Text>
                  </View>
                  <View style={profileStyles.flex}>
                    <Text style={[profileStyles.medium, { color: theme.colors.onSurface }]}>{language.native}</Text>
                    {language.code === 'en' ? null : <Text style={[profileStyles.small, { color: theme.colors.onSurfaceVariant }]}>{language.label}</Text>}
                  </View>
                  <SelectionMark type="radio" checked={selected} />
                </View>
              </TouchableRipple>
            );
          })}
        </View>
      </SheetBlock>
    </PanelSheet>
  );
}

const styles = StyleSheet.create({
  rule: { borderTopWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52, paddingVertical: 6 },
  glyph: { width: 36, height: 36, borderRadius: Shape.small, alignItems: 'center', justifyContent: 'center' },
  glyphText: { fontFamily: Fonts.semiBold, fontSize: 15, lineHeight: 20 },
});
