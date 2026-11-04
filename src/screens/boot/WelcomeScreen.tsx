import React, {useState} from 'react';
import {
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {PrimaryButton} from '../../components/buttons/PrimaryButton';
import {ScreenAmbient} from '../../components/layout/ScreenAmbient';
import {APP_BRAND_LINE, APP_STAGE_LINE} from '../../constants/brand';
import {colors, fonts, radius} from '../../constants/theme';
import {icons} from '../../data/assets';

import {useAdaptive} from '../../hooks/useAdaptive';
import {useShake} from '../../hooks/useShake';
import {useAuth} from '../../routing/AuthContext';

type AuthMode = 'signIn' | 'signUp';

type AuthDraft = {
  email: string;
  password: string;
};

type WelcomeScreenProps = {
  onComplete: () => void;
  onDismiss?: () => void;
};

const EMPTY_DRAFT: AuthDraft = {email: '', password: ''};

function deny(shake: () => void, message: string) {
  shake();
  Alert.alert(message);
}

export function WelcomeScreen({onComplete, onDismiss}: WelcomeScreenProps) {
  const insets = useSafeAreaInsets();
  const adaptive = useAdaptive();
  const {register, signIn, enterGuest} = useAuth();
  const primaryShake = useShake();
  const [mode, setMode] = useState<AuthMode>('signIn');
  const [drafts, setDrafts] = useState<Record<AuthMode, AuthDraft>>({
    signIn: {...EMPTY_DRAFT},
    signUp: {...EMPTY_DRAFT},
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(
    null,
  );
  const iconSize = adaptive.scale(54);
  const isSignIn = mode === 'signIn';
  const canDismiss = Boolean(onDismiss);
  const {email, password} = drafts[mode];

  const setEmail = (value: string) => {
    setDrafts(current => ({
      ...current,
      [mode]: {...current[mode], email: value},
    }));
  };

  const setPassword = (value: string) => {
    setDrafts(current => ({
      ...current,
      [mode]: {...current[mode], password: value},
    }));
  };

  const switchMode = (next: AuthMode) => {
    if (next === mode) {
      return;
    }
    setMode(next);
    setPasswordVisible(false);
    setFocusedField(null);
  };

  const submit = async () => {
    if (!isSignIn) {
      if (!email.includes('@')) {
        deny(primaryShake.shake, 'Incorrect email or password.');
        return;
      }
      if (password.length < 3) {
        deny(primaryShake.shake, 'Fill in the fields.');
        return;
      }
      const result = await register(email, password);
      if (result.ok) {
        onComplete();
      }
      return;
    }

    if (!email.trim() || !password) {
      deny(primaryShake.shake, 'Fill in the fields.');
      return;
    }

    const result = await signIn(email, password);
    if (result.ok) {
      onComplete();
      return;
    }
    deny(primaryShake.shake, 'Incorrect email or password.');
  };

  return (
    <ScreenAmbient opacity={0.32}>
      <KeyboardAvoidingView
        style={styles.WelcomeScreenFacetChassis}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.WelcomeScreenScrollContent,
            {
              paddingHorizontal: adaptive.horizontalPadding,
              paddingTop: insets.top + adaptive.verticalScale(37),
              paddingBottom: Math.max(insets.bottom, 24),
            },
          ]}>
          {canDismiss ? (
            <Pressable
              onPress={onDismiss}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Close"
              style={styles.WelcomeScreenClosePortico}>
              <Text style={styles.WelcomeScreenCloseFiligree}>Close</Text>
            </Pressable>
          ) : null}

          <View style={styles.WelcomeScreenBrandLintel}>
            <View
              style={[
                styles.WelcomeScreenLogoPortico,
                {
                  borderRadius: adaptive.scale(15),
                  height: iconSize,
                  width: iconSize,
                },
              ]}>
              <Image
                source={icons.crest}
                style={[
                  styles.WelcomeScreenLogoSigil,
                  {borderRadius: adaptive.scale(15)},
                ]}
                resizeMode="cover"
              />
            </View>
            <View style={styles.WelcomeScreenBrandCopy}>
              <Text style={styles.WelcomeScreenBrandFiligree}>
                {APP_BRAND_LINE}
              </Text>
              <Text style={styles.WelcomeScreenStageFiligree}>
                {APP_STAGE_LINE}
              </Text>
            </View>
          </View>

          <Text style={styles.WelcomeScreenTitleFiligree}>Welcome</Text>
          <Text style={styles.WelcomeScreenBodyFiligree}>
            Sign in to sync your saved games, ratings and analytics.
          </Text>

          <View
            style={styles.WelcomeScreenSegmentPortico}
            accessibilityRole="tablist">
            <Pressable
              onPress={() => switchMode('signIn')}
              accessibilityRole="tab"
              accessibilityLabel="Sign In"
              accessibilityState={{selected: isSignIn}}
              style={[
                styles.WelcomeScreenSegmentBtn,
                isSignIn && styles.WelcomeScreenSegmentActive,
              ]}>
              <Text
                accessibilityElementsHidden
                importantForAccessibility="no"
                style={[
                  styles.WelcomeScreenSegmentFiligree,
                  isSignIn && styles.WelcomeScreenSegmentActiveFiligree,
                ]}>
                Sign In
              </Text>
            </Pressable>
            <Pressable
              onPress={() => switchMode('signUp')}
              accessibilityRole="tab"
              accessibilityLabel="Sign Up"
              accessibilityState={{selected: !isSignIn}}
              style={[
                styles.WelcomeScreenSegmentBtn,
                !isSignIn && styles.WelcomeScreenSegmentActive,
              ]}>
              <Text
                accessibilityElementsHidden
                importantForAccessibility="no"
                style={[
                  styles.WelcomeScreenSegmentFiligree,
                  !isSignIn && styles.WelcomeScreenSegmentActiveFiligree,
                ]}>
                Sign Up
              </Text>
            </Pressable>
          </View>

          <View style={styles.WelcomeScreenFieldEnclave}>
            <Text style={styles.WelcomeScreenFieldLintel}>EMAIL</Text>
            <View
              collapsable={false}
              style={[
                styles.WelcomeScreenFieldPortico,
                focusedField === 'email' && styles.WelcomeScreenFieldFocused,
              ]}>
              <TextInput
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                keyboardType="email-address"
                returnKeyType="next"
                editable
                underlineColorAndroid="transparent"
                placeholder="alex.mercer@icloud.com"
                placeholderTextColor={colors.bodyFaint}
                selectionColor={colors.accent}
                accessibilityLabel="Email"
                style={styles.WelcomeScreenInput}
              />
            </View>
          </View>

          <View style={styles.WelcomeScreenFieldEnclave}>
            <Text style={styles.WelcomeScreenFieldLintel}>PASSWORD</Text>
            <View
              collapsable={false}
              style={[
                styles.WelcomeScreenFieldPortico,
                focusedField === 'password' && styles.WelcomeScreenFieldFocused,
              ]}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password"
                textContentType="password"
                returnKeyType="done"
                editable
                underlineColorAndroid="transparent"
                secureTextEntry={!passwordVisible}
                placeholder="••••••••"
                placeholderTextColor={colors.bodyFaint}
                selectionColor={colors.accent}
                accessibilityLabel="Password"
                style={styles.WelcomeScreenInput}
              />
              <Pressable
                onPress={() => setPasswordVisible(current => !current)}
                hitSlop={8}
                style={styles.WelcomeScreenEyePortico}
                accessibilityRole="button"
                accessibilityLabel={
                  passwordVisible ? 'Hide password' : 'Show password'
                }>
                <Image
                  source={icons.reveal}
                  accessibilityElementsHidden
                  importantForAccessibility="no"
                  style={styles.WelcomeScreenEyeSigil}
                  resizeMode="contain"
                />
              </Pressable>
            </View>
          </View>

          <Animated.View
            style={[styles.WelcomeScreenSubmitPortico, primaryShake.style]}>
            <PrimaryButton
              label={isSignIn ? 'Sign In' : 'Sign Up'}
              onPress={submit}
            />
          </Animated.View>

          <View style={styles.WelcomeScreenGuestEnclave}>
            {!canDismiss ? (
              <>
                <View style={styles.WelcomeScreenDividerLintel}>
                  <View style={styles.WelcomeScreenHairline} />
                  <Text style={styles.WelcomeScreenOrFiligree}>OR</Text>
                  <View style={styles.WelcomeScreenHairline} />
                </View>
                <Pressable
                  onPress={() => {
                    enterGuest();
                    onComplete();
                  }}
                  style={styles.WelcomeScreenGuestPortico}
                  accessibilityRole="button"
                  accessibilityLabel="Continue without an account">
                  <Text
                    accessibilityElementsHidden
                    importantForAccessibility="no"
                    style={styles.WelcomeScreenGuestFiligree}>
                    Continue without an account
                  </Text>
                  <Image
                    source={icons.advance}
                    accessibilityElementsHidden
                    importantForAccessibility="no"
                    style={styles.WelcomeScreenChevronSigil}
                    resizeMode="contain"
                  />
                </Pressable>
                <Text style={styles.WelcomeScreenHintFiligree}>
                  Guest mode gives full access to games and analytics. Ratings
                  sync once you create an account.
                </Text>
              </>
            ) : (
              <Text style={styles.WelcomeScreenHintFiligree}>
                Create an account to sync saved games and ratings across
                sessions.
              </Text>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenAmbient>
  );
}

const styles = StyleSheet.create({
  WelcomeScreenFacetChassis: {
    flex: 1,
  },
  WelcomeScreenScrollContent: {
    flexGrow: 1,
  },
  WelcomeScreenClosePortico: {
    alignSelf: 'flex-end',
    marginBottom: 8,
    paddingVertical: 4,
  },
  WelcomeScreenCloseFiligree: {
    color: colors.accent,
    fontFamily: fonts.sansMedium,
    fontSize: 15,
    fontWeight: '500',
  },
  WelcomeScreenBrandLintel: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },

  WelcomeScreenLogoPortico: {
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },

  WelcomeScreenLogoSigil: {
    borderColor: colors.iconRing,
    borderWidth: StyleSheet.hairlineWidth,
    height: '100%',
    width: '100%',
  },

  WelcomeScreenBrandCopy: {
    gap: 2,
  },

  WelcomeScreenBrandFiligree: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.18,
  },

  WelcomeScreenStageFiligree: {
    color: colors.accentBright,
    fontFamily: fonts.sansRegular,
    fontSize: 10,
    letterSpacing: 2.2,
  },

  WelcomeScreenTitleFiligree: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.52,
    lineHeight: 31.2,
    marginTop: 26,
  },

  WelcomeScreenBodyFiligree: {
    color: colors.bodySoft,
    fontFamily: fonts.sansRegular,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
  },

  WelcomeScreenSegmentPortico: {
    backgroundColor: colors.segment,
    borderColor: colors.cardBorderMuted,
    borderRadius: radius.chip,
    borderWidth: 1,
    flexDirection: 'row',
    height: 42,
    marginTop: 28,
    padding: 3,
  },

  WelcomeScreenSegmentBtn: {
    alignItems: 'center',
    borderRadius: radius.pill,
    flex: 1,
    justifyContent: 'center',
  },
  WelcomeScreenSegmentActive: {
    backgroundColor: colors.accent,
    shadowColor: colors.accentShadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },

  WelcomeScreenSegmentFiligree: {
    color: colors.body,
    fontFamily: fonts.sansRegular,
    fontSize: 13.5,
  },

  WelcomeScreenSegmentActiveFiligree: {
    color: colors.buttonText,
  },

  WelcomeScreenFieldEnclave: {
    marginTop: 18,
  },
  WelcomeScreenFieldLintel: {
    color: colors.label,
    fontFamily: fonts.sansRegular,
    fontSize: 11.5,
    letterSpacing: 0.46,
    marginBottom: 8,
  },

  WelcomeScreenFieldPortico: {
    backgroundColor: colors.inputFill,
    borderColor: colors.cardBorderStrong,
    borderRadius: radius.input,
    borderWidth: 1,
    flexDirection: 'row',
    height: 54,
  },

  WelcomeScreenFieldFocused: {
    borderColor: colors.accentBorder,
    shadowColor: colors.accent,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  WelcomeScreenInput: {
    color: colors.ivory,
    flex: 1,
    fontFamily: fonts.sansRegular,
    fontSize: 15,
    height: '100%',
    paddingHorizontal: 16,
    paddingVertical: 0,
    textAlignVertical: 'center',
  },

  WelcomeScreenEyePortico: {
    alignSelf: 'center',
    marginRight: 16,
  },
  WelcomeScreenEyeSigil: {
    height: 19,
    width: 19,
  },

  WelcomeScreenSubmitPortico: {
    marginTop: 30,
    width: '100%',
  },

  WelcomeScreenGuestEnclave: {
    marginTop: 'auto',
    paddingTop: 28,
  },

  WelcomeScreenDividerLintel: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },

  WelcomeScreenHairline: {
    backgroundColor: colors.hairline,
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },

  WelcomeScreenOrFiligree: {
    color: colors.bodyDim,
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.88,
  },
  WelcomeScreenGuestPortico: {
    alignItems: 'center',
    backgroundColor: colors.cardMuted,
    borderColor: colors.cardBorderIdle,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    height: 54,
    justifyContent: 'center',
    marginTop: 16,
    paddingHorizontal: 18,
  },
  WelcomeScreenGuestFiligree: {
    color: colors.ivory,
    fontFamily: fonts.sansRegular,
    fontSize: 15,
  },

  WelcomeScreenChevronSigil: {
    height: 15,
    marginLeft: 8,
    width: 15,
  },
  WelcomeScreenHintFiligree: {
    color: colors.bodyHint,
    fontFamily: fonts.sansRegular,
    fontSize: 11,
    lineHeight: 16.5,
    marginTop: 16,
    textAlign: 'center',
  },
});
