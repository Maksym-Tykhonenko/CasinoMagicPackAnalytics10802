import React, {useMemo, useState} from 'react';
import {Image, ScrollView, StyleSheet, Text, View} from 'react-native';
import {LineChart, PieChart} from 'react-native-gifted-charts';

import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {PressableScale} from '../../components/buttons/PressableScale';

import {CapsuleBarChart} from '../../components/charts/CapsuleBarChart';
import {ScreenAmbient} from '../../components/layout/ScreenAmbient';
import {FadeIn} from '../../components/motion/FadeIn';

import {colors, fonts} from '../../constants/theme';
import {icons} from '../../data/assets';
import {
  ANALYTICS_PERIODS,
  ANALYTICS_TABS,
  CATEGORY_TONES,
  buildAnalyticsModel,
  type AnalyticsPeriod,
  type AnalyticsTab,
} from '../../data/analytics';

import type {CatalogueTitle} from '../../data/pack';
import {useAdaptive} from '../../hooks/useAdaptive';
import {usePack} from '../../routing/PackContext';
import {tabBarOverlayHeight} from '../../routing/tabBarLayout';

export function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const adaptive = useAdaptive();
  const {titles} = usePack();
  const [tab, setTab] = useState<AnalyticsTab>('Overview');
  const [period, setPeriod] = useState<AnalyticsPeriod>('Last 30 days');
  const pad = adaptive.scale(20);
  const chartWidth = adaptive.width - pad * 2 - 32;
  const model = useMemo(
    () => buildAnalyticsModel(titles, period),
    [period, titles],
  );

  const cyclePeriod = () => {
    const index = ANALYTICS_PERIODS.indexOf(period);
    setPeriod(ANALYTICS_PERIODS[(index + 1) % ANALYTICS_PERIODS.length]);
  };

  return (
    <ScreenAmbient opacity={0.28}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: pad,
          paddingTop: insets.top + 16,
          paddingBottom: tabBarOverlayHeight(insets.bottom) + 16,
        }}>
        <FadeIn style={styles.AnalyticsScreenTitleLintel}>
          <Text style={styles.AnalyticsScreenTitleFiligree}>Analytics</Text>
          <PressableScale
            onPress={cyclePeriod}
            accessibilityRole="button"
            accessibilityLabel={`Period ${period}`}
            accessibilityHint="Changes the analytics time range"
            contentStyle={styles.AnalyticsScreenPeriodPortico}>
            <Text style={styles.AnalyticsScreenPeriodFiligree}>{period}</Text>
            <Image
              source={icons.advance}
              accessibilityElementsHidden
              importantForAccessibility="no"
              style={styles.AnalyticsScreenPeriodSigil}
              resizeMode="contain"
            />
          </PressableScale>
        </FadeIn>

        <FadeIn delay={40} style={styles.AnalyticsScreenTabsPortico}>
          {ANALYTICS_TABS.map(option => {
            const active = tab === option;
            return (
              <PressableScale
                key={option}
                onPress={() => setTab(option)}
                accessibilityRole="tab"
                accessibilityLabel={option}
                accessibilityState={{selected: active}}
                style={styles.AnalyticsScreenTabCell}
                contentStyle={[
                  styles.AnalyticsScreenTabBtn,
                  active && styles.AnalyticsScreenTabActive,
                ]}>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.AnalyticsScreenTabFiligree,
                    adaptive.isNarrow &&
                      styles.AnalyticsScreenTabNarrowFiligree,
                    active && styles.AnalyticsScreenTabActiveFiligree,
                  ]}>
                  {option}
                </Text>
              </PressableScale>
            );
          })}
        </FadeIn>

        {tab === 'Overview' || tab === 'Ratings' ? (
          <FadeIn delay={80} style={styles.AnalyticsScreenKpiLintel}>
            <KpiCard
              label="Games tracked"
              value={model.gamesTracked.toLocaleString()}
              delta={model.gamesDelta}
            />
            <KpiCard
              label="Average rating"
              value={model.avgRating.toFixed(2)}
              delta={model.ratingDelta}
            />
          </FadeIn>
        ) : null}

        {tab === 'Overview' || tab === 'Ratings' ? (
          <FadeIn delay={120}>
            <RtpCard bars={model.rtpBars} />
          </FadeIn>
        ) : null}

        {tab === 'Overview' || tab === 'Popularity' ? (
          <FadeIn delay={160}>
            <TrendCard
              width={chartWidth}
              values={model.trend}
              labels={model.trendLabels}
              delta={model.trendDelta}
            />
          </FadeIn>
        ) : null}

        {tab === 'Overview' || tab === 'Categories' ? (
          <FadeIn delay={200}>
            <CategoryCard
              total={model.gamesTracked}
              slices={model.categories}
            />
          </FadeIn>
        ) : null}

        {tab === 'Overview' || tab === 'Popularity' ? (
          <FadeIn delay={240}>
            <CompareCard titles={model.compared} />
          </FadeIn>
        ) : null}
      </ScrollView>
    </ScreenAmbient>
  );
}

