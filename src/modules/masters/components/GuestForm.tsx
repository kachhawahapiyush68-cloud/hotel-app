// src/modules/masters/components/GuestForm.tsx
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import AppInput from '../../../shared/components/AppInput';
import AppButton from '../../../shared/components/AppButton';
import { Guest } from '../../../api/guestApi';
import { useThemeStore } from '../../../store/themeStore';

type Props = {
  initial?: Guest | null;
  submitting?: boolean;
  onSubmit: (values: {
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
  }) => void;
};

type FormState = {
  title: string;
  first_name: string;
  last_name: string;
  mobile: string;
  email: string;
  address: string;
  city: string;
  country: string;
  document_type: string;
  document_no: string;
  gst_no: string;
  remarks: string;
};

const GuestForm: React.FC<Props> = ({ initial, submitting, onSubmit }) => {
  const { theme } = useThemeStore();
  const [form, setForm] = useState<FormState>({
    title: '',
    first_name: '',
    last_name: '',
    mobile: '',
    email: '',
    address: '',
    city: '',
    country: '',
    document_type: '',
    document_no: '',
    gst_no: '',
    remarks: '',
  });

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title ?? '',
        first_name: initial.first_name ?? '',
        last_name: initial.last_name ?? '',
        mobile: initial.mobile ?? '',
        email: initial.email ?? '',
        address: initial.address ?? '',
        city: initial.city ?? '',
        country: initial.country ?? '',
        document_type: initial.document_type ?? '',
        document_no: initial.document_no ?? '',
        gst_no: initial.gst_no ?? '',
        remarks: initial.remarks ?? '',
      });
    } else {
      setForm({
        title: '',
        first_name: '',
        last_name: '',
        mobile: '',
        email: '',
        address: '',
        city: '',
        country: '',
        document_type: '',
        document_no: '',
        gst_no: '',
        remarks: '',
      });
    }
  }, [initial]);

  const setField = (field: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSubmit({
      title: form.title.trim() || null,
      first_name: form.first_name.trim() || null,
      last_name: form.last_name.trim() || null,
      mobile: form.mobile.trim() || null,
      email: form.email.trim() || null,
      address: form.address.trim() || null,
      city: form.city.trim() || null,
      country: form.country.trim() || null,
      document_type: form.document_type.trim() || null,
      document_no: form.document_no.trim() || null,
      gst_no: form.gst_no.trim() || null,
      remarks: form.remarks.trim() || null,
    });
  };

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.row}>
        <View style={styles.colSmall}>
          <AppInput
            label="Title"
            value={form.title}
            onChangeText={t => setField('title', t)}
            placeholder="Mr, Ms"
          />
        </View>
        <View style={styles.col}>
          <AppInput
            label="First Name"
            value={form.first_name}
            onChangeText={t => setField('first_name', t)}
          />
        </View>
      </View>

      <AppInput
        label="Last Name"
        value={form.last_name}
        onChangeText={t => setField('last_name', t)}
      />

      <AppInput
        label="Mobile"
        keyboardType="phone-pad"
        value={form.mobile}
        onChangeText={t => setField('mobile', t)}
      />

      <AppInput
        label="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={form.email}
        onChangeText={t => setField('email', t)}
      />

      <AppInput
        label="Address"
        value={form.address}
        onChangeText={t => setField('address', t)}
        multiline
      />

      <View style={styles.row}>
        <View style={styles.col}>
          <AppInput
            label="City"
            value={form.city}
            onChangeText={t => setField('city', t)}
          />
        </View>
        <View style={styles.col}>
          <AppInput
            label="Country"
            value={form.country}
            onChangeText={t => setField('country', t)}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.col}>
          <AppInput
            label="Document Type"
            placeholder="Passport, ID"
            value={form.document_type}
            onChangeText={t => setField('document_type', t)}
          />
        </View>
        <View style={styles.col}>
          <AppInput
            label="Document No"
            value={form.document_no}
            onChangeText={t => setField('document_no', t)}
          />
        </View>
      </View>

      <AppInput
        label="GST No"
        value={form.gst_no}
        onChangeText={t => setField('gst_no', t)}
      />

      <AppInput
        label="Remarks"
        value={form.remarks}
        onChangeText={t => setField('remarks', t)}
        multiline
      />

      <AppButton
        title={initial ? 'Update Guest' : 'Save Guest'}
        onPress={handleSubmit}
        loading={submitting}
        style={{ marginTop: 12 }}
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
  },
  col: {
    flex: 1,
  },
  colSmall: {
    width: 80,
  },
});

export default GuestForm;