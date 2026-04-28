import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  useFonts,
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';

const activities = [
  { id: '1', name: 'Running', duration: '25 min', calories: '220 kcal', icon: 'street-view' as const, color: '#F97316' },
  { id: '2', name: 'Cycling', duration: '45 min', calories: '380 kcal', icon: 'bicycle' as const, color: '#22C55E' },
];

export default function HomeScreen() {
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#13131f" />
      <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>Hello, Alex</Text>
            <Text style={s.subGreeting}>Ready to crush your goals today?</Text>
          </View>
          <TouchableOpacity style={s.notifBtn}>
            <FontAwesome name="bell-o" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Progress Card */}
        <View style={s.progressCard}>
          <Text style={s.progressLabel}>Today's Progress</Text>
          <View style={s.stepsRow}>
            <Text style={s.stepsCount}>8,792</Text>
            <Text style={s.stepsUnit}> steps</Text>
          </View>
          <View style={s.progressBarBg}>
            <View style={[s.progressBarFill, { width: '73%' }]} />
          </View>
          <Text style={s.progressPercent}>73% of daily goal</Text>
        </View>

        {/* Today's Activities */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Today's Activities</Text>
          <TouchableOpacity>
            <Text style={s.addActivity}>+ Add Activity</Text>
          </TouchableOpacity>
        </View>

        {activities.map((item) => (
          <TouchableOpacity key={item.id} style={s.activityCard}>
            <View style={[s.activityIcon, { backgroundColor: item.color + '22' }]}>
              <FontAwesome name={item.icon} size={18} color={item.color} />
            </View>
            <View style={s.activityInfo}>
              <Text style={s.activityName}>{item.name}</Text>
              <Text style={s.activityMeta}>{item.duration} • {item.calories}</Text>
            </View>
            <FontAwesome name="chevron-right" size={13} color="#9999bb" />
          </TouchableOpacity>
        ))}

        {/* Quick Stats */}
        <Text style={[s.sectionTitle, { marginTop: 24, marginBottom: 12 }]}>Quick Stats</Text>
        <View style={s.statsRow}>
          {[
            { value: '6.8', label: 'km today' },
            { value: '620', label: 'kcal burned' },
            { value: '92', label: 'avg BPM' },
          ].map((stat) => (
            <View key={stat.label} style={s.statCard}>
              <Text style={s.statValue}>{stat.value}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Suggested Workouts */}
        <Text style={[s.sectionTitle, { marginTop: 24, marginBottom: 12 }]}>Suggested Workouts</Text>

        {[
          { name: 'Morning Run', desc: 'Burn fat and boost endurance', icon: 'street-view' as const, color: '#F97316', duration: '30 min' },
          { name: 'HIIT Training', desc: 'High intensity full body workout', icon: 'fire' as const, color: '#EF4444', duration: '20 min' },
        ].map((workout) => (
          <View key={workout.name} style={s.workoutCard}>
            <View style={s.workoutLeft}>
              <View style={[s.workoutIcon, { backgroundColor: workout.color + '22' }]}>
                <FontAwesome name={workout.icon} size={20} color={workout.color} />
              </View>
              <View style={{ marginLeft: 14 }}>
                <Text style={s.workoutName}>{workout.name}</Text>
                <Text style={s.workoutDesc}>{workout.desc}</Text>
                <Text style={s.workoutDuration}>{workout.duration}</Text>
              </View>
            </View>
            <TouchableOpacity style={s.startBtn}>
              <Text style={s.startBtnText}>Start</Text>
            </TouchableOpacity>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#13131f' },
  container: { flex: 1, paddingHorizontal: 20 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    marginBottom: 24,
  },
  greeting: { fontFamily: 'Nunito_800ExtraBold', fontSize: 28, color: '#fff' },
  subGreeting: { fontFamily: 'Nunito_400Regular', fontSize: 14, color: '#9999bb', marginTop: 2 },
  notifBtn: {
    backgroundColor: '#1e1e30',
    padding: 11,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2e2e44',
  },

  progressCard: {
    backgroundColor: '#F97316',
    borderRadius: 20,
    padding: 20,
    marginBottom: 28,
  },
  progressLabel: { fontFamily: 'Nunito_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 6 },
  stepsRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 16 },
  stepsCount: { fontFamily: 'Nunito_800ExtraBold', fontSize: 44, color: '#fff' },
  stepsUnit: { fontFamily: 'Nunito_400Regular', fontSize: 16, color: 'rgba(255,255,255,0.8)' },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressBarFill: { height: 6, backgroundColor: '#fff', borderRadius: 3 },
  progressPercent: { fontFamily: 'Nunito_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.8)' },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontFamily: 'Nunito_700Bold', fontSize: 18, color: '#fff' },
  addActivity: { fontFamily: 'Nunito_600SemiBold', fontSize: 13, color: '#F97316' },

  activityCard: {
    backgroundColor: '#1e1e30',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2e2e44',
  },
  activityIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  activityInfo: { flex: 1 },
  activityName: { fontFamily: 'Nunito_700Bold', fontSize: 16, color: '#e0e0ff' },
  activityMeta: { fontFamily: 'Nunito_400Regular', fontSize: 13, color: '#9999bb', marginTop: 3 },

  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: '#1e1e30',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2e2e44',
  },
  statValue: { fontFamily: 'Nunito_800ExtraBold', fontSize: 22, color: '#fff' },
  statLabel: { fontFamily: 'Nunito_400Regular', fontSize: 12, color: '#9999bb', marginTop: 4 },

  workoutCard: {
    backgroundColor: '#1e1e30',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2e2e44',
  },
  workoutLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  workoutIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workoutName: { fontFamily: 'Nunito_700Bold', fontSize: 15, color: '#e0e0ff' },
  workoutDesc: { fontFamily: 'Nunito_400Regular', fontSize: 12, color: '#9999bb', marginTop: 2 },
  workoutDuration: { fontFamily: 'Nunito_600SemiBold', fontSize: 12, color: '#F97316', marginTop: 3 },
  startBtn: {
    backgroundColor: '#F97316',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  startBtnText: { fontFamily: 'Nunito_700Bold', fontSize: 13, color: '#fff' },
});