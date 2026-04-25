// app/(tabs)/account.tsx — IronFit My Account Screen

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Modal,
} from 'react-native';
import {
  useFonts,
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';
import FontAwesome from '@expo/vector-icons/FontAwesome';

// ─── Types & Data ────────────────────────────────────────────────────────────

interface UserProfile {
  name: string;
  email: string;
  height: string;
  weight: string;
  fitnessGoal: string;
}

const INITIAL_PROFILE: UserProfile = {
  name: 'Alex Johnson',
  email: 'alex.johnson@email.com',
  height: '175 cm',
  weight: '70 kg',
  fitnessGoal: 'Weight Loss',
};

type FieldKey = keyof UserProfile;

const FIELD_CONFIG: { key: FieldKey; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'height', label: 'Height' },
  { key: 'weight', label: 'Weight' },
  { key: 'fitnessGoal', label: 'Fitness Goal' },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function AccountScreen() {
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [editingField, setEditingField] = useState<FieldKey | null>(null);
  const [editValue, setEditValue] = useState('');

  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  if (!fontsLoaded) return null;

  const initials = profile.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 1);

  const openEdit = (key: FieldKey) => {
    setEditingField(key);
    setEditValue(profile[key]);
  };

  const saveEdit = () => {
    if (editingField && editValue.trim()) {
      setProfile((prev) => ({ ...prev, [editingField]: editValue.trim() }));
    }
    setEditingField(null);
  };

  return (
    <View style={s.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#13131f" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>My Account</Text>
        </View>

        {/* Avatar Section */}
        <View style={s.avatarSection}>
          <View style={s.avatarContainer}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{initials}</Text>
            </View>
            <TouchableOpacity style={s.cameraBtn} activeOpacity={0.7}>
              <FontAwesome name="camera" size={12} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={s.userName}>{profile.name}</Text>
          <Text style={s.userEmail}>{profile.email}</Text>
        </View>

        {/* Personal Information Card */}
        <View style={s.infoCard}>
          <Text style={s.infoTitle}>Personal Information</Text>

          {FIELD_CONFIG.map((field, index) => (
            <View key={field.key}>
              {index > 0 && <View style={s.divider} />}
              <View style={s.fieldRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.fieldLabel}>{field.label}</Text>
                  <Text style={s.fieldValue}>{profile[field.key]}</Text>
                </View>
                <TouchableOpacity
                  style={s.editBtn}
                  onPress={() => openEdit(field.key)}
                  activeOpacity={0.6}
                >
                  <FontAwesome name="pencil" size={16} color="#9999bb" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Settings Section */}
        <View style={s.settingsCard}>
          <Text style={s.infoTitle}>Settings</Text>

          {[
            { icon: 'bell' as const, label: 'Notifications', value: 'On' },
            { icon: 'moon-o' as const, label: 'Dark Mode', value: 'On' },
            { icon: 'language' as const, label: 'Language', value: 'English' },
            { icon: 'lock' as const, label: 'Privacy', value: '' },
          ].map((item, i) => (
            <View key={item.label}>
              {i > 0 && <View style={s.divider} />}
              <TouchableOpacity style={s.settingRow} activeOpacity={0.6}>
                <View style={s.settingIconWrap}>
                  <FontAwesome name={item.icon} size={16} color="#F97316" />
                </View>
                <Text style={s.settingLabel}>{item.label}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {item.value ? (
                    <Text style={s.settingValue}>{item.value}</Text>
                  ) : null}
                  <FontAwesome
                    name="chevron-right"
                    size={12}
                    color="#9999bb"
                    style={{ marginLeft: 8 }}
                  />
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Log Out Button */}
        <TouchableOpacity style={s.logoutBtn} activeOpacity={0.7}>
          <FontAwesome
            name="sign-out"
            size={18}
            color="#ff4d4d"
            style={{ marginRight: 10 }}
          />
          <Text style={s.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── Edit Modal ── */}
      <Modal
        visible={editingField !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingField(null)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>
              Edit{' '}
              {FIELD_CONFIG.find((f) => f.key === editingField)?.label ?? ''}
            </Text>
            <TextInput
              style={s.modalInput}
              value={editValue}
              onChangeText={setEditValue}
              autoFocus
              placeholderTextColor="#666"
              selectionColor="#F97316"
            />
            <View style={s.modalActions}>
              <TouchableOpacity
                style={s.modalCancel}
                onPress={() => setEditingField(null)}
              >
                <Text style={s.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.modalSave} onPress={saveEdit}>
                <Text style={s.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#13131f',
  },

  /* Header */
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 32,
    color: '#fff',
  },

  /* Avatar */
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F97316',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 40,
    color: '#fff',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2d2b55',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#13131f',
  },
  userName: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 22,
    color: '#fff',
  },
  userEmail: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: '#9999bb',
    marginTop: 4,
  },

  /* Info Card */
  infoCard: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: '#1e1e30',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2e2e44',
  },
  infoTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: '#fff',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#2e2e44',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  fieldLabel: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: '#9999bb',
    marginBottom: 4,
  },
  fieldValue: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 16,
    color: '#e0e0ff',
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Settings Card */
  settingsCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#1e1e30',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2e2e44',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  settingIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F9731618',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  settingLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15,
    color: '#e0e0ff',
    flex: 1,
  },
  settingValue: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: '#9999bb',
  },

  /* Log Out */
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 16,
    backgroundColor: '#1e1e30',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ff4d4d33',
  },
  logoutText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: '#ff4d4d',
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#1e1e30',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#2e2e44',
  },
  modalTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: '#fff',
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: '#13131f',
    borderRadius: 12,
    padding: 14,
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 16,
    color: '#e0e0ff',
    borderWidth: 1,
    borderColor: '#2e2e44',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalCancel: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#13131f',
    borderWidth: 1,
    borderColor: '#2e2e44',
  },
  modalCancelText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: '#9999bb',
  },
  modalSave: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F97316',
  },
  modalSaveText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: '#fff',
  },
});
