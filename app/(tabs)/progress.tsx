// app/(tabs)/progress.tsx — IronFit My Progress Screen

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {
  useFonts,
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';
import FontAwesome from '@expo/vector-icons/FontAwesome';

// ─── Mock Data ───────────────────────────────────────────────────────────────

const TIME_RANGES = ['1 Week', '2 Week', '3 Week', '1 Month'] as const;
type TimeRange = (typeof TIME_RANGES)[number];

interface WeeklyHighlight {
  avgKm: number;
  dateRange: string;
}

const PROGRESS_DATA: Record<
  TimeRange,
  {
    steps: number;
    distanceIncrease: number;
    yesterdayKm: number;
    distance: number;
    calories: number;
    points: number;
    highlights: WeeklyHighlight[];
    highlightText: string;
  }
> = {
  '1 Week': {
    steps: 8792,
    distanceIncrease: 37,
    yesterdayKm: 2.8,
    distance: 6.834,
    calories: 1.9,
    points: 1.136,
    highlights: [
      { avgKm: 3.2, dateRange: '18 - 25 April' },
      { avgKm: 2.8, dateRange: '11 - 17 April' },
    ],
    highlightText:
      'Your daily distance is improving, great job!\nLast week, you walked and ran farther than the week before.',
  },
  '2 Week': {
    steps: 16540,
    distanceIncrease: 24,
    yesterdayKm: 3.1,
    distance: 12.45,
    calories: 3.62,
    points: 2.108,
    highlights: [
      { avgKm: 3.0, dateRange: '11 - 25 April' },
      { avgKm: 2.5, dateRange: '28 Mar - 10 April' },
    ],
    highlightText:
      'You have been consistent over the past two weeks.\nKeep up the momentum — you are building a solid habit!',
  },
  '3 Week': {
    steps: 23100,
    distanceIncrease: 18,
    yesterdayKm: 2.6,
    distance: 17.92,
    calories: 5.14,
    points: 3.024,
    highlights: [
      { avgKm: 2.9, dateRange: '4 - 25 April' },
      { avgKm: 2.4, dateRange: '14 - 3 April' },
    ],
    highlightText:
      'Three weeks of consistent training!\nYour endurance is clearly improving over time.',
  },
  '1 Month': {
    steps: 31250,
    distanceIncrease: 42,
    yesterdayKm: 3.4,
    distance: 24.6,
    calories: 7.38,
    points: 4.512,
    highlights: [
      { avgKm: 3.1, dateRange: '1 - 25 April' },
      { avgKm: 2.2, dateRange: '1 - 31 March' },
    ],
    highlightText:
      'Amazing month! Your distance increased 42% compared to March.\nYou have ve burned over 7,000 calories this month.',
  },
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function ProgressScreen() {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1 Week');
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  if (!fontsLoaded) return null;

  const data = PROGRESS_DATA[selectedRange];

  return (
    <View style={s.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#13131f" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>My Progress</Text>
          <Text style={s.sub}>Track your fitness journey</Text>
        </View>

        {/* ── Steps Card ── */}
        <View style={s.stepsCard}>
          <View style={s.stepsRow}>
            <View style={s.stepsIconWrap}>
              <FontAwesome name="th-large" size={18} color="#fff" />
            </View>
            <View style={{ marginLeft: 14 }}>
              <Text style={s.stepsValue}>
                {data.steps.toLocaleString()}
              </Text>
              <Text style={s.stepsLabel}>Steps</Text>
            </View>
          </View>

          {/* ── Time Range Selector ── */}
          <View style={s.rangePicker}>
            {TIME_RANGES.map((range) => (
              <TouchableOpacity
                key={range}
                style={[
                  s.rangeBtn,
                  selectedRange === range && s.rangeBtnActive,
                ]}
                onPress={() => setSelectedRange(range)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    s.rangeBtnNum,
                    selectedRange === range && s.rangeBtnNumActive,
                  ]}
                >
                  {range.split(' ')[0]}
                </Text>
                <Text
                  style={[
                    s.rangeBtnText,
                    selectedRange === range && s.rangeBtnTextActive,
                  ]}
                >
                  {range.split(' ')[1]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Distance Increase Card ── */}
          <View style={s.increaseCard}>
            <View style={s.increaseLeft}>
              <View style={s.increaseIconWrap}>
                <FontAwesome name="line-chart" size={16} color="#fff" />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={s.increaseTitle}>Distance Increase</Text>
                <Text style={s.increasePercent}>{data.distanceIncrease}%</Text>
                <Text style={s.increaseYesterday}>
                  yesterday: {data.yesterdayKm} Km
                </Text>
              </View>
            </View>
            <FontAwesome name="chevron-right" size={14} color="#9999bb" />
          </View>
        </View>

        {/* ── Stats Row ── */}
        <View style={s.statsCard}>
          <View style={s.statsRow}>
            {[
              { value: data.distance.toFixed(3), unit: 'm', label: 'Distance' },
              {
                value: data.calories.toFixed(3),
                unit: 'kcal',
                label: 'Calories',
              },
              { value: data.points.toFixed(3), unit: 'pts', label: 'Points' },
            ].map((stat, i) => (
              <React.Fragment key={stat.label}>
                {i > 0 && <View style={s.statDiv} />}
                <View style={s.statCol}>
                  <Text style={s.statLabel}>{stat.label}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                    <Text style={s.statValue}>{stat.value}</Text>
                    <Text style={s.statUnit}> {stat.unit}</Text>
                  </View>
                </View>
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* ── Highlights ── */}
        <View style={s.highlightsSection}>
          <View style={s.highlightsHeader}>
            <Text style={s.highlightsTitle}>Highlights</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={s.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          <Text style={s.highlightBody}>{data.highlightText}</Text>

          {data.highlights.map((h, i) => (
            <View key={i} style={s.highlightRow}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Text style={s.highlightKm}>{h.avgKm}</Text>
                <Text style={s.highlightKmUnit}> Km/day</Text>
              </View>
              <View
                style={[
                  s.dateBadge,
                  i === 0 ? s.dateBadgePrimary : s.dateBadgeSecondary,
                ]}
              >
                <Text
                  style={[
                    s.dateBadgeText,
                    i === 0
                      ? s.dateBadgeTextPrimary
                      : s.dateBadgeTextSecondary,
                  ]}
                >
                  {h.dateRange}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#13131f',
  },

  /* Header */
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 32,
    color: '#fff',
  },
  sub: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: '#9999bb',
    marginTop: 2,
  },

  /* Steps Card */
  stepsCard: {
    marginHorizontal: 16,
    backgroundColor: '#1e1e30',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2e2e44',
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  stepsIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2d2b55',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepsValue: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 30,
    color: '#fff',
  },
  stepsLabel: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: '#9999bb',
    marginTop: -2,
  },

  /* Time Range Picker */
  rangePicker: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  rangeBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#13131f',
    borderWidth: 1,
    borderColor: '#2e2e44',
  },
  rangeBtnActive: {
    backgroundColor: '#2d2b55',
    borderColor: '#5b57a6',
  },
  rangeBtnNum: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 16,
    color: '#9999bb',
  },
  rangeBtnNumActive: {
    color: '#fff',
  },
  rangeBtnText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 11,
    color: '#9999bb',
    marginTop: 1,
  },
  rangeBtnTextActive: {
    color: '#c4c0ff',
  },

  /* Distance Increase Card */
  increaseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#13131f',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2e2e44',
  },
  increaseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  increaseIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2d2b55',
    alignItems: 'center',
    justifyContent: 'center',
  },
  increaseTitle: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: '#e0e0ff',
  },
  increasePercent: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 18,
    color: '#F97316',
  },
  increaseYesterday: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: '#9999bb',
    marginTop: 1,
  },

  /* Stats */
  statsCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#1e1e30',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2e2e44',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statDiv: {
    width: 1,
    backgroundColor: '#2e2e44',
    marginVertical: 4,
  },
  statLabel: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: '#9999bb',
    marginBottom: 6,
  },
  statValue: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 22,
    color: '#fff',
  },
  statUnit: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: '#9999bb',
  },

  /* Highlights */
  highlightsSection: {
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: '#1e1e30',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2e2e44',
  },
  highlightsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  highlightsTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 20,
    color: '#fff',
  },
  seeAll: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: '#F97316',
  },
  highlightBody: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: '#9999bb',
    lineHeight: 20,
    marginBottom: 20,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 14,
  },
  highlightKm: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 26,
    color: '#fff',
  },
  highlightKmUnit: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: '#9999bb',
  },
  dateBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  dateBadgePrimary: {
    backgroundColor: '#2d2b55',
  },
  dateBadgeSecondary: {
    backgroundColor: '#F9731622',
  },
  dateBadgeText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
  },
  dateBadgeTextPrimary: {
    color: '#c4c0ff',
  },
  dateBadgeTextSecondary: {
    color: '#F97316',
  },
});
