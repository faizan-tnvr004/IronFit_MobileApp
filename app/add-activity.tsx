import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, Modal, TextInput, Alert, Platform
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import {
  useFonts, Nunito_400Regular, Nunito_600SemiBold,
  Nunito_700Bold, Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';
import { useActivities } from '@/context/ActivityContext';
import { useAuth } from '@/context/AuthContext';
import { Workout, addCustomWorkout, deleteCustomWorkout } from '@/services/firestoreService';

const ICONS = ['male', 'street-view', 'bicycle', 'music', 'tint', 'heart', 'user-secret', 'gamepad', 'futbol-o'];
const COLORS = ['#F97316', '#EF4444', '#22C55E', '#A855F7', '#3B82F6', '#EC4899', '#EAB308', '#06B6D4', '#6366F1'];

export default function AddActivityScreen() {
  const router = useRouter();
  const { workouts, refreshActivities } = useActivities();
  const { user } = useAuth();
  
  const [fontsLoaded] = useFonts({
    Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold,
  });

  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formMet, setFormMet] = useState('5.0');
  const [formDur, setFormDur] = useState('30');
  const [formIcon, setFormIcon] = useState(ICONS[0]);
  const [formColor, setFormColor] = useState(COLORS[0]);

  if (!fontsLoaded) return null;

  const handleSelect = (item: Workout) => {
    if (item.id) {
      router.push(`/activity/${item.id}` as any);
    }
  };

  const handleOpenModal = () => {
    setFormName('');
    setFormDesc('');
    setFormMet('5.0');
    setFormDur('30');
    setFormIcon(ICONS[0]);
    setFormColor(COLORS[0]);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formName || !formDesc || !formMet) {
      Alert.alert('Error', 'Please fill in all text fields');
      return;
    }
    const metScore = parseFloat(formMet);
    if (isNaN(metScore)) {
      Alert.alert('Error', 'MET score must be a number');
      return;
    }
    if (!user) return;

    setIsSubmitting(true);
    try {
      const workoutData = {
        name: formName,
        desc: formDesc,
        kcal: `~${Math.round(metScore * 70)} kcal/hour`, // Estimate
        icon: formIcon,
        color: formColor,
        metScore,
        defaultDuration: `${formDur} min`,
        defaultCalories: `${Math.round(metScore * 70 * (parseInt(formDur) / 60))} kcal`,
      };

      await addCustomWorkout(user.uid, workoutData);
      Alert.alert('Success', 'Custom workout added');
      setShowModal(false);
      refreshActivities();
    } catch (err) {
      Alert.alert('Error', 'Failed to save workout');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    if (!user) return;

    if (Platform.OS === 'web') {
      if (window.confirm('Delete this custom workout?')) {
        deleteCustomWorkout(user.uid, id)
          .then(() => refreshActivities())
          .catch(() => Alert.alert('Error', 'Failed to delete custom workout'));
      }
      return;
    }

    Alert.alert('Confirm', 'Delete this custom workout?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCustomWorkout(user.uid, id);
            refreshActivities();
          } catch (err) {
            Alert.alert('Error', 'Failed to delete custom workout');
          }
        }
      }
    ]);
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
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {workouts.length === 0 ? (
            <ActivityIndicator size="large" color="#F97316" />
          ) : (
            <View style={s.grid}>
              {workouts.map((item) => (
                <View key={item.id} style={s.cardContainer}>
                  <View style={s.card}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <TouchableOpacity onPress={() => handleSelect(item)} activeOpacity={0.75}>
                        <View style={[s.iconWrap, { backgroundColor: item.color + '22' }]}>
                          <FontAwesome name={item.icon as any} size={22} color={item.color} />
                        </View>
                      </TouchableOpacity>
                      {item.isCustom && item.id && (
                        <TouchableOpacity onPress={() => handleDelete(item.id!)} style={s.delBtn}>
                          <FontAwesome name="trash" size={16} color="#ef4444" />
                        </TouchableOpacity>
                      )}
                    </View>
                    <TouchableOpacity onPress={() => handleSelect(item)} activeOpacity={0.75} style={{ flex: 1 }}>
                      <Text style={s.cardName} numberOfLines={1}>{item.name}</Text>
                      <Text style={s.cardDesc} numberOfLines={1}>{item.desc}</Text>
                      <Text style={[s.cardKcal, { color: item.color }]}>{item.kcal}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
        
        <View style={s.footerBtnWrap}>
          <TouchableOpacity style={s.addCustomBtn} onPress={handleOpenModal}>
            <FontAwesome name="plus" size={16} color="#F97316" style={{ marginRight: 8 }} />
            <Text style={s.addCustomBtnText}>Create Custom Workout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Custom Workout</Text>
            
            <ScrollView style={{ maxHeight: 400 }}>
              <Text style={s.label}>Workout Name</Text>
              <TextInput style={s.input} value={formName} onChangeText={setFormName} placeholder="e.g. Boxing" placeholderTextColor="#666" />
              
              <Text style={s.label}>Description</Text>
              <TextInput style={s.input} value={formDesc} onChangeText={setFormDesc} placeholder="e.g. Heavy bag drills" placeholderTextColor="#666" />
              
              <Text style={s.label}>MET Score (Multiplier for calories)</Text>
              <TextInput style={s.input} value={formMet} onChangeText={setFormMet} keyboardType="numeric" placeholder="e.g. 7.5" placeholderTextColor="#666" />

              <Text style={s.label}>Default Duration (minutes)</Text>
              <View style={s.selRow}>
                {['15', '30', '45', '60', '90'].map(d => (
                  <TouchableOpacity key={d} onPress={() => setFormDur(d)} style={[s.pillBtn, formDur === d && s.pillBtnActive]}>
                    <Text style={[s.pillText, formDur === d && s.pillTextActive]}>{d}m</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput 
                style={[s.input, { marginTop: 10 }]} 
                value={formDur} 
                onChangeText={setFormDur} 
                keyboardType="numeric" 
                placeholder="Custom minutes (e.g. 20)" 
                placeholderTextColor="#666" 
              />

              <Text style={s.label}>Icon</Text>
              <View style={s.selRow}>
                {ICONS.map(i => (
                  <TouchableOpacity key={i} onPress={() => setFormIcon(i)} style={[s.selBox, formIcon === i && s.selBoxActive]}>
                    <FontAwesome name={i as any} size={20} color={formIcon === i ? '#F97316' : '#9999bb'} />
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={s.label}>Theme Color</Text>
              <View style={s.selRow}>
                {COLORS.map(c => (
                  <TouchableOpacity key={c} onPress={() => setFormColor(c)} style={[s.colorBox, { backgroundColor: c }, formColor === c && s.colorBoxActive]} />
                ))}
              </View>
            </ScrollView>

            <View style={s.modalActions}>
              <TouchableOpacity style={s.modalCancel} onPress={() => setShowModal(false)} disabled={isSubmitting}>
                <Text style={s.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.modalSave} onPress={handleSave} disabled={isSubmitting}>
                <Text style={s.modalSaveText}>{isSubmitting ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  backdrop: { flex: 1 },
  sheet: { backgroundColor: '#1a1a2e', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 24, paddingHorizontal: 24, maxHeight: '85%' },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sheetTitle: { fontFamily: 'Nunito_800ExtraBold', fontSize: 24, color: '#fff' },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#2e2e44', alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  cardContainer: { width: '47%' },
  card: { width: '100%', backgroundColor: '#13131f', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#2e2e44' },
  iconWrap: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  delBtn: { padding: 8, borderRadius: 12, backgroundColor: '#1a1a2e', borderWidth: 1, borderColor: '#ff4d4d33' },
  cardName: { fontFamily: 'Nunito_700Bold', fontSize: 16, color: '#fff', marginBottom: 4 },
  cardDesc: { fontFamily: 'Nunito_400Regular', fontSize: 12, color: '#9999bb', marginBottom: 6 },
  cardKcal: { fontFamily: 'Nunito_600SemiBold', fontSize: 12 },
  footerBtnWrap: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingBottom: 32, paddingTop: 16, backgroundColor: '#1a1a2e' },
  addCustomBtn: { backgroundColor: '#F9731615', borderWidth: 1, borderColor: '#F9731644', borderRadius: 16, height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  addCustomBtnText: { fontFamily: 'Nunito_700Bold', fontSize: 16, color: '#F97316' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 24 },
  modalCard: { backgroundColor: '#1e1e30', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#2e2e44' },
  modalTitle: { fontFamily: 'Nunito_800ExtraBold', fontSize: 22, color: '#fff', marginBottom: 20 },
  label: { fontFamily: 'Nunito_600SemiBold', fontSize: 13, color: '#9999bb', marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: '#13131f', borderRadius: 12, padding: 14, fontFamily: 'Nunito_600SemiBold', fontSize: 16, color: '#e0e0ff', borderWidth: 1, borderColor: '#2e2e44' },
  selRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  selBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#13131f', borderWidth: 1, borderColor: '#2e2e44', alignItems: 'center', justifyContent: 'center' },
  selBoxActive: { borderColor: '#F97316', backgroundColor: '#F9731622' },
  colorBox: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: 'transparent' },
  colorBoxActive: { borderColor: '#fff' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 24 },
  modalCancel: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, backgroundColor: '#13131f', borderWidth: 1, borderColor: '#2e2e44' },
  modalCancelText: { fontFamily: 'Nunito_600SemiBold', fontSize: 14, color: '#9999bb' },
  modalSave: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, backgroundColor: '#F97316' },
  modalSaveText: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: '#fff' },
  pillBtn: { backgroundColor: '#13131f', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#2e2e44' },
  pillBtnActive: { backgroundColor: '#F97316', borderColor: '#F97316' },
  pillText: { fontFamily: 'Nunito_600SemiBold', fontSize: 14, color: '#9999bb' },
  pillTextActive: { color: '#fff', fontFamily: 'Nunito_700Bold' },
});