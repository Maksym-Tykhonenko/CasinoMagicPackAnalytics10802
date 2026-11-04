import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {useReduceMotion} from '../../hooks/useReduceMotion';
import {colors} from '../../constants/theme';

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export function BottomSheet({visible, onClose, children}: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const reduce = useReduceMotion();
  const overlay = useRef(new Animated.Value(0)).current;
  const sheet = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible) {
      return;
    }
    if (reduce) {
      overlay.setValue(1);
      sheet.setValue(0);
      return;
    }
    overlay.setValue(0);
    sheet.setValue(1);
    Animated.parallel([
      Animated.timing(overlay, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(sheet, {
        toValue: 0,
        duration: 360,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [overlay, reduce, sheet, visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent>
      <View style={styles.BottomSheetFacetChassis} pointerEvents="box-none">
        <Animated.View style={[styles.BottomSheetVeil, {opacity: overlay}]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close sheet"
          />
        </Animated.View>
        <Animated.View
          style={[
            styles.BottomSheetPortico,
            {
              paddingBottom: Math.max(insets.bottom, 18),
              transform: [
                {
                  translateY: sheet.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 640],
                  }),
                },
              ],
            },
          ]}>
          <View style={styles.BottomSheetHandle} />
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  BottomSheetFacetChassis: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  BottomSheetVeil: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(3, 5, 10, 0.72)',
  },

  BottomSheetPortico: {
    backgroundColor: '#0b1120',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTopWidth: 1,
    paddingHorizontal: 22,
    paddingTop: 10,
    maxHeight: '92%',
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: -30},
    shadowOpacity: 0.55,
    shadowRadius: 30,
  },

  BottomSheetHandle: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: 3,
    height: 5,
    marginBottom: 14,
    width: 38,
  },
});
