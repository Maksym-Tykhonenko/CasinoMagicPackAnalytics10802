import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';

import {PressableScale} from '../buttons/PressableScale';
import {PrimaryButton} from '../buttons/PrimaryButton';
import {BottomSheet} from './BottomSheet';
import {colors, fonts} from '../../constants/theme';
import {SORT_OPTIONS, type SortOption} from '../../data/pack';
import {
  DEFAULT_FILTERS,
  toggleValue,
  type ExploreFilters,
  type FilterOptions,
} from '../../data/filters';

type FiltersSheetProps = {
  visible: boolean;
  filters: ExploreFilters;
  options: FilterOptions;
  matchCount: number;
  onChange: (next: ExploreFilters) => void;
  onClose: () => void;
  onApply: () => void;
};

export function FiltersSheet({
  visible,
  filters,
  options,
  matchCount,
  onChange,
  onClose,
  onApply,
}: FiltersSheetProps) {
  const patch = (partial: Partial<ExploreFilters>) =>
    onChange({...filters, ...partial});

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        bounces={false}>
      <View style={styles.FiltersSheetHeader}>
        <PressableScale
          onPress={() => onChange(DEFAULT_FILTERS)}
          accessibilityRole="button"
          accessibilityLabel="Reset filters">
          <Text style={styles.FiltersSheetLinkFiligree}>Reset</Text>
        </PressableScale>
        <Text
          accessibilityRole="header"
          style={styles.FiltersSheetTitleFiligree}>
          Filters
        </Text>
        <PressableScale
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close filters">
          <Text style={styles.FiltersSheetLinkFiligree}>Close</Text>
        </PressableScale>
      </View>

      <Text style={styles.FiltersSheetLintel}>SORT BY</Text>
      <View style={styles.FiltersSheetSortPortico}>
        {SORT_OPTIONS.map(option => {
          const active = filters.sort === option;
          return (
            <PressableScale
              key={option}
              onPress={() => patch({sort: option as SortOption})}
              accessibilityRole="button"
              accessibilityLabel={`Sort by ${option}`}
              accessibilityState={{selected: active}}
              style={styles.FiltersSheetSortCell}
              contentStyle={[
                styles.FiltersSheetSortBtn,
                active && styles.FiltersSheetSortActive,
              ]}>
              <Text
                style={[
                  styles.FiltersSheetSortFiligree,
                  active && styles.FiltersSheetSortActiveFiligree,
                ]}>
                {option}
              </Text>
            </PressableScale>
          );
        })}
      </View>

      <Text style={styles.FiltersSheetLintel}>
        CATEGORIES
        {filters.categories.length
          ? ` · ${filters.categories.length} SELECTED`
          : ''}
      </Text>
      <ChipRow
        options={options.categories}
        selected={filters.categories}
        onToggle={value =>
          patch({categories: toggleValue(filters.categories, value)})
        }
      />

      <Text style={styles.FiltersSheetLintel}>PROVIDER</Text>
      <ChipRow
        options={options.providers}
        selected={filters.providers}
        onToggle={value =>
          patch({providers: toggleValue(filters.providers, value)})
        }
      />

      <Text style={styles.FiltersSheetLintel}>VOLATILITY</Text>
      <ChipRow
        options={options.volatility}
        selected={filters.volatility}
        onToggle={value =>
          patch({volatility: toggleValue(filters.volatility, value)})
        }
      />

      <View style={styles.FiltersSheetRatingLintel}>
        <Text style={styles.FiltersSheetLintel}>MINIMUM RATING</Text>
        <Text style={styles.FiltersSheetRatingValue}>
          {filters.minRating.toFixed(1)}★ and above
        </Text>
      </View>
      <RatingTrack
        value={filters.minRating}
        onChange={minRating => patch({minRating})}
      />

      <ToggleRow
        label="Only saved games"
        value={filters.onlySaved}
        onToggle={() => patch({onlySaved: !filters.onlySaved})}
      />
      <ToggleRow
        label="Hide games I rated"
        value={filters.hideRated}
        onToggle={() => patch({hideRated: !filters.hideRated})}
      />

      <PrimaryButton
        label={`Show ${matchCount} games`}
        onPress={onApply}
        style={styles.FiltersSheetApply}
      />
      </ScrollView>
    </BottomSheet>
  );
}

