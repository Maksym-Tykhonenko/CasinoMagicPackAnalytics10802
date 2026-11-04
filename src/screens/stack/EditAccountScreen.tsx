import React, {useState} from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {PressableScale} from '../../components/buttons/PressableScale';
import {PrimaryButton} from '../../components/buttons/PrimaryButton';
import {ScreenAmbient} from '../../components/layout/ScreenAmbient';

import {AccountAvatar} from '../../components/account/AccountAvatar';
import {colors, fonts} from '../../constants/theme';
import {icons} from '../../data/assets';
import {useAdaptive} from '../../hooks/useAdaptive';
import {pickGalleryPhoto} from '../../media/pickGalleryPhoto';

import {useAuth} from '../../routing/AuthContext';
import {useAccount} from '../../routing/AccountContext';
import type {MainStackParamList} from '../../routing/types';

type Nav = NativeStackNavigationProp<MainStackParamList, 'EditProfile'>;

export function EditAccountScreen() {
  const insets = useSafeAreaInsets();
  const adaptive = useAdaptive();

  const navigation = useNavigation<Nav>();
  const {profile, updateProfile} = useAccount();

  const {updateAccount} = useAuth();
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [email, setEmail] = useState(profile.email);
  const [photoUri, setPhotoUri] = useState(profile.photoUri);
  const pad = adaptive.scale(20);

  const commit = async () => {
    const nextName = displayName.trim() || profile.displayName;
    const nextEmail = email.trim();
    await updateProfile({
      displayName: nextName,
      email: nextEmail,
      photoUri,
    });
    if (nextEmail.includes('@')) {
      await updateAccount({
        fromEmail: profile.email,
        email: nextEmail,
        displayName: nextName,
      });
    }
    navigation.goBack();
  };

  const discard = () => {
    navigation.goBack();
  };

  const changePhoto = async () => {
    const uri = await pickGalleryPhoto();
    if (uri) {
      setPhotoUri(uri);
    }
  };

  return (
    <ScreenAmbient opacity={0.28}>
      <KeyboardAvoidingView
        style={styles.EditAccountScreenFacetChassis}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View
          style={[
            styles.EditAccountScreenHeader,
            {
              paddingTop: insets.top,
              minHeight: insets.top + 53,
            },
          ]}>
          <View style={styles.EditAccountScreenHeaderRow}>
            <PressableScale
              onPress={discard}
              accessibilityRole="button"
              accessibilityLabel="Back to Account"
              style={styles.EditAccountScreenHeaderSide}
              contentStyle={styles.EditAccountScreenBackPortico}>
              <Image
                source={icons.retreat}
                accessibilityElementsHidden
                importantForAccessibility="no"
                style={styles.EditAccountScreenBackSigil}
                resizeMode="contain"
              />
              <Text style={styles.EditAccountScreenBackFiligree}>Account</Text>
            </PressableScale>
            <Text
              accessibilityRole="header"
              style={styles.EditAccountScreenTitleFiligree}>
              Edit Account
            </Text>
            <PressableScale
              onPress={commit}
              accessibilityRole="button"
              accessibilityLabel="Save changes"
              style={styles.EditAccountScreenHeaderSideEnd}>
              <Text style={styles.EditAccountScreenSaveFiligree}>Save</Text>
            </PressableScale>
          </View>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.EditAccountScreenScrollContent,
            {paddingHorizontal: pad},
          ]}>
          <View style={styles.EditAccountScreenAvatarEnclave}>
            <AccountAvatar
              name={displayName}
              photoUri={photoUri}
              size={88}
              showLens
              onPress={changePhoto}
            />
            <PressableScale
              onPress={changePhoto}
              accessibilityRole="button"
              accessibilityLabel="Change photo">
              <Text style={styles.EditAccountScreenChangeFiligree}>
                Change photo
              </Text>
            </PressableScale>
          </View>

          <Text style={styles.EditAccountScreenLabelFiligree}>
            Display name
          </Text>
          <View style={styles.EditAccountScreenFieldPortico}>
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
              underlineColorAndroid="transparent"
              placeholder="Display name"
              placeholderTextColor="rgba(234, 240, 250, 0.4)"
              selectionColor={colors.accent}
              accessibilityLabel="Display name"
              style={styles.EditAccountScreenInput}
            />
          </View>

          <Text
            style={[
              styles.EditAccountScreenLabelFiligree,
              styles.EditAccountScreenLabelOffset,
            ]}>
            Email
          </Text>
          <View style={styles.EditAccountScreenFieldPortico}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              returnKeyType="done"
              underlineColorAndroid="transparent"
              placeholder="Email"
              placeholderTextColor="rgba(234, 240, 250, 0.4)"
              selectionColor={colors.accent}
              accessibilityLabel="Email"
              style={styles.EditAccountScreenInput}
            />
          </View>

          <View style={styles.EditAccountScreenPrimary}>
            <PrimaryButton label="Save changes" onPress={commit} />
          </View>
          <PressableScale
            onPress={discard}
            accessibilityRole="button"
            accessibilityLabel="Discard changes"
            contentStyle={styles.EditAccountScreenDiscardPortico}>
            <Text style={styles.EditAccountScreenDiscardFiligree}>Discard</Text>
          </PressableScale>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenAmbient>
  );
}

