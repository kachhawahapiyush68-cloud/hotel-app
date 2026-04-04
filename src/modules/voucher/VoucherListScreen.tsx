// src/modules/voucher/VoucherListScreen.tsx

import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { voucherApi } from "./api";
import { Voucher } from "../../api/types";
import Card from "../../shared/components/Card";
import AppButton from "../../shared/components/AppButton";
import Loader from "../../shared/components/Loader";

export default function VoucherListScreen({ navigation }: any) {
  const [items, setItems] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const data = await voucherApi.getAll();
    setItems(data);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await loadData();
      } catch (e: any) {
        Alert.alert("Error", e?.response?.data?.message || "Failed to load vouchers");
      } finally {
        setLoading(false);
      }
    })();
  }, [loadData]);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  const handleDelete = (item: Voucher) => {
    Alert.alert("Delete Voucher", `Delete ${item.voucher_no}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await voucherApi.remove(item.voucher_id!);
            await loadData();
          } catch (e: any) {
            Alert.alert("Error", e?.response?.data?.message || "Delete failed");
          }
        },
      },
    ]);
  };

  if (loading) return <Loader />;

  return (
    <View style={styles.container}>
      <AppButton
        title="Add Voucher"
        onPress={() => navigation.navigate("VoucherEntry")}
      />

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.voucher_id)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Text style={styles.title}>{item.voucher_no}</Text>
            <Text style={styles.sub}>{item.voucher_type}</Text>
            <Text style={styles.sub}>{item.voucher_date}</Text>
            {!!item.narration && <Text style={styles.sub}>{item.narration}</Text>}

            <View style={styles.actions}>
              <AppButton
                title="Delete"
                variant="danger"
                onPress={() => handleDelete(item)}
              />
            </View>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  card: { marginBottom: 12, gap: 6 },
  title: { fontSize: 16, fontWeight: "700" },
  sub: { color: "#666" },
  actions: { flexDirection: "row", gap: 10, marginTop: 8 },
});