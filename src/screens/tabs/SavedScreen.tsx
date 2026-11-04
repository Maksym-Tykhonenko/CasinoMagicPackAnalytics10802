import React, {useCallback, useMemo, useState} from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {useNavigation} from '@react-navigation/native';
import type {CompositeNavigationProp} from '@react-navigation/native';
import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {PieChart} from 'react-native-gifted-charts';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {PressableScale} from '../../components/buttons/PressableScale';
import {PrimaryButton} from '../../components/buttons/PrimaryButton';
import {ScreenAmbient} from '../../components/layout/ScreenAmbient';
import {CoverArt} from '../../components/media/CoverArt';
import {CoverFade} from '../../components/media/CoverFade';
import {FadeIn} from '../../components/motion/FadeIn';
import {FiltersSheet} from '../../components/sheets/FiltersSheet';
import {colors, fonts} from '../../constants/theme';
import {icons} from '../../data/assets';
import {CATEGORY_TONES} from '../../data/analytics';
import type {CatalogueTitle} from '../../data/pack';
import {
  applyFilters,
  buildFilterOptions,
  countActiveFilters,
  DEFAULT_FILTERS,
  searchTitles,
} from '../../data/filters';
import {useAdaptive} from '../../hooks/useAdaptive';
import {usePack} from '../../routing/PackContext';
import {useLibrary} from '../../routing/LibraryContext';
import {tabBarOverlayHeight} from '../../routing/tabBarLayout';
import type {MainTabParamList, MainStackParamList} from '../../routing/types';

type SavedNav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Saved'>,
  NativeStackNavigationProp<MainStackParamList>
>;

function viewsFor(title: CatalogueTitle) {
  return Math.max(1, Math.round(title.popularity / 8));
}

function starLine(rating: number) {
  const filled = Math.min(5, Math.max(0, Math.round(rating)));
  return `${'★'.repeat(filled)}${'☆'.repeat(5 - filled)}`;
}

function formatSavedAgo(at?: number) {
  if (!at) {
    return 'saved just now';
  }
  const minutes = Math.max(1, Math.round((Date.now() - at) / 60000));
  if (minutes < 60) {
    return `saved ${minutes}m ago`;
  }
  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `saved ${hours}h ago`;
  }
  const days = Math.round(hours / 24);
  if (days === 1) {
    return 'saved yesterday';
  }
  return `saved ${days} days ago`;
}

