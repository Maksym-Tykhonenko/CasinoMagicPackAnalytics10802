import {LogBox} from 'react-native';

// RN 0.87: gesture-handler still imports DrawerLayoutAndroid on load.
// App does not use drawers — silence until the library drops the import.
LogBox.ignoreLogs(['DrawerLayoutAndroid is deprecated']);