const styles = StyleSheet.create({
  EditAccountScreenFacetChassis: {
    flex: 1,
  },

  EditAccountScreenScrollContent: {
    paddingBottom: 32,
    paddingTop: 22,
  },
  EditAccountScreenHeader: {
    backgroundColor: 'rgba(6, 9, 17, 0.86)',
    borderBottomColor: 'rgba(255, 255, 255, 0.07)',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  EditAccountScreenHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 53,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  EditAccountScreenHeaderSide: {
    zIndex: 1,
  },

  EditAccountScreenHeaderSideEnd: {
    zIndex: 1,
  },
  EditAccountScreenBackPortico: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 3,
  },
  EditAccountScreenBackSigil: {
    height: 18,
    tintColor: colors.accentSoft,
    width: 18,
  },
  EditAccountScreenBackFiligree: {
    color: colors.accentSoft,
    fontFamily: fonts.sansMedium,
    fontSize: 15.5,
    fontWeight: '500',
  },

  EditAccountScreenTitleFiligree: {
    color: colors.white,
    fontFamily: fonts.sansRegular,
    fontSize: 16,
    left: 0,
    position: 'absolute',
    right: 0,
    textAlign: 'center',
  },

  EditAccountScreenSaveFiligree: {
    color: colors.accentSoft,
    fontFamily: fonts.sansRegular,
    fontSize: 14,
    textAlign: 'right',
  },

  EditAccountScreenAvatarEnclave: {
    alignItems: 'center',
    marginBottom: 24,
  },

  EditAccountScreenChangeFiligree: {
    color: colors.accentSoft,
    fontFamily: fonts.sansRegular,
    fontSize: 13.5,
    marginTop: 12,
  },

  EditAccountScreenLabelFiligree: {
    color: colors.bodyFaint,
    fontFamily: fonts.sansRegular,
    fontSize: 11.5,
    letterSpacing: 0.46,
    marginBottom: 8,
  },
  EditAccountScreenLabelOffset: {
    marginTop: 14,
  },

  EditAccountScreenFieldPortico: {
    backgroundColor: colors.inputFill,
    borderColor: colors.cardBorderStrong,
    borderRadius: 15,
    borderWidth: 1,
    height: 54,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },

  EditAccountScreenInput: {
    color: colors.ivory,
    fontFamily: fonts.sansRegular,
    fontSize: 15,
    height: '100%',
    paddingVertical: 0,
  },

  EditAccountScreenPrimary: {
    marginTop: 24,
    width: '100%',
  },

  EditAccountScreenDiscardPortico: {
    backgroundColor: colors.cardStrong,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    borderWidth: 1,
    height: 52,
    justifyContent: 'center',
    marginTop: 10,
    width: '100%',
  },

  EditAccountScreenDiscardFiligree: {
    color: colors.ivory,
    fontFamily: fonts.sansRegular,
    fontSize: 15,
  },
});
