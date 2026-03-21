// src/modules/masters/CompanyEditScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useThemeStore } from '../../store/themeStore';
import { companyApi, Company } from '../../api/companyApi';
import Loader from '../../shared/components/Loader';
import SectionTitle from '../../shared/components/SectionTitle';
import CompanyForm from './components/CompanyForm';

type RouteParams = {
  id?: number;
};

const CompanyEditScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const [initial, setInitial] = useState<Company | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const params: RouteParams | undefined = route.params;
  const id: number | undefined = params?.id;

  const load = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await companyApi.getById(id);
      setInitial(data);
    } catch (e: any) {
      Alert.alert(
        'Error',
        e?.response?.data?.message || e?.message || 'Failed to load company',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) load();
  }, [id]);

  const handleSubmit = async (values: Company) => {
    try {
      setSaving(true);
      if (id) {
        await companyApi.update(id, values);
      } else {
        await companyApi.create(values);
      }
      navigation.goBack();
    } catch (e: any) {
      Alert.alert(
        'Error',
        e?.response?.data?.message || e?.message || 'Failed to save company',
      );
    } finally {
      setSaving(false);
    }
  };

  if (id && loading) {
    return <Loader />;
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <SectionTitle title={id ? 'Edit Company' : 'New Company'} />
      <CompanyForm initial={initial} onSubmit={handleSubmit} submitting={saving} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
});

export default CompanyEditScreen;
