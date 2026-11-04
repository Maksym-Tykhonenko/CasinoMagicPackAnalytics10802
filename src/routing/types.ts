import type {NavigatorScreenParams} from '@react-navigation/native';

export type AppPhase = 'Loader' | 'Gate' | 'Onboarding' | 'Auth' | 'Main';

export type GuestTab =
  | 'Home'
  | 'Explore'
  | 'Saved'
  | 'Analytics'
  | 'Ratings'
  | 'Profile';

export type MainTabParamList = {
  Home: undefined;
  Explore: undefined;
  Saved: undefined;
  Analytics: undefined;
  Ratings: undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  Search: {query?: string} | undefined;
  GameDetail: {id: string};
  EditProfile: undefined;
};

export type RootStackParamList = {
  SplashScreen: undefined;
  Gate: undefined;
  Onboarding: undefined;
  Auth: {reopened?: boolean} | undefined;
  Main: NavigatorScreenParams<MainStackParamList> | undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
