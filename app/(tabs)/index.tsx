import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts, Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { CircularProgress } from '@/components/CircularProgress';
import { useAuth } from '@/context/AuthContext';
import { useActivities } from '@/context/ActivityContext';

export default function HomeScreen() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const { activities, workouts, refreshActivities } = useActivities();

  const [fontsLoaded] = useFonts({ Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold });

  useEffect(() => {
    refreshActivities();
  }, []);

  if (!fontsLoaded || !userProfile) return null;

  const todayKcal = activities.reduce((s, a) => s + a.caloriesBurned, 0);
  const todayMin = activities.reduce((s, a) => s + a.durationMin, 0);
  const todaySteps = Math.round(activities.filter(a => a.type === 'Walking').reduce((s, a) => s + (a.distance ?? 0), 0) * 1312);
  const stepGoal = userProfile.dailyStepGoal || 10000;
  const progress = Math.min((todaySteps / stepGoal) * 100, 100);

  return (
    <View style={s.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#13131f" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.greet}>Hello, {userProfile.name.split(' ')[0]} 👋</Text>
            <Text style={s.sub}>Let's reach your goal today!</Text>
          </View>
          <TouchableOpacity style={s.profileBtn} onPress={() => router.push('/(tabs)/account')}>
            <View style={s.avatarSmall}>
              <Text style={s.avatarTextSmall}>{userProfile.name[0]}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Progress Card */}
        <View style={s.progressCard}>
          <View style={s.progressRow}>
            <View style={s.progressLeft}>
              <Text style={s.progressTitle}>Steps Target</Text>
              <Text style={s.progressValue}>{todaySteps.toLocaleString()}</Text>
              <Text style={s.progressLabel}>of {stepGoal.toLocaleString()} steps</Text>
              <View style={s.badge}>
                <FontAwesome name="bolt" size={12} color="#F97316" />
                <Text style={s.badgeText}>On track!</Text>
              </View>
            </View>
            <View style={s.progressRight}>
              <CircularProgress 
                size={120} 
                strokeWidth={12} 
                progress={progress} 
                color="#F97316" 
                backgroundColor="#2d2b55" 
              />
            </View>
          </View>

          <View style={s.statsRow}>
            <View style={s.statBox}>
              <Text style={s.statVal}>{todayKcal}</Text>
              <Text style={s.statLbl}>Calories</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statBox}>
              <Text style={s.statVal}>{todayMin}</Text>
              <Text style={s.statLbl}>Active Time</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statBox}>
              <Text style={s.statVal}>{activities.length}</Text>
              <Text style={s.statLbl}>Workouts</Text>
            </View>
          </View>
        </View>

        {/* Activities Header */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Today's Activities</Text>
          <TouchableOpacity onPress={() => router.push('/add-activity')}>
            <Text style={s.addText}>+ Add Activity</Text>
          </TouchableOpacity>
        </View>

        {/* Activity Cards */}
        {activities.length === 0 ? (
          <View style={s.emptyState}>
            <Text style={s.emptyText}>No activities logged today.</Text>
            <TouchableOpacity style={s.emptyBtn} onPress={() => router.push('/add-activity')}>
              <Text style={s.emptyBtnText}>Start Now</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={s.activityList}>
            {activities.map((item) => {
              const workout = workouts.find(w => w.name === item.type);
              const color = workout?.color || '#9999bb';
              const icon = workout?.icon || 'circle';
              const route = workout?.id ? `/activity/${workout.id}` : '#';
              
              return (
                <TouchableOpacity 
                  key={item.id} 
                  style={s.activityCard} 
                  onPress={() => router.push(route as any)}
                >
                  <View style={[s.iconBox, { backgroundColor: color + '22' }]}>
                    <FontAwesome name={icon as any} size={20} color={color} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 16 }}>
                    <Text style={s.activityName}>{item.type}</Text>
                    <Text style={s.activityMeta}>{item.durationMin} min • {item.time}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[s.activityValue, { color: color }]}>{item.caloriesBurned}</Text>
                    <Text style={s.activityUnit}>kcal</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#13131f' },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greet: { fontFamily: 'Nunito_800ExtraBold', fontSize: 26, color: '#fff' },
  sub: { fontFamily: 'Nunito_400Regular', fontSize: 14, color: '#9999bb', marginTop: 2 },
  profileBtn: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden' },
  avatarSmall: { width: '100%', height: '100%', backgroundColor: '#F97316', alignItems: 'center', justifyContent: 'center' },
  avatarTextSmall: { fontFamily: 'Nunito_800ExtraBold', fontSize: 18, color: '#fff' },
  progressCard: { marginHorizontal: 16, backgroundColor: '#1e1e30', borderRadius: 28, padding: 24, borderWidth: 1, borderColor: '#2e2e44', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  progressLeft: { flex: 1 },
  progressTitle: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: '#9999bb', marginBottom: 8 },
  progressValue: { fontFamily: 'Nunito_800ExtraBold', fontSize: 36, color: '#fff' },
  progressLabel: { fontFamily: 'Nunito_600SemiBold', fontSize: 13, color: '#9999bb', marginBottom: 12 },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9731615', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontFamily: 'Nunito_700Bold', fontSize: 11, color: '#F97316', marginLeft: 5 },
  progressRight: { width: 120, height: 120, alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#2e2e44', paddingTop: 20 },
  statBox: { flex: 1, alignItems: 'center' },
  statVal: { fontFamily: 'Nunito_800ExtraBold', fontSize: 20, color: '#fff' },
  statLbl: { fontFamily: 'Nunito_400Regular', fontSize: 11, color: '#9999bb', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#2e2e44', marginVertical: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginTop: 32, marginBottom: 16 },
  sectionTitle: { fontFamily: 'Nunito_800ExtraBold', fontSize: 20, color: '#fff' },
  addText: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: '#F97316' },
  activityList: { paddingHorizontal: 16, gap: 12 },
  activityCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e1e30', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#2e2e44' },
  iconBox: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  activityName: { fontFamily: 'Nunito_700Bold', fontSize: 16, color: '#fff' },
  activityMeta: { fontFamily: 'Nunito_400Regular', fontSize: 12, color: '#9999bb', marginTop: 3 },
  activityValue: { fontFamily: 'Nunito_800ExtraBold', fontSize: 18 },
  activityUnit: { fontFamily: 'Nunito_400Regular', fontSize: 10, color: '#9999bb' },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontFamily: 'Nunito_400Regular', fontSize: 14, color: '#9999bb', marginBottom: 16 },
  emptyBtn: { backgroundColor: '#F9731622', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  emptyBtnText: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: '#F97316' },
});