import React, {useMemo} from 'react';
import {Alert, Linking, StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import type {CompositeNavigationProp} from '@react-navigation/native';
import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ScrollView} from 'react-native-gesture-handler';

import {PressableScale} from '../../components/buttons/PressableScale';
import {ScreenAmbient} from '../../components/layout/ScreenAmbient';
import {FadeIn} from '../../components/motion/FadeIn';
import {AccountAvatar} from '../../components/account/AccountAvatar';
import {colors, fonts} from '../../constants/theme';
import {
  APP_FULL_TITLE,
  PRIVACY_POLICY_URL,
  TERMS_OF_USE_URL,
} from '../../constants/brand';
import {
  buildActivityModel,
  collectActivityStamps,
  SAMPLE_ACTIVITY,
} from '../../data/activity';
import {useAdaptive} from '../../hooks/useAdaptive';
import {useAuth} from '../../routing/AuthContext';
import {useLibrary} from '../../routing/LibraryContext';
import {useAccount} from '../../routing/AccountContext';
import {tabBarOverlayHeight} from '../../routing/tabBarLayout';
import type {
  MainTabParamList,
  MainStackParamList,
  RootStackParamList,
} from '../../routing/types';

type ProfileNav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Profile'>,
  CompositeNavigationProp<
    NativeStackNavigationProp<MainStackParamList>,
    NativeStackNavigationProp<RootStackParamList>
  >
>;

export function AccountScreen() {
  const insets = useSafeAreaInsets();
  const adaptive = useAdaptive();
  const navigation = useNavigation<ProfileNav>();
  const {sessionEmail, deleteAccount} = useAuth();
  // Re-open the auth screen (sign in) from the root stack, keeping Main behind it.
  const openAuth = () => navigation.navigate('Auth', {reopened: true});
  const {profile} = useAccount();
  const {savedIds, savedAt, ratings} = useLibrary();
  const pad = adaptive.scale(20);
  const isGuest = !sessionEmail;
  const canDeleteAccount = Boolean(
    sessionEmail || profile.nameSetByUser || profile.photoUri,
  );

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This permanently removes your account, saved games and ratings from this device. This cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteAccount()
              .catch(() => {})
              .finally(openAuth);
          },
        },
      ],
    );
  };
  const activity = useMemo(() => {
    const live = buildActivityModel(
      collectActivityStamps(savedIds, savedAt, ratings),
    );
    if (!sessionEmail && live.empty) {
      return SAMPLE_ACTIVITY;
    }
    return live;
  }, [ratings, savedAt, savedIds, sessionEmail]);

  return (
    <ScreenAmbient opacity={0.28}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.AccountScreenScrollContent,
          {
            paddingBottom: tabBarOverlayHeight(insets.bottom) + 16,
            paddingHorizontal: pad,
            paddingTop: insets.top + 16,
          },
        ]}>
        <FadeIn>
          <Text style={styles.AccountScreenTitleFiligree}>Account</Text>
        </FadeIn>

        <FadeIn delay={60} style={styles.AccountScreenCardPortico}>
          <AccountAvatar
            name={profile.displayName}
            photoUri={profile.photoUri}
            size={64}
            showStatus
          />
          <View style={styles.AccountScreenCardCopy}>
            <Text numberOfLines={1} style={styles.AccountScreenNameFiligree}>
              {profile.displayName}
            </Text>
            <Text numberOfLines={1} style={styles.AccountScreenEmailFiligree}>
              {profile.email}
            </Text>
            <View style={styles.AccountScreenBadgePortico}>
              <Text style={styles.AccountScreenBadgeFiligree}>
                VERIFIED · 18+
              </Text>
            </View>
          </View>
        </FadeIn>

        <FadeIn delay={90}>
          <PressableScale
            onPress={() => navigation.navigate('EditProfile')}
            accessibilityRole="button"
            accessibilityLabel="Edit Account"
            contentStyle={styles.AccountScreenEditPortico}>
            <Text style={styles.AccountScreenEditFiligree}>Edit Account</Text>
          </PressableScale>
        </FadeIn>

        {isGuest ? (
          <FadeIn delay={100}>
            <PressableScale
              onPress={openAuth}
              accessibilityRole="button"
              accessibilityLabel="Sign In"
              contentStyle={styles.AccountScreenAuthPortico}>
              <Text style={styles.AccountScreenAuthFiligree}>Sign In</Text>
            </PressableScale>
          </FadeIn>
        ) : null}

        <FadeIn delay={120} style={styles.AccountScreenActivityPortico}>
          <View style={styles.AccountScreenActivityLintel}>
            <Text style={styles.AccountScreenSectionFiligree}>
              Activity · last 12 weeks
            </Text>
            <Text
              style={[
                styles.AccountScreenDeltaFiligree,
                !activity.deltaUp && styles.AccountScreenDeltaDownFiligree,
                activity.empty && styles.AccountScreenDeltaIdleFiligree,
              ]}>
              {activity.deltaLabel}
            </Text>
          </View>
          <View style={styles.AccountScreenBarsEnclave}>
            {activity.bars.map((height, index) => {
              const accent =
                !activity.empty && index >= activity.bars.length - 3;
              return (
                <View
                  key={`week-${index}`}
                  style={[styles.AccountScreenBarCell, {height}]}>
                  {accent ? (
                    <LinearGradient
                      colors={['#2e7bff', '#7fb2ff']}
                      start={{x: 0.5, y: 1}}
                      end={{x: 0.5, y: 0}}
                      style={styles.AccountScreenBarFill}
                    />
                  ) : (
                    <View style={styles.AccountScreenBarIdle} />
                  )}
                </View>
              );
            })}
          </View>
        </FadeIn>

        <FadeIn delay={160} style={styles.AccountScreenAboutPortico}>
          <Text style={styles.AccountScreenSectionFiligree}>About App</Text>
          <Text style={styles.AccountScreenAboutBodyFiligree}>
            {APP_FULL_TITLE} helps you explore game information, organize saved
            titles, and understand pack trends through simple visual
            analytics.
          </Text>
          <PressableScale
            onPress={() => Linking.openURL(PRIVACY_POLICY_URL).catch(() => {})}
            accessibilityRole="link"
            accessibilityLabel="Privacy Policy"
            contentStyle={styles.AccountScreenLegalPortico}>
            <Text style={styles.AccountScreenLegalFiligree}>
              Privacy Policy
            </Text>
          </PressableScale>
          <PressableScale
            onPress={() => Linking.openURL(TERMS_OF_USE_URL).catch(() => {})}
            accessibilityRole="link"
            accessibilityLabel="Terms of Use"
            contentStyle={styles.AccountScreenLegalPortico}>
            <Text style={styles.AccountScreenLegalFiligree}>Terms of Use</Text>
          </PressableScale>
        </FadeIn>

        {canDeleteAccount ? (
          <FadeIn delay={190}>
            <PressableScale
              onPress={handleDeleteAccount}
              accessibilityRole="button"
              accessibilityLabel="Delete Account"
              contentStyle={styles.AccountScreenDeletePortico}>
              <Text style={styles.AccountScreenDeleteFiligree}>
                Delete Account
              </Text>
            </PressableScale>
          </FadeIn>
        ) : null}
      </ScrollView>
    </ScreenAmbient>
  );
}

