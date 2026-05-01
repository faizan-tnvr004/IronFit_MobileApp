import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, Dimensions, Alert } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { BarChart } from 'react-native-chart-kit';
import { useFonts, Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';

const W = Dimensions.get('window').width;

export default function SwimmingScreen() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({ Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold });
  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#13131f" />
      <View style={s.container}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={16} color="#fff" />
        </TouchableOpacity>
        <Text style={s.title}>Swimming</Text>
        <View style={s.statsGrid}>
          {[
            { label: 'Laps',     value: '32',  unit: '' },
            { label: 'Calories', value: '580', unit: 'kcal' },
            { label: 'Duration', value: '45',  unit: 'min' },
            { label: 'Strokes',  value: '850', unit: '' },
          ].map((stat) => (
            <View key={stat.label} style={s.statCard}>
              <Text style={s.statLabel}>{stat.label}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Text style={s.statValue}>{stat.value}</Text>
                {stat.unit ? <Text style={s.statUnit}>{stat.unit}</Text> : null}
              </View>
            </View>
          ))}
        </View>
        <View style={s.chartCard}>
          <Text style={s.chartTitle}>Swimming Sessions</Text>
          <BarChart
  data={{ labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], datasets: [{ data: [18, 22, 25, 20, 28, 40, 32] }] }}
  width={W - 96} height={180} yAxisLabel="" yAxisSuffix=""
  chartConfig={{ backgroundColor: '#1e1e30', backgroundGradientFrom: '#1e1e30', backgroundGradientTo: '#1e1e30', decimalPlaces: 0, color: (o=1) => `rgba(59,130,246,${o})`, labelColor: (o=1) => `rgba(153,153,187,${o})`, propsForBackgroundLines: { stroke: '#2e2e44', strokeDasharray: '4' } }}
  style={{ borderRadius: 12, marginTop: 8 }} showValuesOnTopOfBars={false}
/>
        </View>
      </View>
      <View style={s.footer}>
        <TouchableOpacity style={[s.startBtn, { backgroundColor: '#3B82F6' }]} onPress={() => Alert.alert('Coming Soon', 'This functionality is not yet defined.')}>
          <FontAwesome name="play" size={16} color="#fff" style={{ marginRight: 10 }} />
          <Text style={s.startBtnText}>Start Swimming</Text>
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
  chartCard: { backgroundColor: '#1e1e30', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#2e2e44',overflow: 'hidden' },
  chartTitle: { fontFamily: 'Nunito_700Bold', fontSize: 17, color: '#fff' },
  footer: { paddingHorizontal: 24, paddingBottom: 32 },
  startBtn: { backgroundColor: '#F97316', borderRadius: 18, height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  startBtnText: { fontFamily: 'Nunito_700Bold', fontSize: 18, color: '#fff' },
});