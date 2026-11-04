import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {colors} from '../constants/theme';
import {PackProvider} from './PackContext';
import {LibraryProvider} from './LibraryContext';
import {AccountProvider} from './AccountContext';
import {MainTabs} from './MainTabs';
import {EditAccountScreen} from '../screens/stack/EditAccountScreen';
import {GameDetailScreen} from '../screens/stack/GameDetailScreen';
import {SearchScreen} from '../screens/stack/SearchScreen';
import type {MainStackParamList} from './types';

const Stack = createNativeStackNavigator<MainStackParamList>();

export function MainNavigator() {
  return (
    <PackProvider>
      <LibraryProvider>
        <AccountProvider>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              contentStyle: {backgroundColor: colors.background},
              animation: 'fade_from_bottom',
            }}>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="Search" component={SearchScreen} />
            <Stack.Screen name="GameDetail" component={GameDetailScreen} />
            <Stack.Screen name="EditProfile" component={EditAccountScreen} />
          </Stack.Navigator>
        </AccountProvider>
      </LibraryProvider>
    </PackProvider>
  );
}
