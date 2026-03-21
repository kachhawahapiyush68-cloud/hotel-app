// src/modules/masters/components/RoomForm.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import AppInput from '../../../shared/components/AppInput';
import AppButton from '../../../shared/components/AppButton';
import Pill from '../../../shared/components/Pill';
import SectionTitle from '../../../shared/components/SectionTitle';
import SelectModal from '../../../shared/components/SelectModal';
import CategoryPicker from './CategoryPicker';
import { Room, RoomPayload, RoomStatus } from '../../../api/roomApi';
import { useThemeStore } from '../../../store/themeStore';
import { useAuthStore } from '../../../store/authStore';
import { isSuperAdmin } from '../../../shared/utils/role';

export interface RoomFormValues {
  room_no: string;
  category_id: number | null;
  floor_no: string;
  max_adult: string;
  max_child: string;
  base_rate: string;
  status: RoomStatus;
  is_dormitory: boolean;
  is_active: boolean;
}

interface RoomFormProps {
  initialRoom?: Room | null;
  loading?: boolean;
  onSubmit: (payload: RoomPayload) => void;
  onCancel?: () => void;
}

const statusOptions: { label: string; value: RoomStatus }[] = [
  { label: 'Available', value: 'Available' },
  { label: 'Occupied', value: 'Occupied' },
  { label: 'Out Of Order', value: 'OutOfOrder' },
  { label: 'Dirty', value: 'Dirty' },
  { label: 'Blocked', value: 'Blocked' },
];

const RoomForm: React.FC<RoomFormProps> = ({
  initialRoom,
  loading,
  onSubmit,
  onCancel,
}) => {
  const { theme } = useThemeStore();
  const { user } = useAuthStore();

  const [values, setValues] = useState<RoomFormValues>({
    room_no: '',
    category_id: null,
    floor_no: '',
    max_adult: '',
    max_child: '',
    base_rate: '',
    status: 'Available',
    is_dormitory: false,
    is_active: true,
  });

  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialRoom) {
      setValues({
        room_no: initialRoom.room_no,
        category_id: initialRoom.category_id,
        floor_no: initialRoom.floor_no ?? '',
        max_adult: initialRoom.max_adult ? String(initialRoom.max_adult) : '',
        max_child: initialRoom.max_child ? String(initialRoom.max_child) : '',
        base_rate: initialRoom.base_rate ? String(initialRoom.base_rate) : '',
        status: initialRoom.status ?? 'Available',
        is_dormitory: initialRoom.is_dormitory === 1,
        is_active: initialRoom.is_active === 1,
      });
    }
  }, [initialRoom]);

  const handleChange = (field: keyof RoomFormValues, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!values.room_no.trim()) nextErrors.room_no = 'Room no is required';
    if (!values.category_id) nextErrors.category_id = 'Category is required';

    if (values.max_adult && isNaN(Number(values.max_adult))) {
      nextErrors.max_adult = 'Must be a number';
    }
    if (values.max_child && isNaN(Number(values.max_child))) {
      nextErrors.max_child = 'Must be a number';
    }
    if (values.base_rate && isNaN(Number(values.base_rate))) {
      nextErrors.base_rate = 'Must be a number';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const payload: RoomPayload = {
      room_no: values.room_no.trim(),
      category_id: values.category_id!,
      floor_no: values.floor_no.trim() || null,
      max_adult: values.max_adult ? Number(values.max_adult) : undefined,
      max_child: values.max_child ? Number(values.max_child) : undefined,
      base_rate: values.base_rate ? Number(values.base_rate) : undefined,
      status: values.status,
      is_dormitory: values.is_dormitory ? 1 : 0,
      is_active: values.is_active ? 1 : 0,
    };

    if (isSuperAdmin(user?.role) && initialRoom?.company_id) {
      payload.company_id = initialRoom.company_id;
    }

    onSubmit(payload);
  };

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <SectionTitle title={initialRoom ? 'Edit Room' : 'New Room'} />

      <AppInput
        label="Room No"
        value={values.room_no}
        onChangeText={text => handleChange('room_no', text)}
        error={errors.room_no}
      />

      {/* CategoryPicker we defined earlier takes only selectedId/onSelect/error; 
          we wrap label with AppInput outside when needed. 
          For simplicity here, keep a plain CategoryPicker that uses AppInput internally. */}
      <CategoryPicker
        selectedId={values.category_id}
        onSelect={id => handleChange('category_id', id)}
      />

      <AppInput
        label="Floor No"
        value={values.floor_no}
        onChangeText={text => handleChange('floor_no', text)}
      />

      <View style={styles.row}>
        <View style={styles.col}>
          <AppInput
            label="Max Adult"
            keyboardType="numeric"
            value={values.max_adult}
            onChangeText={text => handleChange('max_adult', text)}
            error={errors.max_adult}
          />
        </View>
        <View style={styles.col}>
          <AppInput
            label="Max Child"
            keyboardType="numeric"
            value={values.max_child}
            onChangeText={text => handleChange('max_child', text)}
            error={errors.max_child}
          />
        </View>
      </View>

      <AppInput
        label="Base Rate"
        keyboardType="numeric"
        value={values.base_rate}
        onChangeText={text => handleChange('base_rate', text)}
        error={errors.base_rate}
      />

      <AppInput
        label="Status"
        value={statusOptions.find(s => s.value === values.status)?.label ?? ''}
        editable={false}
        onPress={() => setStatusModalVisible(true)}
      />

      <View style={styles.row}>
        <Pill
          label="Dormitory"
          active={values.is_dormitory}
          onPress={() => handleChange('is_dormitory', !values.is_dormitory)}
        />
        <Pill
          label="Active"
          active={values.is_active}
          onPress={() => handleChange('is_active', !values.is_active)}
        />
      </View>

      <View style={styles.buttonRow}>
        {onCancel && (
          <View style={styles.buttonCol}>
            <AppButton title="Cancel" variant="outline" onPress={onCancel} />
          </View>
        )}
        <View style={styles.buttonCol}>
          <AppButton
            title={initialRoom ? 'Update' : 'Save'}
            onPress={handleSubmit}
            loading={!!loading}
          />
        </View>
      </View>

      <SelectModal
        visible={statusModalVisible}
        title="Select Status"
        onClose={() => setStatusModalVisible(false)}
        data={statusOptions.map(s => ({ label: s.label, value: s.value }))}
        onSelect={item => {
          handleChange('status', item.value as RoomStatus);
          setStatusModalVisible(false);
        }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  col: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  buttonCol: {
    flex: 1,
  },
});

export default RoomForm;
