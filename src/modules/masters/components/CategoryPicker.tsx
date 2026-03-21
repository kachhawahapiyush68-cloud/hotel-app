// src/modules/masters/components/CategoryPicker.tsx
import React, { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import AppInput from '../../../shared/components/AppInput';
import SelectModal from '../../../shared/components/SelectModal';
import { Category, categoryApi } from '../../../api/categoryApi';
import { useThemeStore } from '../../../store/themeStore';

type Props = {
  label?: string;
  selectedId: number | null;
  onSelect: (id: number) => void;
  error?: string;
  categoryType?: string;
};

const CategoryPicker: React.FC<Props> = ({
  label = 'Category',
  selectedId,
  onSelect,
  error,
  categoryType,
}) => {
  const { theme } = useThemeStore();
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await categoryApi.list(
        categoryType ? { category_type: categoryType } : {},
      );
      setData(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [categoryType]);

  const selected = data.find(c => c.category_id === selectedId);

  if (loading && data.length === 0) {
    return <ActivityIndicator color={theme.colors.primary} />;
  }

  return (
    <>
      <AppInput
        label={label}
        value={selected ? selected.category_name : ''}
        editable={false}
        onPress={() => setModalVisible(true)}
        error={error}
      />
      <SelectModal
        visible={modalVisible}
        title="Select Category"
        onClose={() => setModalVisible(false)}
        data={data.map(c => ({
          label: `${c.category_name} (${c.category_type})`,
          value: c.category_id,
        }))}
        onSelect={item => {
          onSelect(item.value as number);
          setModalVisible(false);
        }}
      />
    </>
  );
};

export default CategoryPicker;
