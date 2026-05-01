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

export default function YogaScreen() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const { refreshActivities } = useActivities();
  const [fontsLoaded] = useFonts({
    Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold,
  });

  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [duration, setDuration] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
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
      const activityLogs = data.filter(a => a.type === 'Yoga');
      setLogs(activityLogs);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogActivity = async () => {
    if (!duration || !date) {
      Alert.alert('Error', 'Please fill in duration and date');
      return;
    }
    if (!user || !userProfile) return;

    setIsSubmitting(true);
    try {
      const durNum = parseInt(duration);
      const calories = calculateCalories('Yoga', durNum, userProfile.weightKg);

      await addActivityLog(user.uid, {
        type: 'Yoga',
        durationMin: durNum,
        caloriesBurned: calories,
        date: date,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      });

      Alert.alert('Success', 'Activity logged successfully!');
      setShowModal(false);
      setDuration('');
      fetchData();
      refreshActivities();
    } catch (err) {
      Alert.alert('Error', 'Failed to log activity');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!fontsLoaded) return null;

  const totalTime = logs.reduce((sum, log) => sum + log.durationMin, 0);
  const totalCalories = logs.reduce((sum, log) => sum + log.caloriesBurned, 0);

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
        chartData[6 - diffDays] += log.durationMin;
      }
    });
  }

  const weekData = {
    labels,
    datasets: [{ data: chartData.some(d => d > 0) ? chartData : [1, 1, 1, 1, 1, 1, 1], strokeWidth: 2 }],
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#13131f" />

      <View style={s.container}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={16} color="#fff" />
        </TouchableOpacity>

        <Text style={s.title}>Yoga</Text>

        {isLoading ? (
          <ActivityIndicator size="large" color="#A855F7" style={{ marginTop: 50 }} />
        ) : (
          <>
            <View style={s.statsGrid}>
              {[
                { label: 'Time (7d)',     value: totalTime.toString(),  unit: 'min' },
                { label: 'Calories',      value: totalCalories.toString(), unit: 'kcal' },
                { label: 'Sessions',      value: logs.length.toString(), unit: '' },
              ].map((stat) => (
                <View key={stat.label} style={[s.statCard, stat.label === 'Sessions' && { width: '100%' }]}>
                  <Text style={s.statLabel}>{stat.label}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                    <Text style={s.statValue}>{stat.value}</Text>
                    <Text style={s.statUnit}>{stat.unit}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={s.chartCard}>
              <Text style={s.chartTitle}>Weekly Consistency (min)</Text>
              <LineChart
                data={weekData}
                width={W - 64}
                height={180}
                chartConfig={{
                  backgroundColor: '#1e1e30',
                  backgroundGradientFrom: '#1e1e30',
                  backgroundGradientTo: '#1e1e30',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(168,85,247,${opacity})`,
                  labelColor: (opacity = 1) => `rgba(153,153,187,${opacity})`,
                  propsForDots: { r: '4', strokeWidth: '2', stroke: '#A855F7' },
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
        <TouchableOpacity style={[s.startBtn, { backgroundColor: '#EC4899' }]} onPress={() => setShowModal(true)}>
          <FontAwesome name="plus" size={16} color="#fff" style={{ marginRight: 10 }} />
          <Text style={s.startBtnText}>Log Activity</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showModal} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Log Yoga Session</Text>
            
            <View style={s.inputWrap}>
              <Text style={s.modalLabel}>Date (YYYY-MM-DD)</Text>
              <TextInput style={s.modalInput} value={date} onChangeText={setDate} placeholderTextColor="#666" />
            </View>
            
            <View style={s.inputWrap}>
              <Text style={s.modalLabel}>Duration (minutes)</Text>
              <TextInput style={s.modalInput} value={duration} onChangeText={setDuration} keyboardType="numeric" placeholderTextColor="#666" />
            </View>

            <View style={s.modalActions}>
              <TouchableOpacity style={s.modalCancel} onPress={() => setShowModal(false)} disabled={isSubmitting}>
                <Text style={s.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.modalSave, { backgroundColor: '#EC4899' }]} onPress={handleLogActivity} disabled={isSubmitting}>
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
  startBtn: { borderRadius: 18, height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  startBtnText: { fontFamily: 'Nunito_700Bold', fontSize: 18, color: '#fff' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 24 },
  modalCard: { backgroundColor: '#1e1e30', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#2e2e44' },
  modalTitle: { fontFamily: 'Nunito_700Bold', fontSize: 20, color: '#fff', marginBottom: 20 },
  inputWrap: { marginBottom: 16 },
  modalLabel: { fontFamily: 'Nunito_600SemiBold', fontSize: 13, color: '#9999bb', marginBottom: 8 },
  modalInput: { backgroundColor: '#13131f', borderRadius: 12, padding: 14, fontFamily: 'Nunito_600SemiBold', fontSize: 16, color: '#e0e0ff', borderWidth: 1, borderColor: '#2e2e44' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 10 },
  modalCancel: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, backgroundColor: '#13131f', borderWidth: 1, borderColor: '#2e2e44' },
  modalCancelText: { fontFamily: 'Nunito_600SemiBold', fontSize: 14, color: '#9999bb' },
  modalSave: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  modalSaveText: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: '#fff' },
});