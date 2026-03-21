// src/modules/users/UserListScreen.tsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  Text,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import SectionTitle from '../../shared/components/SectionTitle';
import Card from '../../shared/components/Card';
import AppButton from '../../shared/components/AppButton';
import Loader from '../../shared/components/Loader';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { AppUser, userApi } from '../../api/userApi';
import { isSuperAdmin } from '../../shared/utils/role';

type Nav = {
  navigate: (screen: string, params?: any) => void;
};

const UserListScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const authUser = useAuthStore(s => s.user);
  const navigation = useNavigation<Nav>();
  const isFocused = useIsFocused();

  const [data, setData] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await userApi.list();

      // If current user is SUPER_ADMIN → show everyone (including super admin)
      // If current user is ADMIN → hide SUPER_ADMIN records
      const filtered = isSuperAdmin(authUser?.role)
        ? res
        : res.filter(u => !isSuperAdmin(u.role));

      setData(filtered);
    } catch (e: any) {
      Alert.alert(
        'Error',
        e?.response?.data?.message || e?.message || 'Failed to load users',
      );
    } finally {
      setLoading(false);
    }
  }, [authUser?.role]);

  useEffect(() => {
    if (isFocused) {
      load();
    }
  }, [isFocused, load]);

  const openEdit = (user: AppUser) => {
    navigation.navigate('UserEdit', { id: user.user_id });
  };

  const confirmDeactivate = (user: AppUser) => {
    if (!user.is_active) return;
    Alert.alert(
      'Deactivate user',
      `Are you sure you want to deactivate ${user.user_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: () => handleDeactivate(user.user_id),
        },
      ],
    );
  };

  const handleDeactivate = async (id: number) => {
    try {
      await userApi.deactivate(id);
      await load();
    } catch (e: any) {
      Alert.alert(
        'Error',
        e?.response?.data?.message || e?.message || 'Failed to deactivate user',
      );
    }
  };

  const renderItem = ({ item }: { item: AppUser }) => {
    const name = item.full_name || item.user_name;
    const companyLine = `Company #${item.company_id}`;
    const roleLine = `${item.role} • ${
      item.is_active ? 'Active' : 'Inactive'
    }`;

    return (
      <Card
        style={styles.card}
        onPress={() => openEdit(item)}
        header={name}
        subtitle={
          [
            roleLine,
            companyLine,
            item.email || '',
            item.phone || '',
          ]
            .filter(Boolean)
            .join('\n')
        }
        footer={
          <View style={styles.footer}>
            <AppButton
              title="Edit"
              size="small"
              onPress={() => openEdit(item)}
            />
            <AppButton
              title={item.is_active ? 'Deactivate' : 'Inactive'}
              size="small"
              variant="outline"
              onPress={() => confirmDeactivate(item)}
            />
          </View>
        }
      />
    );
  };

  if (loading && data.length === 0) {
    return <Loader />;
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <SectionTitle
        title="Users"
        subtitle={
          isSuperAdmin(authUser?.role)
            ? 'All companies'
            : 'Users in your company'
        }
      />
      <Text
        style={[
          styles.countText,
          { color: theme.colors.textSecondary },
        ]}
      >
        {data.length} user{data.length === 1 ? '' : 's'} found
      </Text>

      <FlatList
        data={data}
        keyExtractor={item => String(item.user_id)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { marginBottom: 10 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    columnGap: 8,
  },
  countText: {
    fontSize: 12,
    marginBottom: 8,
  },
});

export default UserListScreen;
