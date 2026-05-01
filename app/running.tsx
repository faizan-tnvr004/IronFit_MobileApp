import React from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  StatusBar, TouchableOpacity, Dimensions, Alert,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { LineChart } from 'react-native-chart-kit';
import {
  useFonts, Nunito_400Regular, Nunito_600SemiBold,
  Nunito_700Bold, Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';

const W = Dimensions.get('window').width;

const weekData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [{ data: [3.2, 4.5, 4.0, 5.5, 6.0, 7.8, 6.2], strokeWidth: 2 }],
};

export default function RunningScreen() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold,
  });
  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#13131f" />

      <View style={s.container}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={16} color="#fff" />
        </TouchableOpacity>

        <Text style={s.title}>Running</Text>

        <View style={s.statsGrid}>
          {[
            { label: 'Distance', value: '5.2', unit: 'km' },
            { label: 'Pace',     value: '5:42', unit: '/km' },
            { label: 'Calories', value: '520', unit: 'kcal' },
            { label: 'Time',     value: '29', unit: 'min' },
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
          <Text style={s.chartTitle}>Weekly Stats</Text>
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
              propsForDots: { r: '5', strokeWidth: '2', stroke: '#F97316' },
              propsForBackgroundLines: { stroke: '#2e2e44', strokeDasharray: '4' },
            }}
            bezier
            style={{ borderRadius: 12, marginTop: 8 }}
            withShadow={false}
          />
        </View>
      </View>

      <View style={s.footer}>
        <TouchableOpacity style={s.startBtn} onPress={() => Alert.alert('Coming Soon', 'This functionality is not yet defined.')}>
          <FontAwesome name="play" size={16} color="#fff" style={{ marginRight: 10 }} />
          <Text style={s.startBtnText}>Start Running</Text>
        </TouchableOpacity>
      </View>
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
});