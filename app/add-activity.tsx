import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import {
  useFonts, Nunito_400Regular, Nunito_600SemiBold,
  Nunito_700Bold, Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';
import { useActivities } from '@/context/ActivityContext';
import { Workout } from '@/services/firestoreService';

export default function AddActivityScreen() {
  const router = useRouter();
  const { workouts } = useActivities();
  const [fontsLoaded] = useFonts({
    Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold,
  });
  if (!fontsLoaded) return null;

  const handleSelect = (item: Workout) => {
    if (item.id) {
      router.push(`/activity/${item.id}` as any);
    }
  };

  return (
    <View style={s.overlay}>
      <StatusBar barStyle="light-content" />
      <TouchableOpacity style={s.backdrop} onPress={() => router.back()} />
      <View style={s.sheet}>
        <View style={s.sheetHeader}>
          <Text style={s.sheetTitle}>Choose Activity</Text>
          <TouchableOpacity onPress={() => router.back()} style={s.closeBtn}>
            <FontAwesome name="times" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
          {workouts.length === 0 ? (
            <ActivityIndicator size="large" color="#F97316" />
          ) : (
            <View style={s.grid}>
              {workouts.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={s.card}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.75}
                >
                  <View style={[s.iconWrap, { backgroundColor: item.color + '22' }]}>
                    <FontAwesome name={item.icon as any} size={22} color={item.color} />
                  </View>
                  <Text style={s.cardName}>{item.name}</Text>
                  <Text style={s.cardDesc}>{item.desc}</Text>
                  <Text style={[s.cardKcal, { color: item.color }]}>{item.kcal}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  backdrop: { flex: 1 },
  sheet: { backgroundColor: '#1a1a2e', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: '85%' },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sheetTitle: { fontFamily: 'Nunito_800ExtraBold', fontSize: 24, color: '#fff' },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#2e2e44', alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '47%', backgroundColor: '#13131f', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#2e2e44' },
  iconWrap: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  cardName: { fontFamily: 'Nunito_700Bold', fontSize: 16, color: '#fff', marginBottom: 4 },
  cardDesc: { fontFamily: 'Nunito_400Regular', fontSize: 12, color: '#9999bb', marginBottom: 6 },
  cardKcal: { fontFamily: 'Nunito_600SemiBold', fontSize: 12 },
});