function ChipRow({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <View style={styles.FiltersSheetChipsEnclave}>
      {options.map(option => {
        const active = selected.includes(option);
        return (
          <PressableScale
            key={option}
            onPress={() => onToggle(option)}
            accessibilityRole="button"
            accessibilityLabel={option}
            accessibilityState={{selected: active}}
            contentStyle={[
              styles.FiltersSheetChipPortico,
              active && styles.FiltersSheetChipActive,
            ]}>
            <Text
              style={[
                styles.FiltersSheetChipFiligree,
                active && styles.FiltersSheetChipActiveFiligree,
              ]}>
              {option}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

function RatingTrack({
  value,
  onChange,
}: {
  value: number;
  onChange: (next: number) => void;
}) {
  const steps = [1, 2, 3, 4, 5];
  return (
    <View style={styles.FiltersSheetTrackEnclave}>
      <View style={styles.FiltersSheetTrack}>
        <View
          style={[
            styles.FiltersSheetTrackFill,
            {width: `${((value - 1) / 4) * 100}%`},
          ]}
        />
        {steps.map(step => (
          <PressableScale
            key={step}
            onPress={() => onChange(step)}
            accessibilityRole="button"
            accessibilityLabel={`Minimum rating ${step.toFixed(1)} stars`}
            accessibilityState={{selected: step === Math.round(value)}}
            style={styles.FiltersSheetThumbHit}
            contentStyle={[
              styles.FiltersSheetThumb,
              step === Math.round(value) && styles.FiltersSheetThumbActive,
            ]}
          />
        ))}
      </View>
      <View style={styles.FiltersSheetScaleLintel}>
        {steps.map(step => (
          <Text key={step} style={styles.FiltersSheetScaleFiligree}>
            {step.toFixed(1)}
          </Text>
        ))}
      </View>
    </View>
  );
}

function ToggleRow({
  label,
  value,
  onToggle,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <PressableScale
      onPress={onToggle}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{checked: value}}
      contentStyle={styles.FiltersSheetTogglePortico}>
      <Text style={styles.FiltersSheetToggleFiligree}>{label}</Text>
      <View
        style={[
          styles.FiltersSheetSwitch,
          value && styles.FiltersSheetSwitchOn,
        ]}>
        <View
          style={[styles.FiltersSheetKnob, value && styles.FiltersSheetKnobOn]}
        />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  FiltersSheetHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  FiltersSheetLinkFiligree: {
    color: colors.accentSoft,
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    fontWeight: '500',
  },

  FiltersSheetTitleFiligree: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 17,
    fontWeight: '700',
  },
  FiltersSheetLintel: {
    color: 'rgba(234, 240, 250, 0.4)',
    fontFamily: fonts.sansRegular,
    fontSize: 11,
    letterSpacing: 1.1,
    marginBottom: 10,
    marginTop: 14,
  },

  FiltersSheetSortPortico: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    height: 40,
    padding: 3,
  },

  FiltersSheetSortCell: {
    flex: 1,
  },
  FiltersSheetSortBtn: {
    borderRadius: 9,
    height: 32,
    justifyContent: 'center',
  },
  FiltersSheetSortActive: {
    backgroundColor: colors.accent,
    shadowColor: colors.accentShadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 1,
    shadowRadius: 4,
  },

  FiltersSheetSortFiligree: {
    color: colors.body,
    fontFamily: fonts.sansRegular,
    fontSize: 12.5,
  },

  FiltersSheetSortActiveFiligree: {
    color: colors.buttonText,
  },

  FiltersSheetChipsEnclave: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  FiltersSheetChipPortico: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: colors.cardBorderStrong,
    borderRadius: 11,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },

  FiltersSheetChipActive: {
    backgroundColor: 'rgba(74, 155, 255, 0.9)',
    borderColor: 'rgba(74, 155, 255, 0.9)',
  },

  FiltersSheetChipFiligree: {
    color: 'rgba(234, 240, 250, 0.62)',
    fontFamily: fonts.sansRegular,
    fontSize: 12.5,
  },

  FiltersSheetChipActiveFiligree: {
    color: colors.buttonText,
  },
  FiltersSheetRatingLintel: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  FiltersSheetRatingValue: {
    color: colors.star,
    fontFamily: fonts.sansRegular,
    fontSize: 11,
    marginBottom: 10,
    marginTop: 14,
  },

  FiltersSheetTrackEnclave: {
    marginBottom: 8,
  },
  FiltersSheetTrack: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    flexDirection: 'row',
    height: 4,
    justifyContent: 'space-between',
    marginTop: 8,
  },

  FiltersSheetTrackFill: {
    backgroundColor: colors.accent,
    borderRadius: 2,
    height: 4,
    left: 0,
    position: 'absolute',
    top: 0,
  },

  FiltersSheetThumbHit: {
    marginTop: -9,
  },
  FiltersSheetThumb: {
    backgroundColor: 'transparent',
    borderRadius: 11,
    height: 22,
    width: 22,
  },

  FiltersSheetThumbActive: {
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  FiltersSheetScaleLintel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  FiltersSheetScaleFiligree: {
    color: colors.bodyDim,
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    fontWeight: '500',
  },

  FiltersSheetTogglePortico: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    height: 60,
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: 15,
    width: '100%',
  },
  FiltersSheetToggleFiligree: {
    color: colors.ivory,
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    fontWeight: '500',
  },
  FiltersSheetSwitch: {
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 16,
    height: 34,
    justifyContent: 'center',
    paddingHorizontal: 2,
    width: 54,
  },

  FiltersSheetSwitchOn: {
    backgroundColor: '#2e7bff',
    alignItems: 'flex-end',
  },

  FiltersSheetKnob: {
    backgroundColor: colors.white,
    borderRadius: 13,
    height: 26,
    width: 26,
  },

  FiltersSheetKnobOn: {},

  FiltersSheetApply: {
    marginTop: 16,
  },
});
