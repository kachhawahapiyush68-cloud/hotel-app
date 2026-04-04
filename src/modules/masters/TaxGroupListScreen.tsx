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
import AppButton from "../../shared/components/AppButton";
import Card from "../../shared/components/Card";
import Loader from "../../shared/components/Loader";
import AppInput from "../../shared/components/AppInput";
import { httpClient } from "../../api/httpClient";

export interface TaxGroup {
  tax_group_id?: number;
  company_id: number;
  tax_group_name: string;
  cgst_rate: number;
  sgst_rate: number;
  igst_rate: number;
  service_charge_rate: number;
  is_active?: number;
  is_deleted?: number;
  created_at?: string;
  updated_at?: string;
}

interface CreateTaxGroupPayload {
  company_id?: number;
  tax_group_name: string;
  cgst_rate?: number;
  sgst_rate?: number;
  igst_rate?: number;
  service_charge_rate?: number;
  is_active?: number;
}

const TaxGroupListScreen: React.FC = () => {
  const [items, setItems] = useState<TaxGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const [name, setName] = useState("");
  const [cgst, setCgst] = useState("0");
  const [sgst, setSgst] = useState("0");
  const [igst, setIgst] = useState("0");
  const [serviceCharge, setServiceCharge] = useState("0");

  const loadData = useCallback(async () => {
    const res = await httpClient.get<TaxGroup[]>("/tax-groups");
    setItems(res.data);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await loadData();
      } catch (e: any) {
        Alert.alert(
          "Error",
          e?.response?.data?.message || "Failed to load tax groups"
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

  const resetForm = () => {
    setName("");
    setCgst("0");
    setSgst("0");
    setIgst("0");
    setServiceCharge("0");
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert("Validation", "Tax group name is required");
      return;
    }

    const payload: CreateTaxGroupPayload = {
      company_id: 1, // or from auth store
      tax_group_name: name.trim(),
      cgst_rate: Number(cgst || 0),
      sgst_rate: Number(sgst || 0),
      igst_rate: Number(igst || 0),
      service_charge_rate: Number(serviceCharge || 0),
      is_active: 1,
    };

    try {
      setSaving(true);
      await httpClient.post("/tax-groups", payload);
      await loadData();
      resetForm();
      setModalVisible(false);
      Alert.alert("Success", "Tax group created");
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.response?.data?.message || "Failed to create tax group"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item: TaxGroup) => {
    Alert.alert("Delete Tax Group", `Delete ${item.tax_group_name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await httpClient.delete(`/tax-groups/${item.tax_group_id}`);
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
      <AppButton title="Add Tax Group" onPress={() => setModalVisible(true)} />

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.tax_group_id)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Text style={styles.title}>{item.tax_group_name}</Text>
            <Text style={styles.sub}>
              CGST: {item.cgst_rate}% | SGST: {item.sgst_rate}% | IGST:{" "}
              {item.igst_rate}%
            </Text>
            <Text style={styles.sub}>
              Service Charge: {item.service_charge_rate}%
            </Text>
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

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modal}>
          <Text style={styles.header}>Create Tax Group</Text>

          <AppInput label="Name" value={name} onChangeText={setName} />

          <AppInput
            label="CGST %"
            keyboardType="numeric"
            value={cgst}
            onChangeText={setCgst}
          />

          <AppInput
            label="SGST %"
            keyboardType="numeric"
            value={sgst}
            onChangeText={setSgst}
          />

          <AppInput
            label="IGST %"
            keyboardType="numeric"
            value={igst}
            onChangeText={setIgst}
          />

          <AppInput
            label="Service Charge %"
            keyboardType="numeric"
            value={serviceCharge}
            onChangeText={setServiceCharge}
          />

          <AppButton
            title={saving ? "Saving..." : "Save"}
            onPress={handleCreate}
          />
          <AppButton
            title="Close"
            variant="secondary"
            onPress={() => setModalVisible(false)}
          />
        </View>
      </Modal>
    </View>
  );
};

export default TaxGroupListScreen;