import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text } from "react-native";
import { ledgerApi } from "./api";
import { LedgerSummaryResponse } from "../../api/types";
import Loader from "../../shared/components/Loader";
import Card from "../../shared/components/Card";
import AppInput from "../../shared/components/AppInput";
import AppButton from "../../shared/components/AppButton";

type Props = {
  route: { params?: { ledgerId?: number } };
  navigation: any;
};

export default function LedgerStatementScreen({
  route,
  navigation,
}: Props) {
  const ledgerId = Number(route?.params?.ledgerId);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [data, setData] = useState<LedgerSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  const loadData = async () => {
    const res = await ledgerApi.getSummary(ledgerId);
    setData(res);
  };

  useEffect(() => {
    (async () => {
      try {
        if (!ledgerId || ledgerId <= 0) {
          Alert.alert("Error", "Invalid ledger id");
          navigation.goBack?.();
          return;
        }
        await loadData();
      } catch (e: any) {
        Alert.alert(
          "Error",
          e?.response?.data?.message || "Failed to load summary"
        );
        navigation.goBack?.();
      } finally {
        setLoading(false);
      }
    })();
  }, [ledgerId]);

  const handleFilter = async () => {
    // Backend summary has no from/to filter; just reload summary.
    try {
      setSearching(true);
      await loadData();
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.response?.data?.message || "Failed to load summary"
      );
    } finally {
      setSearching(false);
    }
  };

  if (loading) return <Loader />;
  if (!data) return null;

  const totalDr = Number(data.total_debit || 0);
  const totalCr = Number(data.total_credit || 0);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Ledger Summary</Text>

      <Card style={styles.card}>
        <Text style={styles.title}>{data.ledger_name}</Text>
        <Text style={styles.sub}>Type: {data.ledger_type}</Text>
        <Text style={styles.sub}>
          Opening: {data.dr_cr_flag}{" "}
          {Number(data.opening_balance || 0).toFixed(2)}
        </Text>
        <Text style={styles.sub}>
          Closing: {data.closing_flag}{" "}
          {Number(data.closing_balance || 0).toFixed(2)}
        </Text>
      </Card>

      <Text style={styles.section}>Filter (UI only)</Text>

      <AppInput
        label="From Date"
        placeholder="YYYY-MM-DD"
        value={fromDate}
        onChangeText={setFromDate}
      />
      <AppInput
        label="To Date"
        placeholder="YYYY-MM-DD"
        value={toDate}
        onChangeText={setToDate}
      />
      <AppButton
        title={searching ? "Loading..." : "Reload Summary"}
        onPress={handleFilter}
        disabled={searching}
      />

      <Card style={styles.totalCard}>
        <Text style={styles.totalText}>
          Total Dr: {totalDr.toFixed(2)}
        </Text>
        <Text style={styles.totalText}>
          Total Cr: {totalCr.toFixed(2)}
        </Text>
      </Card>
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