import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  StatusBar, TouchableOpacity, Dimensions, Alert, Modal, TextInput, ActivityIndicator
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { LineChart } from 'react-native-chart-kit';
import {
  useFonts, Nunito_400Regular, Nunito_600SemiBold,
  Nunito_700Bold, Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';
import { useAuth } from '@/context/AuthContext';
import { addActivityLog, getActivitiesInRange, calculateCalories, ActivityLog } from '@/services/firestoreService';
import { useActivities } from '@/context/ActivityContext';

const W = Dimensions.get('window').width;

export default function RunningScreen() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const { refreshActivities } = useActivities();
  const [fontsLoaded] = useFonts({
    Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold,
  });

  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const today = new Date();
      const weekAgo = new Date();
      weekAgo.setDate(today.getDate() - 6);
      
      const d1 = weekAgo.toISOString().split('T')[0];
      const d2 = today.toISOString().split('T')[0];
      
      const data = await getActivitiesInRange(user.uid, d1, d2);
      const runningLogs = data.filter(a => a.type === 'Running');
      setLogs(runningLogs);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogActivity = async () => {
    if (!duration || !distance || !date) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (!user || !userProfile) return;

    setIsSubmitting(true);
    try {
      const durNum = parseInt(duration);
      const distNum = parseFloat(distance);
      const calories = calculateCalories('Running', durNum, userProfile.weightKg);

      await addActivityLog(user.uid, {
        type: 'Running',
        durationMin: durNum,
        distance: distNum,
        caloriesBurned: calories,
        date: date,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      });

      Alert.alert('Success', 'Activity logged successfully!');
      setShowModal(false);
      setDuration('');
      setDistance('');
      fetchData();
      refreshActivities();
    } catch (err) {
      Alert.alert('Error', 'Failed to log activity');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!fontsLoaded) return null;

  // Calculate stats
  const totalDistance = logs.reduce((sum, log) => sum + (log.distance || 0), 0);
  const totalTime = logs.reduce((sum, log) => sum + log.durationMin, 0);
  const totalCalories = logs.reduce((sum, log) => sum + log.caloriesBurned, 0);
  const pace = totalDistance > 0 ? (totalTime / totalDistance).toFixed(2) : '0';

  // Chart data (last 7 days)
  const chartData = [0, 0, 0, 0, 0, 0, 0];
  const labels = ['6d', '5d', '4d', '3d', '2d', '1d', 'Today'];
  
  if (logs.length > 0) {
    const today = new Date();
    today.setHours(0,0,0,0);
    logs.forEach(log => {
      const logDate = new Date(log.date);
      const diffTime = Math.abs(today.getTime() - logDate.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < 7) {
        chartData[6 - diffDays] += (log.distance || 0);
      }
    });
  }

  const weekData = {
    labels,
    datasets: [{ data: chartData.some(d => d > 0) ? chartData : [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1], strokeWidth: 2 }],
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#13131f" />

      <View style={s.container}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={16} color="#fff" />
        </TouchableOpacity>

        <Text style={s.title}>Running</Text>

        {isLoading ? (
          <ActivityIndicator size="large" color="#F97316" style={{ marginTop: 50 }} />
        ) : (
          <>
            <View style={s.statsGrid}>
              {[
                { label: 'Distance (7d)', value: totalDistance.toFixed(1), unit: 'km' },
                { label: 'Avg Pace',      value: pace, unit: '/km' },
                { label: 'Calories',      value: totalCalories.toString(), unit: 'kcal' },
                { label: 'Time',          value: totalTime.toString(), unit: 'min' },
              ].map((stat) => (
                <View key={stat.label} style={s.statCard}>
                  <Text style={s.statLabel}>{stat.label}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                    <Text style={s.statValue}>{stat.value}</Text>
                    <Text style={s.statUnit}>{stat.unit}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={s.chartCard}>
              <Text style={s.chartTitle}>Weekly Distance (km)</Text>
              <LineChart
                data={weekData}
                width={W - 64}
                height={180}
                chartConfig={{
                  backgroundColor: '#1e1e30',
                  backgroundGradientFrom: '#1e1e30',
                  backgroundGradientTo: '#1e1e30',
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(249,115,22,${opacity})`,
                  labelColor: (opacity = 1) => `rgba(153,153,187,${opacity})`,
                  propsForDots: { r: '4', strokeWidth: '2', stroke: '#F97316' },
                  propsForBackgroundLines: { stroke: '#2e2e44', strokeDasharray: '4' },
                }}
                bezier
                style={{ borderRadius: 12, marginTop: 8 }}
                withShadow={false}
              />
            </View>
          </>
        )}
      </View>

      <View style={s.footer}>
        <TouchableOpacity style={s.startBtn} onPress={() => setShowModal(true)}>
          <FontAwesome name="plus" size={16} color="#fff" style={{ marginRight: 10 }} />
          <Text style={s.startBtnText}>Log Activity</Text>
        </TouchableOpacity>
      </View>

      {/* Log Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Log Running Session</Text>
            
            <View style={s.inputWrap}>
              <Text style={s.modalLabel}>Date (YYYY-MM-DD)</Text>
              <TextInput style={s.modalInput} value={date} onChangeText={setDate} placeholder="2026-04-25" placeholderTextColor="#666" />
            </View>
            
            <View style={s.inputWrap}>
              <Text style={s.modalLabel}>Duration (minutes)</Text>
              <TextInput style={s.modalInput} value={duration} onChangeText={setDuration} keyboardType="numeric" placeholder="e.g. 30" placeholderTextColor="#666" />
            </View>

            <View style={s.inputWrap}>
              <Text style={s.modalLabel}>Distance (km)</Text>
              <TextInput style={s.modalInput} value={distance} onChangeText={setDistance} keyboardType="numeric" placeholder="e.g. 5.2" placeholderTextColor="#666" />
            </View>

            <View style={s.modalActions}>
              <TouchableOpacity style={s.modalCancel} onPress={() => setShowModal(false)} disabled={isSubmitting}>
                <Text style={s.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.modalSave} onPress={handleLogActivity} disabled={isSubmitting}>
                <Text style={s.modalSaveText}>{isSubmitting ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#13131f' },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1e1e30', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { fontFamily: 'Nunito_800ExtraBold', fontSize: 36, color: '#fff', marginBottom: 24 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: { width: '47%', backgroundColor: '#1e1e30', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#2e2e44' },
  statLabel: { fontFamily: 'Nunito_400Regular', fontSize: 12, color: '#9999bb', marginBottom: 6 },
  statValue: { fontFamily: 'Nunito_800ExtraBold', fontSize: 26, color: '#fff' },
  statUnit: { fontFamily: 'Nunito_400Regular', fontSize: 14, color: '#9999bb', marginLeft: 3 },
  chartCard: { backgroundColor: '#1e1e30', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#2e2e44' },
  chartTitle: { fontFamily: 'Nunito_700Bold', fontSize: 17, color: '#fff' },
  footer: { paddingHorizontal: 24, paddingBottom: 32 },
  startBtn: { backgroundColor: '#F97316', borderRadius: 18, height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  startBtnText: { fontFamily: 'Nunito_700Bold', fontSize: 18, color: '#fff' },
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 24 },
  modalCard: { backgroundColor: '#1e1e30', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#2e2e44' },
  modalTitle: { fontFamily: 'Nunito_700Bold', fontSize: 20, color: '#fff', marginBottom: 20 },
  inputWrap: { marginBottom: 16 },
  modalLabel: { fontFamily: 'Nunito_600SemiBold', fontSize: 13, color: '#9999bb', marginBottom: 8 },
  modalInput: { backgroundColor: '#13131f', borderRadius: 12, padding: 14, fontFamily: 'Nunito_600SemiBold', fontSize: 16, color: '#e0e0ff', borderWidth: 1, borderColor: '#2e2e44' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 10 },
  modalCancel: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, backgroundColor: '#13131f', borderWidth: 1, borderColor: '#2e2e44' },
  modalCancelText: { fontFamily: 'Nunito_600SemiBold', fontSize: 14, color: '#9999bb' },
  modalSave: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, backgroundColor: '#F97316' },
  modalSaveText: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: '#fff' },
});