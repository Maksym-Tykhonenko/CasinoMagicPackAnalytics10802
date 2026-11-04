import React from 'react';
import {Image, StyleSheet, View} from 'react-native';

import {icons} from '../../data/assets';
import {colors} from '../../constants/theme';
import {useAdaptive} from '../../hooks/useAdaptive';

type ScreenAmbientProps = {
  children: React.ReactNode;
  opacity?: number;
};

export function ScreenAmbient({children, opacity = 0.5}: ScreenAmbientProps) {
  const adaptive = useAdaptive();

  return (
    <View style={styles.ScreenAmbientFacetChassis}>
      <Image
        source={icons.appBg}
        pointerEvents="none"
        style={[
          styles.ScreenAmbientSigil,
          {
            opacity,
            width: adaptive.width,
            height: adaptive.height,
          },
        ]}
        resizeMode="cover"
      />
      <View style={styles.ScreenAmbientContent} pointerEvents="box-none">
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ScreenAmbientFacetChassis: {
    backgroundColor: colors.background,
    flex: 1,
  },

  ScreenAmbientSigil: {
    left: 0,
    position: 'absolute',
    top: 0,
  },
  ScreenAmbientContent: {
    flex: 1,
    zIndex: 1,
  },
});
