// src/modules/masters/components/CategoryForm.tsx
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import AppInput from '../../../shared/components/AppInput';
import AppButton from '../../../shared/components/AppButton';
import { Category } from '../../../api/categoryApi';

type Props = {
  initial?: Partial<Category>;
  onSubmit: (values: {
    category_type: string;
    category_name: string;
    description?: string;
  }) => void;
  submitting?: boolean;
};

const CategoryForm: React.FC<Props> = ({
  initial,
  onSubmit,
  submitting,
}) => {
  const [categoryType, setCategoryType] = useState(
    initial?.category_type || '',
  );
  const [categoryName, setCategoryName] = useState(
    initial?.category_name || '',
  );
  const [description, setDescription] = useState(initial?.description || '');
  const [errors, setErrors] = useState<{
    category_type?: string;
    category_name?: string;
  }>({});

  useEffect(() => {
    if (initial) {
      setCategoryType(initial.category_type || '');
      setCategoryName(initial.category_name || '');
      setDescription(initial.description || '');
    }
  }, [initial]);

  const handleSubmit = () => {
    const errs: typeof errors = {};
    if (!categoryType.trim()) errs.category_type = 'Required';
    if (!categoryName.trim()) errs.category_name = 'Required';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    onSubmit({
      category_type: categoryType.trim(),
      category_name: categoryName.trim(),
      description: description.trim() || undefined,
    });
  };

  return (
    <View>
      <AppInput
        placeholder="Category Type (e.g. Room, POS)"
        value={categoryType}
        onChangeText={setCategoryType}
      />
      <AppInput
        placeholder="Category Name"
        value={categoryName}
        onChangeText={setCategoryName}
      />
      <AppInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
      />
      <AppButton title="Save" onPress={handleSubmit} loading={submitting} />
    </View>
  );
};

export default CategoryForm;
