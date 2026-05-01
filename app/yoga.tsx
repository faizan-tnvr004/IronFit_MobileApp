import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, Dimensions, Alert } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { LineChart } from 'react-native-chart-kit';
import { useFonts, Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';

const W = Dimensions.get('window').width;

export default function YogaScreen() {
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
        <Text style={s.title}>Yoga</Text>
        <View style={s.statsGrid}>
          {[
            { label: 'Session Minutes',   value: '45', unit: 'min' },
            { label: 'Flexibility',       value: '8.5', unit: '/10' },
            { label: 'Mindfulness Score', value: '92', unit: '/ 100' },
          ].map((stat) => (
            <View key={stat.label} style={[s.statCard, stat.label === 'Mindfulness Score' && { width: '100%' }]}>
              <Text style={s.statLabel}>{stat.label}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Text style={s.statValue}>{stat.value}</Text>
                <Text style={s.statUnit}>{stat.unit}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={s.chartCard}>
          <Text style={s.chartTitle}>Weekly Consistency</Text>
          <LineChart
            data={{ labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], datasets: [{ data: [20, 30, 30, 35, 40, 48, 30], strokeWidth: 2 }] }}
            width={W - 64} height={180}
            chartConfig={{ backgroundColor: '#1e1e30', backgroundGradientFrom: '#1e1e30', backgroundGradientTo: '#1e1e30', decimalPlaces: 0, color: (o=1) => `rgba(168,85,247,${o})`, labelColor: (o=1) => `rgba(153,153,187,${o})`, propsForDots: { r: '5', strokeWidth: '2', stroke: '#A855F7' }, propsForBackgroundLines: { stroke: '#2e2e44', strokeDasharray: '4' } }}
            bezier style={{ borderRadius: 12, marginTop: 8 }} withShadow={false}
          />
        </View>
      </View>
      <View style={s.footer}>
        <TouchableOpacity style={[s.startBtn, { backgroundColor: '#EC4899' }]} onPress={() => Alert.alert('Coming Soon', 'This functionality is not yet defined.')}>
          <FontAwesome name="play" size={16} color="#fff" style={{ marginRight: 10 }} />
          <Text style={s.startBtnText}>Start Yoga</Text>
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
  startBtn: { borderRadius: 18, height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  startBtnText: { fontFamily: 'Nunito_700Bold', fontSize: 18, color: '#fff' },
});