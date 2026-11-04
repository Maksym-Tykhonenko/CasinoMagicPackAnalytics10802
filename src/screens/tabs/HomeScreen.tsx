import React, {useMemo, useRef} from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {useNavigation} from '@react-navigation/native';
import type {CompositeNavigationProp} from '@react-navigation/native';
import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {PressableScale} from '../../components/buttons/PressableScale';
import {ScreenAmbient} from '../../components/layout/ScreenAmbient';
import {CoverArt} from '../../components/media/CoverArt';
import {CoverFade} from '../../components/media/CoverFade';
import {FadeIn} from '../../components/motion/FadeIn';

import {colors, fonts} from '../../constants/theme';
import {icons} from '../../data/assets';
import type {CatalogueTitle, PulseStat} from '../../data/pack';
import {useAdaptive} from '../../hooks/useAdaptive';
import {usePack} from '../../routing/PackContext';
import {useLibrary} from '../../routing/LibraryContext';

import {useAccount} from '../../routing/AccountContext';
import {tabBarOverlayHeight} from '../../routing/tabBarLayout';
import type {MainTabParamList, MainStackParamList} from '../../routing/types';

type HomeNav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<MainStackParamList>
>;

function greetingForHour(hour: number) {
  if (hour < 12) {
    return 'Good morning';
  }
  if (hour < 18) {
    return 'Good afternoon';
  }
  return 'Good evening';
}

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const adaptive = useAdaptive();
  const navigation = useNavigation<HomeNav>();
  const {featured, popular, stats, ready, error, refresh} = usePack();
  const {profile} = useAccount();
  const library = useLibrary();
  const greeting = useMemo(() => greetingForHour(new Date().getHours()), []);
  const pad = adaptive.scale(20);
  const featuredHeight = adaptive.verticalScale(186);
  const tileWidth = adaptive.scale(142);
  const tileHeight = adaptive.verticalScale(172);

  const openTitle = (id: string) => navigation.navigate('GameDetail', {id});

  return (
    <ScreenAmbient opacity={0.28}>
      <ScrollView
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.HomeScreenScrollContent,
          {
            paddingBottom: tabBarOverlayHeight(insets.bottom) + 16,
            paddingHorizontal: pad,
            paddingTop: insets.top + adaptive.verticalScale(12),
          },
        ]}>
        <FadeIn>
          <Text style={styles.HomeScreenGreetingFiligree}>{greeting}</Text>
          <Text style={styles.HomeScreenTitleFiligree}>
            {profile.displayName}
          </Text>
        </FadeIn>

        <FadeIn delay={60}>
          <PressableScale
            onPress={() => navigation.navigate('Search')}
            accessibilityRole="search"
            accessibilityLabel="Search games and providers"
            contentStyle={styles.HomeScreenSearchPortico}>
            <Image
              source={icons.seek}
              accessibilityElementsHidden
              importantForAccessibility="no"
              style={styles.HomeScreenSeekSigil}
              resizeMode="contain"
            />
            <Text
              accessibilityElementsHidden
              importantForAccessibility="no"
              style={styles.HomeScreenSearchFiligree}>
              Search games, providers…
            </Text>
          </PressableScale>
        </FadeIn>

        {!ready ? (
          <View style={styles.HomeScreenStatusEnclave}>
            <ActivityIndicator color={colors.accent} />
            <Text style={styles.HomeScreenStatusFiligree}>
              Loading live slots…
            </Text>
          </View>
        ) : null}

        {ready && error ? (
          <Pressable
            onPress={refresh}
            style={styles.HomeScreenStatusEnclave}
            accessibilityRole="button"
            accessibilityLabel="Retry loading games"
            accessibilityHint={error}>
            <Text style={styles.HomeScreenStatusFiligree}>{error}</Text>
            <Text style={styles.HomeScreenRetryFiligree}>Tap to retry</Text>
          </Pressable>
        ) : null}

        <View
          style={[styles.HomeScreenFeaturedPortico, {height: featuredHeight}]}>
          <CoverArt
            source={featured.art}
            style={styles.HomeScreenFeaturedSigil}
          />
          <CoverFade height={160} />
          <View style={styles.HomeScreenFeaturedBadgePortico}>
            <Text style={styles.HomeScreenFeaturedBadgeFiligree}>SPOTLIGHT</Text>
          </View>
          <View style={styles.HomeScreenFeaturedCopyEnclave}>
            <View style={styles.HomeScreenFeaturedCopy}>
              <Text
                style={styles.HomeScreenFeaturedTitleFiligree}
                numberOfLines={1}>
                {featured.title}
              </Text>
              <Text
                style={styles.HomeScreenFeaturedMetaFiligree}
                numberOfLines={1}>
                {featured.category}
                {featured.studio ? ` · ${featured.studio}` : ''}
              </Text>
              <View style={styles.HomeScreenFeaturedStatsLintel}>
                <Text style={styles.HomeScreenStarFiligree}>
                  ★ {featured.rating.toFixed(1)}
                </Text>
                <Text style={styles.HomeScreenInterestFiligree}>
                  {featured.interest}
                </Text>
              </View>
            </View>
            <PressableScale
              onPress={() => openTitle(featured.id)}
              accessibilityRole="button"
              accessibilityLabel={`Open details for ${featured.title}`}
              style={styles.HomeScreenPlayHit}
              contentStyle={styles.HomeScreenPlayPortico}>
              <Text style={styles.HomeScreenPlayFiligree}>Details</Text>
            </PressableScale>
          </View>
        </View>

        <View style={styles.HomeScreenPulseLintel}>
          {stats.map(stat => (
            <PulseCard key={stat.label} stat={stat} />
          ))}
        </View>

        <View style={styles.HomeScreenSectionLintel}>
          <Text style={styles.HomeScreenSectionFiligree}>Popular Games</Text>
          <Pressable
            onPress={() => navigation.navigate('Explore')}
            accessibilityRole="button"
            accessibilityLabel="View all popular games">
            <Text style={styles.HomeScreenViewAllFiligree}>View All</Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{marginRight: -pad}}
          contentContainerStyle={styles.HomeScreenRailEnclave}>
          {popular.map(title => (
            <PopularCard
              key={title.id}
              title={title}
              width={tileWidth}
              height={tileHeight}
              saved={library.isSaved(title.id)}
              onPress={() => openTitle(title.id)}
              onSave={() => library.toggleSaved(title.id)}
            />
          ))}
        </ScrollView>
      </ScrollView>
    </ScreenAmbient>
  );
}