function KpiCard({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta: string;
}) {
  return (
    <View style={styles.AnalyticsScreenKpiPortico}>
      <Text style={styles.AnalyticsScreenKpiLabel}>{label}</Text>
      <Text style={styles.AnalyticsScreenKpiValue}>{value}</Text>
      <Text style={styles.AnalyticsScreenKpiDelta}>{delta}</Text>
    </View>
  );
}

function RtpCard({
  bars,
}: {
  bars: Array<{label: string; value: number; highlighted: boolean}>;
}) {
  return (
    <View style={styles.AnalyticsScreenCardPortico}>
      <Text style={styles.AnalyticsScreenCardTitle}>RTP distribution</Text>
      <CapsuleBarChart
        height={118}
        maxValue={5}
        data={bars.map(bar => ({
          value: bar.value,
          label: bar.label,
          highlighted: bar.highlighted,
          topLabel: bar.value.toFixed(1),
        }))}
      />
    </View>
  );
}

function TrendCard({
  width,
  values,
  labels,
  delta,
}: {
  width: number;
  values: number[];
  labels: string[];
  delta: string;
}) {
  const data = values.map((value, index) => ({
    value,
    label: labels[index],
    labelTextStyle: styles.AnalyticsScreenAxisFiligree,
    dataPointColor:
      index === values.length - 1 ? colors.white : colors.interest,
    dataPointRadius: index === values.length - 1 ? 5 : 3.5,
  }));

  return (
    <View style={styles.AnalyticsScreenCardPortico}>
      <View style={styles.AnalyticsScreenCardHeader}>
        <Text
          style={[
            styles.AnalyticsScreenCardTitle,
            styles.AnalyticsScreenCardTitleFlush,
          ]}>
          Popularity trend
        </Text>
        <Text style={styles.AnalyticsScreenTrendDelta}>{delta}</Text>
      </View>
      <LineChart
        data={data}
        width={width}
        height={118}
        areaChart
        curved
        color={colors.accent}
        startFillColor="rgba(74, 155, 255, 0.38)"
        endFillColor="rgba(74, 155, 255, 0.02)"
        startOpacity={0.45}
        endOpacity={0.04}
        thickness={2.5}
        hideRules={false}
        rulesColor="rgba(255, 255, 255, 0.06)"
        rulesThickness={1}
        hideYAxisText
        yAxisThickness={0}
        yAxisLabelWidth={0}
        xAxisThickness={0}
        xAxisColor="transparent"
        overflowTop={12}
        isAnimated
        animationDuration={900}
        disableScroll
        initialSpacing={8}
        endSpacing={12}
        spacing={Math.max(28, (width - 24) / Math.max(values.length - 1, 1))}
      />
    </View>
  );
}

