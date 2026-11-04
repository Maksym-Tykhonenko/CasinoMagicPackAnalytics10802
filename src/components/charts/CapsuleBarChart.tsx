import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import {colors, fonts} from '../../constants/theme';

export type CapsuleBarItem = {
  value: number;
  label: string;
  highlighted?: boolean;
  topLabel?: string;
};

export function CapsuleBarChart({
  data,
  height = 118,
  maxValue,
}: {
  data: CapsuleBarItem[];
  height?: number;
  maxValue: number;
}) {
  const peak = Math.max(maxValue, ...data.map(item => item.value), 0.001);
  const showTops = data.some(item => item.topLabel);

  return (
    <View style={styles.CapsuleBarChartLintel}>
      {data.map((item, index) => {
        const hasValue = item.value > 0;
        const barHeight = hasValue
          ? Math.max(18, (item.value / peak) * height)
          : 18;
        const highlighted = Boolean(item.highlighted && hasValue);
        return (
          <View key={`${item.label}-${index}`} style={styles.CapsuleBarChartCol}>
            {showTops ? (
              <Text style={styles.CapsuleBarChartTopFiligree}>
                {item.topLabel ?? ' '}
              </Text>
            ) : null}
            <View style={[styles.CapsuleBarChartTrack, {height}]}>
              <View style={[styles.CapsuleBarChartBar, {height: barHeight}]}>
                {highlighted ? (
                  <LinearGradient
                    colors={['#7fb2ff', '#2e7bff']}
                    start={{x: 0.5, y: 0}}
                    end={{x: 0.5, y: 1}}
                    style={StyleSheet.absoluteFill}
                  />
                ) : (
                  <View style={styles.CapsuleBarChartIdle} />
                )}
              </View>
            </View>
            <Text numberOfLines={1} style={styles.CapsuleBarChartAxisFiligree}>
              {item.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  CapsuleBarChartLintel: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },

  CapsuleBarChartCol: {
    alignItems: 'center',
    flex: 1,
  },

  CapsuleBarChartTopFiligree: {
    color: colors.interest,
    fontFamily: fonts.sansRegular,
    fontSize: 10,
    marginBottom: 6,
    textAlign: 'center',
  },
  CapsuleBarChartTrack: {
    justifyContent: 'flex-end',
    width: '100%',
  },
  CapsuleBarChartBar: {
    alignSelf: 'center',
    borderRadius: 8,
    overflow: 'hidden',
    width: 28,
  },
  CapsuleBarChartIdle: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },

  CapsuleBarChartAxisFiligree: {
    color: 'rgba(234, 240, 250, 0.4)',
    fontFamily: fonts.sansMedium,
    fontSize: 9,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
});