function PulseCard({stat}: {stat: PulseStat}) {
  return (
    <View style={styles.HomeScreenPulsePortico}>
      <Text style={styles.HomeScreenPulseLabelFiligree}>{stat.label}</Text>
      <Text style={styles.HomeScreenPulseValueFiligree}>{stat.value}</Text>
      <Text style={styles.HomeScreenPulseDeltaFiligree}>{stat.delta}</Text>
    </View>
  );
}

function PopularCard({
  title,
  width,
  height,
  saved,
  onPress,
  onSave,
}: {
  title: CatalogueTitle;
  width: number;
  height: number;
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
      accessibilityLabel={`${title.title}, rated ${title.rating.toFixed(1)}`}>
      <View style={[styles.HomeScreenTilePortico, {width, height}]}>
        <CoverArt source={title.art} style={styles.HomeScreenTileSigil} />
        <CoverFade height={112} />
        <View style={styles.HomeScreenRankPortico}>
          <Text style={styles.HomeScreenRankFiligree}>#{title.rank} TOP</Text>
        </View>
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
          style={styles.HomeScreenRibbonHit}
          contentStyle={styles.HomeScreenRibbonPortico}>
          <Image
            source={icons.ribbon}
            accessibilityElementsHidden
            importantForAccessibility="no"
            style={[
              styles.HomeScreenRibbonSigil,
              saved
                ? styles.HomeScreenRibbonSaved
                : styles.HomeScreenRibbonIdle,
            ]}
            resizeMode="contain"
          />
        </PressableScale>
        <View style={styles.HomeScreenTileCopy}>
          <Text numberOfLines={1} style={styles.HomeScreenTileTitleFiligree}>
            {title.title}
          </Text>
          <View style={styles.HomeScreenTileMetaLintel}>
            <Text style={styles.HomeScreenTileCategoryFiligree}>
              {title.category}
            </Text>
            <Text style={styles.HomeScreenStarFiligree}>
              ★ {title.rating.toFixed(1)}
            </Text>
          </View>
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  HomeScreenScrollContent: {
    flexGrow: 1,
  },

  HomeScreenGreetingFiligree: {
    color: colors.bodySoft,
    fontFamily: fonts.sansRegular,
    fontSize: 13,
  },

  HomeScreenTitleFiligree: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.48,
    marginTop: 2,
  },
  HomeScreenSearchPortico: {
    backgroundColor: colors.searchFill,
    borderColor: colors.cardBorderStrong,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 46,
    marginTop: 14,
    paddingHorizontal: 14,
    gap: 9,
    width: '100%',
  },

  HomeScreenSeekSigil: {
    height: 16,
    width: 16,
  },

  HomeScreenSearchFiligree: {
    color: 'rgba(234, 240, 250, 0.4)',
    fontFamily: fonts.sansRegular,
    fontSize: 14.5,
  },

  HomeScreenStatusEnclave: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  HomeScreenStatusFiligree: {
    color: colors.bodySoft,
    fontFamily: fonts.sansRegular,
    fontSize: 13,
    textAlign: 'center',
  },
  HomeScreenRetryFiligree: {
    color: colors.accentSoft,
    fontFamily: fonts.sansMedium,
    fontSize: 13,
  },
  HomeScreenFeaturedPortico: {
    backgroundColor: colors.cardStrong,
    borderColor: colors.cardBorder,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'space-between',
    marginTop: 16,
    overflow: 'hidden',
    padding: 14,
  },

  HomeScreenFeaturedSigil: {
    ...StyleSheet.absoluteFill,
  },
  HomeScreenFeaturedBadgePortico: {
    alignSelf: 'flex-start',
    backgroundColor: colors.featuredBadge,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    zIndex: 3,
  },

  HomeScreenFeaturedBadgeFiligree: {
    color: colors.buttonText,
    fontFamily: fonts.sansBold,
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.95,
  },
  HomeScreenFeaturedCopyEnclave: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 12,
    zIndex: 3,
  },
  HomeScreenFeaturedCopy: {
    flex: 1,
  },
  HomeScreenFeaturedTitleFiligree: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.22,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 8,
  },

  HomeScreenFeaturedMetaFiligree: {
    color: colors.white,
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    marginTop: 4,
    opacity: 0.95,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 6,
  },

  HomeScreenFeaturedStatsLintel: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },

  HomeScreenStarFiligree: {
    color: '#ffd278',
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 5,
  },

  HomeScreenInterestFiligree: {
    color: '#c8e0ff',
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 5,
  },

  HomeScreenPlayHit: {
    zIndex: 4,
  },
  HomeScreenPlayPortico: {
    backgroundColor: colors.white,
    borderRadius: 12,
    elevation: 4,
    height: 38,
    justifyContent: 'center',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.35,
    shadowRadius: 4,
  },

  HomeScreenPlayFiligree: {
    color: colors.buttonText,
    fontFamily: fonts.sansBold,
    fontSize: 13.5,
    fontWeight: '700',
  },

  HomeScreenPulseLintel: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },

  HomeScreenPulsePortico: {
    backgroundColor: colors.cardStrong,
    borderColor: colors.cardBorderStrong,
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    minHeight: 83.5,
    paddingHorizontal: 12,
    paddingVertical: 13,
  },

  HomeScreenPulseLabelFiligree: {
    color: colors.bodyFaint,
    fontFamily: fonts.sansRegular,
    fontSize: 10.5,
  },
  HomeScreenPulseValueFiligree: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginTop: 4,
  },

  HomeScreenPulseDeltaFiligree: {
    color: colors.gain,
    fontFamily: fonts.sansRegular,
    fontSize: 10.5,
    marginTop: 4,
  },
  HomeScreenSectionFiligree: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.18,
  },

  HomeScreenSectionLintel: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 22,
  },
  HomeScreenViewAllFiligree: {
    color: colors.accentSoft,
    fontFamily: fonts.sansRegular,
    fontSize: 13,
    paddingBottom: 2,
  },

  HomeScreenRailEnclave: {
    gap: 12,
    marginTop: 12,
  },
  HomeScreenTilePortico: {
    backgroundColor: colors.cardStrong,
    borderColor: colors.cardBorder,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'space-between',
    overflow: 'hidden',
    padding: 9,
  },

  HomeScreenTileSigil: {
    ...StyleSheet.absoluteFill,
  },
  HomeScreenRankPortico: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(4, 7, 15, 0.82)',
    borderColor: 'rgba(255, 255, 255, 0.28)',
    borderRadius: 7,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 3,
  },

  HomeScreenRankFiligree: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.72,
  },
  HomeScreenRibbonHit: {
    position: 'absolute',
    right: 8,
    top: 8,
    zIndex: 3,
  },
  HomeScreenRibbonPortico: {
    alignItems: 'center',
    backgroundColor: 'rgba(4, 7, 15, 0.72)',
    borderColor: 'rgba(255, 255, 255, 0.28)',
    borderRadius: 9,
    borderWidth: 1,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },

  HomeScreenRibbonSigil: {
    height: 13,
    width: 13,
  },

  HomeScreenRibbonIdle: {
    opacity: 1,
    tintColor: colors.white,
  },
  HomeScreenRibbonSaved: {
    opacity: 1,
    tintColor: colors.accent,
  },
  HomeScreenTileCopy: {
    marginTop: 'auto',
    zIndex: 3,
  },

  HomeScreenTileTitleFiligree: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 13.5,
    fontWeight: '700',
    lineHeight: 16.2,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 5,
  },
  HomeScreenTileMetaLintel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },

  HomeScreenTileCategoryFiligree: {
    color: colors.white,
    fontFamily: fonts.sansMedium,
    fontSize: 10.5,
    opacity: 0.92,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 4,
  },
});
