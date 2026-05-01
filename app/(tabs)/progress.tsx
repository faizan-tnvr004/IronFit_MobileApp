import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, Modal, TextInput, Alert, Dimensions } from 'react-native';
import { useFonts, Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LineChart } from 'react-native-chart-kit';
import { useAuth } from '@/context/AuthContext';
import { getActivitiesInRange, ActivityLog, getWeightLogs, addWeightLog, WeightLog } from '@/services/firestoreService';

const TIME_RANGES = ['1 Week', '2 Week', '3 Week', '1 Month'] as const;
type TimeRange = (typeof TIME_RANGES)[number];
const W = Dimensions.get('window').width;

export default function ProgressScreen() {
  const { user, refreshProfile } = useAuth();
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1 Week');
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [prevLogs, setPrevLogs] = useState<ActivityLog[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Weight logging modal
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [isSubmittingWeight, setIsSubmittingWeight] = useState(false);

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

      const [currentData, previousData, wData] = await Promise.all([
        getActivitiesInRange(user.uid, start.toISOString().split('T')[0], end.toISOString().split('T')[0]),
        getActivitiesInRange(user.uid, prevStart.toISOString().split('T')[0], prevEnd.toISOString().split('T')[0]),
        getWeightLogs(user.uid)
      ]);
      
      setLogs(currentData);
      setPrevLogs(previousData);
      setWeightLogs(wData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogWeight = async () => {
    if (!newWeight || !user) return;
    setIsSubmittingWeight(true);
    try {
      await addWeightLog(user.uid, {
        weight: parseFloat(newWeight),
        date: new Date().toISOString().split('T')[0]
      });
      await refreshProfile();
      await fetchProgressData();
      setShowWeightModal(false);
      setNewWeight('');
      Alert.alert('Success', 'Weight logged successfully!');
    } catch (err) {
      Alert.alert('Error', 'Failed to log weight');
    } finally {
      setIsSubmittingWeight(false);
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

  // Weight Chart Data - ensuring we have safe defaults to prevent render errors
  const lastSevenWeightLogs = weightLogs.slice(-7);
  const wLabels = lastSevenWeightLogs.map(wl => {
    const parts = wl.date ? wl.date.split('-') : [];
    return parts.length >= 3 ? `${parts[1]}/${parts[2]}` : '??/??';
  });
  const wValues = lastSevenWeightLogs.map(wl => wl.weight || 0);
  
  const weightChartData = {
    labels: wLabels.length > 0 ? wLabels : ['No Data'],
    datasets: [{
      data: wValues.length > 0 ? wValues : [0],
      strokeWidth: 2,
    }],
  };

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

        {/* Weight Chart Section */}
        <View style={s.statsCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={s.infoTitle}>Weight Trend (kg)</Text>
            <TouchableOpacity style={s.addWeightBtn} onPress={() => setShowWeightModal(true)}>
              <Text style={s.addWeightText}>+ Log Weight</Text>
            </TouchableOpacity>
          </View>
          {weightLogs.length > 0 ? (
            <LineChart
              data={weightChartData}
              width={W - 64}
              height={180}
              chartConfig={{
                backgroundColor: '#1e1e30',
                backgroundGradientFrom: '#1e1e30',
                backgroundGradientTo: '#1e1e30',
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(249, 115, 22, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(153, 153, 187, ${opacity})`,
                propsForDots: { r: '4', strokeWidth: '2', stroke: '#F97316' },
                propsForBackgroundLines: { stroke: '#2e2e44' },
              }}
              bezier
              style={{ borderRadius: 16 }}
            />
          ) : (
            <View style={s.emptyWeight}>
              <Text style={s.emptyWeightText}>No weight logs yet. Start tracking to see progress!</Text>
            </View>
          )}
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

      {/* Weight Modal */}
      <Modal visible={showWeightModal} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Log Your Weight</Text>
            <TextInput
              style={s.modalInput}
              placeholder="e.g. 72.5"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={newWeight}
              onChangeText={setNewWeight}
              autoFocus
            />
            <View style={s.modalActions}>
              <TouchableOpacity style={s.modalCancel} onPress={() => setShowWeightModal(false)} disabled={isSubmittingWeight}>
                <Text style={s.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.modalSave} onPress={handleLogWeight} disabled={isSubmittingWeight}>
                <Text style={s.modalSaveText}>{isSubmittingWeight ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  infoTitle: { fontFamily: 'Nunito_700Bold', fontSize: 18, color: '#fff' },
  addWeightBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: '#F9731618', borderWidth: 1, borderColor: '#F9731633' },
  addWeightText: { fontFamily: 'Nunito_700Bold', fontSize: 12, color: '#F97316' },
  emptyWeight: { height: 100, alignItems: 'center', justifyContent: 'center' },
  emptyWeightText: { fontFamily: 'Nunito_400Regular', fontSize: 13, color: '#9999bb', textAlign: 'center' },
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
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 24 },
  modalCard: { backgroundColor: '#1e1e30', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#2e2e44' },
  modalTitle: { fontFamily: 'Nunito_700Bold', fontSize: 20, color: '#fff', marginBottom: 20 },
  modalInput: { backgroundColor: '#13131f', borderRadius: 12, padding: 14, fontFamily: 'Nunito_600SemiBold', fontSize: 16, color: '#e0e0ff', borderWidth: 1, borderColor: '#2e2e44', marginBottom: 20 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  modalCancel: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, backgroundColor: '#13131f', borderWidth: 1, borderColor: '#2e2e44' },
  modalCancelText: { fontFamily: 'Nunito_600SemiBold', fontSize: 14, color: '#9999bb' },
  modalSave: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, backgroundColor: '#F97316' },
  modalSaveText: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: '#fff' },
});
