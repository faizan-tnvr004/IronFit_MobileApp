import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { useFonts, Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuth } from '@/context/AuthContext';
import { getActivitiesInRange, ActivityLog } from '@/services/firestoreService';

const TIME_RANGES = ['1 Week', '2 Week', '3 Week', '1 Month'] as const;
type TimeRange = (typeof TIME_RANGES)[number];

export default function ProgressScreen() {
  const { user } = useAuth();
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1 Week');
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [prevLogs, setPrevLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [fontsLoaded] = useFonts({ Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold });

  useEffect(() => {
    if (user) {
      fetchProgressData();
    }
  }, [user, selectedRange]);

  const fetchProgressData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const days = selectedRange === '1 Week' ? 7 : selectedRange === '2 Week' ? 14 : selectedRange === '3 Week' ? 21 : 30;
      
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - (days - 1));
      
      const prevEnd = new Date();
      prevEnd.setDate(start.getDate() - 1);
      const prevStart = new Date();
      prevStart.setDate(prevEnd.getDate() - (days - 1));

      const currentData = await getActivitiesInRange(user.uid, start.toISOString().split('T')[0], end.toISOString().split('T')[0]);
      const previousData = await getActivitiesInRange(user.uid, prevStart.toISOString().split('T')[0], prevEnd.toISOString().split('T')[0]);
      
      setLogs(currentData);
      setPrevLogs(previousData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!fontsLoaded || isLoading) return <View style={s.screen}><ActivityIndicator size="large" color="#F97316" style={{marginTop: 100}} /></View>;

  const currentDist = logs.reduce((s, a) => s + (a.distance ?? 0), 0);
  const prevDist = prevLogs.reduce((s, a) => s + (a.distance ?? 0), 0);
  const distIncrease = prevDist > 0 ? Math.round(((currentDist - prevDist) / prevDist) * 100) : (currentDist > 0 ? 100 : 0);

  const currentCal = logs.reduce((s, a) => s + a.caloriesBurned, 0);
  const currentSteps = Math.round(logs.filter(a => a.type === 'Walking').reduce((s, a) => s + (a.distance ?? 0), 0) * 1312);
  const currentPoints = Math.round(currentCal / 10);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKm = logs.filter(a => a.date === yesterday.toISOString().split('T')[0]).reduce((s, a) => s + (a.distance ?? 0), 0);

  const highlightText = distIncrease > 0 
    ? `Your daily distance is improving, great job!\nIn this period, you covered ${distIncrease}% more distance than the previous period.`
    : currentDist > 0 
      ? `You are staying active!\nKeep up the consistency to see even better results in the coming weeks.`
      : `No activity recorded yet for this period.\nLet's get moving and start your fitness journey today!`;

  return (
    <View style={s.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#13131f" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={s.header}>
          <Text style={s.title}>My Progress</Text>
          <Text style={s.sub}>Track your fitness journey</Text>
        </View>

        <View style={s.stepsCard}>
          <View style={s.stepsRow}>
            <View style={s.stepsIconWrap}>
              <FontAwesome name="th-large" size={18} color="#fff" />
            </View>
            <View style={{ marginLeft: 14 }}>
              <Text style={s.stepsValue}>{currentSteps.toLocaleString()}</Text>
              <Text style={s.stepsLabel}>Total Walking Steps</Text>
            </View>
          </View>

          <View style={s.rangePicker}>
            {TIME_RANGES.map((range) => (
              <TouchableOpacity
                key={range}
                style={[s.rangeBtn, selectedRange === range && s.rangeBtnActive]}
                onPress={() => setSelectedRange(range)}
                activeOpacity={0.7}
              >
                <Text style={[s.rangeBtnNum, selectedRange === range && s.rangeBtnNumActive]}>{range.split(' ')[0]}</Text>
                <Text style={[s.rangeBtnText, selectedRange === range && s.rangeBtnTextActive]}>{range.split(' ')[1]}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={s.increaseCard}>
            <View style={s.increaseLeft}>
              <View style={s.increaseIconWrap}>
                <FontAwesome name="line-chart" size={16} color="#fff" />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={s.increaseTitle}>Distance Change</Text>
                <Text style={[s.increasePercent, { color: distIncrease >= 0 ? '#22C55E' : '#EF4444' }]}>{distIncrease > 0 ? '+' : ''}{distIncrease}%</Text>
                <Text style={s.increaseYesterday}>yesterday: {yesterdayKm.toFixed(1)} Km</Text>
              </View>
            </View>
            <FontAwesome name="chevron-right" size={14} color="#9999bb" />
          </View>
        </View>

        <View style={s.statsCard}>
          <View style={s.statsRow}>
            {[
              { value: currentDist.toFixed(2), unit: 'km', label: 'Distance' },
              { value: currentCal.toLocaleString(), unit: 'kcal', label: 'Calories' },
              { value: currentPoints.toLocaleString(), unit: 'pts', label: 'Points' },
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

        <View style={s.highlightsSection}>
          <View style={s.highlightsHeader}>
            <Text style={s.highlightsTitle}>Highlights</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={s.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <Text style={s.highlightBody}>{highlightText}</Text>
          
          <View style={s.highlightRow}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <Text style={s.highlightKm}>{(currentDist / (selectedRange === '1 Week' ? 7 : selectedRange === '2 Week' ? 14 : selectedRange === '3 Week' ? 21 : 30)).toFixed(1)}</Text>
              <Text style={s.highlightKmUnit}> Km/day avg</Text>
            </View>
            <View style={[s.dateBadge, s.dateBadgePrimary]}>
              <Text style={[s.dateBadgeText, s.dateBadgeTextPrimary]}>Current Period</Text>
            </View>
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
  stepsCard: { marginHorizontal: 16, backgroundColor: '#1e1e30', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#2e2e44' },
  stepsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  stepsIconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#2d2b55', alignItems: 'center', justifyContent: 'center' },
  stepsValue: { fontFamily: 'Nunito_800ExtraBold', fontSize: 30, color: '#fff' },
  stepsLabel: { fontFamily: 'Nunito_400Regular', fontSize: 13, color: '#9999bb', marginTop: -2 },
  rangePicker: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  rangeBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 14, backgroundColor: '#13131f', borderWidth: 1, borderColor: '#2e2e44' },
  rangeBtnActive: { backgroundColor: '#2d2b55', borderColor: '#5b57a6' },
  rangeBtnNum: { fontFamily: 'Nunito_800ExtraBold', fontSize: 16, color: '#9999bb' },
  rangeBtnNumActive: { color: '#fff' },
  rangeBtnText: { fontFamily: 'Nunito_400Regular', fontSize: 11, color: '#9999bb', marginTop: 1 },
  rangeBtnTextActive: { color: '#c4c0ff' },
  increaseCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#13131f', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#2e2e44' },
  increaseLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  increaseIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2d2b55', alignItems: 'center', justifyContent: 'center' },
  increaseTitle: { fontFamily: 'Nunito_600SemiBold', fontSize: 14, color: '#e0e0ff' },
  increasePercent: { fontFamily: 'Nunito_800ExtraBold', fontSize: 18, color: '#F97316' },
  increaseYesterday: { fontFamily: 'Nunito_400Regular', fontSize: 12, color: '#9999bb', marginTop: 1 },
  statsCard: { marginHorizontal: 16, marginTop: 16, backgroundColor: '#1e1e30', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#2e2e44' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statCol: { flex: 1, alignItems: 'center' },
  statDiv: { width: 1, backgroundColor: '#2e2e44', marginVertical: 4 },
  statLabel: { fontFamily: 'Nunito_400Regular', fontSize: 12, color: '#9999bb', marginBottom: 6 },
  statValue: { fontFamily: 'Nunito_800ExtraBold', fontSize: 22, color: '#fff' },
  statUnit: { fontFamily: 'Nunito_400Regular', fontSize: 12, color: '#9999bb' },
  highlightsSection: { marginHorizontal: 16, marginTop: 24, backgroundColor: '#1e1e30', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#2e2e44' },
  highlightsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  highlightsTitle: { fontFamily: 'Nunito_700Bold', fontSize: 20, color: '#fff' },
  seeAll: { fontFamily: 'Nunito_600SemiBold', fontSize: 13, color: '#F97316' },
  highlightBody: { fontFamily: 'Nunito_400Regular', fontSize: 13, color: '#9999bb', lineHeight: 20, marginBottom: 20 },
  highlightRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 14 },
  highlightKm: { fontFamily: 'Nunito_800ExtraBold', fontSize: 26, color: '#fff' },
  highlightKmUnit: { fontFamily: 'Nunito_400Regular', fontSize: 13, color: '#9999bb' },
  dateBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  dateBadgePrimary: { backgroundColor: '#2d2b55' },
  dateBadgeText: { fontFamily: 'Nunito_600SemiBold', fontSize: 12 },
  dateBadgeTextPrimary: { color: '#c4c0ff' },
});
