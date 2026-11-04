import React from 'react';
import {StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

type CoverFadeProps = {
  height?: number;
};

/** Soft bottom veil — dark enough for white copy, under UI (zIndex 1). */
export function CoverFade({height = 72}: CoverFadeProps) {
  return (
    <LinearGradient
      pointerEvents="none"
      colors={[
        'rgba(4, 7, 15, 0)',
        'rgba(4, 7, 15, 0.45)',
        'rgba(4, 7, 15, 0.82)',
        'rgba(4, 7, 15, 0.94)',
      ]}
      locations={[0, 0.35, 0.72, 1]}
      style={[styles.CoverFadeChassis, {height}]}
    />
  );
}

const styles = StyleSheet.create({
  CoverFadeChassis: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 1,
  },
});
