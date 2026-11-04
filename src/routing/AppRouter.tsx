import React from 'react';
import {StyleSheet, View} from 'react-native';

import {colors} from '../constants/theme';
import {RootNavigator} from './RootNavigator';
import {AuthProvider} from './AuthContext';

export function AppRouter() {
  return (
    <View style={styles.AppRouterFacetChassis}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  AppRouterFacetChassis: {
    backgroundColor: colors.background,
    flex: 1,
  },
});
