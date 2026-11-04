import React, {useMemo, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {CompositeNavigationProp} from '@react-navigation/native';
import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {PressableScale} from '../../components/buttons/PressableScale';
import {PrimaryButton} from '../../components/buttons/PrimaryButton';
import {CapsuleBarChart} from '../../components/charts/CapsuleBarChart';
import {ScreenAmbient} from '../../components/layout/ScreenAmbient';
import {CoverArt} from '../../components/media/CoverArt';
import {FadeIn} from '../../components/motion/FadeIn';
import {RateSheet} from '../../components/sheets/RateSheet';
import {colors, fonts} from '../../constants/theme';
import type {CatalogueTitle} from '../../data/pack';
import {
  buildRatingsModel,
  formatRatedAgo,
  formatRatedDate,
  starGlyph,
  type RatedEntry,
} from '../../data/ratings';
import {useAdaptive} from '../../hooks/useAdaptive';
import {usePack} from '../../routing/PackContext';
import {useLibrary} from '../../routing/LibraryContext';
import {tabBarOverlayHeight} from '../../routing/tabBarLayout';
import type {MainTabParamList, MainStackParamList} from '../../routing/types';

type RatingsNav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Ratings'>,
  NativeStackNavigationProp<MainStackParamList>
>;

export function RatingsScreen() {
  const insets = useSafeAreaInsets();
  const adaptive = useAdaptive();
  const navigation = useNavigation<RatingsNav>();
  const {titles, featured} = usePack();
  const library = useLibrary();
  const [rateTarget, setRateTarget] = useState<CatalogueTitle | null>(null);
  const pad = adaptive.scale(20);
  const chartWidth = adaptive.width - pad * 2 - 32;
  const model = useMemo(
    () => buildRatingsModel(titles, library.ratings),
    [library.ratings, titles],
  );
  const empty = model.count === 0;
  const filledHero = Math.min(5, Math.max(0, Math.floor(model.avg)));

  const openTitle = (id: string) => navigation.navigate('GameDetail', {id});

  return (
    <ScreenAmbient opacity={0.28}>
      {empty ? (
        <View
          style={[
            styles.RatingsScreenEmptyChassis,
            {
              paddingHorizontal: pad,
              paddingTop: insets.top + 16,
              paddingBottom: tabBarOverlayHeight(insets.bottom) + 16,
            },
          ]}>
          <FadeIn>
            <Text style={styles.RatingsScreenTitleFiligree}>My Ratings</Text>
          </FadeIn>
          <FadeIn delay={80} style={styles.RatingsScreenEmptyEnclave}>
            <View style={styles.RatingsScreenStarPortico}>
              <Text style={styles.RatingsScreenStarGlyph}>★</Text>
            </View>
            <Text style={styles.RatingsScreenEmptyTitle}>No ratings yet</Text>
            <Text style={styles.RatingsScreenEmptyBody}>
              Open any game and tap Rate to score it from 1 to 5 stars. Your
              distribution, trends and community comparison appear here.
            </Text>
            <PrimaryButton
              label="Rate your first game"
              onPress={() => setRateTarget(featured)}
              style={styles.RatingsScreenEmptyAction}
            />
          </FadeIn>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: pad,
            paddingTop: insets.top + 16,
            paddingBottom: tabBarOverlayHeight(insets.bottom) + 16,
          }}>
          <FadeIn>
            <Text style={styles.RatingsScreenTitleFiligree}>My Ratings</Text>
          </FadeIn>

          <FadeIn delay={40} style={styles.RatingsScreenHeroPortico}>
            <View style={styles.RatingsScreenHeroScore}>
              <Text style={styles.RatingsScreenHeroValue}>
                {model.avg.toFixed(1)}
              </Text>
              <Text style={styles.RatingsScreenHeroStars}>
                {'★'.repeat(filledHero)}
                <Text style={styles.RatingsScreenHeroStarsDim}>
                  {'★'.repeat(5 - filledHero)}
                </Text>
              </Text>
            </View>
            <View style={styles.RatingsScreenHeroCopy}>
              <Text style={styles.RatingsScreenHeroLabel}>
                Your personal average
              </Text>
              <Text style={styles.RatingsScreenHeroMeta}>
                Across {model.count} rated game
                {model.count === 1 ? '' : 's'}
                {model.vsCatalogue
                  ? ` · ${
                      model.vsCatalogue >= 0 ? '+' : ''
                    }${model.vsCatalogue.toFixed(2)} vs pack avg`
                  : ''}
              </Text>
            </View>
          </FadeIn>

          <FadeIn delay={80} style={styles.RatingsScreenKpiLintel}>
            <View style={styles.RatingsScreenKpiPortico}>
              <Text style={styles.RatingsScreenKpiLabel}>Games rated</Text>
              <Text style={styles.RatingsScreenKpiValue}>{model.count}</Text>
            </View>
            <View style={styles.RatingsScreenKpiPortico}>
              <Text style={styles.RatingsScreenKpiLabel}>Your average</Text>
              <Text
                style={[
                  styles.RatingsScreenKpiValue,
                  styles.RatingsScreenKpiGold,
                ]}>
                {model.avg.toFixed(1)}
              </Text>
            </View>
          </FadeIn>

          <FadeIn delay={120} style={styles.RatingsScreenCardPortico}>
            <Text style={styles.RatingsScreenCardTitle}>
              Your rating distribution
            </Text>
            <View style={styles.RatingsScreenDistEnclave}>
              {model.distribution.map(bucket => (
                <View key={bucket.stars} style={styles.RatingsScreenDistRow}>
                  <Text style={styles.RatingsScreenDistStar}>
                    {bucket.stars}★
                  </Text>
                  <View style={styles.RatingsScreenDistTrack}>
                    <View
                      style={[
                        styles.RatingsScreenDistFill,
                        {
                          width: `${Math.max(
                            bucket.count ? 4 : 0,
                            (bucket.count / model.distMax) * 100,
                          )}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.RatingsScreenDistMeta}>
                    {bucket.count} · {bucket.pct}%
                  </Text>
                </View>
              ))}
            </View>
          </FadeIn>

          {model.categories.length > 0 ? (
            <FadeIn delay={160} style={styles.RatingsScreenCardPortico}>
              <View style={styles.RatingsScreenCardHeader}>
                <Text
                  style={[
                    styles.RatingsScreenCardTitle,
                    styles.RatingsScreenCardTitleFlush,
                  ]}>
                  You vs community
                </Text>
                <Text style={styles.RatingsScreenCardHint}>by category</Text>
              </View>
              <View style={styles.RatingsScreenLegendRow}>
                <View style={styles.RatingsScreenLegendSwatch} />
                <Text style={styles.RatingsScreenLegendLabel}>You</Text>
              </View>
              {model.categories.map(item => (
                <View key={item.label} style={styles.RatingsScreenCatRow}>
                  <View style={styles.RatingsScreenCatHeader}>
                    <Text style={styles.RatingsScreenCatLabel}>
                      {item.label}
                    </Text>
                    <Text style={styles.RatingsScreenCatValue}>
                      {item.avg.toFixed(1)}
                    </Text>
                  </View>
                  <View style={styles.RatingsScreenCatTrack}>
                    <View
                      style={[
                        styles.RatingsScreenCatFill,
                        {width: `${(item.avg / 5) * 100}%`},
                      ]}
                    />
                  </View>
                </View>
              ))}
            </FadeIn>
          ) : null}

          {model.favorites.length > 0 ? (
            <FadeIn delay={200}>
              <Text style={styles.RatingsScreenSectionFiligree}>
                Favourite categories by rating
              </Text>
              <View style={styles.RatingsScreenChipEnclave}>
                {model.favorites.map(item => (
                  <View
                    key={item.label}
                    style={styles.RatingsScreenChipPortico}>
                    <Text style={styles.RatingsScreenChipLabel}>
                      {item.label}
                    </Text>
                    <Text style={styles.RatingsScreenChipValue}>
                      ★ {item.avg.toFixed(1)}
                    </Text>
                  </View>
                ))}
              </View>
            </FadeIn>
          ) : null}

          <FadeIn delay={240} style={styles.RatingsScreenCardPortico}>
            <View style={styles.RatingsScreenCardHeader}>
              <Text
                style={[
                  styles.RatingsScreenCardTitle,
                  styles.RatingsScreenCardTitleFlush,
                ]}>
                Personal rating trend
              </Text>
              <Text style={styles.RatingsScreenTrendDelta}>
                {`${model.trendDelta >= 0 ? '+' : ''}${model.trendDelta.toFixed(
                  1,
                )} vs Q1`}
              </Text>
            </View>
            <TrendBars months={model.months} />
          </FadeIn>

          <RatedSection
            delay={280}
            title="Your highest rated"
            entries={model.highest}
            metaFor={entry =>
              `${entry.title.category} · rated ${formatRatedDate(
                entry.rating.ratedAt,
              )}`
            }
            onPress={openTitle}
          />
          <RatedSection
            delay={320}
            title="Your lowest rated"
            entries={model.lowest}
            metaFor={entry =>
              `${entry.title.category} · rated ${formatRatedDate(
                entry.rating.ratedAt,
              )}`
            }
            onPress={openTitle}
          />
          <RatedSection
            delay={360}
            title="Recently rated"
            compact
            entries={model.recent}
            metaFor={entry =>
              `Rated ${entry.rating.stars}★ · ${formatRatedAgo(
                entry.rating.ratedAt,
              )}`
            }
            onPress={openTitle}
          />
        </ScrollView>
      )}

      <RateSheet
        visible={Boolean(rateTarget)}
        title={rateTarget}
        initial={rateTarget ? library.ratings[rateTarget.id] : undefined}
        onClose={() => setRateTarget(null)}
        onSubmit={rating => {
          if (rateTarget) {
            library.rateTitle(rateTarget.id, rating);
          }
          setRateTarget(null);
        }}
      />
    </ScreenAmbient>
  );
}

function TrendBars({
  months,
}: {
  months: Array<{label: string; value: number; highlighted: boolean}>;
}) {
  return (
    <CapsuleBarChart
      height={84}
      maxValue={5}
      data={months.map(month => ({
        value: month.value,
        label: month.label,
        highlighted: month.highlighted && month.value > 0,
      }))}
    />
  );
}

function RatedSection({
  title,
  entries,
  metaFor,
  onPress,
  delay,
  compact = false,
}: {
  title: string;
  entries: RatedEntry[];
  metaFor: (entry: RatedEntry) => string;
  onPress: (id: string) => void;
  delay: number;
  compact?: boolean;
}) {
  if (entries.length === 0) {
    return null;
  }

  return (
    <FadeIn delay={delay}>
      <Text style={styles.RatingsScreenSectionFiligree}>{title}</Text>
      <View style={styles.RatingsScreenListEnclave}>
        {entries.map(entry => (
          <PressableScale
            key={entry.title.id}
            onPress={() => onPress(entry.title.id)}
            accessibilityRole="button"
            accessibilityLabel={`${entry.title.title}, your rating ${entry.rating.stars} stars`}
            style={styles.RatingsScreenRowCell}
            contentStyle={[
              styles.RatingsScreenRowPortico,
              compact && styles.RatingsScreenRowCompact,
            ]}>
            <CoverArt
              source={entry.title.art}
              style={
                compact
                  ? styles.RatingsScreenRowThumbCompact
                  : styles.RatingsScreenRowThumb
              }
            />
            <View style={styles.RatingsScreenRowCopy}>
              <Text
                numberOfLines={1}
                style={styles.RatingsScreenRowTitleFiligree}>
                {entry.title.title}
              </Text>
              <Text
                numberOfLines={1}
                style={styles.RatingsScreenRowMetaFiligree}>
                {metaFor(entry)}
              </Text>
            </View>
            <Text style={styles.RatingsScreenRowStars}>
              {starGlyph(entry.rating.stars)}
            </Text>
          </PressableScale>
        ))}
      </View>
    </FadeIn>
  );
}

const styles = StyleSheet.create({
  RatingsScreenEmptyChassis: {
    flex: 1,
  },
  RatingsScreenTitleFiligree: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.9,
  },

  RatingsScreenEmptyEnclave: {
    alignItems: 'center',
    alignSelf: 'stretch',
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 48,
  },

  RatingsScreenStarPortico: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 199, 97, 0.08)',
    borderColor: 'rgba(255, 199, 97, 0.22)',
    borderRadius: 34,
    borderWidth: 1,
    height: 106,
    justifyContent: 'center',
    marginBottom: 20,
    width: 106,
  },

  RatingsScreenStarGlyph: {
    color: colors.star,
    fontSize: 40,
    lineHeight: 47,
    textAlign: 'center',
  },
  RatingsScreenEmptyTitle: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.22,
    textAlign: 'center',
  },

  RatingsScreenEmptyBody: {
    color: colors.bodySoft,
    fontFamily: fonts.sansRegular,
    fontSize: 14,
    lineHeight: 21.7,
    marginBottom: 22,
    marginTop: 10,
    textAlign: 'center',
  },
  RatingsScreenEmptyAction: {
    height: 52,
    width: '100%',
  },

  RatingsScreenHeroPortico: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 199, 97, 0.08)',
    borderColor: 'rgba(255, 199, 97, 0.22)',
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 16,
    minHeight: 106,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  RatingsScreenHeroScore: {
    alignItems: 'center',
    width: 78,
  },

  RatingsScreenHeroValue: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 44,
    fontWeight: '700',
    letterSpacing: -1.32,
  },

  RatingsScreenHeroStars: {
    color: colors.star,
    fontFamily: fonts.sansRegular,
    fontSize: 14,
    letterSpacing: 1.12,
    marginTop: 4,
  },

  RatingsScreenHeroStarsDim: {
    color: 'rgba(255, 199, 97, 0.3)',
  },

  RatingsScreenHeroCopy: {
    flex: 1,
    marginLeft: 18,
  },

  RatingsScreenHeroLabel: {
    color: colors.white,
    fontFamily: fonts.sansRegular,
    fontSize: 13.5,
  },
  RatingsScreenHeroMeta: {
    color: colors.bodyMuted,
    fontFamily: fonts.sansRegular,
    fontSize: 11.5,
    lineHeight: 17.25,
    marginTop: 4,
  },
  RatingsScreenKpiLintel: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 14,
  },

  RatingsScreenKpiPortico: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    minHeight: 68,
    paddingHorizontal: 12,
    paddingVertical: 13,
  },
  RatingsScreenKpiLabel: {
    color: colors.bodyFaint,
    fontFamily: fonts.sansRegular,
    fontSize: 10.5,
  },

  RatingsScreenKpiValue: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 5,
  },

  RatingsScreenKpiGold: {
    color: colors.star,
  },

  RatingsScreenCardPortico: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 16,
    padding: 16,
  },

  RatingsScreenCardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  RatingsScreenCardTitle: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },

  RatingsScreenCardTitleFlush: {
    marginBottom: 0,
  },

  RatingsScreenCardHint: {
    color: colors.bodyFaint,
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    fontWeight: '500',
  },

  RatingsScreenDistEnclave: {
    gap: 15,
  },

  RatingsScreenDistRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },

  RatingsScreenDistStar: {
    color: colors.star,
    fontFamily: fonts.sansRegular,
    fontSize: 11,
    width: 32,
  },

  RatingsScreenDistTrack: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 5,
    flex: 1,
    height: 9,
    marginRight: 8,
    overflow: 'hidden',
  },
  RatingsScreenDistFill: {
    backgroundColor: colors.star,
    borderRadius: 5,
    height: 9,
  },

  RatingsScreenDistMeta: {
    color: colors.bodyFaint,
    fontFamily: fonts.sansMedium,
    fontSize: 10.5,
    fontWeight: '500',
    textAlign: 'right',
    width: 56,
  },
  RatingsScreenLegendRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  RatingsScreenLegendSwatch: {
    backgroundColor: colors.star,
    borderRadius: 2,
    height: 8,
    width: 8,
  },

  RatingsScreenLegendLabel: {
    color: colors.bodyFaint,
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    fontWeight: '500',
  },

  RatingsScreenCatRow: {
    marginBottom: 14,
  },

  RatingsScreenCatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  RatingsScreenCatLabel: {
    color: 'rgba(234, 240, 250, 0.62)',
    fontFamily: fonts.sansMedium,
    fontSize: 11.5,
    fontWeight: '500',
  },

  RatingsScreenCatValue: {
    color: colors.white,
    fontFamily: fonts.sansRegular,
    fontSize: 11.5,
  },

  RatingsScreenCatTrack: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 3,
    height: 6,
    overflow: 'hidden',
  },
  RatingsScreenCatFill: {
    backgroundColor: colors.star,
    borderRadius: 3,
    height: 6,
  },

  RatingsScreenSectionFiligree: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.17,
    marginBottom: 11,
    marginTop: 18,
  },

  RatingsScreenChipEnclave: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },

  RatingsScreenChipPortico: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  RatingsScreenChipLabel: {
    color: colors.ivory,
    fontFamily: fonts.sansRegular,
    fontSize: 12.5,
  },
  RatingsScreenChipValue: {
    color: colors.star,
    fontFamily: fonts.sansRegular,
    fontSize: 11.5,
  },
  RatingsScreenTrendDelta: {
    color: colors.gain,
    fontFamily: fonts.sansRegular,
    fontSize: 12,
  },
  RatingsScreenListEnclave: {
    gap: 9,
  },
  RatingsScreenRowCell: {
    width: '100%',
  },

  RatingsScreenRowPortico: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    height: 74,
    paddingHorizontal: 10,
    width: '100%',
  },

  RatingsScreenRowCompact: {
    height: 68,
  },
  RatingsScreenRowThumb: {
    borderRadius: 11,
    height: 52,
    width: 52,
  },
  RatingsScreenRowThumbCompact: {
    borderRadius: 11,
    height: 46,
    width: 46,
  },

  RatingsScreenRowCopy: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  RatingsScreenRowTitleFiligree: {
    color: colors.white,
    fontFamily: fonts.sansRegular,
    fontSize: 14,
  },
  RatingsScreenRowMetaFiligree: {
    color: colors.bodyFaint,
    fontFamily: fonts.sansRegular,
    fontSize: 11,
    marginTop: 3,
  },

  RatingsScreenRowStars: {
    color: colors.star,
    fontFamily: fonts.sansRegular,
    fontSize: 12.5,
    letterSpacing: 0.75,
  },
});
