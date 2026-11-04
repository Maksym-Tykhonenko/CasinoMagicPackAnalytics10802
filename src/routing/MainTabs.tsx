import React from 'react';
import {useWindowDimensions} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import {tabBarRailInset} from './tabBarLayout';

import {AnalyticsScreen} from '../screens/tabs/AnalyticsScreen';
import {ExploreScreen} from '../screens/tabs/ExploreScreen';
import {HomeScreen} from '../screens/tabs/HomeScreen';
import {AccountScreen} from '../screens/tabs/AccountScreen';
import {RatingsScreen} from '../screens/tabs/RatingsScreen';
import {SavedScreen} from '../screens/tabs/SavedScreen';
import {PackTabBar} from './PackTabBar';
import type {MainTabParamList} from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  const {width, height} = useWindowDimensions();
  const insets = useSafeAreaInsets();
  // iPhone Duo's outer/landscape display is wider than it is tall. The bar stays
  // a bottom overlay in react-navigation's layout (so toggling tabBarPosition
  // never leaves a stale scene width); PackTabBar instead draws itself as a side
  // rail and we inset the scene content to clear it.
  const vertical = width > height;
  const railInset = tabBarRailInset(insets.left);
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={props => <PackTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: 'transparent',
          paddingLeft: vertical ? railInset : 0,
        },
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
        },
      }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Saved" component={SavedScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="Ratings" component={RatingsScreen} />
      <Tab.Screen name="Profile" component={AccountScreen} />
    </Tab.Navigator>
  );
}