function CategoryCard({
  total,
  slices,
}: {
  total: number;
  slices: Array<{label: string; count: number}>;
}) {
  const pieData = slices.map((slice, index) => ({
    value: slice.count,
    color: CATEGORY_TONES[index] ?? CATEGORY_TONES[CATEGORY_TONES.length - 1],
  }));

  return (
    <View style={styles.AnalyticsScreenCardPortico}>
      <Text style={styles.AnalyticsScreenCardTitle}>Category distribution</Text>
      <View style={styles.AnalyticsScreenDonutLintel}>
        <PieChart
          data={pieData}
          donut
          radius={41}
          innerRadius={29}
          innerCircleColor="#080c15"
          backgroundColor="transparent"
          isAnimated
          animationDuration={800}
          centerLabelComponent={() => (
            <View style={styles.AnalyticsScreenDonutCenter}>
              <Text style={styles.AnalyticsScreenDonutValue}>
                {total.toLocaleString()}
              </Text>
              <Text style={styles.AnalyticsScreenDonutHint}>GAMES</Text>
            </View>
          )}
        />
        <View style={styles.AnalyticsScreenLegendEnclave}>
          {slices.map((slice, index) => (
            <View key={slice.label} style={styles.AnalyticsScreenLegendRow}>
              <View
                style={[
                  styles.AnalyticsScreenLegendSwatch,
                  {
                    backgroundColor:
                      CATEGORY_TONES[index] ??
                      CATEGORY_TONES[CATEGORY_TONES.length - 1],
                  },
                ]}
              />
              <Text style={styles.AnalyticsScreenLegendLabel}>
                {slice.label}
              </Text>
              <Text style={styles.AnalyticsScreenLegendValue}>
                {slice.count}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function CompareCard({titles}: {titles: CatalogueTitle[]}) {
  return (
    <View style={styles.AnalyticsScreenCardPortico}>
      <Text style={styles.AnalyticsScreenCardTitle}>Game comparison</Text>
      {titles.map((title, index) => (
        <View
          key={title.id}
          style={[
            styles.AnalyticsScreenCompareRow,
            index === 0 && styles.AnalyticsScreenCompareRowFirst,
          ]}>
          <View style={styles.AnalyticsScreenCompareHeader}>
            <Text style={styles.AnalyticsScreenCompareTitle}>
              {title.title}
            </Text>
            <Text style={styles.AnalyticsScreenCompareMeta}>
              {title.rating.toFixed(1)} · {title.popularity}% interest
            </Text>
          </View>
          <View style={styles.AnalyticsScreenMeterLintel}>
            <Meter label="Rating" value={title.rating / 5} />
            <Meter label="Interest" value={title.popularity / 100} />
            <Meter label="Saves" value={Math.min(1, title.popularity / 110)} />
            <Meter label="Reviews" value={Math.min(1, title.rating / 5.4)} />
          </View>
        </View>
      ))}
    </View>
  );
}

function Meter({label, value}: {label: string; value: number}) {
  return (
    <View style={styles.AnalyticsScreenMeter}>
      <View style={styles.AnalyticsScreenMeterTrack}>
        <View
          style={[
            styles.AnalyticsScreenMeterFill,
            {width: `${Math.round(value * 100)}%`},
          ]}
        />
      </View>
      <Text style={styles.AnalyticsScreenMeterLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  AnalyticsScreenTitleLintel: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  AnalyticsScreenTitleFiligree: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.9,
  },
  AnalyticsScreenPeriodPortico: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: colors.cardBorderStrong,
    borderRadius: 11,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    height: 30,
    paddingHorizontal: 11,
  },

  AnalyticsScreenPeriodFiligree: {
    color: colors.interest,
    fontFamily: fonts.sansRegular,
    fontSize: 11.5,
  },

  AnalyticsScreenPeriodSigil: {
    height: 10,
    tintColor: colors.interest,
    transform: [{rotate: '90deg'}],
    width: 10,
  },

  AnalyticsScreenTabsPortico: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    height: 40,
    marginTop: 16,
    padding: 3,
  },

  AnalyticsScreenTabCell: {
    flex: 1,
  },
  AnalyticsScreenTabBtn: {
    borderRadius: 9,
    height: 32,
    justifyContent: 'center',
    width: '100%',
  },

  AnalyticsScreenTabActive: {
    backgroundColor: colors.accent,
    shadowColor: colors.accentShadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 1,
    shadowRadius: 4,
  },

  AnalyticsScreenTabFiligree: {
    color: colors.body,
    fontFamily: fonts.sansRegular,
    fontSize: 12,
  },

  AnalyticsScreenTabNarrowFiligree: {
    fontSize: 10.5,
  },
  AnalyticsScreenTabActiveFiligree: {
    color: colors.white,
  },
  AnalyticsScreenKpiLintel: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },

  AnalyticsScreenKpiPortico: {
    backgroundColor: 'rgba(74, 155, 255, 0.08)',
    borderColor: 'rgba(74, 155, 255, 0.2)',
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    minHeight: 92,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  AnalyticsScreenKpiLabel: {
    color: colors.bodySoft,
    fontFamily: fonts.sansRegular,
    fontSize: 10.5,
  },

  AnalyticsScreenKpiValue: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 25,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginTop: 4,
  },
  AnalyticsScreenKpiDelta: {
    color: colors.gain,
    fontFamily: fonts.sansRegular,
    fontSize: 10.5,
    marginTop: 6,
  },

  AnalyticsScreenCardPortico: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 14,
    padding: 16,
  },
  AnalyticsScreenCardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  AnalyticsScreenCardTitle: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },

  AnalyticsScreenCardTitleFlush: {
    marginBottom: 0,
  },

  AnalyticsScreenTrendDelta: {
    color: colors.gain,
    fontFamily: fonts.sansRegular,
    fontSize: 10.5,
  },
  AnalyticsScreenAxisFiligree: {
    color: 'rgba(234, 240, 250, 0.4)',
    fontFamily: fonts.sansMedium,
    fontSize: 9,
    fontWeight: '500',
  },

  AnalyticsScreenDonutLintel: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
  },

  AnalyticsScreenDonutCenter: {
    alignItems: 'center',
  },

  AnalyticsScreenDonutValue: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 16,
    fontWeight: '700',
  },

  AnalyticsScreenDonutHint: {
    color: colors.bodyFaint,
    fontFamily: fonts.sansRegular,
    fontSize: 8.5,
    letterSpacing: 0.68,
    marginTop: 2,
  },
  AnalyticsScreenLegendEnclave: {
    flex: 1,
    gap: 10,
  },

  AnalyticsScreenLegendRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  AnalyticsScreenLegendSwatch: {
    borderRadius: 3,
    height: 9,
    marginRight: 8,
    width: 9,
  },

  AnalyticsScreenLegendLabel: {
    color: 'rgba(234, 240, 250, 0.7)',
    flex: 1,
    fontFamily: fonts.sansMedium,
    fontSize: 11.5,
    fontWeight: '500',
  },
  AnalyticsScreenLegendValue: {
    color: colors.white,
    fontFamily: fonts.sansRegular,
    fontSize: 11.5,
  },
  AnalyticsScreenCompareRow: {
    marginTop: 12,
  },

  AnalyticsScreenCompareRowFirst: {
    marginTop: 0,
  },

  AnalyticsScreenCompareHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  AnalyticsScreenCompareTitle: {
    color: colors.ivory,
    fontFamily: fonts.sansRegular,
    fontSize: 12,
  },
  AnalyticsScreenCompareMeta: {
    color: colors.bodyFaint,
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    fontWeight: '500',
  },

  AnalyticsScreenMeterLintel: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  AnalyticsScreenMeter: {
    flex: 1,
  },
  AnalyticsScreenMeterTrack: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    height: 5,
    overflow: 'hidden',
  },

  AnalyticsScreenMeterFill: {
    backgroundColor: colors.accent,
    borderRadius: 3,
    height: 5,
  },

  AnalyticsScreenMeterLabel: {
    color: colors.bodyDim,
    fontFamily: fonts.sansMedium,
    fontSize: 8.5,
    fontWeight: '500',
    marginTop: 5,
  },
});
