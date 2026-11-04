import React, {useState} from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {PrimaryButton} from '../../components/buttons/PrimaryButton';
import {ScreenAmbient} from '../../components/layout/ScreenAmbient';
import {PaginationDots} from '../../components/nav/PaginationDots';

import {colors, fonts} from '../../constants/theme';
import {ONBOARDING_STEPS} from '../../data/onboarding';
import {useAdaptive} from '../../hooks/useAdaptive';

type OnboardingScreenProps = {
  onComplete: () => void;
};

export function OnboardingScreen({onComplete}: OnboardingScreenProps) {
  const insets = useSafeAreaInsets();
  const adaptive = useAdaptive();
  const [stepIndex, setStepIndex] = useState(0);
  const step = ONBOARDING_STEPS[stepIndex];

  const isLastStep = stepIndex === ONBOARDING_STEPS.length - 1;
  const heroWidth = adaptive.scale(345);
  const heroHeight = adaptive.verticalScale(368);
  const backdropOpacity = stepIndex === 0 ? 0.55 : 0.5;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
      return;
    }
    setStepIndex(current => current + 1);
  };

  return (
    <ScreenAmbient opacity={backdropOpacity}>
      <View style={styles.OnboardingScreenFacetChassis}>
        <Pressable
          onPress={onComplete}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Skip onboarding"
          style={[
            styles.OnboardingScreenTopSkip,
            {
              top: insets.top + adaptive.verticalScale(8),
              right: adaptive.horizontalPadding,
            },
          ]}>
          <Text style={styles.OnboardingScreenTopSkipFiligree}>Skip</Text>
        </Pressable>

        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces
          keyboardShouldPersistTaps="always"
          contentContainerStyle={styles.OnboardingScreenScrollContent}>
          <View
            style={[
              styles.OnboardingScreenHeroEnclave,
              {
                width: heroWidth,
                height: heroHeight,
                marginTop: insets.top + adaptive.verticalScale(40),
              },
            ]}>
            <Image
              source={step.hero}
              style={styles.OnboardingScreenHeroSigil}
              resizeMode="contain"
            />
          </View>

          <View
            style={[
              styles.OnboardingScreenFooter,
              {paddingBottom: Math.max(insets.bottom, 24)},
            ]}>
            <PaginationDots
              total={ONBOARDING_STEPS.length}
              activeIndex={stepIndex}
            />
            <Text style={styles.OnboardingScreenTitleFiligree}>
              {step.title}
            </Text>
            <Text style={styles.OnboardingScreenBodyFiligree}>
              {step.description}
            </Text>
            <PrimaryButton
              label={step.buttonLabel}
              onPress={handleNext}
              style={styles.OnboardingScreenAction}
            />
          </View>
        </ScrollView>
      </View>
    </ScreenAmbient>
  );
}

const styles = StyleSheet.create({
  OnboardingScreenFacetChassis: {
    flex: 1,
  },
  OnboardingScreenScrollContent: {
    flexGrow: 1,
  },
  OnboardingScreenTopSkip: {
    position: 'absolute',
    zIndex: 2,
  },

  OnboardingScreenTopSkipFiligree: {
    color: colors.skip,
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    fontWeight: '500',
  },

  OnboardingScreenHeroEnclave: {
    alignSelf: 'center',
  },
  OnboardingScreenHeroSigil: {
    height: '100%',
    width: '100%',
  },

  OnboardingScreenFooter: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingHorizontal: 30,
  },
  OnboardingScreenTitleFiligree: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.56,
    lineHeight: 33.6,
    marginTop: 26,
    textAlign: 'center',
  },

  OnboardingScreenBodyFiligree: {
    color: colors.bodyMuted,
    fontFamily: fonts.sansRegular,
    fontSize: 15,
    lineHeight: 22.5,
    marginTop: 12,
    textAlign: 'center',
  },

  OnboardingScreenAction: {
    marginTop: 28,
    width: '100%',
  },
});
