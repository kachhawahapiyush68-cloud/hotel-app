import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text } from "react-native";
import { voucherApi } from "./api";
import { Voucher, VoucherDetail } from "../../api/types";
import Loader from "../../shared/components/Loader";
import Card from "../../shared/components/Card";
import AppButton from "../../shared/components/AppButton";

type Props = {
  route: { params?: { voucherId?: number } };
  navigation: any;
};

export default function VoucherDetailScreen({ route, navigation }: Props) {
  const voucherId = Number(route?.params?.voucherId);
  const [data, setData] = useState<Voucher | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const res = await voucherApi.getById(voucherId);
    setData(res);
  };

  useEffect(() => {
    (async () => {
      try {
        if (!voucherId || voucherId <= 0) {
          Alert.alert("Error", "Invalid voucher id");
          navigation.goBack?.();
          return;
        }
        await loadData();
      } catch (e: any) {
        Alert.alert(
          "Error",
          e?.response?.data?.message || "Failed to load voucher"
        );
        navigation.goBack?.();
      } finally {
        setLoading(false);
      }
    })();
  }, [voucherId]);

  const handleDelete = async () => {
    if (!data?.voucher_id) return;

    Alert.alert("Delete Voucher", `Delete ${data.voucher_no}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await voucherApi.remove(data.voucher_id!);
            Alert.alert("Success", "Voucher deleted", [
              { text: "OK", onPress: () => navigation.goBack?.() },
            ]);
          } catch (e: any) {
            Alert.alert(
              "Error",
              e?.response?.data?.message || "Failed to delete voucher"
            );
          }
        },
      },
    ]);
  };

  if (loading) return <Loader />;
  if (!data) return null;

  const details: VoucherDetail[] = Array.isArray(data.details)
    ? data.details
    : [];

  const totalDr = details.reduce(
    (sum, x) => sum + Number(x.dr_amount || 0),
    0
  );
  const totalCr = details.reduce(
    (sum, x) => sum + Number(x.cr_amount || 0),
    0
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Voucher Detail</Text>

      <Card style={styles.card}>
        <Text style={styles.title}>{data.voucher_no}</Text>
        <Text style={styles.sub}>Type: {data.voucher_type}</Text>
        <Text style={styles.sub}>Date: {data.voucher_date}</Text>
        {!!data.reference_no && (
          <Text style={styles.sub}>Ref: {data.reference_no}</Text>
        )}
        {!!data.narration && (
          <Text style={styles.sub}>Narration: {data.narration}</Text>
        )}
      </Card>

      <Text style={styles.section}>Entries</Text>

      {details.map((line, index) => (
        <Card
          key={line.voucher_detail_id ?? index}
          style={styles.card}
        >
          <Text style={styles.lineTitle}>
            {line.ledger_name || `Ledger #${line.ledger_id}`}
          </Text>
          <Text style={styles.sub}>Type: {line.ledger_type || "-"}</Text>
          <Text style={styles.sub}>
            Dr: {Number(line.dr_amount || 0).toFixed(2)}
          </Text>
          <Text style={styles.sub}>
            Cr: {Number(line.cr_amount || 0).toFixed(2)}
          </Text>
        </Card>
      ))}

      <Card style={styles.totalCard}>
        <Text style={styles.totalText}>
          Total Dr: {totalDr.toFixed(2)}
        </Text>
        <Text style={styles.totalText}>
          Total Cr: {totalCr.toFixed(2)}
        </Text>
      </Card>

      <AppButton
        title="Delete Voucher"
        variant="danger"
        onPress={handleDelete}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
  },
  section: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 4,
  },
  card: {
    gap: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  lineTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  sub: {
    color: "#666",
  },
  totalCard: {
    gap: 4,
    backgroundColor: "#f3f3f3",
  },
  totalText: {
    fontSize: 15,
    fontWeight: "600",
  },
});