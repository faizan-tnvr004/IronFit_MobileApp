import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, StatusBar,
  TextInput, TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import {
  useFonts, Nunito_400Regular, Nunito_600SemiBold,
  Nunito_700Bold, Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const [fontsLoaded] = useFonts({
    Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold,
  });
  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#13131f" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.kav}>
        <View style={s.container}>

          {/* Logo */}
          <View style={s.logoWrap}>
            <View style={s.logoBox}>
              <FontAwesome name="link" size={32} color="#fff" />
            </View>
            <Text style={s.logoText}>IronFit</Text>
          </View>

          {/* Heading */}
          <Text style={s.heading}>Welcome Back</Text>
          <Text style={s.sub}>Sign in to continue your fitness journey</Text>

          {/* Email */}
          <View style={s.inputWrap}>
            <TextInput
              style={s.input}
              placeholder="Email"
              placeholderTextColor="#9999bb"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password */}
          <View style={s.inputWrap}>
            <TextInput
              style={[s.input, { paddingRight: 50 }]}
              placeholder="Password"
              placeholderTextColor="#9999bb"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
            />
            <TouchableOpacity style={s.eyeBtn} onPress={() => setShowPass(!showPass)}>
              <FontAwesome name={showPass ? 'eye' : 'eye-slash'} size={18} color="#9999bb" />
            </TouchableOpacity>
          </View>

          {/* Forgot */}
          <TouchableOpacity style={s.forgotWrap}>
            <Text style={s.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity style={s.loginBtn} onPress={() => router.replace('/(tabs)')}>
            <Text style={s.loginBtnText}>Login</Text>
          </TouchableOpacity>

          {/* Sign up */}
          <View style={s.signupRow}>
            <Text style={s.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/signup')}>
              <Text style={s.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#13131f' },
  kav: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 28, justifyContent: 'center' },
  logoWrap: { alignItems: 'center', marginBottom: 40 },
  logoBox: { width: 80, height: 80, borderRadius: 24, backgroundColor: '#F97316', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  logoText: { fontFamily: 'Nunito_800ExtraBold', fontSize: 24, color: '#fff' },
  heading: { fontFamily: 'Nunito_800ExtraBold', fontSize: 30, color: '#fff', marginBottom: 8 },
  sub: { fontFamily: 'Nunito_400Regular', fontSize: 14, color: '#9999bb', marginBottom: 32 },
  inputWrap: { position: 'relative', marginBottom: 16 },
  input: {
    backgroundColor: '#1e1e30',
    borderRadius: 14,
    height: 54,
    paddingHorizontal: 18,
    fontFamily: 'Nunito_400Regular',
    fontSize: 15,
    color: '#e0e0ff',
    borderWidth: 1,
    borderColor: '#2e2e44',
  },
  eyeBtn: { position: 'absolute', right: 16, top: 17 },
  forgotWrap: { alignItems: 'flex-end', marginBottom: 28 },
  forgotText: { fontFamily: 'Nunito_600SemiBold', fontSize: 13, color: '#F97316' },
  loginBtn: { backgroundColor: '#F97316', borderRadius: 16, height: 56, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  loginBtnText: { fontFamily: 'Nunito_700Bold', fontSize: 17, color: '#fff' },
  signupRow: { flexDirection: 'row', justifyContent: 'center' },
  signupText: { fontFamily: 'Nunito_400Regular', fontSize: 14, color: '#9999bb' },
  signupLink: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: '#F97316' },
});