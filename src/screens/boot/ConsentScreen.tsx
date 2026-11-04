import React, {useState} from 'react';
import {Image, Linking, Pressable, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {PrimaryButton} from '../../components/buttons/PrimaryButton';

import {ScreenAmbient} from '../../components/layout/ScreenAmbient';
import {colors, fonts, layout, radius} from '../../constants/theme';

import {PRIVACY_POLICY_URL, TERMS_OF_USE_URL} from '../../constants/brand';
import {icons} from '../../data/assets';
import {useAdaptive} from '../../hooks/useAdaptive';

type ConsentScreenProps = {
  onComplete: () => void;
};

export function ConsentScreen({onComplete}: ConsentScreenProps) {
  const insets = useSafeAreaInsets();
  const adaptive = useAdaptive();
  const [isAdult, setIsAdult] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const canContinue = isAdult && agreed;
  const iconSize = adaptive.scale(layout.iconSize);

  return (
    <ScreenAmbient opacity={0.4}>
      <View
        style={[
          styles.ConsentScreenContent,
          {
            paddingHorizontal: adaptive.horizontalPadding,
            paddingTop: insets.top + adaptive.verticalScale(45),
            paddingBottom: Math.max(insets.bottom, 24),
          },
        ]}>
        <View style={styles.ConsentScreenHeroEnclave}>
          <View
            style={[
              styles.ConsentScreenLogoPortico,
              {
                borderRadius: adaptive.scale(radius.icon),
                height: iconSize,
                width: iconSize,
              },
            ]}>
            <Image
              source={icons.crest}
              style={[
                styles.ConsentScreenLogoSigil,
                {borderRadius: adaptive.scale(radius.icon)},
              ]}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.ConsentScreenTitleFiligree}>Before You Begin</Text>
          <Text style={styles.ConsentScreenBodyFiligree}>
            This app is an entertainment-only collection of game information
            and analytics. No wagering, deposits, withdrawals, or cash prizes
            are involved. Please confirm the following before continuing.
          </Text>
        </View>

        <View style={styles.ConsentScreenChecksEnclave}>
          <Pressable
            onPress={() => setIsAdult(current => !current)}
            style={styles.ConsentScreenCheckPortico}
            accessibilityRole="checkbox"
            accessibilityLabel="I am 18 years old or older"
            accessibilityState={{checked: isAdult}}>
            <CheckMark checked={isAdult} />
            <Text
              accessibilityElementsHidden
              importantForAccessibility="no"
              style={styles.ConsentScreenCheckFiligree}>
              I am 18 years old or older
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setAgreed(current => !current)}
            style={[
              styles.ConsentScreenCheckPortico,
              styles.ConsentScreenCheckPorticoTall,
            ]}
            accessibilityRole="checkbox"
            accessibilityLabel="I have read and agree to the Terms of Use and Privacy Policy"
            accessibilityState={{checked: agreed}}>
            <CheckMark checked={agreed} />
            <Text
              accessibilityElementsHidden
              importantForAccessibility="no"
              style={styles.ConsentScreenCheckFiligree}>
              I have read and agree to the{' '}
              <Text
                style={styles.ConsentScreenLinkFiligree}
                accessibilityRole="link"
                accessibilityLabel="Terms of Use"
                onPress={() =>
                  Linking.openURL(TERMS_OF_USE_URL).catch(() => {})
                }>
                Terms of Use
              </Text>
              {' and '}
              <Text
                style={styles.ConsentScreenLinkFiligree}
                accessibilityRole="link"
                accessibilityLabel="Privacy Policy"
                onPress={() =>
                  Linking.openURL(PRIVACY_POLICY_URL).catch(() => {})
                }>
                Privacy Policy
              </Text>
            </Text>
          </Pressable>
        </View>

        <View style={styles.ConsentScreenFooter}>
          <PrimaryButton
            label="Continue"
            onPress={onComplete}
            disabled={!canContinue}
          />
          {!canContinue ? (
            <Text style={styles.ConsentScreenHintFiligree}>
              Confirm both statements to continue
            </Text>
          ) : (
            <View style={styles.ConsentScreenHintSpacer} />
          )}
        </View>
      </View>
    </ScreenAmbient>
  );
}

function CheckMark({checked}: {checked: boolean}) {
  return (
    <View
      style={[
        styles.ConsentScreenBoxPortico,
        checked && styles.ConsentScreenBoxChecked,
      ]}>
      {checked ? (
        <Image
          source={icons.affirm}
          style={styles.ConsentScreenCheckSigil}
          resizeMode="contain"
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  ConsentScreenContent: {
    flex: 1,
  },

  ConsentScreenHeroEnclave: {},

  ConsentScreenLogoPortico: {
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.55,
    shadowRadius: 12,
    elevation: 8,
  },
  ConsentScreenLogoSigil: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.iconRing,
    height: '100%',
    width: '100%',
  },

  ConsentScreenTitleFiligree: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.6,
    lineHeight: 34.5,
    marginTop: 26,
  },
  ConsentScreenBodyFiligree: {
    color: colors.body,
    fontFamily: fonts.sansRegular,
    fontSize: 15,
    lineHeight: 22.5,
    marginTop: 12,
  },

  ConsentScreenChecksEnclave: {
    gap: 12,
    marginTop: 48,
  },

  ConsentScreenCheckPortico: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderRadius: radius.card,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    minHeight: 65,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },

  ConsentScreenCheckPorticoTall: {
    alignItems: 'flex-start',
    minHeight: 80,
    paddingVertical: 18,
  },

  ConsentScreenBoxPortico: {
    alignItems: 'center',
    borderColor: colors.checkboxIdle,
    borderRadius: radius.checkbox,
    borderWidth: 1.5,
    height: 27,
    justifyContent: 'center',
    width: 27,
  },

  ConsentScreenBoxChecked: {
    backgroundColor: colors.checkFill,
    borderColor: colors.checkBorder,
  },

  ConsentScreenCheckSigil: {
    height: 16,
    width: 16,
  },
  ConsentScreenCheckFiligree: {
    color: colors.ivory,
    flex: 1,
    fontFamily: fonts.sansMedium,
    fontSize: 14.5,
    fontWeight: '500',
    lineHeight: 21,
  },
  ConsentScreenLinkFiligree: {
    color: colors.accentSoft,
    fontFamily: fonts.sansMedium,
    fontWeight: '500',
  },
  ConsentScreenFooter: {
    marginTop: 'auto',
  },
  ConsentScreenHintFiligree: {
    color: colors.bodyDim,
    fontFamily: fonts.sansRegular,
    fontSize: 11.5,
    marginTop: 14,
    textAlign: 'center',
  },

  ConsentScreenHintSpacer: {
    height: 27.5,
  },
});
