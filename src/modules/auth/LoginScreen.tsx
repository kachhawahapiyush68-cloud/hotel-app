// src/modules/auth/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { API_BASE_URL } from '../../config/env';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/AuthStack';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { login, loading, error } = useAuthStore();

  const [username, setUsername] = useState('');
  const [hotelCode, setHotelCode] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!username || !password) {
      setLocalError('Username and password are required');
      return;
    }
    setLocalError(null);
    await login({ username, password, hotelCode: hotelCode || undefined });
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: '#F3F6FF' }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.cardWrapper}>
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <Ionicons name="cloud-outline" size={32} color="#1D4ED8" />
          </View>
          <Text style={styles.loginTitle}>Login</Text>
        </View>

        <View style={styles.inputCard}>
          <View style={styles.inputRow}>
            <Ionicons name="person-outline" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.textInput}
              placeholder="Username"
              placeholderTextColor="#9CA3AF"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.inputRow}>
            <Ionicons name="key-outline" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.textInput}
              placeholder="Password"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={secure}
            />
            <TouchableOpacity onPress={() => setSecure((v) => !v)}>
              <Ionicons
                name={secure ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.inputRow}>
            <Ionicons name="home-outline" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.textInput}
              placeholder="Hotel Code"
              placeholderTextColor="#9CA3AF"
              value={hotelCode}
              onChangeText={setHotelCode}
              autoCapitalize="characters"
            />
          </View>
        </View>

        {(localError || error) && (
          <Text style={styles.errorText}>{localError || error}</Text>
        )}

        <TouchableOpacity
          style={styles.loginButton}
          onPress={onSubmit}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>
            {loading ? 'Logging in...' : 'Login'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.trialBox}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.trialTitle}>Free Trial</Text>
          <Text style={styles.trialSubtitle}>
            One-step To Get An Instant Demo
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomArea}>
        <Text style={styles.footerText}>Powered by Yanolja Cloud Solution</Text>
        <Text style={styles.footerTextSmall}>{API_BASE_URL}</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  cardWrapper: { paddingHorizontal: 24, paddingTop: 60 },
  logoSection: { alignItems: 'center', marginBottom: 32 },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0ECFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  loginTitle: { fontSize: 22, fontWeight: '700', color: '#111827' },
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  textInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#111827',
  },
  divider: { height: 1, backgroundColor: '#E5E7EB' },
  errorText: { color: '#DC2626', fontSize: 13, marginTop: 8 },
  loginButton: {
    marginTop: 16,
    backgroundColor: '#1D4ED8',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  loginButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  trialBox: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 6,
    borderColor: '#2563EB',
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#F3F8FF',
  },
  trialTitle: { color: '#2563EB', fontSize: 15, fontWeight: '700' },
  trialSubtitle: { color: '#4B5563', fontSize: 12, marginTop: 2 },
  bottomArea: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 24,
  },
  footerText: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  footerTextSmall: { fontSize: 10, color: '#9CA3AF', marginTop: 2 },
});
