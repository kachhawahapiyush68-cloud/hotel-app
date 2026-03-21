// src/modules/masters/components/ProductForm.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import AppInput from '../../../shared/components/AppInput';
import AppButton from '../../../shared/components/AppButton';
import CategoryPicker from './CategoryPicker';
import { Product } from '../../../api/productApi';
import { useThemeStore } from '../../../store/themeStore';

type Props = {
  initial?: Product | null;
  submitting?: boolean;
  onSubmit: (values: {
    category_id: number;
    product_code?: string | null;
    product_name: string;
    unit: string;
    rate: number;
    tax_group_id?: number | null;
    is_service?: number;
    is_active?: number;
  }) => void;
};

type FormState = {
  category_id: number | null;
  product_code: string;
  product_name: string;
  unit: string;
  rate: string;
  tax_group_id: string;
  is_service: boolean;
  is_active: boolean;
};

const ProductForm: React.FC<Props> = ({ initial, submitting, onSubmit }) => {
  const { theme } = useThemeStore();

  const [form, setForm] = useState<FormState>({
    category_id: null,
    product_code: '',
    product_name: '',
    unit: '',
    rate: '',
    tax_group_id: '',
    is_service: false,
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initial) {
      setForm({
        category_id: initial.category_id,
        product_code: initial.product_code ?? '',
        product_name: initial.product_name,
        unit: initial.unit,
        rate: String(initial.rate),
        tax_group_id: initial.tax_group_id != null ? String(initial.tax_group_id) : '',
        is_service: initial.is_service === 1,
        is_active: initial.is_active === 1,
      });
    } else {
      setForm({
        category_id: null,
        product_code: '',
        product_name: '',
        unit: '',
        rate: '',
        tax_group_id: '',
        is_service: false,
        is_active: true,
      });
    }
  }, [initial]);

  const setField = (field: keyof FormState, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.category_id) next.category_id = 'Category is required';
    if (!form.product_name.trim()) next.product_name = 'Product name is required';
    if (!form.unit.trim()) next.unit = 'Unit is required';

    if (form.rate && isNaN(Number(form.rate))) {
      next.rate = 'Rate must be a number';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    onSubmit({
      category_id: form.category_id!,
      product_code: form.product_code.trim() || null,
      product_name: form.product_name.trim(),
      unit: form.unit.trim(),
      rate: form.rate ? Number(form.rate) : 0,
      tax_group_id: form.tax_group_id ? Number(form.tax_group_id) : null,
      is_service: form.is_service ? 1 : 0,
      is_active: form.is_active ? 1 : 0,
    });
  };

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <CategoryPicker
        label="Category"
        selectedId={form.category_id}
        onSelect={id => setField('category_id', id)}
        error={errors.category_id}
      />

      <AppInput
        label="Product Code"
        value={form.product_code}
        onChangeText={t => setField('product_code', t)}
      />

      <AppInput
        label="Product Name"
        value={form.product_name}
        onChangeText={t => setField('product_name', t)}
        error={errors.product_name}
      />

      <AppInput
        label="Unit (e.g. PCS, KG)"
        value={form.unit}
        onChangeText={t => setField('unit', t)}
        error={errors.unit}
      />

      <AppInput
        label="Rate"
        keyboardType="numeric"
        value={form.rate}
        onChangeText={t => setField('rate', t)}
        error={errors.rate}
      />

      <AppInput
        label="Tax Group Id (optional)"
        keyboardType="numeric"
        value={form.tax_group_id}
        onChangeText={t => setField('tax_group_id', t)}
      />

      <View style={styles.row}>
        <AppButton
          title={form.is_service ? 'Service Item' : 'Goods Item'}
          variant="outline"
          onPress={() => setField('is_service', !form.is_service)}
          style={styles.toggle}
        />
        <AppButton
          title={form.is_active ? 'Active' : 'Inactive'}
          variant="outline"
          onPress={() => setField('is_active', !form.is_active)}
          style={styles.toggle}
        />
      </View>

      <AppButton
        title={initial ? 'Update Product' : 'Save Product'}
        onPress={handleSubmit}
        loading={submitting}
        style={styles.submit}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  toggle: {
    flex: 1,
  },
  submit: {
    marginTop: 8,
  },
});

export default ProductForm;
