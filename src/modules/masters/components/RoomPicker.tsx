// src/modules/masters/components/RoomPicker.tsx
import React, { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import AppInput from '../../../shared/components/AppInput';
import SelectModal from '../../../shared/components/SelectModal';
import { roomApi, Room } from '../../../api/roomApi';
import { useAuthStore } from '../../../store/authStore';
import { isSuperAdmin } from '../../../shared/utils/role';

interface RoomPickerProps {
  label?: string;
  selectedId: number | null;
  onSelect: (id: number) => void;
  error?: string;
}

const RoomPicker: React.FC<RoomPickerProps> = ({
  label = 'Room',
  selectedId,
  onSelect,
  error,
}) => {
  const { user } = useAuthStore();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (isSuperAdmin(user?.role) && user?.companyid) {
        params.companyid = user.companyid;
      }
      const data = await roomApi.list(params);
      setRooms(data.filter(r => r.is_deleted === 0 && r.is_active === 1));
    } catch (e) {
      console.warn('Failed to load rooms', e);
    } finally {
      setLoading(false);
    }
  };

  const selected = rooms.find(r => r.room_id === selectedId);

  if (loading && rooms.length === 0) {
    return <ActivityIndicator />;
  }

  return (
    <>
      <AppInput
        label={label}
        value={selected ? selected.room_no : ''}
        editable={false}
        onPress={() => setModalVisible(true)}
        error={error}
      />
      <SelectModal
        visible={modalVisible}
        title="Select Room"
        onClose={() => setModalVisible(false)}
        data={rooms.map(r => ({
          label: `${r.room_no}`,
          value: r.room_id,
        }))}
        onSelect={item => {
          onSelect(item.value as number);
          setModalVisible(false);
        }}
      />
    </>
  );
};

export default RoomPicker;