export function SavedScreen() {
  const insets = useSafeAreaInsets();
  const adaptive = useAdaptive();
  const navigation = useNavigation<SavedNav>();
  const {titles} = usePack();
  const library = useLibrary();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showingAll, setShowingAll] = useState(false);
  const pad = adaptive.scale(20);
  const tileWidth = adaptive.scale(130);
  const tileHeight = adaptive.verticalScale(150);
  const activeCount = countActiveFilters(filters);

  const savedTitles = useMemo(() => {
    const byId = new Map(titles.map(title => [title.id, title]));
    return library.savedIds
      .map(id => byId.get(id))
      .filter((title): title is CatalogueTitle => Boolean(title));
  }, [library.savedIds, titles]);

  const filterOptions = useMemo(() => buildFilterOptions(titles), [titles]);

  const visible = useMemo(
    () =>
      applyFilters(
        searchTitles(savedTitles, query),
        filters,
        library.savedIds,
        library.ratedIds,
      ),
    [filters, library.ratedIds, library.savedIds, query, savedTitles],
  );

  const collectionEmpty = savedTitles.length === 0;
  const trimmed = query.trim();
  const searching = trimmed.length > 0;
  const recent = showingAll ? visible : visible.slice(0, 3);
  const highest = useMemo(
    () => [...visible].sort((left, right) => right.rating - left.rating),
    [visible],
  );
  const played = useMemo(() => {
    const ranked = [...visible].sort(
      (left, right) => viewsFor(right) - viewsFor(left),
    );
    return ranked.slice(0, 4);
  }, [visible]);
  const maxViews = Math.max(1, ...played.map(viewsFor));

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    visible.forEach(title => {
      counts.set(title.category, (counts.get(title.category) ?? 0) + 1);
    });
    return [...counts.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 4)
      .map(([label, count], index) => ({
        label,
        count,
        tint:
          CATEGORY_TONES[index] ?? CATEGORY_TONES[CATEGORY_TONES.length - 1],
      }));
  }, [visible]);

  const avgRating =
    visible.length === 0
      ? 0
      : visible.reduce((sum, title) => sum + title.rating, 0) / visible.length;
  const sessions = visible.reduce((sum, title) => sum + viewsFor(title), 0);
  const renderDonutLabel = useCallback(
    () => <SavedDonutLabel count={visible.length} />,
    [visible.length],
  );

  const openTitle = (id: string) => navigation.navigate('GameDetail', {id});

  return (
    <ScreenAmbient opacity={0.28}>
      <ScrollView
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.SavedScreenScrollContent,
          {
            paddingBottom: tabBarOverlayHeight(insets.bottom) + 16,
            paddingHorizontal: pad,
            paddingTop: insets.top + 16,
          },
        ]}>
        <FadeIn style={styles.SavedScreenTitleLintel}>
          <Text style={styles.SavedScreenTitleFiligree}>Saved</Text>
          <Text
            style={[
              styles.SavedScreenCountFiligree,
              !collectionEmpty && styles.SavedScreenCountActive,
            ]}>
            {savedTitles.length.toLocaleString()} games
          </Text>
        </FadeIn>

        {collectionEmpty ? (
          <FadeIn delay={60} style={styles.SavedScreenEmptyEnclave}>
            <Image
              source={icons.hollow}
              style={styles.SavedScreenEmptySigil}
              resizeMode="contain"
            />
            <Text style={styles.SavedScreenEmptyTitle}>
              Your collection is empty
            </Text>
            <Text style={styles.SavedScreenEmptyBody}>
              Tap the bookmark on any game card to save it here. Saved games
              get their own ratings, statistics and category breakdown.
            </Text>
            <PrimaryButton
              label="Explore games"
              onPress={() => navigation.navigate('Explore')}
              style={styles.SavedScreenEmptyAction}
            />
          </FadeIn>
        ) : (
          <>
            <FadeIn delay={60} style={styles.SavedScreenSearchLintel}>
              <View
                style={[
                  styles.SavedScreenSearchPortico,
                  focused && styles.SavedScreenSearchFocused,
                ]}>
                <Image
                  source={icons.seek}
                  style={styles.SavedScreenSeekSigil}
                  resizeMode="contain"
                />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="search"
                  underlineColorAndroid="transparent"
                  placeholder="Search saved"
                  placeholderTextColor="rgba(234, 240, 250, 0.4)"
                  selectionColor={colors.accent}
                  accessibilityLabel="Search saved games"
                  accessibilityRole="search"
                  style={styles.SavedScreenInput}
                />
              </View>
              <PressableScale
                onPress={() => setFiltersOpen(true)}
                accessibilityRole="button"
                accessibilityLabel="Open filters"
                contentStyle={styles.SavedScreenFilterPortico}>
                <Image
                  source={icons.winnow}
                  accessibilityElementsHidden
                  importantForAccessibility="no"
                  style={styles.SavedScreenFilterSigil}
                  resizeMode="contain"
                />
                {activeCount > 0 ? (
                  <View style={styles.SavedScreenBadgePortico}>
                    <Text style={styles.SavedScreenBadgeFiligree}>
                      {activeCount}
                    </Text>
                  </View>
                ) : null}
              </PressableScale>
            </FadeIn>

            {searching && visible.length === 0 ? (
              <FadeIn delay={80} style={styles.SavedScreenStatusEnclave}>
                <Text style={styles.SavedScreenStatusFiligree}>
                  Nothing saved matches “{trimmed}”.
                </Text>
              </FadeIn>
            ) : null}

            {!searching ? (
              <FadeIn delay={80} style={styles.SavedScreenPulseLintel}>
                <View style={styles.SavedScreenPulsePortico}>
                  <Text style={styles.SavedScreenPulseLabelFiligree}>
                    Collection avg
                  </Text>
                  <Text
                    style={[
                      styles.SavedScreenPulseValueFiligree,
                      styles.SavedScreenPulseStar,
                    ]}>
                    {avgRating.toFixed(1)}
                  </Text>
                </View>
                <View style={styles.SavedScreenPulsePortico}>
                  <Text style={styles.SavedScreenPulseLabelFiligree}>
                    Categories
                  </Text>
                  <Text style={styles.SavedScreenPulseValueFiligree}>
                    {categories.length}
                  </Text>
                </View>
                <View style={styles.SavedScreenPulsePortico}>
                  <Text style={styles.SavedScreenPulseLabelFiligree}>
                    Game sessions
                  </Text>
                  <Text
                    style={[
                      styles.SavedScreenPulseValueFiligree,
                      styles.SavedScreenPulseInterest,
                    ]}>
                    {sessions}
                  </Text>
                </View>
              </FadeIn>
            ) : null}

            {visible.length > 0 ? (
              <>
                <FadeIn delay={100} style={styles.SavedScreenSectionLintel}>
                  <Text style={styles.SavedScreenSectionFiligree}>
                    {searching ? 'Matching Saved' : 'Recently Saved'}
                  </Text>
                  {!searching && visible.length > 3 ? (
                    <Pressable
                      onPress={() => setShowingAll(current => !current)}
                      accessibilityRole="button"
                      accessibilityLabel={
                        showingAll ? 'Show less saved games' : 'View all saved games'
                      }>
                      <Text style={styles.SavedScreenViewAllFiligree}>
                        {showingAll ? 'Show less' : 'View All'}
                      </Text>
                    </Pressable>
                  ) : null}
                </FadeIn>

                <View style={styles.SavedScreenListEnclave}>
                  {(searching ? visible : recent).map((title, index) => (
                    <FadeIn
                      key={title.id}
                      delay={120 + index * 40}
                      style={styles.SavedScreenRowCell}>
                      <SavedRow
                        title={title}
                        savedAgo={formatSavedAgo(library.savedAt[title.id])}
                        onPress={() => openTitle(title.id)}
                        onRemove={() => library.toggleSaved(title.id)}
                      />
                    </FadeIn>
                  ))}
                </View>
              </>
            ) : null}

            {!searching && highest.length > 0 ? (
              <>
                <Text
                  style={[
                    styles.SavedScreenSectionFiligree,
                    styles.SavedScreenSectionOffset,
                  ]}>
                  Highest Rated in Collection
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.SavedScreenRailEnclave}>
                  {highest.map(title => (
                    <PressableScale
                      key={title.id}
                      onPress={() => openTitle(title.id)}>
                      <RatedCard
                        title={title}
                        width={tileWidth}
                        height={tileHeight}
                        onSave={() => library.toggleSaved(title.id)}
                      />
                    </PressableScale>
                  ))}
                </ScrollView>
              </>
            ) : null}

            {!searching && played.length > 0 ? (
              <>
                <Text
                  style={[
                    styles.SavedScreenSectionFiligree,
                    styles.SavedScreenSectionOffset,
                  ]}>
                  Most Popular Saved
                </Text>
                <View style={styles.SavedScreenPlayedPortico}>
                  {played.map(title => (
                    <PlayedRow
                      key={title.id}
                      title={title}
                      maxViews={maxViews}
                    />
                  ))}
                </View>
              </>
            ) : null}

            {!searching && categories.length > 0 ? (
              <>
                <Text
                  style={[
                    styles.SavedScreenSectionFiligree,
                    styles.SavedScreenSectionOffset,
                  ]}>
                  Saved by Category
                </Text>
                <View style={styles.SavedScreenCategoryPortico}>
                  <PieChart
                    data={categories.map(item => ({
                      value: item.count,
                      color: item.tint,
                    }))}
                    donut
                    radius={38}
                    innerRadius={28}
                    innerCircleColor="#080c15"
                    backgroundColor="transparent"
                    isAnimated={false}
                    centerLabelComponent={renderDonutLabel}
                  />
                  <View style={styles.SavedScreenLegendEnclave}>
                    {categories.map(item => (
                      <View
                        key={item.label}
                        style={styles.SavedScreenLegendRow}>
                        <View
                          style={[
                            styles.SavedScreenLegendSwatch,
                            {backgroundColor: item.tint},
                          ]}
                        />
                        <Text
                          numberOfLines={1}
                          style={styles.SavedScreenLegendFiligree}>
                          {item.label}
                        </Text>
                        <Text style={styles.SavedScreenLegendCountFiligree}>
                          {item.count}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </>
            ) : null}
          </>
        )}
      </ScrollView>

      <FiltersSheet
        visible={filtersOpen}
        filters={filters}
        options={filterOptions}
        matchCount={visible.length}
        onChange={setFilters}
        onClose={() => setFiltersOpen(false)}
        onApply={() => setFiltersOpen(false)}
      />
    </ScreenAmbient>
  );
}

