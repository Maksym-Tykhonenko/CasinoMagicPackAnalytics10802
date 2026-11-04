import React, {useEffect, useMemo, useState} from 'react';
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
import {useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RouteProp} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {PressableScale} from '../../components/buttons/PressableScale';
import {PrimaryButton} from '../../components/buttons/PrimaryButton';
import {ScreenAmbient} from '../../components/layout/ScreenAmbient';
import {CoverArt} from '../../components/media/CoverArt';
import {FadeIn} from '../../components/motion/FadeIn';
import {colors, fonts} from '../../constants/theme';
import {icons} from '../../data/assets';
import type {CatalogueTitle} from '../../data/pack';
import {searchTitles} from '../../data/filters';
import {useAdaptive} from '../../hooks/useAdaptive';
import {usePack} from '../../routing/PackContext';
import {useLibrary} from '../../routing/LibraryContext';
import type {MainStackParamList} from '../../routing/types';

type Nav = NativeStackNavigationProp<MainStackParamList, 'Search'>;
type Route = RouteProp<MainStackParamList, 'Search'>;

const EMPTY_CHIPS = ['Adventure', 'Classic', 'Cyberpunk'];

export function SearchScreen() {
  const insets = useSafeAreaInsets();
  const adaptive = useAdaptive();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const {titles} = usePack();
  const library = useLibrary();
  const [query, setQuery] = useState(route.params?.query ?? '');
  const [focused, setFocused] = useState(true);

  useEffect(() => {
    if (route.params?.query) {
      setQuery(route.params.query);
    }
  }, [route.params?.query]);

  const results = useMemo(() => searchTitles(titles, query), [query, titles]);
  const trimmed = query.trim();
  const showEmpty = trimmed.length > 0 && results.length === 0;
  const showResults = trimmed.length > 0 && results.length > 0;

  const commit = (value: string) => {
    setQuery(value);
    library.pushRecent(value);
  };

  return (
    <ScreenAmbient opacity={0.28}>
      <KeyboardAvoidingView
        style={styles.SearchScreenFacetChassis}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View
          style={[
            styles.SearchScreenHeader,
            {
              paddingHorizontal: adaptive.scale(20),
              paddingTop: insets.top + 10,
            },
          ]}>
          <View
            style={[
              styles.SearchScreenFieldPortico,
              focused && styles.SearchScreenFieldFocused,
            ]}>
            <Image
              source={icons.seek}
              style={styles.SearchScreenSeekSigil}
              resizeMode="contain"
            />
            <TextInput
              value={query}
              onChangeText={setQuery}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onSubmitEditing={() => commit(query)}
              autoFocus
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              editable
              underlineColorAndroid="transparent"
              placeholder="Search games"
              placeholderTextColor="rgba(234, 240, 250, 0.4)"
              selectionColor={colors.accent}
              accessibilityLabel="Search games"
              accessibilityRole="search"
              style={styles.SearchScreenInput}
            />
            {query.length > 0 ? (
              <PressableScale
                onPress={() => setQuery('')}
                accessibilityRole="button"
                accessibilityLabel="Clear search"
                contentStyle={styles.SearchScreenClearPortico}>
                <Text style={styles.SearchScreenClearFiligree}>✕</Text>
              </PressableScale>
            ) : null}
          </View>
          <PressableScale
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Cancel search">
            <Text style={styles.SearchScreenCancelFiligree}>Cancel</Text>
          </PressableScale>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: adaptive.scale(20),
            paddingBottom: 32,
          }}>
          {showResults ? (
            <FadeIn>
              <Text style={styles.SearchScreenLintel}>
                {results.length} RESULTS
              </Text>
              {results.map((title, index) => (
                <FadeIn key={title.id} delay={index * 40}>
                  <SearchResult
                    title={title}
                    onPress={() => {
                      commit(query);
                      navigation.navigate('GameDetail', {id: title.id});
                    }}
                  />
                </FadeIn>
              ))}
            </FadeIn>
          ) : null}

          {showEmpty ? (
            <FadeIn style={styles.SearchScreenEmptyEnclave}>
              <View style={styles.SearchScreenEmptyPortico}>
                <Image
                  source={icons.vacant}
                  style={styles.SearchScreenEmptySigil}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.SearchScreenEmptyTitle}>No games found</Text>
              <Text style={styles.SearchScreenEmptyBody}>
                Nothing in the pack matches “{trimmed}”. Try a shorter
                query, or browse by category instead.
              </Text>
              <View style={styles.SearchScreenChipsEnclave}>
                {EMPTY_CHIPS.map(chip => (
                  <PressableScale
                    key={chip}
                    onPress={() => commit(chip)}
                    accessibilityRole="button"
                    accessibilityLabel={`Search ${chip}`}
                    contentStyle={styles.SearchScreenChipPortico}>
                    <Text style={styles.SearchScreenChipFiligree}>{chip}</Text>
                  </PressableScale>
                ))}
              </View>
              <PrimaryButton
                label="Browse all games"
                fullWidth={false}
                onPress={() => navigation.goBack()}
                style={styles.SearchScreenBrowse}
              />
            </FadeIn>
          ) : null}

          {!trimmed ? (
            <FadeIn>
              <Text style={styles.SearchScreenLintel}>RECENT SEARCHES</Text>
              <View style={styles.SearchScreenRecentPortico}>
                {library.recentSearches.map((item, index) => (
                  <View
                    key={item}
                    style={[
                      styles.SearchScreenRecentRow,
                      index < library.recentSearches.length - 1 &&
                        styles.SearchScreenRecentRule,
                    ]}>
                    <PressableScale
                      onPress={() => commit(item)}
                      accessibilityRole="button"
                      accessibilityLabel={`Search ${item}`}
                      style={styles.SearchScreenRecentHit}>
                      <Image
                        source={icons.lapse}
                        accessibilityElementsHidden
                        importantForAccessibility="no"
                        style={styles.SearchScreenRecentSigil}
                        resizeMode="contain"
                      />
                      <Text style={styles.SearchScreenRecentFiligree}>
                        {item}
                      </Text>
                    </PressableScale>
                    <PressableScale
                      onPress={() => library.removeRecent(item)}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove recent search ${item}`}>
                      <Text style={styles.SearchScreenRecentClear}>✕</Text>
                    </PressableScale>
                  </View>
                ))}
              </View>
              <View style={styles.SearchScreenTipPortico}>
                <Text style={styles.SearchScreenTipFiligree}>
                  Tip: search by provider name to see every title they published,
                  then sort by rating.
                </Text>
              </View>
            </FadeIn>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenAmbient>
  );
}

function SearchResult({
  title,
  onPress,
}: {
  title: CatalogueTitle;
  onPress: () => void;
}) {
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title.title}, rated ${title.rating.toFixed(1)}`}
      contentStyle={styles.SearchScreenHitPortico}>
      <CoverArt source={title.art} style={styles.SearchScreenThumbSigil} />
      <View style={styles.SearchScreenHitCopy}>
        <Text style={styles.SearchScreenHitTitle}>{title.title}</Text>
        <Text style={styles.SearchScreenHitMeta}>
          {title.category}
          {title.studio ? ` · ${title.studio}` : ''}
        </Text>
      </View>
      <View style={styles.SearchScreenHitStats}>
        <Text style={styles.SearchScreenHitRating}>
          ★ {title.rating.toFixed(1)}
        </Text>
        <Text style={styles.SearchScreenHitPop}>{title.popularity}% pop.</Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  SearchScreenFacetChassis: {
    flex: 1,
  },

  SearchScreenHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },

  SearchScreenFieldPortico: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    height: 46,
    paddingLeft: 14,
    paddingRight: 8,
  },
  SearchScreenFieldFocused: {
    borderColor: 'rgba(74, 155, 255, 0.55)',
  },

  SearchScreenSeekSigil: {
    height: 16,
    width: 16,
  },
  SearchScreenInput: {
    color: colors.white,
    flex: 1,
    fontFamily: fonts.sansRegular,
    fontSize: 14.5,
    height: '100%',
    paddingHorizontal: 9,
    paddingVertical: 0,
  },
  SearchScreenClearPortico: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 8,
    height: 16,
    width: 16,
  },

  SearchScreenClearFiligree: {
    color: colors.buttonText,
    fontFamily: fonts.sansBold,
    fontSize: 10,
    fontWeight: '700',
  },

  SearchScreenCancelFiligree: {
    color: colors.accentSoft,
    fontFamily: fonts.sansMedium,
    fontSize: 14.5,
    fontWeight: '500',
  },

  SearchScreenLintel: {
    color: 'rgba(234, 240, 250, 0.4)',
    fontFamily: fonts.sansRegular,
    fontSize: 11,
    letterSpacing: 1.1,
    marginBottom: 12,
  },

  SearchScreenHitPortico: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    height: 76,
    marginBottom: 9,
    paddingHorizontal: 10,
    width: '100%',
  },

  SearchScreenThumbSigil: {
    borderRadius: 10,
    height: 54,
    width: 54,
  },
  SearchScreenHitCopy: {
    flex: 1,
    marginLeft: 12,
  },

  SearchScreenHitTitle: {
    color: colors.white,
    fontFamily: fonts.sansRegular,
    fontSize: 14.5,
  },
  SearchScreenHitMeta: {
    color: colors.bodyFaint,
    fontFamily: fonts.sansRegular,
    fontSize: 11.5,
    marginTop: 4,
  },

  SearchScreenHitStats: {
    alignItems: 'flex-end',
  },

  SearchScreenHitRating: {
    color: colors.star,
    fontFamily: fonts.sansRegular,
    fontSize: 13,
  },

  SearchScreenHitPop: {
    color: colors.interest,
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    fontWeight: '500',
    marginTop: 4,
  },

  SearchScreenEmptyEnclave: {
    alignItems: 'center',
    paddingTop: 72,
  },

  SearchScreenEmptyPortico: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: colors.cardBorderStrong,
    borderRadius: 32,
    borderWidth: 1,
    height: 98,
    justifyContent: 'center',
    width: 98,
  },

  SearchScreenEmptySigil: {
    height: 42,
    width: 42,
  },

  SearchScreenEmptyTitle: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 21,
    fontWeight: '700',
    letterSpacing: -0.21,
    marginTop: 18,
  },

  SearchScreenEmptyBody: {
    color: colors.bodySoft,
    fontFamily: fonts.sansRegular,
    fontSize: 14,
    lineHeight: 21.7,
    marginTop: 8,
    paddingHorizontal: 12,
    textAlign: 'center',
  },

  SearchScreenChipsEnclave: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginTop: 18,
  },

  SearchScreenChipPortico: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: colors.cardBorderStrong,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },

  SearchScreenChipFiligree: {
    color: colors.ivory,
    fontFamily: fonts.sansRegular,
    fontSize: 12.5,
  },

  SearchScreenBrowse: {
    marginTop: 18,
    paddingHorizontal: 28,
    width: 213,
  },

  SearchScreenRecentPortico: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  SearchScreenRecentRow: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 48,
    paddingHorizontal: 15,
  },

  SearchScreenRecentRule: {
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  SearchScreenRecentHit: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },

  SearchScreenRecentSigil: {
    height: 15,
    tintColor: colors.bodyFaint,
    width: 15,
  },

  SearchScreenRecentFiligree: {
    color: 'rgba(234, 240, 250, 0.75)',
    fontFamily: fonts.sansRegular,
    fontSize: 14,
  },

  SearchScreenRecentClear: {
    color: colors.disabledText,
    fontSize: 16,
    padding: 6,
  },
  SearchScreenTipPortico: {
    backgroundColor: 'rgba(74, 155, 255, 0.09)',
    borderColor: 'rgba(74, 155, 255, 0.22)',
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  SearchScreenTipFiligree: {
    color: colors.body,
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    lineHeight: 18,
  },
});
