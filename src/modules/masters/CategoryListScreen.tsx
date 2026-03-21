// src/modules/masters/CategoryListScreen.tsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { categoryApi, Category } from '../../api/categoryApi';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import Loader from '../../shared/components/Loader';
import Card from '../../shared/components/Card';
import AppButton from '../../shared/components/AppButton';
import SectionTitle from '../../shared/components/SectionTitle';
import CategoryForm from './components/CategoryForm';
import CompanySelector from './components/CompanySelector';

const CategoryListScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const isFocused = useIsFocused();
  const user = useAuthStore(s => s.user);

  const role = (user?.role || '').toUpperCase();

  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [effectiveCompanyId, setEffectiveCompanyId] = useState<
    number | undefined
  >(undefined);

  const onCompanyChange = useCallback((companyId: number | undefined) => {
    setEffectiveCompanyId(companyId);
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const params: { companyid?: number } = {};

      if (role === 'SUPER_ADMIN') {
        if (!effectiveCompanyId) {
          setData([]);
          return;
        }
        params.companyid = effectiveCompanyId;
      }
      // non-super-admin: backend uses req.user.companyid

      const res = await categoryApi.list(params);
      setData(res);
    } catch (e: any) {
      Alert.alert(
        'Error',
        e?.response?.data?.message || e?.message || 'Failed to load categories',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role !== 'SUPER_ADMIN') {
      setEffectiveCompanyId(user?.companyid);
    }
  }, [role, user?.companyid]);

  useEffect(() => {
    if (isFocused) {
      load();
    }
  }, [isFocused, effectiveCompanyId]);

  const openCreate = () => {
    setEditing(null);
    setModalVisible(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setModalVisible(true);
  };

  const handleDelete = (cat: Category) => {
    Alert.alert('Confirm', `Delete ${cat.category_name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await categoryApi.remove(cat.category_id);
            setData(prev =>
              prev.filter(c => c.category_id !== cat.category_id),
            );
          } catch (e: any) {
            Alert.alert(
              'Error',
              e?.response?.data?.message ||
                e?.message ||
                'Failed to delete',
            );
          }
        },
      },
    ]);
  };

  const handleSubmit = async (values: {
    category_type: string;
    category_name: string;
    description?: string;
  }) => {
    try {
      setSubmitting(true);

      const payload: any = { ...values };

      if (role === 'SUPER_ADMIN') {
        if (!effectiveCompanyId) {
          Alert.alert('Error', 'Please select a company first');
          return;
        }
        payload.company_id = effectiveCompanyId;
      }

      if (editing) {
        const updated = await categoryApi.update(editing.category_id, payload);
        setData(prev =>
          prev.map(c => (c.category_id === updated.category_id ? updated : c)),
        );
      } else {
        const created = await categoryApi.create(payload);
        setData(prev => [created, ...prev]);
      }

      setModalVisible(false);
      setEditing(null);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        'Failed to save category';
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const renderItem = ({ item }: { item: Category }) => (
    <Card>
      <TouchableOpacity onPress={() => openEdit(item)}>
        <View style={styles.rowHeader}>
          <Text style={[styles.name, { color: theme.colors.text }]}>
            {item.category_name}
          </Text>
          <Text style={[styles.type, { color: theme.colors.textSecondary }]}>
            {item.category_type}
          </Text>
        </View>
        {item.description ? (
          <Text
            style={{ color: theme.colors.textSecondary, marginTop: 4 }}
          >
            {item.description}
          </Text>
        ) : null}
      </TouchableOpacity>
      <View style={styles.rowActions}>
        <TouchableOpacity onPress={() => openEdit(item)}>
          <Text
            style={{ color: theme.colors.primary, marginRight: 16 }}
          >
            Edit
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item)}>
          <Text style={{ color: theme.colors.danger }}>Delete</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  if (loading) {
    return <Loader />;
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <SectionTitle title="Categories" />
      <CompanySelector onChange={onCompanyChange} />

      <AppButton
        title="Add Category"
        onPress={openCreate}
        style={{ marginBottom: 8 }}
      />

      {role === 'SUPER_ADMIN' && !effectiveCompanyId ? (
        <Text style={{ color: theme.colors.textSecondary }}>
          Please select a company to view categories.
        </Text>
      ) : (
        <FlatList
          data={data}
          keyExtractor={item => String(item.category_id)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <SectionTitle
            title={editing ? 'Edit Category' : 'New Category'}
          />
          <CategoryForm
            initial={editing || undefined}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
          <AppButton
            title="Close"
            onPress={() => {
              setModalVisible(false);
              setEditing(null);
            }}
            style={{ marginTop: 12 }}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: { fontSize: 16, fontWeight: '600' },
  type: { fontSize: 13 },
  rowActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    padding: 16,
  },
});

export default CategoryListScreen;
