// src/modules/masters/GuestListScreen.tsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  Text,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { guestApi, Guest } from '../../api/guestApi';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import SectionTitle from '../../shared/components/SectionTitle';
import Card from '../../shared/components/Card';
import AppButton from '../../shared/components/AppButton';
import Loader from '../../shared/components/Loader';
import GuestForm from './components/GuestForm';
import { formatDateTime } from '../../shared/utils/date';

const GuestListScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const user = useAuthStore(s => s.user);
  const isFocused = useIsFocused();

  const [data, setData] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(false);

  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<Guest | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await guestApi.list();
      setData(res);
    } catch (e: any) {
      Alert.alert(
        'Error',
        e?.response?.data?.message || e?.message || 'Failed to load guests',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      load();
    }
  }, [isFocused, load]);

  const openCreate = () => {
    setEditing(null);
    setFormVisible(true);
  };

  const openEdit = (guest: Guest) => {
    setEditing(guest);
    setFormVisible(true);
  };

  const handleSubmit = async (values: {
    title?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    mobile?: string | null;
    email?: string | null;
    address?: string | null;
    city?: string | null;
    country?: string | null;
    document_type?: string | null;
    document_no?: string | null;
    gst_no?: string | null;
    remarks?: string | null;
  }) => {
    try {
      setSaving(true);

      if (editing) {
        await guestApi.update(editing.guest_id, values);
      } else {
        await guestApi.create(values);
      }

      setFormVisible(false);
      setEditing(null);
      await load();
    } catch (e: any) {
      Alert.alert(
        'Error',
        e?.response?.data?.message || e?.message || 'Failed to save guest',
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (guest: Guest) => {
    Alert.alert(
      'Delete guest',
      `Are you sure you want to delete ${guest.first_name || ''} ${guest.last_name || ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => handleDelete(guest.guest_id),
        },
      ],
    );
  };

  const handleDelete = async (id: number) => {
    try {
      await guestApi.remove(id);
      await load();
    } catch (e: any) {
      Alert.alert(
        'Error',
        e?.response?.data?.message || e?.message || 'Failed to delete guest',
      );
    }
  };

  const renderItem = ({ item }: { item: Guest }) => {
    const name =
      (item.first_name || '') +
      (item.last_name ? ` ${item.last_name}` : '');
    return (
      <Card
        style={styles.card}
        onPress={() => openEdit(item)}
        header={name || item.mobile || 'Guest'}
        subtitle={
          [
            item.mobile || '',
            item.email || '',
            item.city || '',
            item.country || '',
          ]
            .filter(Boolean)
            .join(' • ') +
          (item.created_at
            ? `\nCreated: ${formatDateTime(item.created_at)}`
            : '')
        }
        footer={
          <View style={styles.cardFooter}>
            <AppButton
              title="Edit"
              size="small"
              onPress={() => openEdit(item)}
            />
            <AppButton
              title="Delete"
              size="small"
              variant="outline"
              onPress={() => confirmDelete(item)}
            />
          </View>
        }
      />
    );
  };

  if (loading && !formVisible && data.length === 0) {
    return <Loader />;
  }

  if (formVisible) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <SectionTitle
          title={editing ? 'Edit Guest' : 'New Guest'}
        />
        <GuestForm
          initial={editing || undefined}
          submitting={saving}
          onSubmit={handleSubmit}
        />
        <AppButton
          title="Close"
          variant="outline"
          onPress={() => {
            setFormVisible(false);
            setEditing(null);
          }}
          style={{ margin: 16 }}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <SectionTitle title="Guests" />
      <Text
        style={[
          styles.countText,
          { color: theme.colors.textSecondary },
        ]}
      >
        {data.length} guest{data.length === 1 ? '' : 's'} found
      </Text>

      <AppButton
        title="Add Guest"
        onPress={openCreate}
        style={{ marginBottom: 8 }}
      />

      <FlatList
        data={data}
        keyExtractor={item => String(item.guest_id)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { marginBottom: 10 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    columnGap: 8,
  },
  countText: {
    fontSize: 12,
    marginBottom: 8,
  },
});

export default GuestListScreen;
