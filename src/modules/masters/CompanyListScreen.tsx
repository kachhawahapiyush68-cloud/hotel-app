// src/modules/masters/CompanyListScreen.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { companyApi, Company } from '../../api/companyApi';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import Loader from '../../shared/components/Loader';
import Card from '../../shared/components/Card';
import AppButton from '../../shared/components/AppButton';
import SectionTitle from '../../shared/components/SectionTitle';

const CompanyListScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const isFocused = useIsFocused();
  const navigation = useNavigation<any>();
  const user = useAuthStore(s => s.user);

  const role = (user?.role || '').toUpperCase();

  const [data, setData] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const res = await companyApi.getAll();
      setData(res);
    } catch (e: any) {
      Alert.alert(
        'Error',
        e?.response?.data?.message || e?.message || 'Failed to load companies',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      load();
    }
  }, [isFocused]);

  const openCreate = () => {
    if (role !== 'SUPER_ADMIN') {
      Alert.alert('Not allowed', 'Only super admin can create new companies');
      return;
    }
    navigation.navigate('CompanyEdit', { id: undefined });
  };

  const openEdit = (company: Company) => {
    if (!company.company_id) return;
    navigation.navigate('CompanyEdit', { id: company.company_id });
  };

  const toggleActive = async (company: Company) => {
    if (role !== 'SUPER_ADMIN') return;
    if (!company.company_id) return;

    const currentActive =
      company.is_active === 1 || company.is_active === undefined;

    try {
      if (currentActive) {
        await companyApi.deactivate(company.company_id);
        setData(prev =>
          prev.map(c =>
            c.company_id === company.company_id
              ? { ...c, is_active: 0 }
              : c,
          ),
        );
      } else {
        await companyApi.update(company.company_id, { is_active: 1 });
        setData(prev =>
          prev.map(c =>
            c.company_id === company.company_id
              ? { ...c, is_active: 1 }
              : c,
          ),
        );
      }
    } catch (e: any) {
      Alert.alert(
        'Error',
        e?.response?.data?.message || e?.message || 'Failed to change status',
      );
    }
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return data;
    return data.filter(c => {
      const name = c.company_name?.toLowerCase() || '';
      const code = c.company_code?.toLowerCase() || '';
      const city = c.city?.toLowerCase() || '';
      return name.includes(term) || code.includes(term) || city.includes(term);
    });
  }, [data, search]);

  const renderItem = ({ item }: { item: Company }) => {
    const active = item.is_active === 1 || item.is_active === undefined;
    return (
      <TouchableOpacity onPress={() => openEdit(item)}>
        <Card style={styles.card}>
          <View style={styles.rowTop}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: theme.colors.text }]}>
                {item.company_name}
              </Text>
              <Text
                style={[styles.code, { color: theme.colors.textSecondary }]}
              >
                {item.company_code}
              </Text>
            </View>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: active
                    ? theme.colors.primarySoft
                    : theme.colors.border,
                },
              ]}
            >
              <Text
                style={{
                  color: active
                    ? theme.colors.primary
                    : theme.colors.textSecondary,
                  fontSize: 11,
                  fontWeight: '600',
                }}
              >
                {active ? 'ACTIVE' : 'INACTIVE'}
              </Text>
            </View>
          </View>

          <View style={styles.rowBottom}>
            <View>
              {item.city ? (
                <Text
                  style={[
                    styles.meta,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {item.city}
                </Text>
              ) : null}
              {item.phone || item.mobile ? (
                <Text
                  style={[
                    styles.meta,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {item.phone || item.mobile}
                </Text>
              ) : null}
            </View>

            {role === 'SUPER_ADMIN' && item.company_id && (
              <TouchableOpacity
                onPress={() => toggleActive(item)}
                style={{ paddingHorizontal: 4, paddingVertical: 2 }}
              >
                <Text
                  style={{
                    color: active ? theme.colors.danger : theme.colors.primary,
                    fontSize: 12,
                    fontWeight: '600',
                  }}
                >
                  {active ? 'Deactivate' : 'Activate'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <SectionTitle title="Companies" subtitle="Manage hotels / branches" />

      <View style={styles.topRow}>
        <View
          style={[
            styles.searchWrapper,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name, code, city"
            placeholderTextColor={theme.colors.textSecondary}
            style={[styles.searchInput, { color: theme.colors.text }]}
          />
        </View>
        {role === 'SUPER_ADMIN' && (
          <AppButton
            title="+ New"
            onPress={openCreate}
            size="small"
            style={styles.addButton}
          />
        )}
      </View>

      <Text
        style={[
          styles.countText,
          { color: theme.colors.textSecondary },
        ]}
      >
        {filtered.length} compan{filtered.length === 1 ? 'y' : 'ies'} found
      </Text>

      <FlatList
        data={filtered}
        keyExtractor={(item, index) =>
          item.company_id ? String(item.company_id) : `tmp-${index}`
        }
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  searchWrapper: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  searchInput: {
    fontSize: 14,
    paddingVertical: 4,
  },
  addButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  countText: {
    fontSize: 12,
    marginBottom: 8,
  },
  card: {
    marginVertical: 6,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  name: { fontSize: 16, fontWeight: '600' },
  code: { fontSize: 13, marginTop: 2 },
  meta: { fontSize: 12 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
});

export default CompanyListScreen;
