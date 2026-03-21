// src/modules/users/UserEditScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import AppInput from '../../shared/components/AppInput';
import AppButton from '../../shared/components/AppButton';
import SectionTitle from '../../shared/components/SectionTitle';
import Loader from '../../shared/components/Loader';
import { useThemeStore } from '../../store/themeStore';
import { AppUser, userApi, UpdateUserPayload } from '../../api/userApi';
import { normalizeRole } from '../../shared/utils/role';

type RootStackParamList = {
  UserEdit: { id: number };
};

type UserEditRouteProp = RouteProp<RootStackParamList, 'UserEdit'>;

const UserEditScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const route = useRoute<UserEditRouteProp>();
  const navigation = useNavigation();
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [isActive, setIsActive] = useState(true);

  const id = route.params?.id;

  const load = async () => {
    try {
      setLoading(true);
      const data = await userApi.getById(id);
      setUser(data);
      setFullName(data.full_name || '');
      setEmail(data.email || '');
      setPhone(data.phone || '');
      setRole(data.role || '');
      setIsActive(data.is_active === 1);
    } catch (e: any) {
      Alert.alert(
        'Error',
        e?.response?.data?.message || e?.message || 'Failed to load user',
      );
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload: UpdateUserPayload = {
        full_name: fullName.trim() || null,
        email: email.trim() || null,
        phone: phone.trim() || null,
        role: role ? normalizeRole(role) : null,
        is_active: isActive ? 1 : 0,
      };
      await userApi.update(id, payload);
      navigation.goBack();
    } catch (e: any) {
      Alert.alert(
        'Error',
        e?.response?.data?.message || e?.message || 'Failed to update user',
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return <Loader />;
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <SectionTitle title="Edit User" subtitle={user.user_name} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <AppInput
          label="Full Name"
          value={fullName}
          onChangeText={setFullName}
        />
        <AppInput
          label="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <AppInput
          label="Phone"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
        <AppInput
          label="Role"
          value={role}
          onChangeText={setRole}
          placeholder="ADMIN, EMPLOYEE, USER"
        />
        <AppButton
          title={isActive ? 'Active' : 'Inactive'}
          variant="outline"
          onPress={() => setIsActive(prev => !prev)}
          style={{ marginTop: 8, marginBottom: 16 }}
        />
        <AppButton
          title="Save"
          onPress={handleSave}
          loading={saving}
        />
        <AppButton
          title="Cancel"
          variant="outline"
          onPress={() => navigation.goBack()}
          style={{ marginTop: 8 }}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 24 },
});

export default UserEditScreen;
