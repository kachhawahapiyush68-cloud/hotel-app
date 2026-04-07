import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ledgerApi } from "./api";
import { Ledger, CreateLedgerPayload } from "../../api/types";
import Card from "../../shared/components/Card";
import AppButton from "../../shared/components/AppButton";
import Loader from "../../shared/components/Loader";
import LedgerForm from "./components/LedgerForm";

type Props = {
  navigation: any;
};

export default function LedgerListScreen({ navigation }: Props) {
  const [items, setItems] = useState<Ledger[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const loadData = useCallback(async () => {
    const data = await ledgerApi.getAll();
    setItems(data);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await loadData();
      } catch (e: any) {
        Alert.alert(
          "Error",
          e?.response?.data?.message || "Failed to load ledgers"
        );
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

  const handleCreate = async (payload: CreateLedgerPayload) => {
    try {
      setSaving(true);
      await ledgerApi.create({
        ...payload,
      });
      setModalVisible(false);
      await loadData();
      Alert.alert("Success", "Ledger created successfully");
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.response?.data?.message || "Failed to save ledger"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item: Ledger) => {
    Alert.alert("Delete Ledger", `Delete ${item.ledger_name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await ledgerApi.remove(item.ledger_id!);
            await loadData();
          } catch (e: any) {
            Alert.alert(
              "Error",
              e?.response?.data?.message || "Delete failed"
            );
          }
        },
      },
    ]);
  };

  if (loading) return <Loader />;

  return (
    <View style={styles.container}>
      <AppButton title="Add Ledger" onPress={() => setModalVisible(true)} />

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.ledger_id)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.ledger_name}</Text>
                <Text style={styles.sub}>
                  {item.ledger_type} | {item.dr_cr_flag} | OB:{" "}
                  {Number(item.opening_balance || 0).toFixed(2)}
                </Text>
              </View>
            </View>

            <View style={styles.actions}>
              <AppButton
                title="Statement"
                variant="secondary"
                onPress={() =>
                  navigation.navigate("LedgerStatement", {
                    ledgerId: item.ledger_id,
                  })
                }
              />
              <AppButton
                title="Delete"
                variant="danger"
                onPress={() => handleDelete(item)}
              />
            </View>
          </Card>
        )}
      />

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modal}>
          <Text style={styles.header}>Create Ledger</Text>
          <LedgerForm onSubmit={handleCreate} loading={saving} />
          <AppButton
            title="Close"
            variant="secondary"
            onPress={() => setModalVisible(false)}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  card: { marginBottom: 12, gap: 10 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  title: { fontSize: 16, fontWeight: "700" },
  sub: { marginTop: 4, color: "#666" },
  modal: { flex: 1, padding: 16, gap: 12 },
  header: { fontSize: 20, fontWeight: "700" },
});