import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useFonts, Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { useAuth } from '@/context/AuthContext';
import { useActivities } from '@/context/ActivityContext';
import { getAllActivities, getActivitiesByDate, ActivityLog } from '@/services/firestoreService';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const TODAY = new Date().toISOString().split('T')[0];

export default function HistoryScreen() {
  const { user } = useAuth();
  const { workouts, refreshTrigger } = useActivities();
  const [sel, setSel] = useState(TODAY);
  const [allActivities, setAllActivities] = useState<ActivityLog[]>([]);
  const [dayActivities, setDayActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDayLoading, setIsDayLoading] = useState(false);

  const [fontsLoaded] = useFonts({ Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold });

  useEffect(() => {
    if (user) {
      fetchAllActivities();
      fetchDayActivities(sel);
    }
  }, [user, refreshTrigger]);

  const fetchAllActivities = async () => {
    if (!user) return;
    try {
      const data = await getAllActivities(user.uid);
      setAllActivities(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDayActivities = async (date: string) => {
    if (!user) return;
    setIsDayLoading(true);
    try {
      const data = await getActivitiesByDate(user.uid, date);
      setDayActivities(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDayLoading(false);
    }
  };

  const handleDayPress = (day: any) => {
    setSel(day.dateString);
    fetchDayActivities(day.dateString);
  };

  if (!fontsLoaded || isLoading) return <View style={s.screen}><ActivityIndicator size="large" color="#F97316" style={{marginTop: 100}} /></View>;

  const totalCal = dayActivities.reduce((s, a) => s + a.caloriesBurned, 0);
  const totalMin = dayActivities.reduce((s, a) => s + a.durationMin, 0);
  const totalKm = dayActivities.reduce((s, a) => s + (a.distance ?? 0), 0);

  const markedDates: Record<string, any> = {};
  allActivities.forEach(a => {
    markedDates[a.date] = { marked: true, dotColor: '#F97316' };
  });
  markedDates[sel] = { ...(markedDates[sel] || {}), selected: true, selectedColor: '#F97316', selectedTextColor: '#fff' };

  let displayDate = 'Invalid Date';
  let monthName = 'Summary';
  try {
    if (sel) {
      const dateObj = new Date(sel + 'T00:00:00');
      if (!isNaN(dateObj.getTime())) {
        displayDate = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        monthName = dateObj.toLocaleDateString('en-US', { month: 'long' });
      }
    }
  } catch (e) {
    console.error("Date error:", e);
  }

  // Monthly summary (for the month of the selected date)
  const selMonth = sel.split('-')[1];
  const monthActivities = allActivities.filter(a => a.date.split('-')[1] === selMonth);
  const monthWorkouts = monthActivities.length;
  const monthCal = monthActivities.reduce((s, a) => s + a.caloriesBurned, 0);
  const monthKm = monthActivities.reduce((s, a) => s + (a.distance ?? 0), 0);

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
            current={sel}
            markedDates={markedDates}
            onDayPress={handleDayPress}
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
          {isDayLoading ? (
            <ActivityIndicator size="small" color="#F97316" />
          ) : (
            dayActivities.length > 0 && (
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
            )
          )}
        </View>

        {/* Activity list */}
        {!isDayLoading && dayActivities.length === 0 ? (
          <View style={s.empty}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🌙</Text>
            <Text style={s.emptyT}>Rest Day</Text>
            <Text style={s.emptySub}>No activities logged for this day.</Text>
          </View>
        ) : (
          <View style={s.list}>
            {dayActivities.map(a => {
              const workout = workouts.find(w => w.name === a.type);
              const color = workout?.color || '#9999bb';
              const icon = workout?.icon || 'circle';

              return (
                <View key={a.id} style={s.row}>
                  <View style={[s.icon, { backgroundColor: color + '22' }]}>
                    <FontAwesome name={icon as any} size={22} color={color} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text style={s.actName}>{a.type}</Text>
                    <Text style={s.actMeta}>{a.durationMin} min{a.distance ? `  •  ${a.distance} km` : ''} • {a.time}</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={[s.kcal, { color: color }]}>{a.caloriesBurned}</Text>
                    <Text style={s.kcalLbl}>kcal</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Monthly summary */}
        <View style={s.summaryCard}>
          <Text style={s.summaryTitle}>{monthName} Summary</Text>
          <View style={s.summaryRow}>
            {[{ v: monthWorkouts.toString(), l: 'Workouts' }, { v: monthCal.toLocaleString(), l: 'kcal burned' }, { v: monthKm.toFixed(1), l: 'km total' }].map((it, i) => (
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
