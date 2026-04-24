// app/(tabs)/history.tsx — IronFit History/Calendar Screen

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useFonts, Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';

type Activity = {
  id: string; type: 'Running' | 'Cycling' | 'Swimming' | 'Yoga' | 'Walking';
  duration: number; calories: number; distance?: number; time: string;
};

const ICONS: Record<string, string> = { Running: '🏃', Cycling: '🚴', Swimming: '🏊', Yoga: '🧘', Walking: '🚶' };
const COLORS: Record<string, string> = { Running: '#F97316', Cycling: '#22C55E', Swimming: '#3B82F6', Yoga: '#A855F7', Walking: '#EAB308' };
const TODAY = new Date().toISOString().split('T')[0];

const DATA: Record<string, Activity[]> = {
  [TODAY]: [
    { id: '1', type: 'Running', duration: 25, calories: 220, distance: 3.2, time: '07:00 AM' },
    { id: '2', type: 'Cycling', duration: 45, calories: 380, distance: 12.5, time: '05:30 PM' },
  ],
  '2026-04-23': [{ id: '3', type: 'Swimming', duration: 40, calories: 320, time: '06:00 AM' }],
  '2026-04-22': [
    { id: '4', type: 'Yoga', duration: 60, calories: 180, time: '08:00 AM' },
    { id: '5', type: 'Walking', duration: 30, calories: 120, distance: 2.8, time: '07:00 PM' },
  ],
  '2026-04-20': [{ id: '6', type: 'Running', duration: 35, calories: 310, distance: 4.5, time: '06:30 AM' }],
};

