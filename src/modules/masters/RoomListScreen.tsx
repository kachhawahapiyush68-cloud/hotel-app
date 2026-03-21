import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { roomApi, Room, RoomPayload } from '../../api/roomApi';
import Card from '../../shared/components/Card';
import AppButton from '../../shared/components/AppButton';
import Loader from '../../shared/components/Loader';
import SectionTitle from '../../shared/components/SectionTitle';
import RoomForm from './components/RoomForm';
import { useThemeStore } from '../../store/themeStore';
import { formatCurrency } from '../../shared/utils/number';

const RoomListScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadRooms = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);
      const data = await roomApi.list();
      setRooms(data);
    } catch (e) {
      console.warn('Failed to load rooms', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const onRefresh = () => {
    setRefreshing(true);
    loadRooms();
  };

  const openCreate = () => {
    setEditingRoom(null);
    setFormVisible(true);
  };

  const openEdit = (room: Room) => {
    setEditingRoom(room);
    setFormVisible(true);
  };

  const handleSubmit = async (payload: RoomPayload) => {
    try {
      setSaving(true);
      if (editingRoom) {
        await roomApi.update(editingRoom.room_id, payload);
      } else {
        await roomApi.create(payload);
      }
      setFormVisible(false);
      setEditingRoom(null);
      await loadRooms();
    } catch (e: any) {
      console.warn('Failed to save room', e);
      if (e?.response?.status === 409) {
        Alert.alert(
          'Error',
          e.response.data?.message || 'Room number already exists',
        );
      } else {
        Alert.alert('Error', 'Failed to save room');
      }
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (room: Room) => {
    Alert.alert(
      'Delete Room',
      `Are you sure you want to delete room ${room.room_no}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => handleDelete(room.room_id),
        },
      ],
    );
  };

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      await roomApi.delete(id);
      await loadRooms();
    } catch (e) {
      console.warn('Failed to delete room', e);
      Alert.alert('Error', 'Failed to delete room');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Room }) => (
    <Card
      style={styles.card}
      onPress={() => openEdit(item)}
      header={`${item.room_no} • ${item.status}`}
      subtitle={
        `Category #${item.category_id} • Floor ${item.floor_no ?? '-'}\n` +
        `Max Adult: ${item.max_adult}  Max Child: ${item.max_child}\n` +
        `Base Rate: ${formatCurrency(item.base_rate)}`
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

  if (loading && rooms.length === 0) {
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
        <RoomForm
          initialRoom={editingRoom}
          loading={saving}
          onSubmit={handleSubmit}
          onCancel={() => {
            setFormVisible(false);
            setEditingRoom(null);
          }}
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
      <SectionTitle
        title="Rooms"
        rightContent={
          <AppButton title="Add Room" size="small" onPress={openCreate} />
        }
      />
      <FlatList
        data={rooms}
        keyExtractor={item => String(item.room_id)}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={rooms.length === 0 && styles.emptyContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    columnGap: 8,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});

export default RoomListScreen;
