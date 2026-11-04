import React, {useCallback, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {PressableScale} from '../../components/buttons/PressableScale';
import {ScreenAmbient} from '../../components/layout/ScreenAmbient';
import {CoverArt} from '../../components/media/CoverArt';

import {CoverFade} from '../../components/media/CoverFade';

import {FadeIn} from '../../components/motion/FadeIn';
import {FiltersSheet} from '../../components/sheets/FiltersSheet';
import {colors, fonts} from '../../constants/theme';
import {icons} from '../../data/assets';
import type {CatalogueTitle} from '../../data/pack';
import {
  applyFilters,
  buildFilterOptions,
  countActiveFilters,
  DEFAULT_FILTERS,
} from '../../data/filters';
import {useAdaptive} from '../../hooks/useAdaptive';
import {usePack} from '../../routing/PackContext';
import {useLibrary} from '../../routing/LibraryContext';
import {tabBarOverlayHeight} from '../../routing/tabBarLayout';
import type {MainStackParamList} from '../../routing/types';

type Nav = NativeStackNavigationProp<MainStackParamList>;

export function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const adaptive = useAdaptive();
  const navigation = useNavigation<Nav>();
  const {titles, ready, error, refresh, loadingMore} = usePack();
  const library = useLibrary();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const pad = adaptive.scale(20);
  const tileWidth = (adaptive.width - pad * 2 - 12) / 2;
  const activeCount = countActiveFilters(filters);

  const filterOptions = useMemo(() => buildFilterOptions(titles), [titles]);

  const visible = useMemo(
    () => applyFilters(titles, filters, library.savedIds, library.ratedIds),
    [filters, library.ratedIds, library.savedIds, titles],
  );

  const openTitle = useCallback(
    (id: string) => navigation.navigate('GameDetail', {id}),
    [navigation],
  );

  const renderCard = useCallback(
    ({item}: {item: CatalogueTitle}) => (
      <View style={[styles.ExploreScreenTileCell, {width: tileWidth}]}>
        <ExploreCard
          title={item}
          saved={library.isSaved(item.id)}
          onPress={() => openTitle(item.id)}
          onSave={() => library.toggleSaved(item.id)}
        />
      </View>
    ),
    [library, openTitle, tileWidth],
  );

  const listHeader = (
    <View style={styles.ExploreScreenHeaderEnclave}>
      <FadeIn style={styles.ExploreScreenTitleLintel}>
        <Text style={styles.ExploreScreenTitleFiligree}>Explore</Text>
        <Text style={styles.ExploreScreenCountFiligree}>
          {visible.length.toLocaleString()} games
          {loadingMore ? ' · loading' : ''}
        </Text>
      </FadeIn>

      <FadeIn delay={60} style={styles.ExploreScreenSearchLintel}>
        <PressableScale
          onPress={() => navigation.navigate('Search')}
          accessibilityRole="search"
          accessibilityLabel="Search games"
          style={styles.ExploreScreenSearchCell}
          contentStyle={styles.ExploreScreenSearchPortico}>
          <Image
            source={icons.seek}
            accessibilityElementsHidden
            importantForAccessibility="no"
            style={styles.ExploreScreenSeekSigil}
            resizeMode="contain"
          />
          <Text
            accessibilityElementsHidden
            importantForAccessibility="no"
            style={styles.ExploreScreenSearchFiligree}>
            Search games
          </Text>
        </PressableScale>
        <PressableScale
          onPress={() => setFiltersOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={
            activeCount > 0
              ? `Open filters, ${activeCount} active`
              : 'Open filters'
          }
          contentStyle={styles.ExploreScreenFilterPortico}>
          <Image
            source={icons.sift}
            accessibilityElementsHidden
            importantForAccessibility="no"
            style={styles.ExploreScreenFilterSigil}
            resizeMode="contain"
          />
          {activeCount > 0 ? (
            <View style={styles.ExploreScreenBadgePortico}>
              <Text
                accessibilityElementsHidden
                importantForAccessibility="no"
                style={styles.ExploreScreenBadgeFiligree}>
                {activeCount}
              </Text>
            </View>
          ) : null}
        </PressableScale>
      </FadeIn>

      {!ready ? (
        <View style={styles.ExploreScreenStatusEnclave}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : null}

      {ready && error ? (
        <PressableScale
          onPress={refresh}
          accessibilityRole="button"
          accessibilityLabel="Retry loading games"
          accessibilityHint={error}
          contentStyle={styles.ExploreScreenStatusEnclave}>
          <Text style={styles.ExploreScreenStatusFiligree}>{error}</Text>
          <Text style={styles.ExploreScreenRetryFiligree}>Tap to retry</Text>
        </PressableScale>
      ) : null}
    </View>
  );

  return (
    <ScreenAmbient opacity={0.28}>
      <FlatList
        data={visible}
        numColumns={2}
        keyExtractor={item => item.id}
        renderItem={renderCard}
        extraData={library.savedIds}
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        maxToRenderPerBatch={6}
        windowSize={7}
        removeClippedSubviews
        contentContainerStyle={[
          styles.ExploreScreenScrollContent,
          {
            paddingBottom: tabBarOverlayHeight(insets.bottom) + 16,
            paddingHorizontal: pad,
            paddingTop: insets.top + 16,
          },
        ]}
        columnWrapperStyle={styles.ExploreScreenGridRow}
        ListHeaderComponent={listHeader}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.ExploreScreenStatusEnclave}>
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : undefined
        }
      />

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

function ExploreCard({
  title,
  saved,
  onPress,
  onSave,
}: {
  title: CatalogueTitle;
  saved: boolean;
  onPress: () => void;
  onSave: () => void;
}) {
  const ignoreCardPress = useRef(false);

  return (
    <PressableScale
      onPress={() => {
        if (ignoreCardPress.current) {
          return;
        }
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={`${title.title}, rated ${title.rating.toFixed(1)}`}
      contentStyle={styles.ExploreScreenCardPortico}>
      <View style={styles.ExploreScreenArtPortico}>
        <CoverArt source={title.art} style={styles.ExploreScreenArtSigil} />
        <CoverFade height={72} />
        <PressableScale
          hitSlop={8}
          onPress={() => {
            ignoreCardPress.current = true;
            onSave();
            requestAnimationFrame(() => {
              ignoreCardPress.current = false;
            });
          }}
          accessibilityRole="button"
          accessibilityLabel={
            saved ? `Remove ${title.title} from saved` : `Save ${title.title}`
          }
          accessibilityState={{selected: saved}}
          style={styles.ExploreScreenRibbonHit}
          contentStyle={styles.ExploreScreenRibbonPortico}>
          <Image
            source={icons.ribbon}
            accessibilityElementsHidden
            importantForAccessibility="no"
            style={[
              styles.ExploreScreenRibbonSigil,
              saved
                ? styles.ExploreScreenRibbonSaved
                : styles.ExploreScreenRibbonIdle,
            ]}
            resizeMode="contain"
          />
        </PressableScale>
        {title.badge ? (
          <View style={styles.ExploreScreenRankPortico}>
            <Text style={styles.ExploreScreenRankFiligree}>{title.badge}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.ExploreScreenCardCopy}>
        <Text numberOfLines={1} style={styles.ExploreScreenTileTitleFiligree}>
          {title.title}
        </Text>
        <Text
          numberOfLines={1}
          style={styles.ExploreScreenTileCategoryFiligree}>
          {title.category}
          {title.studio ? ` · ${title.studio}` : ''}
        </Text>
        <View style={styles.ExploreScreenTileMetaLintel}>
          <Text style={styles.ExploreScreenStarFiligree}>
            ★ {title.rating.toFixed(1)}
          </Text>
          <Text style={styles.ExploreScreenPopFiligree}>
            {title.popularity}% pop.
          </Text>
        </View>
        <View style={styles.ExploreScreenBarTrack}>
          <View
            style={[
              styles.ExploreScreenBarFill,
              {width: `${title.popularity}%`},
            ]}
          />
        </View>
        <View style={styles.ExploreScreenTagsEnclave}>
          {title.tags.slice(0, 2).map(tag => (
            <View key={tag} style={styles.ExploreScreenTagPortico}>
              <Text style={styles.ExploreScreenTagFiligree}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  ExploreScreenScrollContent: {
    flexGrow: 1,
  },

  ExploreScreenHeaderEnclave: {
    paddingBottom: 16,
  },
  ExploreScreenTitleLintel: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  ExploreScreenTitleFiligree: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.56,
  },

  ExploreScreenCountFiligree: {
    color: colors.bodyFaint,
    fontFamily: fonts.sansRegular,
    fontSize: 13,
    paddingBottom: 4,
  },
  ExploreScreenSearchLintel: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },

  ExploreScreenSearchCell: {
    flex: 1,
  },

  ExploreScreenSearchPortico: {
    alignItems: 'center',
    backgroundColor: colors.searchFill,
    borderColor: colors.cardBorderStrong,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 9,
    height: 46,
    paddingHorizontal: 14,
    width: '100%',
  },

  ExploreScreenSeekSigil: {
    height: 16,
    width: 16,
  },

  ExploreScreenSearchFiligree: {
    color: 'rgba(234, 240, 250, 0.4)',
    fontFamily: fonts.sansRegular,
    fontSize: 14.5,
  },

  ExploreScreenFilterPortico: {
    alignItems: 'center',
    backgroundColor: colors.searchFill,
    borderColor: colors.cardBorderStrong,
    borderRadius: 14,
    borderWidth: 1,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },

  ExploreScreenFilterSigil: {
    height: 18,
    tintColor: colors.ivory,
    width: 18,
  },
  ExploreScreenBadgePortico: {
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

  ExploreScreenBadgeFiligree: {
    color: colors.buttonText,
    fontFamily: fonts.sansBold,
    fontSize: 9,
    fontWeight: '700',
  },

  ExploreScreenStatusEnclave: {
    alignItems: 'center',
    paddingVertical: 20,
  },

  ExploreScreenStatusFiligree: {
    color: colors.bodySoft,
    fontFamily: fonts.sansRegular,
    fontSize: 13,
    textAlign: 'center',
  },

  ExploreScreenRetryFiligree: {
    color: colors.accentSoft,
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    marginTop: 8,
  },

  ExploreScreenGridRow: {
    gap: 12,
  },
  ExploreScreenTileCell: {
    marginBottom: 12,
  },

  ExploreScreenCardPortico: {
    alignItems: 'stretch',
    backgroundColor: colors.cardStrong,
    borderColor: colors.cardBorderStrong,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'flex-start',
    overflow: 'hidden',
    width: '100%',
  },

  ExploreScreenArtPortico: {
    backgroundColor: colors.cardPanel,
    height: 122,
    overflow: 'hidden',
    width: '100%',
  },

  ExploreScreenArtSigil: {
    height: 122,
    width: '100%',
  },

  ExploreScreenRankPortico: {
    backgroundColor: 'rgba(4, 7, 15, 0.82)',
    borderColor: 'rgba(255, 255, 255, 0.28)',
    borderRadius: 7,
    borderWidth: 1,
    bottom: 10,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    position: 'absolute',
    zIndex: 3,
  },
  ExploreScreenRankFiligree: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.72,
  },
  ExploreScreenRibbonHit: {
    position: 'absolute',
    right: 8,
    top: 8,
    zIndex: 3,
  },
  ExploreScreenRibbonPortico: {
    alignItems: 'center',
    backgroundColor: 'rgba(4, 7, 15, 0.72)',
    borderColor: 'rgba(255, 255, 255, 0.28)',
    borderRadius: 9,
    borderWidth: 1,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },

  ExploreScreenRibbonSigil: {
    height: 13,
    width: 13,
  },

  ExploreScreenRibbonIdle: {
    opacity: 1,
    tintColor: colors.white,
  },
  ExploreScreenRibbonSaved: {
    opacity: 1,
    tintColor: colors.accent,
  },
  ExploreScreenCardCopy: {
    backgroundColor: colors.cardPanel,
    paddingBottom: 10,
    paddingHorizontal: 10,
    paddingTop: 10,
    width: '100%',
    zIndex: 2,
  },

  ExploreScreenTileTitleFiligree: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 13.5,
    fontWeight: '700',
  },

  ExploreScreenTileCategoryFiligree: {
    color: 'rgba(255, 255, 255, 0.78)',
    fontFamily: fonts.sansMedium,
    fontSize: 10.5,
    marginTop: 3,
  },

  ExploreScreenTileMetaLintel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  ExploreScreenStarFiligree: {
    color: '#ffd278',
    fontFamily: fonts.sansMedium,
    fontSize: 11,
  },

  ExploreScreenPopFiligree: {
    color: '#c8e0ff',
    fontFamily: fonts.sansMedium,
    fontSize: 11,
  },

  ExploreScreenBarTrack: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    height: 3,
    marginTop: 7,
    overflow: 'hidden',
  },

  ExploreScreenBarFill: {
    backgroundColor: colors.accent,
    height: 3,
  },
  ExploreScreenTagsEnclave: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },

  ExploreScreenTagPortico: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  ExploreScreenTagFiligree: {
    color: 'rgba(255, 255, 255, 0.82)',
    fontFamily: fonts.sansMedium,
    fontSize: 10,
  },
});