export default function HistoryScreen() {
  const [sel, setSel] = useState(TODAY);
  const [fontsLoaded] = useFonts({ Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold });
  if (!fontsLoaded) return null;

  const acts = DATA[sel] ?? [];
  const totalCal = acts.reduce((s, a) => s + a.calories, 0);
  const totalMin = acts.reduce((s, a) => s + a.duration, 0);
  const totalKm = acts.reduce((s, a) => s + (a.distance ?? 0), 0);

  const markedDates: Record<string, any> = {};
  Object.keys(DATA).forEach(d => { markedDates[d] = { marked: true, dotColor: '#F97316' }; });
  markedDates[sel] = { ...(markedDates[sel] || {}), selected: true, selectedColor: '#F97316', selectedTextColor: '#fff' };

  const displayDate = new Date(sel + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <View style={s.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#13131f" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>History</Text>
          <Text style={s.sub}>Your activity log</Text>
        </View>

        {/* Calendar */}
        <View style={s.calWrap}>
          <Calendar
            current={TODAY}
            markedDates={markedDates}
            onDayPress={(day: any) => setSel(day.dateString)}
            theme={{
              backgroundColor: '#1e1e30', calendarBackground: '#1e1e30',
              textSectionTitleColor: '#9999bb', selectedDayBackgroundColor: '#F97316',
              selectedDayTextColor: '#fff', todayTextColor: '#F97316', dayTextColor: '#e0e0ff',
              textDisabledColor: '#44445a', dotColor: '#F97316', arrowColor: '#F97316',
              monthTextColor: '#fff', textDayFontFamily: 'Nunito_600SemiBold',
              textMonthFontFamily: 'Nunito_800ExtraBold', textDayHeaderFontFamily: 'Nunito_700Bold',
              textDayFontSize: 14, textMonthFontSize: 17, textDayHeaderFontSize: 12,
            }}
            style={{ borderRadius: 20 }}
          />
        </View>

        {/* Day header */}
        <View style={s.dayHead}>
          <Text style={s.dayTitle}>{displayDate}</Text>
          {acts.length > 0 && (
            <View style={s.statsRow}>
              {[{ v: totalCal, l: 'kcal' }, { v: totalMin, l: 'min' }, { v: totalKm.toFixed(1), l: 'km' }].map((it, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <View style={s.div} />}
                  <View style={s.statCol}>
                    <Text style={s.statVal}>{it.v}</Text>
                    <Text style={s.statLbl}>{it.l}</Text>
                  </View>
                </React.Fragment>
              ))}
            </View>
          )}
        </View>

        {/* Activity list */}
        {acts.length === 0 ? (
          <View style={s.empty}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🌙</Text>
            <Text style={s.emptyT}>Rest Day</Text>
            <Text style={s.emptySub}>No activities logged for this day.</Text>
          </View>
        ) : (
          <View style={s.list}>
            {acts.map(a => (
              <View key={a.id} style={s.row}>
                <View style={[s.icon, { backgroundColor: COLORS[a.type] + '22' }]}>
                  <Text style={{ fontSize: 22 }}>{ICONS[a.type]}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={s.actName}>{a.type}</Text>
                  <Text style={s.actMeta}>{a.duration} min{a.distance ? `  •  ${a.distance} km` : ''} • {a.time}</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={[s.kcal, { color: COLORS[a.type] }]}>{a.calories}</Text>
                  <Text style={s.kcalLbl}>kcal</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Monthly summary */}
        <View style={s.summaryCard}>
          <Text style={s.summaryTitle}>April Summary</Text>
          <View style={s.summaryRow}>
            {[{ v: '12', l: 'Workouts' }, { v: '2,450', l: 'kcal burned' }, { v: '38.2', l: 'km total' }].map((it, i) => (
              <View key={i} style={{ alignItems: 'center' }}>
                <Text style={s.sumVal}>{it.v}</Text>
                <Text style={s.sumLbl}>{it.l}</Text>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#13131f' },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 16 },
  title: { fontFamily: 'Nunito_800ExtraBold', fontSize: 32, color: '#fff' },
  sub: { fontFamily: 'Nunito_400Regular', fontSize: 14, color: '#9999bb', marginTop: 2 },
  calWrap: { marginHorizontal: 16, borderRadius: 20, overflow: 'hidden', elevation: 4 },
  dayHead: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 8 },
  dayTitle: { fontFamily: 'Nunito_700Bold', fontSize: 18, color: '#fff', marginBottom: 12 },
  statsRow: { flexDirection: 'row', backgroundColor: '#1e1e30', borderRadius: 16, padding: 16 },
  statCol: { flex: 1, alignItems: 'center' },
  statVal: { fontFamily: 'Nunito_800ExtraBold', fontSize: 20, color: '#F97316' },
  statLbl: { fontFamily: 'Nunito_400Regular', fontSize: 11, color: '#9999bb', marginTop: 2 },
  div: { width: 1, backgroundColor: '#2e2e44', marginVertical: 4 },
  list: { paddingHorizontal: 16, paddingTop: 8, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e1e30', borderRadius: 16, padding: 14 },
  icon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  actName: { fontFamily: 'Nunito_700Bold', fontSize: 16, color: '#fff' },
  actMeta: { fontFamily: 'Nunito_400Regular', fontSize: 12, color: '#9999bb', marginTop: 3 },
  kcal: { fontFamily: 'Nunito_800ExtraBold', fontSize: 18 },
  kcalLbl: { fontFamily: 'Nunito_400Regular', fontSize: 10, color: '#9999bb' },
  empty: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  emptyT: { fontFamily: 'Nunito_700Bold', fontSize: 20, color: '#fff', marginBottom: 8 },
  emptySub: { fontFamily: 'Nunito_400Regular', fontSize: 14, color: '#9999bb', textAlign: 'center' },
  summaryCard: { margin: 16, marginTop: 24, backgroundColor: '#1e1e30', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#2e2e44' },
  summaryTitle: { fontFamily: 'Nunito_700Bold', fontSize: 16, color: '#fff', marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
  sumVal: { fontFamily: 'Nunito_800ExtraBold', fontSize: 22, color: '#F97316' },
  sumLbl: { fontFamily: 'Nunito_400Regular', fontSize: 12, color: '#9999bb', marginTop: 4 },
});
