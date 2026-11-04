import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import {PressableScale} from '../buttons/PressableScale';
import {colors, fonts} from '../../constants/theme';
import {icons} from '../../data/assets';
import {initialsFor} from '../../routing/AccountContext';

type AccountAvatarProps = {
  name: string;
  photoUri: string | null;
  size: number;
  showStatus?: boolean;
  showLens?: boolean;
  onPress?: () => void;
};

export function AccountAvatar({
  name,
  photoUri,
  size,
  showStatus = false,
  showLens = false,
  onPress,
}: AccountAvatarProps) {
  const initials = initialsFor(name);
  const radius = size / 2;
  const lens = Math.round(size * 0.386);
  const status = Math.round(size * 0.22);

  const face = (
    <View style={{height: size, width: size}}>
      <LinearGradient
        colors={['#6ba8ff', '#2e7bff']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={[
          styles.AccountAvatarPortico,
          {borderRadius: radius, height: size, width: size},
        ]}>
        {photoUri ? (
          <Image
            source={{uri: photoUri}}
            style={styles.AccountAvatarPhotoSigil}
            resizeMode="cover"
          />
        ) : (
          <Text
            style={[
              styles.AccountAvatarInitialsFiligree,
              {fontSize: size * 0.34},
            ]}>
            {initials}
          </Text>
        )}
      </LinearGradient>
      {showStatus ? (
        <View
          style={[
            styles.AccountAvatarStatusPortico,
            {
              borderRadius: status / 2,
              height: status,
              width: status,
            },
          ]}
        />
      ) : null}
      {showLens ? (
        <View
          style={[
            styles.AccountAvatarLensPortico,
            {
              borderRadius: lens / 2,
              height: lens,
              width: lens,
            },
          ]}>
          <Image
            source={icons.lens}
            style={styles.AccountAvatarLensSigil}
            resizeMode="contain"
          />
        </View>
      ) : null}
    </View>
  );

  if (!onPress) {
    return face;
  }

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Change photo for ${name}`}>
      {face}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  AccountAvatarPortico: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  AccountAvatarPhotoSigil: {
    ...StyleSheet.absoluteFill,
  },
  AccountAvatarInitialsFiligree: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontWeight: '700',
  },

  AccountAvatarStatusPortico: {
    backgroundColor: colors.gain,
    borderColor: '#0a0e18',
    borderWidth: 3,
    bottom: -1,
    position: 'absolute',
    right: -1,
  },

  AccountAvatarLensPortico: {
    alignItems: 'center',
    backgroundColor: '#0b1120',
    borderColor: colors.background,
    borderWidth: 2,
    bottom: -2,
    justifyContent: 'center',
    position: 'absolute',
    right: -2,
  },

  AccountAvatarLensSigil: {
    height: 14,
    width: 14,
  },
});
