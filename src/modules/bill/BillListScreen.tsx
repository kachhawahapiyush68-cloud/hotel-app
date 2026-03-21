// src/modules/bill/BillListScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { fetchBills, Bill } from '../../api/billApi';
import { API_BASE_URL } from '../../config/env';

export default function BillListScreen() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchBills();
        setBills(data);
      } catch (err: any) {
        console.log('BILLS ERROR:', err?.response?.status, err?.response?.data);
        setError('Unable to load bills');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1D4ED8" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <Text style={styles.small}>API: {API_BASE_URL}/bills</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={bills}
        keyExtractor={(item) => String(item.bill_id)}
        renderItem={({ item }) => {
          const amount =
            typeof item.amount === 'number' ? item.amount : 0;

          return (
            <View style={styles.row}>
              <View>
                <Text style={styles.billNo}>Bill #{item.bill_no}</Text>
                {!!item.status && (
                  <Text style={styles.status}>{item.status}</Text>
                )}
              </View>
              <Text style={styles.amount}>{amount.toFixed(2)}</Text>
            </View>
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text>No bills found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { color: '#DC2626', marginBottom: 4 },
  small: { fontSize: 10, color: '#6B7280' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  billNo: { fontSize: 16, fontWeight: '600', color: '#111827' },
  status: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  amount: { fontSize: 16, fontWeight: '700', color: '#1D4ED8' },
});
