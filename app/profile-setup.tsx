import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, StatusBar,
  TextInput, TouchableOpacity, KeyboardAvoidingView,
  Platform, ScrollView, Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  useFonts, Nunito_400Regular, Nunito_600SemiBold,
  Nunito_700Bold, Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';
import { useAuth } from '@/context/AuthContext';
import { createUserProfile, addWeightLog } from '@/services/firestoreService';

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { initialImage } = useLocalSearchParams<{ initialImage?: string }>();
  const { user, refreshProfile } = useAuth();

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [goal, setGoal] = useState('Weight Loss');
  const [stepGoal, setStepGoal] = useState<number>(10000);
  const [image, setImage] = useState<string | null>(initialImage || null);

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fontsLoaded] = useFonts({
    Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold,
  });
  if (!fontsLoaded) return null;
  
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name || !age || !height || !weight) {
      setErrorMsg('Please fill in all fields');
      return;
    }

    if (!user) {
      setErrorMsg('User not authenticated');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const weightVal = parseFloat(weight);
      if (isNaN(weightVal) || weightVal < 40 || weightVal > 400) {
        setErrorMsg('Please enter a valid weight between 40 and 400 kg.');
        setIsSubmitting(false);
        return;
      }

      await createUserProfile(user.uid, {
        name,
        email: user.email || '',
        age: parseInt(age),
        heightCm: parseFloat(height),
        weightKg: weightVal,
        gender,
        fitnessGoal: goal,
        dailyStepGoal: stepGoal,
        photoURL: image || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png', // Default avatar logo
      });

      // Log the initial weight to the trend graph
      await addWeightLog(user.uid, {
        weight: weightVal,
        date: new Date().toISOString().split('T')[0]
      });

      await refreshProfile();
      // Navigation to (tabs) handled automatically by AuthGate
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save profile');
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#13131f" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>

          <View style={s.header}>
            <Text style={s.title}>Complete Profile</Text>
            <Text style={s.sub}>Let us know more about you to personalize your experience and calculate accurate calories.</Text>
          </View>

          {/* Profile Photo Picker */}
          <TouchableOpacity style={s.avatarContainer} onPress={pickImage}>
            {image ? (
              <Image source={{ uri: image }} style={s.avatar} />
            ) : (
              <View style={s.avatarPlaceholder}>
                <FontAwesome name="camera" size={24} color="#9999bb" />
              </View>
            )}
            <View style={s.avatarPlus}>
              <FontAwesome name="plus" size={10} color="#fff" />
            </View>
            <Text style={s.avatarLabel}>{image ? 'Change Photo' : 'Add Photo'}</Text>
          </TouchableOpacity>

          {errorMsg ? <Text style={s.errorText}>{errorMsg}</Text> : null}

          {/* Name */}
          <View style={s.inputGroup}>
            <Text style={s.label}>Full Name</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. Alex Johnson"
              placeholderTextColor="#666"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Age & Gender Row */}
          <View style={s.row}>
            <View style={[s.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={s.label}>Age</Text>
              <TextInput
                style={s.input}
                placeholder="25"
                placeholderTextColor="#666"
                keyboardType="numeric"
                value={age}
                onChangeText={setAge}
              />
            </View>
            <View style={[s.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={s.label}>Gender</Text>
              <View style={s.toggleRow}>
                <TouchableOpacity
                  style={[s.toggleBtn, gender === 'male' && s.toggleActive]}
                  onPress={() => setGender('male')}
                >
                  <Text style={[s.toggleText, gender === 'male' && s.toggleTextActive]}>M</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.toggleBtn, gender === 'female' && s.toggleActive]}
                  onPress={() => setGender('female')}
                >
                  <Text style={[s.toggleText, gender === 'female' && s.toggleTextActive]}>F</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Height & Weight Row */}
          <View style={s.row}>
            <View style={[s.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={s.label}>Height (cm)</Text>
              <TextInput
                style={s.input}
                placeholder="175"
                placeholderTextColor="#666"
                keyboardType="numeric"
                value={height}
                onChangeText={setHeight}
              />
            </View>
            <View style={[s.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={s.label}>Weight (kg)</Text>
              <TextInput
                style={s.input}
                placeholder="70"
                placeholderTextColor="#666"
                keyboardType="numeric"
                value={weight}
                onChangeText={setWeight}
              />
            </View>
          </View>

          {/* Fitness Goal */}
          <View style={s.inputGroup}>
            <Text style={s.label}>Fitness Goal</Text>
            <View style={s.pillsContainer}>
              {['Weight Loss', 'Muscle Gain', 'Stay Fit', 'Endurance'].map(g => (
                <TouchableOpacity
                  key={g}
                  style={[s.pill, goal === g && s.pillActive]}
                  onPress={() => setGoal(g)}
                >
                  <Text style={[s.pillText, goal === g && s.pillTextActive]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Step Goal */}
          <View style={s.inputGroup}>
            <Text style={s.label}>Daily Step Goal</Text>
            <View style={s.pillsContainer}>
              {[8000, 10000, 12000].map(sg => (
                <TouchableOpacity
                  key={sg}
                  style={[s.pill, stepGoal === sg && s.pillActive]}
                  onPress={() => setStepGoal(sg)}
                >
                  <Text style={[s.pillText, stepGoal === sg && s.pillTextActive]}>
                    {(sg / 1000)}k
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={isSubmitting}>
            <Text style={s.saveBtnText}>{isSubmitting ? 'Saving...' : 'Complete Setup'}</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#13131f' },
  container: { paddingHorizontal: 28, paddingTop: 40, paddingBottom: 60 },
  header: { marginBottom: 32 },
  title: { fontFamily: 'Nunito_800ExtraBold', fontSize: 32, color: '#fff', marginBottom: 8 },
  sub: { fontFamily: 'Nunito_400Regular', fontSize: 14, color: '#9999bb', lineHeight: 22 },
  errorText: { fontFamily: 'Nunito_600SemiBold', fontSize: 14, color: '#ff4d4d', marginBottom: 20, textAlign: 'center' },
  inputGroup: { marginBottom: 20 },
  label: { fontFamily: 'Nunito_600SemiBold', fontSize: 13, color: '#9999bb', marginBottom: 8 },
  input: { backgroundColor: '#1e1e30', borderRadius: 14, height: 54, paddingHorizontal: 18, fontFamily: 'Nunito_600SemiBold', fontSize: 16, color: '#fff', borderWidth: 1, borderColor: '#2e2e44' },
  row: { flexDirection: 'row' },
  toggleRow: { flexDirection: 'row', backgroundColor: '#1e1e30', borderRadius: 14, height: 54, padding: 4, borderWidth: 1, borderColor: '#2e2e44' },
  toggleBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  toggleActive: { backgroundColor: '#F97316' },
  toggleText: { fontFamily: 'Nunito_700Bold', fontSize: 15, color: '#9999bb' },
  toggleTextActive: { color: '#fff' },
  pillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  pill: { backgroundColor: '#1e1e30', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#2e2e44' },
  pillActive: { backgroundColor: '#F97316', borderColor: '#F97316' },
  pillText: { fontFamily: 'Nunito_600SemiBold', fontSize: 14, color: '#9999bb' },
  pillTextActive: { color: '#fff', fontFamily: 'Nunito_700Bold' },
  saveBtn: { backgroundColor: '#F97316', borderRadius: 16, height: 56, alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  saveBtnText: { fontFamily: 'Nunito_700Bold', fontSize: 17, color: '#fff' },
  avatarContainer: { alignSelf: 'center', alignItems: 'center', marginBottom: 30 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: '#F97316' },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#1e1e30', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2e2e44' },
  avatarPlus: { position: 'absolute', bottom: 25, right: 0, backgroundColor: '#F97316', width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#13131f' },
  avatarLabel: { fontFamily: 'Nunito_600SemiBold', fontSize: 14, color: '#9999bb', marginTop: 8 },
});