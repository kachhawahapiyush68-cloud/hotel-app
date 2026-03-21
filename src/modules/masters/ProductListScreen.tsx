// src/modules/masters/ProductListScreen.tsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  Text,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import SectionTitle from '../../shared/components/SectionTitle';
import Card from '../../shared/components/Card';
import AppButton from '../../shared/components/AppButton';
import Loader from '../../shared/components/Loader';
import { formatCurrency } from '../../shared/utils/number';
import { productApi, Product, ProductPayload } from '../../api/productApi';
import { isSuperAdmin } from '../../shared/utils/role';
import CompanySelector from './components/CompanySelector';
import ProductForm from './components/ProductForm';

const ProductListScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const user = useAuthStore(s => s.user);
  const isFocused = useIsFocused();

  const role = (user?.role || '').toUpperCase();

  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [effectiveCompanyId, setEffectiveCompanyId] = useState<number | undefined>(undefined);

  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  const onCompanyChange = useCallback((companyId: number | undefined) => {
    setEffectiveCompanyId(companyId);
  }, []);

  useEffect(() => {
    if (!isSuperAdmin(user?.role)) {
      setEffectiveCompanyId(user?.companyid);
    }
  }, [user?.role, user?.companyid]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const params: { companyid?: number } = {};
      if (isSuperAdmin(user?.role)) {
        if (!effectiveCompanyId) {
          setData([]);
          return;
        }
        params.companyid = effectiveCompanyId;
      }
      const res = await productApi.list(params);
      setData(res);
    } catch (e: any) {
      Alert.alert(
        'Error',
        e?.response?.data?.message || e?.message || 'Failed to load products',
      );
    } finally {
      setLoading(false);
    }
  }, [effectiveCompanyId, user?.role]);

  useEffect(() => {
    if (isFocused) {
      load();
    }
  }, [isFocused, load]);

  const openCreate = () => {
    setEditing(null);
    setFormVisible(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setFormVisible(true);
  };

  const handleSubmit = async (values: {
    category_id: number;
    product_code?: string | null;
    product_name: string;
    unit: string;
    rate: number;
    tax_group_id?: number | null;
    is_service?: number;
    is_active?: number;
  }) => {
    try {
      setSaving(true);

      const payload: ProductPayload = { ...values };

      if (isSuperAdmin(user?.role)) {
        if (!effectiveCompanyId) {
          Alert.alert('Error', 'Please select a company first');
          return;
        }
        payload.company_id = effectiveCompanyId;
      }

      if (editing) {
        await productApi.update(editing.product_id, payload);
      } else {
        await productApi.create(payload);
      }

      setFormVisible(false);
      setEditing(null);
      await load();
    } catch (e: any) {
      Alert.alert(
        'Error',
        e?.response?.data?.message || e?.message || 'Failed to save product',
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDeactivate = (product: Product) => {
    Alert.alert(
      'Deactivate product',
      `Are you sure you want to deactivate ${product.product_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: () => handleDeactivate(product.product_id),
        },
      ],
    );
  };

  const handleDeactivate = async (id: number) => {
    try {
      await productApi.deactivate(id);
      await load();
    } catch (e: any) {
      Alert.alert(
        'Error',
        e?.response?.data?.message || e?.message || 'Failed to deactivate product',
      );
    }
  };

  const renderItem = ({ item }: { item: Product }) => (
    <Card
      style={styles.card}
      onPress={() => openEdit(item)}
      header={`${item.product_name} • ${item.unit}`}
      subtitle={
        `Rate: ${formatCurrency(item.rate)}\n` +
        `Category #${item.category_id}` +
        (item.is_service ? ' • Service' : '')
      }
      footer={
        <View style={styles.cardFooter}>
          <AppButton
            title="Edit"
            size="small"
            onPress={() => openEdit(item)}
          />
          <AppButton
            title={item.is_active ? 'Deactivate' : 'Inactive'}
            size="small"
            variant="outline"
            onPress={() => confirmDeactivate(item)}
          />
        </View>
      }
    />
  );

  if (loading && !formVisible && data.length === 0) {
    return <Loader />;
  }

  if (formVisible) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <SectionTitle title={editing ? 'Edit Product' : 'New Product'} />
        <ProductForm
          initial={editing || undefined}
          submitting={saving}
          onSubmit={handleSubmit}
        />
        <AppButton
          title="Close"
          variant="outline"
          onPress={() => {
            setFormVisible(false);
            setEditing(null);
          }}
          style={{ margin: 16 }}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <SectionTitle title="Products" />
      <CompanySelector onChange={onCompanyChange} />

      {isSuperAdmin(user?.role) && !effectiveCompanyId ? (
        <Text style={{ color: theme.colors.textSecondary, marginBottom: 8 }}>
          Please select a company to view products.
        </Text>
      ) : null}

      <AppButton
        title="Add Product"
        onPress={openCreate}
        style={{ marginBottom: 8 }}
      />

      <FlatList
        data={data}
        keyExtractor={item => String(item.product_id)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { marginBottom: 10 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    columnGap: 8,
  },
});

export default ProductListScreen;
