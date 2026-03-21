// src/modules/auth/RegisterScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { registerApi } from '../../api/authApi';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/AuthStack';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [role, setRole] = useState('ADMIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!username || !password || !companyId) {
      setLocalError('Username, password and companyId are required');
      return;
    }
    setLocalError(null);
    try {
      const companyIdNum = Number(companyId);
      if (Number.isNaN(companyIdNum)) {
        setLocalError('companyId must be a number');
        return;
      }
      setLoading(true);
      const res = await registerApi({
        username,
        password,
        fullName: fullName || undefined,
        email: email || undefined,
        companyId: companyIdNum,
        role: role || undefined,
      });
      setLoading(false);
      Alert.alert('Success', res.message || 'User registered successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      setLoading(false);
      const msg =
        err?.response?.data?.message ||
        'Unable to register, please try again';
      setLocalError(msg);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: '#F3F6FF' }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.cardWrapper}>
        <View style={styles.logoSection}>
          <Text style={styles.loginTitle}>Register User</Text>
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
            <Ionicons name="id-card-outline" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.textInput}
              placeholder="Full name"
              placeholderTextColor="#9CA3AF"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>
          <View style={styles.divider} />

          <View style={styles.inputRow}>
            <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.textInput}
              placeholder="Email (optional)"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
          </View>
          <View style={styles.divider} />

          <View style={styles.inputRow}>
            <Ionicons name="business-outline" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.textInput}
              placeholder="Company ID (numeric)"
              placeholderTextColor="#9CA3AF"
              value={companyId}
              onChangeText={setCompanyId}
              keyboardType="number-pad"
            />
          </View>
          <View style={styles.divider} />

          <View style={styles.inputRow}>
            <Ionicons name="ribbon-outline" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.textInput}
              placeholder="Role (SUPER_ADMIN / ADMIN / EMPLOYEE)"
              placeholderTextColor="#9CA3AF"
              value={role}
              onChangeText={setRole}
              autoCapitalize="characters"
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
        </View>

        {localError && (
          <Text style={styles.errorText}>{localError}</Text>
        )}

        <TouchableOpacity
          style={styles.loginButton}
          onPress={onSubmit}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>
            {loading ? 'Registering...' : 'Register'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  cardWrapper: { paddingHorizontal: 24, paddingTop: 60 },
  logoSection: { alignItems: 'center', marginBottom: 24 },
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
});
