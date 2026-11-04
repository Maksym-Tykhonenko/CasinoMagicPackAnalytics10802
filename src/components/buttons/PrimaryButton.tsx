import React from 'react';
import {StyleProp, StyleSheet, Text, ViewStyle} from 'react-native';

import {colors, fonts, layout} from '../../constants/theme';
import {PressableScale} from './PressableScale';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
  disabled?: boolean;
};

export function PrimaryButton({
  label,
  onPress,
  style,
  fullWidth = true,
  disabled = false,
}: PrimaryButtonProps) {
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[fullWidth && styles.PrimaryButtonButtonWide, style]}
      contentStyle={[
        styles.PrimaryButtonBtnPortico,
        disabled && styles.PrimaryButtonButtonDisabled,
      ]}>
      <Text
        numberOfLines={1}
        accessibilityElementsHidden
        importantForAccessibility="no"
        style={[
          styles.PrimaryButtonLabelFiligree,
          disabled && styles.PrimaryButtonLabelDisabled,
        ]}>
        {label}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  PrimaryButtonBtnPortico: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: colors.accent,
    borderRadius: 16,
    height: layout.buttonHeight,
    justifyContent: 'center',
    paddingHorizontal: 16,
    shadowColor: colors.accentGlow,
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 1,
    shadowRadius: 15,
    width: '100%',
    elevation: 8,
  },

  PrimaryButtonButtonWide: {
    alignSelf: 'stretch',
    width: '100%',
  },

  PrimaryButtonButtonDisabled: {
    backgroundColor: colors.buttonDisabled,
    elevation: 0,
    shadowOpacity: 0,
  },
  PrimaryButtonLabelFiligree: {
    color: colors.buttonText,
    fontFamily: fonts.sansRegular,
    fontSize: 16.5,
    fontWeight: '500',
    textAlign: 'center',
  },

  PrimaryButtonLabelDisabled: {
    color: colors.disabledText,
  },
});
