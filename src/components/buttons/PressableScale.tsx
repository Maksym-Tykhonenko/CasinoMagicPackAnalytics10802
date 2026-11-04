import React, {useRef} from 'react';
import {
  Animated,
  Pressable,
  type AccessibilityRole,
  type AccessibilityState,
  type PressableProps,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';

import {useReduceMotion} from '../../hooks/useReduceMotion';

type PressableScaleProps = {
  children?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  hitSlop?: PressableProps['hitSlop'];
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
};

export function PressableScale({
  children,
  onPress,
  disabled = false,
  hitSlop,
  style,
  contentStyle,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = onPress ? 'button' : undefined,
  accessibilityState,
}: PressableScaleProps) {
  const reduce = useReduceMotion();
  const scale = useRef(new Animated.Value(1)).current;

  const to = (value: number) => {
    if (reduce) {
      return;
    }
    Animated.spring(scale, {
      toValue: value,
      friction: 7,
      tension: 170,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={hitSlop}
      onPressIn={() => to(0.97)}
      onPressOut={() => to(1)}
      style={style}
      accessible={Boolean(onPress)}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      accessibilityState={{disabled, ...accessibilityState}}>
      <Animated.View
        style={[
          styles.PressableScaleInner,
          {transform: [{scale}]},
          contentStyle,
        ]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  PressableScaleInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
