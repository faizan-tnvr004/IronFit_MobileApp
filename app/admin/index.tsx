import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity,
  ScrollView, Modal, TextInput, ActivityIndicator, Alert, Dimensions
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useFonts, Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { getWorkouts, addWorkout, updateWorkout, deleteWorkout, Workout } from '@/services/firestoreService';

const W = Dimensions.get('window').width;

const ICONS = ['male', 'street-view', 'bicycle', 'music', 'tint', 'heart', 'user-secret', 'gamepad', 'futbol-o'];
const COLORS = ['#F97316', '#EF4444', '#22C55E', '#A855F7', '#3B82F6', '#EC4899', '#EAB308', '#06B6D4', '#6366F1'];

export default function AdminDashboard() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({ Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold });
  
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [editId, setEditId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formMet, setFormMet] = useState('');
  const [formIcon, setFormIcon] = useState(ICONS[0]);
  const [formColor, setFormColor] = useState(COLORS[0]);

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    setIsLoading(true);
    try {
      const data = await getWorkouts();
      setWorkouts(data);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to fetch workouts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (workout?: Workout) => {
    if (workout) {
      setEditId(workout.id || null);
      setFormName(workout.name);
      setFormDesc(workout.desc);
      setFormMet(workout.metScore.toString());
      setFormIcon(workout.icon);
      setFormColor(workout.color);
    } else {
      setEditId(null);
      setFormName('');
      setFormDesc('');
      setFormMet('');
      setFormIcon(ICONS[0]);
      setFormColor(COLORS[0]);
    }
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

    setIsSubmitting(true);
    try {
      const workoutData = {
        name: formName,
        desc: formDesc,
        kcal: `~${Math.round(metScore * 70)} kcal/hour`, // Estimate based on 70kg
        icon: formIcon,
        color: formColor,
        metScore,
        defaultDuration: '30 min',
        defaultCalories: `${Math.round(metScore * 70 * 0.5)} kcal`,
      };

      if (editId) {
        await updateWorkout(editId, workoutData);
        Alert.alert('Success', 'Workout updated');
      } else {
        await addWorkout(workoutData);
        Alert.alert('Success', 'Workout added');
      }
      setShowModal(false);
      fetchWorkouts();
    } catch (err) {
      Alert.alert('Error', 'Failed to save workout');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Confirm', 'Are you sure you want to delete this workout?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteWorkout(id);
            Alert.alert('Deleted', 'Workout removed successfully');
            fetchWorkouts();
          } catch (err) {
            Alert.alert('Error', 'Failed to delete workout');
          }
        }
      }
    ]);
  };

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#13131f" />
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.replace('/login')}>
          <FontAwesome name="sign-out" size={16} color="#fff" />
        </TouchableOpacity>
        <Text style={s.title}>Admin Panel</Text>
      </View>
      
      <View style={{ paddingHorizontal: 24, marginBottom: 16 }}>
        <Text style={s.sub}>Manage Workouts & MET Scores</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#F97316" style={{ marginTop: 50 }} />
      ) : (
        <ScrollView contentContainerStyle={s.list}>
          {workouts.map(w => (
            <View key={w.id} style={s.card}>
              <View style={[s.iconBox, { backgroundColor: w.color + '22' }]}>
                <FontAwesome name={w.icon as any} size={24} color={w.color} />
              </View>
              <View style={s.cardBody}>
                <Text style={s.cardName}>{w.name}</Text>
                <Text style={s.cardDesc}>{w.desc}</Text>
                <View style={s.badge}>
                  <Text style={s.badgeText}>MET: {w.metScore}</Text>
                </View>
              </View>
              <View style={s.actions}>
                <TouchableOpacity style={s.actBtn} onPress={() => handleOpenModal(w)}>
                  <FontAwesome name="pencil" size={16} color="#3B82F6" />
                </TouchableOpacity>
                <TouchableOpacity style={s.actBtn} onPress={() => w.id && handleDelete(w.id)}>
                  <FontAwesome name="trash" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={s.footer}>
        <TouchableOpacity style={s.addBtn} onPress={() => handleOpenModal()}>
          <FontAwesome name="plus" size={16} color="#fff" style={{ marginRight: 10 }} />
          <Text style={s.addBtnText}>Add New Workout</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>{editId ? 'Edit Workout' : 'Add Workout'}</Text>
            
            <ScrollView style={{ maxHeight: 400 }}>
              <Text style={s.label}>Workout Name</Text>
              <TextInput style={s.input} value={formName} onChangeText={setFormName} placeholder="e.g. Boxing" placeholderTextColor="#666" />
              
              <Text style={s.label}>Description</Text>
              <TextInput style={s.input} value={formDesc} onChangeText={setFormDesc} placeholder="e.g. High intensity combat" placeholderTextColor="#666" />
              
              <Text style={s.label}>MET Score (Multiplier for calories)</Text>
              <TextInput style={s.input} value={formMet} onChangeText={setFormMet} keyboardType="numeric" placeholder="e.g. 7.5" placeholderTextColor="#666" />

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
                <Text style={s.modalSaveText}>{isSubmitting ? 'Saving...' : 'Save Workout'}</Text>
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
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 20, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1e1e30', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  title: { fontFamily: 'Nunito_800ExtraBold', fontSize: 28, color: '#fff' },
  sub: { fontFamily: 'Nunito_400Regular', fontSize: 14, color: '#9999bb' },
  list: { paddingHorizontal: 24, paddingBottom: 100, gap: 16 },
  card: { backgroundColor: '#1e1e30', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#2e2e44', flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1, marginLeft: 16 },
  cardName: { fontFamily: 'Nunito_700Bold', fontSize: 18, color: '#fff' },
  cardDesc: { fontFamily: 'Nunito_400Regular', fontSize: 12, color: '#9999bb', marginTop: 2, marginBottom: 6 },
  badge: { backgroundColor: '#2d2b55', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontFamily: 'Nunito_700Bold', fontSize: 11, color: '#c4c0ff' },
  actions: { flexDirection: 'column', gap: 10 },
  actBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#13131f', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2e2e44' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingBottom: 32, paddingTop: 16, backgroundColor: '#13131f' },
  addBtn: { backgroundColor: '#F97316', borderRadius: 16, height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  addBtnText: { fontFamily: 'Nunito_700Bold', fontSize: 16, color: '#fff' },
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
});
