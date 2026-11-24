import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Switch, Text, useTheme } from 'react-native-paper';

import { useProfileNav } from '@/components/profile-return';
import { DetailScreen } from '@/components/shared/detail-screen';
import { PanelSheet } from '@/components/shared/panel-sheet';
import { SheetBlock, SheetButton, SheetField, SheetSuccess } from '@/components/shared/sheet-parts';
import { setScreenLock, updatePassword, useProfile } from '@/data/profile';
import { useToast } from '@/hooks/use-toast';

import { FeatureCard, LinkCard, profileStyles } from './profile-ui';

/** The old app's password rules, checked as you type. */
const RULES = [
  { label: 'At least 8 characters', test: (value: string) => value.length >= 8 },
  { label: 'An uppercase and a lowercase letter', test: (value: string) => /[A-Z]/.test(value) && /[a-z]/.test(value) },
  { label: 'A number', test: (value: string) => /\d/.test(value) },
  { label: 'A special character (!@#$…)', test: (value: string) => /[^A-Za-z0-9]/.test(value) },
];

/**
 * Security & privacy (profile → Preferences), the old app's screen of the
 * same name: change the account password (then sign in again), lock the app
 * with the phone's screen lock, and the privacy policy.
 */
export function SecurityPrivacy() {
  const theme = useTheme();
  const toast = useToast();
  const profile = useProfile();
  const [changing, setChanging] = useState(false);
  const [lockSheet, setLockSheet] = useState<boolean | null>(null);

  return (
    <DetailScreen title="Security & privacy" fallbackHref="/">
      <View style={[profileStyles.stack, profileStyles.first]}>
        <FeatureCard icon="lock-simple" title="Change account password" line={`Last updated: ${profile.passwordUpdated}`} onPress={() => setChanging(true)} />
        <FeatureCard
          icon="fingerprint"
          title="Enable screen lock"
          line="Secure your app by using screen lock (pattern, fingerprint, PIN)"
          trailing={<Switch value={profile.screenLock} onValueChange={setLockSheet} color={theme.colors.primary} accessibilityLabel="Enable screen lock" />}
        />
        <LinkCard icon="scroll" title="Privacy Policy" line="How Pine Labs collects and uses your data" onPress={() => toast("The privacy policy isn't in the prototype yet")} />
      </View>
      <ChangePasswordSheet visible={changing} onDismiss={() => setChanging(false)} />
      <ScreenLockSheet
        enabling={lockSheet}
        onDismiss={() => setLockSheet(null)}
        onConfirm={() => {
          const enabling = lockSheet === true;
          setScreenLock(enabling);
          setLockSheet(null);
          toast(enabling ? 'Screen lock enabled' : 'Screen lock turned off');
        }}
      />
    </DetailScreen>
  );
}

function ChangePasswordSheet({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
  const theme = useTheme();
  const profileNav = useProfileNav();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);
  const [wasVisible, setWasVisible] = useState(false);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setCurrent('');
      setNext('');
      setConfirm('');
      setDone(false);
    }
  }
  const rulesMet = RULES.every((rule) => rule.test(next));
  const mismatch = confirm.length > 0 && confirm !== next;
  const sameAsOld = next.length > 0 && next === current;
  const valid = current.length > 0 && rulesMet && !mismatch && confirm.length > 0 && !sameAsOld;

  return (
    <PanelSheet
      visible={visible}
      onDismiss={done ? () => undefined : onDismiss}
      title="Change account password"
      fit
      footer={
        done ? (
          <SheetButton
            label="Sign in again"
            onPress={() => {
              // A new password signs you out everywhere, this device included.
              onDismiss();
              profileNav.close();
              router.replace('/login');
            }}
          />
        ) : (
          <SheetButton
            label="Update password"
            disabled={!valid}
            onPress={() => {
              updatePassword();
              setDone(true);
            }}
          />
        )
      }>
      {done ? (
        <SheetSuccess title="Password changed" body="Sign in to continue. You've been signed out of your other devices too." />
      ) : (
        <SheetBlock last gap={16}>
          <SheetField label="Current password" value={current} onChangeText={setCurrent} placeholder="Enter current password" secure />
          <SheetField label="New password" value={next} onChangeText={setNext} placeholder="Enter new password" secure error={sameAsOld ? 'Choose a password you haven’t used' : undefined} />
          <View style={styles.rules}>
            {RULES.map((rule) => {
              const met = rule.test(next);
              return (
                <View key={rule.label} style={styles.rule}>
                  <Icon source={met ? 'check-circle-fill' : 'circle'} size={16} color={met ? '#16a34a' : theme.colors.onSurfaceVariant} />
                  <Text style={[profileStyles.small, { color: met ? theme.colors.onSurface : theme.colors.onSurfaceVariant }]}>{rule.label}</Text>
                </View>
              );
            })}
          </View>
          <SheetField label="Confirm new password" value={confirm} onChangeText={setConfirm} placeholder="Enter it again" secure error={mismatch ? 'Passwords don’t match' : undefined} />
        </SheetBlock>
      )}
    </PanelSheet>
  );
}

/** The old app's "Let's get started" screen lock prompt, as a sheet; turning it off just confirms. */
function ScreenLockSheet({ enabling, onDismiss, onConfirm }: { enabling: boolean | null; onDismiss: () => void; onConfirm: () => void }) {
  const theme = useTheme();
  return (
    <PanelSheet
      visible={enabling !== null}
      onDismiss={onDismiss}
      title={enabling ? 'Enable screen lock' : 'Turn off screen lock'}
      fit
      footer={<SheetButton label={enabling ? 'Enable now' : 'Turn off'} onPress={onConfirm} />}>
      <SheetBlock last gap={12}>
        <View style={profileStyles.centre}>
          <View style={[styles.tile, { backgroundColor: theme.colors.primary }]}>
            <Icon source="fingerprint" size={24} color={theme.colors.onPrimary} />
          </View>
          <Text style={[profileStyles.sheetTitle, profileStyles.centreText, { color: theme.colors.onSurface }]}>{enabling ? 'Unlock Pine Labs One with your screen lock' : 'Open the app without your screen lock?'}</Text>
          <Text style={[profileStyles.body, profileStyles.centreText, { color: theme.colors.onSurfaceVariant }]}>
            {enabling
              ? 'Use your existing screen lock (pattern, fingerprint, PIN) to add an additional layer of security. Only you will be able to access it.'
              : 'Anyone with your unlocked phone will be able to open Pine Labs One.'}
          </Text>
        </View>
      </SheetBlock>
    </PanelSheet>
  );
}

const styles = StyleSheet.create({
  rules: { gap: 6, marginTop: -4 },
  rule: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tile: { width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});
