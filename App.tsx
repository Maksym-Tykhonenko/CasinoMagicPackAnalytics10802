import React, { useEffect, useState } from 'react';
import {StyleSheet, View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {enableScreens} from 'react-native-screens';

import {colors} from './src/constants/theme';
import {AppRouter} from './src/routing/AppRouter';

enableScreens();
//
import {LogLevel, OneSignal} from 'react-native-onesignal';
import { ONESIGNAL_APP_ID } from './src/config/projectConfig';

function App(): React.JSX.Element {
  const [oneSignKkkk] = useState(ONESIGNAL_APP_ID);

  useEffect(() => {
    const initOnsignall = async () => {
      try {
        // Verbose-логи лишаємо тільки в дебазі
        if (__DEV__) {
          OneSignal.Debug.setLogLevel(LogLevel.Verbose);
        }

        // OneSignal ініціалізація
        if (ONESIGNAL_APP_ID) {
          OneSignal.initialize(oneSignKkkk);
        }
      } catch (e) {
        //console.log('OneSignal init error:', e);
      }
    };

    initOnsignall();
  }, []);

  return (
    <GestureHandlerRootView style={styles.AppFacetChassis}>
      <SafeAreaProvider style={styles.AppFacetChassis}>
        <View style={styles.AppFacetChassis}>
          <AppRouter />
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  AppFacetChassis: {
    backgroundColor: colors.background,
    flex: 1,
  },
});

export default App;
