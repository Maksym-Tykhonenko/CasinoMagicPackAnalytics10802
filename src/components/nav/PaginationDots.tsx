import React from 'react';
import {StyleSheet, View} from 'react-native';

import {colors} from '../../constants/theme';

type PaginationDotsProps = {
  total: number;
  activeIndex: number;
};

export function PaginationDots({total, activeIndex}: PaginationDotsProps) {
  return (
    <View style={styles.PaginationDotsFacetChassis}>
      {Array.from({length: total}).map((_, index) => {
        const isActive = index === activeIndex;

        return (
          <View
            key={index}
            style={[
              styles.PaginationDotsDot,
              isActive && styles.PaginationDotsDotActive,
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  PaginationDotsFacetChassis: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 0,
    gap: 6,
  },

  PaginationDotsDot: {
    backgroundColor: colors.dotInactive,
    borderRadius: 3,
    height: 6,
    width: 6,
  },

  PaginationDotsDotActive: {
    backgroundColor: colors.accent,
    borderRadius: 3,
    width: 22,
  },
});
