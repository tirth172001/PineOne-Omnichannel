import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';

import { DetailRow, SectionCard } from '@/components/shared/detail-rows';
import { DetailScreen } from '@/components/shared/detail-screen';
import { PanelSheet } from '@/components/shared/panel-sheet';
import { OtpField, SheetBlock, SheetButton, SheetField, SheetSuccess } from '@/components/shared/sheet-parts';
import { OutlineTag } from '@/components/shared/status';
import { Fonts } from '@/constants/theme';
import { BUSINESS_PROFILE_ROLES } from '@/data/business-profile';
import { CURRENT_USER } from '@/data/businesses';
import { formatPhone, maskedEmail, maskedPhone, updateEmail, updatePhone, useProfile } from '@/data/profile';
import { useToast } from '@/hooks/use-toast';

import { LinkCard, Note, profileStyles } from './profile-ui';

type Field = 'phone' | 'email';

/**
 * Personal details (profile → your name), the old app's Profile: who you
 * are, the phone and email you sign in with — each changed by verifying
 * yourself on the current one, then the new one, by OTP — and your address.
 */
export function PersonalDetails() {
  const theme = useTheme();
  const profile = useProfile();
  const [changing, setChanging] = useState<Field | null>(null);
  const canOpenBusiness = BUSINESS_PROFILE_ROLES.includes(CURRENT_USER.roleLabel);

  return (
    <DetailScreen title="Personal details" fallbackHref="/">
      <View style={[profileStyles.stack, profileStyles.first]}>
        <SectionCard title="Your details" collapsible={false}>
          <DetailRow label="Name" value={CURRENT_USER.name} />
          <DetailRow label="Role">
            <OutlineTag label={CURRENT_USER.roleLabel} />
          </DetailRow>
        </SectionCard>

        <SectionCard title="Contact details" collapsible={false}>
          <ContactRow label="Primary phone no." value={`+91 ${profile.phone}`} onUpdate={() => setChanging('phone')} />
          <ContactRow label="Email ID" value={profile.email} onUpdate={() => setChanging('email')} />
          <Note>Your primary phone no. is used to sign in and for communication with Pine Labs.</Note>
        </SectionCard>

        <SectionCard title="Address" collapsible={false}>
          <Text style={[profileStyles.body, { color: theme.colors.onSurface }]}>{profile.address}</Text>
        </SectionCard>

        {/* The old profile listed linked bank accounts and GST numbers; they live in Business profile now. */}
        {canOpenBusiness ? (
          <>
            <LinkCard icon="bank" title="Bank accounts" line="Accounts your settlements go to" onPress={() => router.push('/business-profile/bank-accounts')} />
            <LinkCard icon="file-text" title="GST & KYC documents" line="GSTIN, PAN and uploaded documents" onPress={() => router.push('/business-profile/documents')} />
          </>
        ) : null}
      </View>
      <ChangeContactSheet field={changing} current={changing === 'email' ? profile.email : profile.phone} onDismiss={() => setChanging(null)} />
    </DetailScreen>
  );
}

function ContactRow({ label, value, onUpdate }: { label: string; value: string; onUpdate: () => void }) {
  const theme = useTheme();
  return (
    <View style={styles.contact}>
      <View style={profileStyles.flex}>
        <Text style={[profileStyles.small, { color: theme.colors.onSurfaceVariant }]}>{label}</Text>
        <Text numberOfLines={1} style={[profileStyles.medium, { color: theme.colors.onSurface }]}>
          {value}
        </Text>
      </View>
      <TouchableRipple onPress={onUpdate} borderless accessibilityRole="button" accessibilityLabel={`Update ${label}`} style={[styles.update, { borderColor: theme.colors.outlineVariant }]}>
        <Text style={[styles.updateLabel, { color: theme.colors.onSurface }]}>Update</Text>
      </TouchableRipple>
    </View>
  );
}

type Step = 'verify' | 'otp' | 'new' | 'newOtp' | 'done';
const RESEND_SECONDS = 30;

/**
 * Old app flow (profile_verify → profile_verify_otp → profile_number_update /
 * profile_email_update → update_verify_otp): send an OTP to what's on file,
 * enter it, type the new value, verify that with its own OTP, done.
 * "000000" stands in for a wrong OTP.
 */