const styles = StyleSheet.create({
  AccountScreenScrollContent: {
    flexGrow: 1,
  },

  AccountScreenTitleFiligree: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.9,
  },

  AccountScreenCardPortico: {
    alignItems: 'center',
    backgroundColor: colors.cardStrong,
    borderColor: colors.cardBorderStrong,
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 15,
    marginTop: 16,
    minHeight: 106.5,
    paddingHorizontal: 18,
    paddingVertical: 20,
  },
  AccountScreenCardCopy: {
    flex: 1,
  },

  AccountScreenNameFiligree: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.18,
  },

  AccountScreenEmailFiligree: {
    color: colors.bodySoft,
    fontFamily: fonts.sansRegular,
    fontSize: 12.5,
    marginTop: 4,
  },

  AccountScreenBadgePortico: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(74, 155, 255, 0.16)',
    borderColor: 'rgba(74, 155, 255, 0.28)',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  AccountScreenBadgeFiligree: {
    color: colors.interest,
    fontFamily: fonts.sansRegular,
    fontSize: 10,
    letterSpacing: 0.8,
  },

  AccountScreenEditPortico: {
    backgroundColor: 'rgba(74, 155, 255, 0.16)',
    borderColor: 'rgba(74, 155, 255, 0.3)',
    borderRadius: 14,
    borderWidth: 1,
    height: 46,
    justifyContent: 'center',
    marginTop: 12,
    width: '100%',
  },
  AccountScreenEditFiligree: {
    color: colors.interest,
    fontFamily: fonts.sansRegular,
    fontSize: 14,
  },
  AccountScreenAuthPortico: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    height: 46,
    justifyContent: 'center',
    marginTop: 10,
    width: '100%',
  },
  AccountScreenAuthFiligree: {
    color: colors.buttonText,
    fontFamily: fonts.sansMedium,
    fontSize: 14.5,
    fontWeight: '500',
  },

  AccountScreenActivityPortico: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  AccountScreenActivityLintel: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  AccountScreenSectionFiligree: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 14.5,
    fontWeight: '700',
  },
  AccountScreenDeltaFiligree: {
    color: colors.gain,
    fontFamily: fonts.sansRegular,
    fontSize: 11.5,
  },

  AccountScreenDeltaDownFiligree: {
    color: '#ff8b8b',
  },

  AccountScreenDeltaIdleFiligree: {
    color: colors.bodyFaint,
  },
  AccountScreenBarsEnclave: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 5,
    height: 64,
    marginTop: 14,
  },

  AccountScreenBarCell: {
    borderRadius: 999,
    flex: 1,
    overflow: 'hidden',
  },

  AccountScreenBarFill: {
    flex: 1,
  },

  AccountScreenBarIdle: {
    backgroundColor: 'rgba(255, 255, 255, 0.13)',
    flex: 1,
  },

  AccountScreenAboutPortico: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },

  AccountScreenAboutBodyFiligree: {
    color: '#9fb0c8',
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    lineHeight: 16.8,
    marginBottom: 16,
    marginTop: 8,
  },
  AccountScreenLegalPortico: {
    backgroundColor: colors.cardStrong,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 14,
    borderWidth: 1,
    height: 46,
    justifyContent: 'center',
    marginTop: 10,
    width: '100%',
  },

  AccountScreenLegalFiligree: {
    color: colors.ivory,
    fontFamily: fonts.sansRegular,
    fontSize: 14,
  },

  AccountScreenDeletePortico: {
    backgroundColor: 'rgba(255, 90, 90, 0.1)',
    borderColor: 'rgba(255, 90, 90, 0.28)',
    borderRadius: 14,
    borderWidth: 1,
    height: 46,
    justifyContent: 'center',
    marginTop: 16,
    width: '100%',
  },
  AccountScreenDeleteFiligree: {
    color: '#ff8b8b',
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
