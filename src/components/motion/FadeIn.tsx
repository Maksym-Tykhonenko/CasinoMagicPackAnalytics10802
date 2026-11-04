import React, {useEffect, useRef} from 'react';
import {Animated, Easing, StyleProp, ViewStyle} from 'react-native';

import {useReduceMotion} from '../../hooks/useReduceMotion';

type FadeInProps = {
  children: React.ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
};

export function FadeIn({children, delay = 0, style}: FadeInProps) {
  const reduce = useReduceMotion();
  const opacity = useRef(new Animated.Value(reduce ? 1 : 0)).current;
  const translateY = useRef(new Animated.Value(reduce ? 0 : 16)).current;

  useEffect(() => {
    if (reduce) {
      opacity.setValue(1);
      translateY.setValue(0);
      return;
    }
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 480,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 480,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, opacity, reduce, translateY]);

  return (
    <Animated.View style={[{opacity, transform: [{translateY}]}, style]}>
      {children}
    </Animated.View>
  );
}
