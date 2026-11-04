import React, {useMemo, useState} from 'react';
import {Image, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RouteProp} from '@react-navigation/native';

import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {PressableScale} from '../../components/buttons/PressableScale';
import {CoverArt} from '../../components/media/CoverArt';
import {CoverFade} from '../../components/media/CoverFade';
import {FadeIn} from '../../components/motion/FadeIn';

import {RateSheet} from '../../components/sheets/RateSheet';
import {colors, fonts} from '../../constants/theme';
import {icons} from '../../data/assets';

import {featuredTitle} from '../../data/pack';

import {useAdaptive} from '../../hooks/useAdaptive';
import {sharePackTitle} from '../../media/sharePackTitle';
import {usePack} from '../../routing/PackContext';
import {useLibrary} from '../../routing/LibraryContext';
import type {MainStackParamList} from '../../routing/types';

type Nav = NativeStackNavigationProp<MainStackParamList, 'GameDetail'>;
type Route = RouteProp<MainStackParamList, 'GameDetail'>;

export function GameDetailScreen() {
  const insets = useSafeAreaInsets();
  const adaptive = useAdaptive();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const {titles, featured} = usePack();
  const library = useLibrary();
  const [ratingOpen, setRatingOpen] = useState(false);

  const title = useMemo(
    () =>
      titles.find(item => item.id === route.params.id) ??
      (featured.id === route.params.id ? featured : featuredTitle),
    [featured, route.params.id, titles],
  );

  const saved = library.isSaved(title.id);
  const heroHeight = adaptive.verticalScale(360);

  const shareTitle = () => {
    sharePackTitle(title);
  };

  const stats = [
    {
      value: title.rating.toFixed(1),
      label: `${(title.ratingsCount ?? 0).toLocaleString()} ratings`,
      color: colors.star,
    },
    {value: `#${title.rank}`, label: 'popularity', color: colors.white},
    {value: `${title.popularity}%`, label: 'interest', color: colors.interest},
  ];

  const traits: Array<{label: string; value: string}> = [
    {label: 'Reels', value: title.reels ?? '5 × 3'},
    {label: 'Paylines', value: title.paylines ?? '25'},
    {label: 'Volatility', value: title.volatility ?? 'Medium'},
    {label: 'Theme', value: title.theme ?? title.category},
    {label: 'Bonus round', value: title.bonus ?? 'Bonus feature'},
    {label: 'Released', value: title.released ?? '2026'},
  ];

  return (
    <View style={styles.GameDetailFacetChassis}>
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 108 + insets.bottom}}>
        <View style={[styles.GameDetailHeroPortico, {height: heroHeight}]}>
          <CoverArt source={title.art} style={styles.GameDetailHeroSigil} />
          <View style={styles.GameDetailHeroVeil} pointerEvents="none" />
          <CoverFade height={210} />
          <View
            style={[
              styles.GameDetailTopLintel,
              {
                paddingTop: insets.top + 8,
                paddingHorizontal: adaptive.scale(16),
              },
            ]}>
            <PressableScale
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              contentStyle={styles.GameDetailGhostPortico}>
              <Image
                source={icons.retreat}
                accessibilityElementsHidden
                importantForAccessibility="no"
                style={styles.GameDetailGhostSigil}
                resizeMode="contain"
              />
              <Text style={styles.GameDetailGhostFiligree}>Back</Text>
            </PressableScale>
            <PressableScale
              onPress={() => library.toggleSaved(title.id)}
              accessibilityRole="button"
              accessibilityLabel={
                saved
                  ? `Remove ${title.title} from saved`
                  : `Save ${title.title}`
              }
              accessibilityState={{selected: saved}}
              contentStyle={styles.GameDetailIconPortico}>
              <Image
                source={icons.ribbon}
                accessibilityElementsHidden
                importantForAccessibility="no"
                style={[
                  styles.GameDetailGhostSigil,
                  saved
                    ? styles.GameDetailSavedSigil
                    : styles.GameDetailIdleSigil,
                ]}
                resizeMode="contain"
              />
            </PressableScale>
          </View>
          <FadeIn
            delay={80}
            style={[
              styles.GameDetailHeroCopy,
              {paddingHorizontal: adaptive.scale(20)},
            ]}>
            {title.badge ? (
              <View style={styles.GameDetailBadgePortico}>
                <Text style={styles.GameDetailBadgeFiligree}>
                  {title.badge}
                </Text>
              </View>
            ) : null}
            <Text style={styles.GameDetailTitleFiligree}>{title.title}</Text>
            <Text style={styles.GameDetailMetaFiligree}>
              {title.category}
              {title.studio ? ` · ${title.studio}` : ''}
              {title.reels ? ` · ${title.reels} reels` : ''}
            </Text>
          </FadeIn>
        </View>

        <View style={{paddingHorizontal: adaptive.scale(20)}}>
          <FadeIn delay={140} style={styles.GameDetailStatsLintel}>
            {stats.map(stat => (
              <View key={stat.label} style={styles.GameDetailStatPortico}>
                <Text style={[styles.GameDetailStatValue, {color: stat.color}]}>
                  {stat.value}
                </Text>
                <Text style={styles.GameDetailStatLabel}>{stat.label}</Text>
              </View>
            ))}
          </FadeIn>

          <FadeIn delay={200}>
            <Text style={styles.GameDetailBodyFiligree}>
              {title.description}
            </Text>
          </FadeIn>

          <FadeIn delay={260}>
            <Text style={styles.GameDetailSectionFiligree}>
              Key characteristics
            </Text>
            <View style={styles.GameDetailTraitsEnclave}>
              {traits.map(trait => (
                <View key={trait.label} style={styles.GameDetailTraitPortico}>
                  <Text style={styles.GameDetailTraitLabel}>{trait.label}</Text>
                  <Text style={styles.GameDetailTraitValue}>{trait.value}</Text>
                </View>
              ))}
            </View>
          </FadeIn>
        </View>
      </ScrollView>

      <FadeIn
        delay={200}
        style={[
          styles.GameDetailFooter,
          {
            paddingBottom: Math.max(insets.bottom, 16),
            paddingHorizontal: adaptive.scale(20),
          },
        ]}>
        <PressableScale
          onPress={() => setRatingOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={`Rate ${title.title}`}
          style={styles.GameDetailRateCell}
          contentStyle={styles.GameDetailRatePortico}>
          <Text style={styles.GameDetailRateStar}>★</Text>
          <Text style={styles.GameDetailRateFiligree}>Rate</Text>
        </PressableScale>
        <PressableScale
          onPress={shareTitle}
          accessibilityRole="button"
          accessibilityLabel={`Share ${title.title}`}
          style={styles.GameDetailPlayCell}
          contentStyle={styles.GameDetailPlayPortico}>
          <Text style={styles.GameDetailPlayFiligree}>Share</Text>
        </PressableScale>
      </FadeIn>

      <RateSheet
        visible={ratingOpen}
        title={title}
        initial={library.ratings[title.id]}
        onClose={() => setRatingOpen(false)}
        onSubmit={rating => {
          library.rateTitle(title.id, rating);
          setRatingOpen(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  GameDetailFacetChassis: {
    backgroundColor: colors.background,
    flex: 1,
  },

  GameDetailHeroPortico: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  GameDetailHeroSigil: {
    ...StyleSheet.absoluteFill,
  },
  GameDetailHeroVeil: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(4, 7, 15, 0.12)',
  },
  GameDetailTopLintel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 3,
  },
  GameDetailGhostPortico: {
    alignItems: 'center',
    backgroundColor: 'rgba(4, 7, 15, 0.78)',
    borderColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    height: 36,
    paddingHorizontal: 12,
  },

  GameDetailIconPortico: {
    alignItems: 'center',
    backgroundColor: 'rgba(4, 7, 15, 0.78)',
    borderColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: 14,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },

  GameDetailGhostSigil: {
    height: 14,
    tintColor: colors.white,
    width: 14,
  },

  GameDetailIdleSigil: {
    tintColor: 'rgba(234, 240, 250, 0.72)',
  },
  GameDetailSavedSigil: {
    tintColor: colors.accent,
  },
  GameDetailGhostFiligree: {
    color: colors.white,
    fontFamily: fonts.sansRegular,
    fontSize: 14,
  },

  GameDetailHeroCopy: {
    paddingBottom: 22,
    zIndex: 3,
  },

  GameDetailBadgePortico: {
    alignSelf: 'flex-start',
    backgroundColor: colors.featuredBadge,
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  GameDetailBadgeFiligree: {
    color: colors.buttonText,
    fontFamily: fonts.sansBold,
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  GameDetailTitleFiligree: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.4,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 8,
  },

  GameDetailMetaFiligree: {
    color: colors.white,
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    marginTop: 6,
    opacity: 0.95,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 6,
  },

  GameDetailStatsLintel: {
    flexDirection: 'row',
    gap: 10,
  },

  GameDetailStatPortico: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  GameDetailStatValue: {
    fontFamily: fonts.sansBold,
    fontSize: 22,
    fontWeight: '700',
  },
  GameDetailStatLabel: {
    color: colors.bodyFaint,
    fontFamily: fonts.sansRegular,
    fontSize: 11,
    marginTop: 4,
  },

  GameDetailBodyFiligree: {
    color: colors.body,
    fontFamily: fonts.sansRegular,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 18,
  },
  GameDetailSectionFiligree: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 24,
  },
  GameDetailTraitsEnclave: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  GameDetailTraitPortico: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    width: '48%',
  },
  GameDetailTraitLabel: {
    color: colors.bodyFaint,
    fontFamily: fonts.sansRegular,
    fontSize: 11,
  },

  GameDetailTraitValue: {
    color: colors.white,
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },

  GameDetailFooter: {
    backgroundColor: colors.background,
    borderTopColor: colors.cardBorderMuted,
    borderTopWidth: StyleSheet.hairlineWidth,
    bottom: 0,
    flexDirection: 'row',
    gap: 10,
    left: 0,
    paddingTop: 12,
    position: 'absolute',
    right: 0,
  },
  GameDetailRateCell: {
    width: 108,
  },

  GameDetailRatePortico: {
    backgroundColor: colors.cardMuted,
    borderColor: colors.cardBorderIdle,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    height: 54,
    width: 108,
  },

  GameDetailRateStar: {
    color: colors.star,
    fontSize: 16,
  },
  GameDetailRateFiligree: {
    color: colors.ivory,
    fontFamily: fonts.sansRegular,
    fontSize: 15,
  },

  GameDetailPlayCell: {
    flex: 1,
  },
  GameDetailPlayPortico: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    height: 54,
    shadowColor: colors.accentGlow,
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 1,
    shadowRadius: 15,
    width: '100%',
  },

  GameDetailPlayFiligree: {
    color: colors.buttonText,
    fontFamily: fonts.sansRegular,
    fontSize: 16.5,
  },
});