function ChangeContactSheet({ field, current, onDismiss }: { field: Field | null; current: string; onDismiss: () => void }) {
  const theme = useTheme();
  const toast = useToast();
  const [step, setStep] = useState<Step>('verify');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState<string>();
  const [value, setValue] = useState('');
  const [resendIn, setResendIn] = useState(0);
  const [shown, setShown] = useState<Field | null>(null);
  // Each opening starts over.
  if (field !== shown) {
    setShown(field);
    if (field) {
      setStep('verify');
      setOtp('');
      setOtpError(undefined);
      setValue('');
    }
  }
  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  const phone = field === 'phone';
  const target = step === 'newOtp' ? (phone ? `+91 ${formatPhone(value)}` : value.trim()) : phone ? maskedPhone(current) : maskedEmail(current);
  const digits = value.replace(/\D/g, '');
  const valueError = phone
    ? digits.length === 10 && formatPhone(digits) === formatPhone(current)
      ? 'Mobile number already exists'
      : value.length > 0 && digits.length !== 10
        ? 'Please enter a valid phone no.'
        : undefined
    : value.trim().toLowerCase() === current.toLowerCase()
      ? 'A user with this email id already exists with your business'
      : value.length > 3 && !/^\S+@\S+\.\S+$/.test(value.trim())
        ? 'Please enter a valid email id to continue'
        : undefined;
  const valueValid = phone ? digits.length === 10 && !valueError : /^\S+@\S+\.\S+$/.test(value.trim()) && !valueError;

  const sendOtp = (next: Step) => {
    setOtp('');
    setOtpError(undefined);
    setResendIn(RESEND_SECONDS);
    setStep(next);
  };
  const verifyOtp = () => {
    if (otp === '000000') {
      setOtpError('Invalid OTP. Please try again.');
      return;
    }
    if (step === 'otp') {
      setStep('new');
      return;
    }
    if (phone) updatePhone(formatPhone(digits));
    else updateEmail(value.trim());
    setStep('done');
  };

  const title = step === 'verify' || step === 'otp' ? 'Verify yourself' : step === 'new' ? (phone ? 'Update primary contact' : 'Update Email ID') : step === 'newOtp' ? 'Verify new contact' : phone ? 'Phone no. updated' : 'Email ID updated';
  const footer =
    step === 'verify' ? (
      <SheetButton label="Send OTP" onPress={() => sendOtp('otp')} />
    ) : step === 'otp' || step === 'newOtp' ? (
      <SheetButton label="Verify" disabled={otp.length < 6} onPress={verifyOtp} />
    ) : step === 'new' ? (
      <SheetButton label="Update" disabled={!valueValid} onPress={() => sendOtp('newOtp')} />
    ) : (
      <SheetButton
        label="Done"
        onPress={() => {
          onDismiss();
          toast(phone ? 'Primary phone no. updated' : 'Email ID updated');
        }}
      />
    );

  return (
    <PanelSheet visible={field !== null} onDismiss={onDismiss} title={title} fit footer={footer}>
      {step === 'verify' ? (
        <SheetBlock last>
          <Text style={[profileStyles.body, { color: theme.colors.onSurface }]}>
            {phone ? 'An OTP will be sent on your registered mobile number' : 'An OTP will be sent on your registered email id'}
          </Text>
          <Text style={[profileStyles.title, { color: theme.colors.onSurface }]}>{target}</Text>
        </SheetBlock>
      ) : null}
      {step === 'otp' || step === 'newOtp' ? (
        <SheetBlock last gap={16}>
          <View style={styles.otpHead}>
            <Text style={[profileStyles.body, { color: theme.colors.onSurfaceVariant }]}>Enter the OTP sent to</Text>
            <View style={styles.otpTarget}>
              <Text style={[profileStyles.medium, profileStyles.flex, { color: theme.colors.onSurface }]}>{target}</Text>
              {step === 'newOtp' ? (
                <Text onPress={() => setStep('new')} style={[styles.link, { color: theme.colors.primary }]}>
                  {phone ? 'Change number' : 'Change Email'}
                </Text>
              ) : null}
            </View>
          </View>
          <OtpField
            value={otp}
            onChange={(next) => {
              setOtp(next);
              setOtpError(undefined);
            }}
          />
          {otpError ? <Text style={[profileStyles.small, { color: theme.colors.error }]}>{otpError}</Text> : null}
          <Text style={[profileStyles.small, { color: theme.colors.onSurfaceVariant }]}>
            {resendIn > 0 ? (
              `Resend OTP in 0:${String(resendIn).padStart(2, '0')}`
            ) : (
              <Text
                onPress={() => {
                  setResendIn(RESEND_SECONDS);
                  toast('OTP resent');
                }}
                style={[styles.link, { color: theme.colors.primary }]}>
                Resend OTP
              </Text>
            )}
          </Text>
        </SheetBlock>
      ) : null}
      {step === 'new' ? (
        <SheetBlock last gap={16}>
          <Text style={[profileStyles.body, { color: theme.colors.onSurfaceVariant }]}>
            {phone ? 'Primary contact no. is used to login and for communications with Pine Labs' : 'Your email ID is used for reports, invoices and communications with Pine Labs'}
          </Text>
          <SheetField
            label={phone ? 'New contact no.' : 'New email ID'}
            value={value}
            onChangeText={setValue}
            placeholder={phone ? 'Enter new contact no.' : 'Enter new email ID'}
            prefix={phone ? 'phone' : 'envelope-simple'}
            keyboardType={phone ? 'number-pad' : 'email-address'}
            error={valueError}
          />
        </SheetBlock>
      ) : null}
      {step === 'done' ? (
        <SheetSuccess
          title={phone ? 'Primary phone no. updated' : 'Email ID updated'}
          body={phone ? `Sign in with +91 ${formatPhone(digits)} from now on.` : `We'll write to ${value.trim()} from now on.`}
        />
      ) : null}
    </PanelSheet>
  );
}

const styles = StyleSheet.create({
  contact: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  update: { height: 32, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, justifyContent: 'center' },
  updateLabel: { fontFamily: Fonts.medium, fontSize: 14, lineHeight: 20 },
  otpHead: { gap: 2 },
  otpTarget: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  link: { fontFamily: Fonts.medium, fontSize: 14, lineHeight: 20 },
});
