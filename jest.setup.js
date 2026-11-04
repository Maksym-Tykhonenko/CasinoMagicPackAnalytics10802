/* eslint-env jest */
jest.mock('react-native-gesture-handler', () => {
  const {ScrollView, TextInput, View} = require('react-native');
  return {
    GestureHandlerRootView: View,
    GestureDetector: View,
    PanGestureHandler: View,
    TapGestureHandler: View,
    ScrollView,
    TextInput,
    State: {},
    Directions: {},
    gestureHandlerRootHOC: component => component,
  };
});

jest.mock('react-native-screens', () => {
  const {View} = require('react-native');
  return {
    enableScreens: jest.fn(),
    enableFreeze: jest.fn(),
    screensEnabled: () => true,
    isSearchBarAvailableForCurrentPlatform: false,
    compatibilityFlags: {},
    Screen: View,
    ScreenContainer: View,
    NativeScreen: View,
    NativeScreenContainer: View,
    FullWindowOverlay: View,
    ScreenStack: View,
    ScreenStackItem: View,
    ScreenFooter: View,
    ScreenStackHeaderConfig: View,
    ScreenStackHeaderBackButtonImage: View,
    ScreenStackHeaderCenterView: View,
    ScreenStackHeaderLeftView: View,
    ScreenStackHeaderRightView: View,
    ScreenStackHeaderSearchBarView: View,
    SearchBar: View,
  };
});

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const inset = {top: 0, right: 0, bottom: 0, left: 0};
  const frame = {x: 0, y: 0, width: 390, height: 844};
  const SafeAreaInsetsContext = React.createContext(inset);
  const SafeAreaFrameContext = React.createContext(frame);

  return {
    SafeAreaProvider: ({children}) => children,
    SafeAreaConsumer: SafeAreaInsetsContext.Consumer,
    SafeAreaView: ({children}) => children,
    SafeAreaInsetsContext,
    SafeAreaFrameContext,
    useSafeAreaInsets: () => inset,
    useSafeAreaFrame: () => frame,
    initialWindowMetrics: {insets: inset, frame},
  };
});

jest.mock('react-native-svg', () => {
  const {View} = require('react-native');
  return {
    __esModule: true,
    default: View,
    Svg: View,
    Circle: View,
    Ellipse: View,
    G: View,
    Text: View,
    TSpan: View,
    TextPath: View,
    Path: View,
    Polygon: View,
    Polyline: View,
    Line: View,
    Rect: View,
    Use: View,
    Image: View,
    Symbol: View,
    Defs: View,
    LinearGradient: View,
    RadialGradient: View,
    Stop: View,
    ClipPath: View,
    Pattern: View,
    Mask: View,
  };
});

jest.mock('react-native-linear-gradient', () => {
  const {View} = require('react-native');
  return View;
});

jest.mock('react-native-gifted-charts', () => {
  const {View} = require('react-native');
  return {
    BarChart: View,
    LineChart: View,
    PieChart: View,
  };
});

jest.mock('@react-native-async-storage/async-storage', () => {
  let store = {};
  return {
    setItem: jest.fn((key, value) => {
      store[key] = value;
      return Promise.resolve();
    }),
    getItem: jest.fn(key => Promise.resolve(store[key] ?? null)),
    removeItem: jest.fn(key => {
      delete store[key];
      return Promise.resolve();
    }),
    clear: jest.fn(() => {
      store = {};
      return Promise.resolve();
    }),
  };
});

jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(() => Promise.resolve({didCancel: true})),
}));

jest.mock('react-native-onesignal', () => ({
  LogLevel: {None: 0, Fatal: 1, Error: 2, Warn: 3, Info: 4, Debug: 5, Verbose: 6},
  OneSignal: {
    initialize: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    Debug: {setLogLevel: jest.fn()},
    Notifications: {
      requestPermission: jest.fn(() => Promise.resolve(true)),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
    User: {
      addTag: jest.fn(),
      getOnesignalId: jest.fn(() => Promise.resolve(null)),
    },
  },
}));

global.fetch = jest.fn(() =>
  Promise.reject(new Error('network disabled in tests')),
);
