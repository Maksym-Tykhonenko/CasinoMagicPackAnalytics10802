import React, {useEffect} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import LottieView from 'lottie-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {APP_LOADER_STATUS} from '../../constants/brand';
import {colors, fonts} from '../../constants/theme';
import {icons} from '../../data/assets';
import {useAdaptive} from '../../hooks/useAdaptive';

const LOADER_DURATION_MS = 3000;
const SPARKLES_LOADER = require('../../assets/pack-magg-sparkles-loader.json');

type LoaderScreenProps = {
  onComplete: () => void;
};

export function LoaderScreen({onComplete}: LoaderScreenProps) {
  const insets = useSafeAreaInsets();
  const adaptive = useAdaptive();
  const logoWidth = adaptive.scale(308);
  const logoHeight = adaptive.scale(186);
  const lottieSize = adaptive.scale(96);

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, LOADER_DURATION_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <View style={styles.LoaderScreenFacetChassis}>
      <Image
        source={icons.loaderBg}
        style={[
          styles.LoaderScreenBackground,
          {width: adaptive.width, height: adaptive.height},
        ]}
        resizeMode="cover"
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces
        contentContainerStyle={styles.LoaderScreenScrollContent}>
        <View style={styles.LoaderScreenHeroEnclave}>
          <Image
            source={icons.loaderLogo}
            style={[
              styles.LoaderScreenLogoSigil,
              {width: logoWidth, height: logoHeight},
            ]}
            resizeMode="contain"
          />
        </View>
        <View
          style={[
            styles.LoaderScreenFooter,
            {
              paddingBottom:
                Math.max(insets.bottom, 24) + adaptive.verticalScale(20),
            },
          ]}>
          <LottieView
            source={SPARKLES_LOADER}
            autoPlay
            loop
            style={{width: lottieSize, height: lottieSize}}
          />
          <Text style={styles.LoaderScreenStatusFiligree}>
            {APP_LOADER_STATUS}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  LoaderScreenFacetChassis: {
    backgroundColor: colors.black,
    flex: 1,
  },

  LoaderScreenBackground: {
    left: 0,
    position: 'absolute',
    top: 0,
  },
  LoaderScreenScrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },

  LoaderScreenHeroEnclave: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },

  LoaderScreenLogoSigil: {},

  LoaderScreenFooter: {
    alignItems: 'center',
  },

  LoaderScreenStatusFiligree: {
    color: colors.bodyFaint,
    fontFamily: fonts.sansMedium,
    fontSize: 11.5,
    letterSpacing: 0.46,
    marginTop: 12,
  },
});
