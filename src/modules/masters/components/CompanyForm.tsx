// src/modules/masters/components/CompanyForm.tsx
import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Company } from '../../../api/companyApi';
import AppInput from '../../../shared/components/AppInput';
import AppButton from '../../../shared/components/AppButton';
import { useThemeStore } from '../../../store/themeStore';

type Props = {
  initial?: Partial<Company>;
  onSubmit: (values: Company) => void;
  submitting?: boolean;
};

const emptyCompany: Company = {
  company_id: undefined,
  company_code: '',
  company_name: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  country: '',
  pincode: '',
  phone: '',
  mobile: '',
  email: '',
  gst_no: '',
  currency_code: '',
  check_in_time: '',
  check_out_time: '',
  is_active: 1,
};

const CompanyForm: React.FC<Props> = ({ initial, onSubmit, submitting }) => {
  const { theme } = useThemeStore();
  const [form, setForm] = useState<Company>(emptyCompany);

  useEffect(() => {
    if (initial) {
      setForm({
        ...emptyCompany,
        ...initial,
      });
    } else {
      setForm(emptyCompany);
    }
  }, [initial]);

  const updateField = (
    field: keyof Company,
    value: string | number | undefined,
  ) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!form.company_code?.trim() || !form.company_name?.trim()) {
      // optionally show validation
      return;
    }
    onSubmit({
      ...form,
      company_code: form.company_code.trim(),
      company_name: form.company_name.trim(),
    });
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      style={{ backgroundColor: theme.colors.background }}
    >
      <View>
        <AppInput
          placeholder="Company Code"
          value={form.company_code}
          onChangeText={t => updateField('company_code', t)}
        />
        <AppInput
          placeholder="Company Name"
          value={form.company_name}
          onChangeText={t => updateField('company_name', t)}
        />
        <AppInput
          placeholder="Address 1"
          value={form.address1 ?? ''}
          onChangeText={t => updateField('address1', t)}
        />
        <AppInput
          placeholder="Address 2"
          value={form.address2 ?? ''}
          onChangeText={t => updateField('address2', t)}
        />
        <AppInput
          placeholder="City"
          value={form.city ?? ''}
          onChangeText={t => updateField('city', t)}
        />
        <AppInput
          placeholder="State"
          value={form.state ?? ''}
          onChangeText={t => updateField('state', t)}
        />
        <AppInput
          placeholder="Country"
          value={form.country ?? ''}
          onChangeText={t => updateField('country', t)}
        />
        <AppInput
          placeholder="Pincode"
          value={form.pincode ?? ''}
          onChangeText={t => updateField('pincode', t)}
        />
        <AppInput
          placeholder="Phone"
          value={form.phone ?? ''}
          onChangeText={t => updateField('phone', t)}
        />
        <AppInput
          placeholder="Mobile"
          value={form.mobile ?? ''}
          onChangeText={t => updateField('mobile', t)}
        />
        <AppInput
          placeholder="Email"
          value={form.email ?? ''}
          onChangeText={t => updateField('email', t)}
        />
        <AppInput
          placeholder="GST No"
          value={form.gst_no ?? ''}
          onChangeText={t => updateField('gst_no', t)}
        />
        <AppInput
          placeholder="Currency Code"
          value={form.currency_code ?? ''}
          onChangeText={t => updateField('currency_code', t)}
        />
        <AppInput
          placeholder="Check-in Time (HH:MM:SS)"
          value={form.check_in_time ?? ''}
          onChangeText={t => updateField('check_in_time', t)}
        />
        <AppInput
          placeholder="Check-out Time (HH:MM:SS)"
          value={form.check_out_time ?? ''}
          onChangeText={t => updateField('check_out_time', t)}
        />

        <AppButton
          title="Save Company"
          onPress={handleSubmit}
          loading={submitting}
          style={styles.button}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 16,
  },
  button: {
    marginTop: 16,
  },
});

export default CompanyForm;