function SavedDonutLabel({count}: {count: number}) {
  return (
    <View style={styles.SavedScreenDonutCenter}>
      <Text style={styles.SavedScreenDonutValueFiligree}>{count}</Text>
      <Text style={styles.SavedScreenDonutLabelFiligree}>SAVED</Text>
    </View>
  );
}

function SavedRow({
  title,
  savedAgo,
  onPress,
  onRemove,
}: {
  title: CatalogueTitle;
  savedAgo: string;
  onPress: () => void;
  onRemove: () => void;
}) {
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title.title}, saved ${savedAgo}`}
      contentStyle={styles.SavedScreenRowPortico}>
      <CoverArt source={title.art} style={styles.SavedScreenThumbSigil} />
      <View style={styles.SavedScreenRowCopy}>
        <Text numberOfLines={1} style={styles.SavedScreenRowTitleFiligree}>
          {title.title}
        </Text>
        <Text numberOfLines={1} style={styles.SavedScreenRowMetaFiligree}>
          {title.category} · {savedAgo}
        </Text>
        <View style={styles.SavedScreenRowMetaLintel}>
          <Text style={styles.SavedScreenStarFiligree}>
            ★ {title.rating.toFixed(1)}
          </Text>
          <View style={styles.SavedScreenViewsPortico}>
            <Text style={styles.SavedScreenViewsFiligree}>
              {viewsFor(title)} views
            </Text>
          </View>
        </View>
      </View>
      <PressableScale
        onPress={onRemove}
        accessibilityRole="button"
        accessibilityLabel={`Remove ${title.title} from saved`}
        contentStyle={styles.SavedScreenRemovePortico}>
        <Image
          source={icons.ribbon}
          accessibilityElementsHidden
          importantForAccessibility="no"
          style={styles.SavedScreenRemoveSigil}
          resizeMode="contain"
        />
        <Text style={styles.SavedScreenRemoveFiligree}>Remove</Text>
      </PressableScale>
    </PressableScale>
  );
}

function RatedCard({
  title,
  width,
  height,
  onSave,
}: {
  title: CatalogueTitle;
  width: number;
  height: number;
  onSave: () => void;
}) {
  return (
    <View style={[styles.SavedScreenTilePortico, {width, height}]}>
      <CoverArt source={title.art} style={styles.SavedScreenTileSigil} />
      <CoverFade height={112} />
      <PressableScale
        onPress={onSave}
        accessibilityRole="button"
        accessibilityLabel={`Save ${title.title}`}
        style={styles.SavedScreenTileRibbonHit}
        contentStyle={styles.SavedScreenTileRibbonPortico}>
        <Image
          source={icons.ribbon}
          accessibilityElementsHidden
          importantForAccessibility="no"
          style={styles.SavedScreenTileRibbonSigil}
          resizeMode="contain"
        />
      </PressableScale>
      <View style={styles.SavedScreenTileCopy}>
        <Text numberOfLines={1} style={styles.SavedScreenTileTitleFiligree}>
          {title.title}
        </Text>
        <Text style={styles.SavedScreenTileStarsFiligree}>
          {starLine(title.rating)}
        </Text>
      </View>
    </View>
  );
}

function PlayedRow({
  title,
  maxViews,
}: {
  title: CatalogueTitle;
  maxViews: number;
}) {
  const views = viewsFor(title);
  return (
    <View style={styles.SavedScreenPlayedRow}>
      <View style={styles.SavedScreenPlayedLintel}>
        <Text numberOfLines={1} style={styles.SavedScreenPlayedTitleFiligree}>
          {title.title}
        </Text>
        <Text style={styles.SavedScreenPlayedCountFiligree}>
          {views} views
        </Text>
      </View>
      <View style={styles.SavedScreenPlayedTrack}>
        <View
          style={[
            styles.SavedScreenPlayedFill,
            {width: `${Math.max(8, (views / maxViews) * 100)}%`},
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  SavedScreenScrollContent: {
    flexGrow: 1,
  },

  SavedScreenTitleLintel: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  SavedScreenTitleFiligree: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.9,
  },
  SavedScreenCountFiligree: {
    color: 'rgba(234, 240, 250, 0.4)',
    fontFamily: fonts.sansRegular,
    fontSize: 12.5,
    paddingBottom: 4,
  },
  SavedScreenCountActive: {
    color: colors.interest,
  },

  SavedScreenEmptyEnclave: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 48,
    paddingHorizontal: 12,
  },

  SavedScreenEmptySigil: {
    height: 106,
    width: 106,
  },

  SavedScreenEmptyTitle: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.22,
    marginTop: 20,
    textAlign: 'center',
  },

  SavedScreenEmptyBody: {
    color: colors.bodySoft,
    fontFamily: fonts.sansRegular,
    fontSize: 14,
    lineHeight: 21.7,
    marginTop: 8,
    textAlign: 'center',
  },

  SavedScreenEmptyAction: {
    height: 52,
    marginTop: 20,
    width: '100%',
  },

  SavedScreenSearchLintel: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },

  SavedScreenSearchPortico: {
    alignItems: 'center',
    backgroundColor: colors.searchFill,
    borderColor: colors.cardBorderStrong,
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    height: 46,
    paddingLeft: 14,
    paddingRight: 12,
  },

  SavedScreenSearchFocused: {
    borderColor: 'rgba(74, 155, 255, 0.55)',
  },

  SavedScreenSeekSigil: {
    height: 16,
    width: 16,
  },

  SavedScreenInput: {
    color: colors.white,
    flex: 1,
    fontFamily: fonts.sansRegular,
    fontSize: 14.5,
    height: '100%',
    paddingHorizontal: 9,
    paddingVertical: 0,
  },

  SavedScreenFilterPortico: {
    alignItems: 'center',
    backgroundColor: colors.searchFill,
    borderColor: colors.cardBorderStrong,
    borderRadius: 14,
    borderWidth: 1,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },

  SavedScreenFilterSigil: {
    height: 18,
    tintColor: colors.ivory,
    width: 18,
  },
  SavedScreenBadgePortico: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 8,
    height: 16,
    justifyContent: 'center',
    minWidth: 16,
    paddingHorizontal: 4,
    position: 'absolute',
    right: -4,
    top: -4,
  },

  SavedScreenBadgeFiligree: {
    color: colors.buttonText,
    fontFamily: fonts.sansBold,
    fontSize: 9,
    fontWeight: '700',
  },

  SavedScreenStatusEnclave: {
    alignItems: 'center',
    paddingVertical: 28,
  },

  SavedScreenStatusFiligree: {
    color: colors.bodySoft,
    fontFamily: fonts.sansRegular,
    fontSize: 13,
    textAlign: 'center',
  },

  SavedScreenPulseLintel: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  SavedScreenPulsePortico: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    minHeight: 68.5,
    paddingHorizontal: 12,
    paddingVertical: 13,
  },

  SavedScreenPulseLabelFiligree: {
    color: colors.bodyFaint,
    fontFamily: fonts.sansRegular,
    fontSize: 10.5,
  },

  SavedScreenPulseValueFiligree: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginTop: 4,
  },
  SavedScreenPulseStar: {
    color: colors.star,
  },

  SavedScreenPulseInterest: {
    color: colors.interest,
  },

  SavedScreenSectionLintel: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  SavedScreenSectionFiligree: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.17,
  },

  SavedScreenSectionOffset: {
    marginTop: 20,
  },

  SavedScreenViewAllFiligree: {
    color: colors.accentSoft,
    fontFamily: fonts.sansRegular,
    fontSize: 12.5,
    paddingBottom: 2,
  },

  SavedScreenListEnclave: {
    gap: 9,
    marginTop: 11,
  },

  SavedScreenRowCell: {
    width: '100%',
  },

  SavedScreenRowPortico: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    height: 82,
    paddingHorizontal: 10,
    width: '100%',
  },

  SavedScreenThumbSigil: {
    borderRadius: 11,
    height: 60,
    width: 60,
  },

  SavedScreenRowCopy: {
    flex: 1,
    marginLeft: 12,
  },
  SavedScreenRowTitleFiligree: {
    color: colors.white,
    fontFamily: fonts.sansRegular,
    fontSize: 14.5,
  },
  SavedScreenRowMetaFiligree: {
    color: colors.bodyFaint,
    fontFamily: fonts.sansRegular,
    fontSize: 11,
    marginTop: 3,
  },

  SavedScreenRowMetaLintel: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },

  SavedScreenStarFiligree: {
    color: colors.star,
    fontFamily: fonts.sansRegular,
    fontSize: 11.5,
  },

  SavedScreenViewsPortico: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },

  SavedScreenViewsFiligree: {
    color: colors.bodySoft,
    fontFamily: fonts.sansMedium,
    fontSize: 9.5,
    fontWeight: '500',
  },

  SavedScreenRemovePortico: {
    alignItems: 'center',
    height: 37,
    justifyContent: 'center',
    width: 45,
  },

  SavedScreenRemoveSigil: {
    height: 18,
    tintColor: colors.accent,
    width: 18,
  },

  SavedScreenRemoveFiligree: {
    color: colors.bodyDim,
    fontFamily: fonts.sansMedium,
    fontSize: 9.5,
    fontWeight: '500',
    marginTop: 4,
  },

  SavedScreenRailEnclave: {
    gap: 11,
    marginTop: 12,
    paddingRight: 8,
  },

  SavedScreenTilePortico: {
    borderRadius: 18,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    padding: 10,
  },

  SavedScreenTileSigil: {
    ...StyleSheet.absoluteFill,
  },


  SavedScreenTileRibbonHit: {
    position: 'absolute',
    right: 8,
    top: 8,
    zIndex: 3,
  },
  SavedScreenTileRibbonPortico: {
    alignItems: 'center',
    backgroundColor: 'rgba(4, 7, 15, 0.72)',
    borderColor: 'rgba(255, 255, 255, 0.28)',
    borderRadius: 9,
    borderWidth: 1,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },

  SavedScreenTileRibbonSigil: {
    height: 13,
    tintColor: colors.accent,
    width: 13,
  },

  SavedScreenTileCopy: {
    zIndex: 3,
  },
  SavedScreenTileTitleFiligree: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 12.5,
    fontWeight: '700',
    lineHeight: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 5,
  },

  SavedScreenTileStarsFiligree: {
    color: '#ffd278',
    fontFamily: fonts.sansMedium,
    fontSize: 10.5,
    letterSpacing: 0.525,
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 4,
  },

  SavedScreenPlayedPortico: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
    marginTop: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  SavedScreenPlayedRow: {
    gap: 6,
  },

  SavedScreenPlayedLintel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  SavedScreenPlayedTitleFiligree: {
    color: 'rgba(234, 240, 250, 0.62)',
    flex: 1,
    fontFamily: fonts.sansMedium,
    fontSize: 11.5,
    fontWeight: '500',
    marginRight: 12,
  },
  SavedScreenPlayedCountFiligree: {
    color: colors.interest,
    fontFamily: fonts.sansMedium,
    fontSize: 11.5,
    fontWeight: '500',
  },
  SavedScreenPlayedTrack: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    height: 6,
    overflow: 'hidden',
  },

  SavedScreenPlayedFill: {
    backgroundColor: colors.accent,
    borderRadius: 3,
    height: 6,
  },

  SavedScreenCategoryPortico: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 22,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 22,
  },

  SavedScreenDonutCenter: {
    alignItems: 'center',
  },

  SavedScreenDonutValueFiligree: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 20,
    fontWeight: '700',
  },
  SavedScreenDonutLabelFiligree: {
    color: colors.bodyFaint,
    fontFamily: fonts.sansRegular,
    fontSize: 9,
    marginTop: 1,
  },

  SavedScreenLegendEnclave: {
    flex: 1,
    gap: 9,
  },

  SavedScreenLegendRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 9,
  },

  SavedScreenLegendSwatch: {
    borderRadius: 3,
    height: 9,
    width: 9,
  },

  SavedScreenLegendFiligree: {
    color: 'rgba(234, 240, 250, 0.7)',
    flex: 1,
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    fontWeight: '500',
  },
  SavedScreenLegendCountFiligree: {
    color: colors.white,
    fontFamily: fonts.sansRegular,
    fontSize: 12,
  },
});
