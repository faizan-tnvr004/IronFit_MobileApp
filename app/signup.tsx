import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, StatusBar,
  TextInput, TouchableOpacity, KeyboardAvoidingView,
  Platform, ScrollView,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import {
  useFonts, Nunito_400Regular, Nunito_600SemiBold,
  Nunito_700Bold, Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';
import { useAuth } from '@/context/AuthContext';

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { signUp, isLoading } = useAuth();

  const [fontsLoaded] = useFonts({
    Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold,
  });
  if (!fontsLoaded) return null;

  const handleSignup = async () => {
    if (!name || !email || !password || !confirm) {
      setErrorMsg('Please fill in all fields');
      return;
    }
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      setErrorMsg('Passwords do not match');
      return;
    }
    setErrorMsg('');
    try {
      await signUp(email, password);
      // Navigation is handled automatically by the AuthGate in _layout.tsx
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sign up');
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#13131f" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>

          {/* Logo */}
          <View style={s.logoWrap}>
            <View style={s.logoBox}>
              <FontAwesome name="link" size={32} color="#fff" />
            </View>
          </View>

          <Text style={s.heading}>Create Account</Text>

          {errorMsg ? <Text style={s.errorText}>{errorMsg}</Text> : null}

          {/* Avatar Picker */}
          <View style={s.avatarWrap}>
            <View style={s.avatar}>
              <FontAwesome name="camera" size={28} color="#9999bb" />
            </View>
            <View style={s.avatarPlus}>
              <FontAwesome name="plus" size={12} color="#fff" />
            </View>
          </View>

          {/* Fields */}
          <View style={s.inputWrap}>
            <TextInput style={s.input} placeholder="Full Name" placeholderTextColor="#9999bb"
              value={name} onChangeText={setName} />
          </View>

          <View style={s.inputWrap}>
            <TextInput style={s.input} placeholder="Email" placeholderTextColor="#9999bb"
              value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          </View>

          <View style={s.inputWrap}>
            <TextInput style={[s.input, { paddingRight: 50 }]} placeholder="Password"
              placeholderTextColor="#9999bb" value={password} onChangeText={setPassword}
              secureTextEntry={!showPass} />
            <TouchableOpacity style={s.eyeBtn} onPress={() => setShowPass(!showPass)}>
              <FontAwesome name={showPass ? 'eye' : 'eye-slash'} size={18} color="#9999bb" />
            </TouchableOpacity>
          </View>

          <View style={s.inputWrap}>
            <TextInput style={[s.input, { paddingRight: 50 }]} placeholder="Confirm Password"
              placeholderTextColor="#9999bb" value={confirm} onChangeText={setConfirm}
              secureTextEntry={!showConfirm} />
            <TouchableOpacity style={s.eyeBtn} onPress={() => setShowConfirm(!showConfirm)}>
              <FontAwesome name={showConfirm ? 'eye' : 'eye-slash'} size={18} color="#9999bb" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={s.createBtn} onPress={handleSignup} disabled={isLoading}>
            <Text style={s.createBtnText}>{isLoading ? 'Creating...' : 'Create Account'}</Text>
          </TouchableOpacity>

          <View style={s.loginRow}>
            <Text style={s.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={s.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#13131f' },
  container: { paddingHorizontal: 28, paddingTop: 40, paddingBottom: 40 },
  logoWrap: { alignItems: 'center', marginBottom: 16 },
  logoBox: { width: 80, height: 80, borderRadius: 24, backgroundColor: '#F97316', alignItems: 'center', justifyContent: 'center' },
  heading: { fontFamily: 'Nunito_800ExtraBold', fontSize: 28, color: '#fff', textAlign: 'center', marginBottom: 28 },
  errorText: { fontFamily: 'Nunito_600SemiBold', fontSize: 14, color: '#ff4d4d', marginBottom: 16, textAlign: 'center' },
  avatarWrap: { alignSelf: 'center', marginBottom: 28, position: 'relative' },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#1e1e30', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2e2e44' },
  avatarPlus: { position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: 13, backgroundColor: '#F97316', alignItems: 'center', justifyContent: 'center' },
  inputWrap: { position: 'relative', marginBottom: 16 },
  input: { backgroundColor: '#1e1e30', borderRadius: 14, height: 54, paddingHorizontal: 18, fontFamily: 'Nunito_400Regular', fontSize: 15, color: '#e0e0ff', borderWidth: 1, borderColor: '#2e2e44' },
  eyeBtn: { position: 'absolute', right: 16, top: 17 },
  createBtn: { backgroundColor: '#F97316', borderRadius: 16, height: 56, alignItems: 'center', justifyContent: 'center', marginTop: 8, marginBottom: 24 },
  createBtnText: { fontFamily: 'Nunito_700Bold', fontSize: 17, color: '#fff' },
  loginRow: { flexDirection: 'row', justifyContent: 'center' },
  loginText: { fontFamily: 'Nunito_400Regular', fontSize: 14, color: '#9999bb' },
  loginLink: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: '#F97316' },
});