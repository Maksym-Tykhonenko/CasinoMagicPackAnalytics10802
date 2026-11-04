import React from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {initialWindowMetrics} from 'react-native-safe-area-context';

import {PressableScale} from '../components/buttons/PressableScale';

import {colors, fonts, radius} from '../constants/theme';
import {tabMarks} from '../data/assets';
import {
  TAB_BAR_HEIGHT,
  TAB_BAR_SIDE_INSET,
  TAB_BAR_TOP_GAP,
  tabBarBottomPadding,
  tabBarRailInset,
} from './tabBarLayout';
import type {GuestTab} from './types';

const TAB_ORDER: GuestTab[] = [
  'Home',
  'Explore',
  'Saved',
  'Analytics',
  'Ratings',
  'Profile',
];

const TAB_LABELS: Record<GuestTab, string> = {
  Home: 'Home',
  Explore: 'Explore',
  Saved: 'Saved',
  Analytics: 'Analytics',
  Ratings: 'My Ratings',
  Profile: 'Account',
};

export function PackTabBar({state, navigation, insets}: BottomTabBarProps) {
  // Rendered via a render-prop that returns JSX, so this is a real component and
  // hooks are allowed here.
  const {width, height} = useWindowDimensions();
  // On a wide-and-short display (iPhone Duo's outer display, or landscape) the
  // floating bottom bar becomes a vertical rail on the leading edge.
  const vertical = width > height;

  // Prefer navigator insets; fall back to window metrics.
  const bottomInset =
    insets.bottom > 0
      ? insets.bottom
      : (initialWindowMetrics?.insets.bottom ?? 0);
  const leftInset =
    insets.left > 0 ? insets.left : (initialWindowMetrics?.insets.left ?? 0);
  const bottomPadding = tabBarBottomPadding(bottomInset);

  const items = TAB_ORDER.map(name => {
    const route = state.routes.find(item => item.name === name);
    if (!route) {
      return null;
    }
    const index = state.routes.findIndex(item => item.key === route.key);
    const focused = state.index === index;

    return (
      <PressableScale
        key={route.key}
        onPress={() => navigation.navigate(name)}
        accessibilityRole="tab"
        accessibilityLabel={TAB_LABELS[name]}
        accessibilityState={{selected: focused}}
        style={vertical ? styles.PackTabBarRailItem : styles.PackTabBarItemFlex}
        contentStyle={styles.PackTabBarItemPortico}>
        <Image
          source={tabMarks[name]}
          accessibilityElementsHidden
          importantForAccessibility="no"
          style={[
            styles.PackTabBarIconSigil,
            focused ? styles.PackTabBarIconActive : styles.PackTabBarIconIdle,
          ]}
          resizeMode="contain"
        />
        <Text
          numberOfLines={1}
          accessibilityElementsHidden
          importantForAccessibility="no"
          style={[
            styles.PackTabBarLabelFiligree,
            focused && styles.PackTabBarLabelActive,
          ]}>
          {TAB_LABELS[name]}
        </Text>
      </PressableScale>
    );
  });

  if (vertical) {
    return (
      <View
        pointerEvents="box-none"
        style={[
          styles.PackTabBarRailShell,
          {width: tabBarRailInset(leftInset), paddingLeft: Math.max(leftInset, 8)},
        ]}>
        <View style={styles.PackTabBarRailChassis}>{items}</View>
      </View>
    );
  }

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.PackTabBarFloatShell,
        {paddingBottom: bottomPadding, paddingTop: TAB_BAR_TOP_GAP},
      ]}>
      <View style={styles.PackTabBarFacetChassis}>{items}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  PackTabBarFloatShell: {
    backgroundColor: 'transparent',
    bottom: 0,
    left: 0,
    paddingHorizontal: TAB_BAR_SIDE_INSET,
    position: 'absolute',
    right: 0,
  },
  PackTabBarFacetChassis: {
    alignItems: 'center',
    backgroundColor: 'rgba(8, 12, 22, 0.92)',
    borderColor: colors.cardBorder,
    borderRadius: radius.card,
    borderWidth: 1,
    flexDirection: 'row',
    height: TAB_BAR_HEIGHT,
    justifyContent: 'space-between',
    overflow: 'hidden',
    paddingHorizontal: 6,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: {width: 0, height: 10},
        shadowOpacity: 0.32,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  PackTabBarRailShell: {
    backgroundColor: 'rgba(8, 12, 22, 0.92)',
    borderRightColor: colors.cardBorder,
    borderRightWidth: 1,
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    top: 0,
  },
  PackTabBarRailChassis: {
    flexDirection: 'column',
    gap: 6,
    justifyContent: 'center',
  },
  PackTabBarItemFlex: {
    flex: 1,
  },
  PackTabBarRailItem: {
    alignSelf: 'stretch',
  },
  PackTabBarItemPortico: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
    justifyContent: 'center',
    minHeight: TAB_BAR_HEIGHT,
  },
  PackTabBarIconSigil: {
    height: 22,
    width: 22,
  },
  PackTabBarIconActive: {
    tintColor: colors.accent,
  },
  PackTabBarIconIdle: {
    tintColor: colors.tabInactive,
  },
  PackTabBarLabelFiligree: {
    color: colors.tabInactive,
    fontFamily: fonts.sansMedium,
    fontSize: 9.5,
    fontWeight: '500',
    textAlign: 'center',
  },
  PackTabBarLabelActive: {
    color: colors.accent,
  },
});
