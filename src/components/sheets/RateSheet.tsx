import React, {useEffect, useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {PressableScale} from '../buttons/PressableScale';
import {PrimaryButton} from '../buttons/PrimaryButton';
import {CoverArt} from '../media/CoverArt';
import {BottomSheet} from './BottomSheet';
import {colors, fonts} from '../../constants/theme';
import type {CatalogueTitle} from '../../data/pack';
import {toggleValue} from '../../data/filters';
import type {TitleRating} from '../../routing/LibraryContext';

const OUTSTANDING = [
  'Great art',
  'Smooth feel',
  'Fun bonus',
  'Too repetitive',
  'Slow start',
];

const STAR_COPY = [
  'Tap a star',
  '1 star · Poor',
  '2 stars · Fair',
  '3 stars · Good',
  '4 stars · Very good',
  '5 stars · Excellent',
];

type RateSheetProps = {
  visible: boolean;
  title: CatalogueTitle | null;
  initial?: TitleRating;
  onClose: () => void;
  onSubmit: (rating: TitleRating) => void;
};

export function RateSheet({
  visible,
  title,
  initial,
  onClose,
  onSubmit,
}: RateSheetProps) {
  const [stars, setStars] = useState(initial?.stars ?? 0);
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [review, setReview] = useState(initial?.review ?? '');

  useEffect(() => {
    if (visible) {
      setStars(initial?.stars ?? 0);
      setTags(initial?.tags ?? []);
      setReview(initial?.review ?? '');
    }
  }, [initial, visible]);

  if (!title) {
    return null;
  }

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.RateSheetHeroLintel}>
          <CoverArt source={title.art} style={styles.RateSheetThumbSigil} />
          <View style={styles.RateSheetHeroCopy}>
            <Text style={styles.RateSheetTitleFiligree}>{title.title}</Text>
            <Text style={styles.RateSheetMetaFiligree}>
              {title.category}
              {title.studio ? ` · ${title.studio}` : ''}
            </Text>
          </View>
        </View>

        <Text style={styles.RateSheetQuestionFiligree}>
          How was this title?
        </Text>
        <Text style={styles.RateSheetHintFiligree}>
          Your rating is private until you publish a review, and it feeds your
          personal analytics.
        </Text>

        <View style={styles.RateSheetStarsLintel}>
          {[1, 2, 3, 4, 5].map(value => (
            <PressableScale
              key={value}
              onPress={() => setStars(value)}
              accessibilityRole="button"
              accessibilityLabel={`${value} star${value === 1 ? '' : 's'}`}
              accessibilityState={{selected: value <= stars}}>
              <Text
                accessibilityElementsHidden
                importantForAccessibility="no"
                style={[
                  styles.RateSheetStarFiligree,
                  value <= stars
                    ? styles.RateSheetStarOn
                    : styles.RateSheetStarOff,
                ]}>
                ★
              </Text>
            </PressableScale>
          ))}
        </View>
        <Text style={styles.RateSheetStarCopy}>{STAR_COPY[stars]}</Text>

        <Text style={styles.RateSheetLintel}>WHAT STOOD OUT? (OPTIONAL)</Text>
        <View style={styles.RateSheetChipsEnclave}>
          {OUTSTANDING.map(option => {
            const active = tags.includes(option);
            return (
              <PressableScale
                key={option}
                onPress={() => setTags(toggleValue(tags, option))}
                accessibilityRole="button"
                accessibilityLabel={option}
                accessibilityState={{selected: active}}
                contentStyle={[
                  styles.RateSheetChipPortico,
                  active && styles.RateSheetChipActive,
                ]}>
                <Text
                  style={[
                    styles.RateSheetChipFiligree,
                    active && styles.RateSheetChipActiveFiligree,
                  ]}>
                  {option}
                </Text>
              </PressableScale>
            );
          })}
        </View>

        <TextInput
          value={review}
          onChangeText={text => setReview(text.slice(0, 500))}
          placeholder="Add a short review… (optional, up to 500 characters)"
          placeholderTextColor={colors.bodyDim}
          multiline
          editable
          underlineColorAndroid="transparent"
          selectionColor={colors.accent}
          accessibilityLabel="Optional review"
          style={styles.RateSheetInput}
        />

        <View style={styles.RateSheetActionsLintel}>
          <PressableScale
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Rate later"
            style={styles.RateSheetLaterCell}
            contentStyle={styles.RateSheetLaterPortico}>
            <Text style={styles.RateSheetLaterFiligree}>Later</Text>
          </PressableScale>
          <PrimaryButton
            label="Submit rating"
            fullWidth={false}
            disabled={stars === 0}
            onPress={() => onSubmit({stars, tags, review})}
            style={styles.RateSheetSubmit}
          />
        </View>
      </KeyboardAvoidingView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  RateSheetHeroLintel: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },

  RateSheetThumbSigil: {
    borderRadius: 11,
    height: 64,
    width: 64,
  },

  RateSheetHeroCopy: {
    flex: 1,
    gap: 4,
  },
  RateSheetTitleFiligree: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.18,
  },
  RateSheetMetaFiligree: {
    color: colors.bodySoft,
    fontFamily: fonts.sansRegular,
    fontSize: 12,
  },

  RateSheetQuestionFiligree: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 22,
    textAlign: 'center',
  },

  RateSheetHintFiligree: {
    color: colors.bodySoft,
    fontFamily: fonts.sansRegular,
    fontSize: 13,
    lineHeight: 19.5,
    marginTop: 8,
    textAlign: 'center',
  },
  RateSheetStarsLintel: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },

  RateSheetStarFiligree: {
    fontSize: 40,
    width: 52,
    textAlign: 'center',
  },

  RateSheetStarOn: {
    color: colors.star,
  },

  RateSheetStarOff: {
    color: 'rgba(255, 199, 97, 0.28)',
  },
  RateSheetStarCopy: {
    color: colors.star,
    fontFamily: fonts.sansRegular,
    fontSize: 13.5,
    marginTop: 8,
    textAlign: 'center',
  },

  RateSheetLintel: {
    color: 'rgba(234, 240, 250, 0.4)',
    fontFamily: fonts.sansRegular,
    fontSize: 11,
    letterSpacing: 1.1,
    marginBottom: 10,
    marginTop: 22,
  },

  RateSheetChipsEnclave: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  RateSheetChipPortico: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: colors.cardBorderStrong,
    borderRadius: 11,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },

  RateSheetChipActive: {
    backgroundColor: 'rgba(74, 155, 255, 0.9)',
    borderColor: 'rgba(74, 155, 255, 0.9)',
  },

  RateSheetChipFiligree: {
    color: 'rgba(234, 240, 250, 0.62)',
    fontFamily: fonts.sansRegular,
    fontSize: 12.5,
  },

  RateSheetChipActiveFiligree: {
    color: colors.buttonText,
  },
  RateSheetInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: colors.cardBorderStrong,
    borderRadius: 16,
    borderWidth: 1,
    color: colors.ivory,
    fontFamily: fonts.sansRegular,
    fontSize: 13.5,
    height: 104,
    marginTop: 16,
    paddingHorizontal: 15,
    paddingTop: 16,
    textAlignVertical: 'top',
  },
  RateSheetActionsLintel: {
    alignItems: 'stretch',
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },

  RateSheetLaterCell: {
    flexShrink: 0,
    width: 114,
  },

  RateSheetLaterPortico: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    borderWidth: 1,
    height: 54,
    width: '100%',
  },
  RateSheetLaterFiligree: {
    color: colors.ivory,
    fontFamily: fonts.sansRegular,
    fontSize: 15,
  },
  RateSheetSubmit: {
    flex: 1,
  },
});
