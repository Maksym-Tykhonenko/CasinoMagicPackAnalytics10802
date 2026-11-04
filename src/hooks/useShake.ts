import {useCallback, useRef} from 'react';
import {Animated} from 'react-native';

import {useReduceMotion} from './useReduceMotion';

export function useShake() {
  const reduce = useReduceMotion();
  const offset = useRef(new Animated.Value(0)).current;

  const shake = useCallback(() => {
    if (reduce) {
      offset.setValue(0);
      return;
    }
    offset.setValue(0);
    Animated.sequence([
      Animated.timing(offset, {
        toValue: 12,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(offset, {
        toValue: -12,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(offset, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(offset, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(offset, {
        toValue: 6,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(offset, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [offset, reduce]);

  return {
    shake,
    style: {transform: [{translateX: offset}]},
  };
}
