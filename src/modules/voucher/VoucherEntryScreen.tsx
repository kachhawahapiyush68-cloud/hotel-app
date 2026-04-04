// src/modules/voucher/VoucherEntryScreen.tsx

import React, { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import AppInput from "../../shared/components/AppInput";
import AppButton from "../../shared/components/AppButton";
import SelectModal from "../../shared/components/SelectModal";
import { ledgerApi } from "../masters/api";
import { voucherApi } from "./api";
import {
  CreateVoucherPayload,
  Ledger,
  VoucherType,
} from "../../api/types";

type EntryLine = {
  ledger_id: number | null;
  ledger_name?: string;
  dr_amount: string;
  cr_amount: string;
};

const VOUCHER_TYPES: VoucherType[] = [
  "Receipt",
  "Payment",
  "Journal",
  "Contra",
  "Sales",
  "Purchase",
];

export default function VoucherEntryScreen({ navigation }: any) {
  const [voucherDate, setVoucherDate] = useState("2026-04-04");
  const [voucherType, setVoucherType] = useState<VoucherType>("Receipt");
  const [narration, setNarration] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [lines, setLines] = useState<EntryLine[]>([
    { ledger_id: null, dr_amount: "0", cr_amount: "0" },
    { ledger_id: null, dr_amount: "0", cr_amount: "0" },
  ]);
  const [saving, setSaving] = useState(false);

  const [ledgerPickerIndex, setLedgerPickerIndex] = useState<number | null>(null);
  const [voucherTypeModal, setVoucherTypeModal] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await ledgerApi.getAll();
        setLedgers(
          data.filter((x) => (x.is_deleted ?? 0) === 0 && x.is_active === 1)
        );
      } catch (e: any) {
        Alert.alert("Error", e?.response?.data?.message || "Failed to load ledgers");
      }
    })();
  }, []);

  const totalDr = useMemo(
    () => lines.reduce((sum, x) => sum + Number(x.dr_amount || 0), 0),
    [lines]
  );
  const totalCr = useMemo(
    () => lines.reduce((sum, x) => sum + Number(x.cr_amount || 0), 0),
    [lines]
  );

  const updateLine = (index: number, patch: Partial<EntryLine>) => {
    setLines((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const addLine = () => {
    setLines((prev) => [
      ...prev,
      { ledger_id: null, dr_amount: "0", cr_amount: "0" },
    ]);
  };

  const removeLine = (index: number) => {
    if (lines.length <= 2) {
      Alert.alert("Validation", "At least two lines are required");
      return;
    }
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    if (!voucherDate) {
      Alert.alert("Validation", "Voucher date is required");
      return false;
    }

    for (const line of lines) {
      if (!line.ledger_id) {
        Alert.alert("Validation", "Please select ledger in all lines");
        return false;
      }
      const dr = Number(line.dr_amount || 0);
      const cr = Number(line.cr_amount || 0);

      if (dr === 0 && cr === 0) {
        Alert.alert("Validation", "Each line must have Dr or Cr amount");
        return false;
      }
      if (dr > 0 && cr > 0) {
        Alert.alert("Validation", "A line cannot have both Dr and Cr");
        return false;
      }
      if (dr < 0 || cr < 0) {
        Alert.alert("Validation", "Amounts cannot be negative");
        return false;
      }
    }

    if (totalDr !== totalCr) {
      Alert.alert("Validation", "Total Dr must equal Total Cr");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const payload: CreateVoucherPayload = {
      company_id: 1, // or derive from auth store
      voucher_date: voucherDate,
      voucher_type: voucherType,
      narration,
      reference_no: referenceNo,
      details: lines.map((line) => ({
        ledger_id: Number(line.ledger_id),
        dr_amount: Number(line.dr_amount || 0),
        cr_amount: Number(line.cr_amount || 0),
      })),
    };

    try {
      setSaving(true);
      const res = await voucherApi.create(payload);
      Alert.alert("Success", `Voucher created: ${res.voucher.voucher_no}`);
      navigation.goBack?.();
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || "Failed to create voucher");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Voucher Entry</Text>

      <AppInput
        label="Voucher Date"
        value={voucherDate}
        onChangeText={setVoucherDate}
      />

      <Text style={styles.label}>Voucher Type</Text>
      <AppButton
        title={voucherType}
        onPress={() => setVoucherTypeModal(true)}
        variant="secondary"
      />

      <AppInput
        label="Narration"
        value={narration}
        onChangeText={setNarration}
      />
      <AppInput
        label="Reference No"
        value={referenceNo}
        onChangeText={setReferenceNo}
      />

      <Text style={styles.section}>Entries</Text>

      {lines.map((line, index) => (
        <View key={index} style={styles.lineCard}>
          <Text style={styles.lineTitle}>Line {index + 1}</Text>

          <AppButton
            title={line.ledger_name || "Select Ledger"}
            variant="secondary"
            onPress={() => setLedgerPickerIndex(index)}
          />

          <AppInput
            label="Dr Amount"
            keyboardType="numeric"
            value={line.dr_amount}
            onChangeText={(v) => updateLine(index, { dr_amount: v })}
          />

          <AppInput
            label="Cr Amount"
            keyboardType="numeric"
            value={line.cr_amount}
            onChangeText={(v) => updateLine(index, { cr_amount: v })}
          />

          <AppButton
            title="Remove Line"
            variant="danger"
            onPress={() => removeLine(index)}
          />
        </View>
      ))}

      <AppButton title="Add Line" variant="secondary" onPress={addLine} />

      <View style={styles.totalBox}>
        <Text>Total Dr: {totalDr.toFixed(2)}</Text>
        <Text>Total Cr: {totalCr.toFixed(2)}</Text>
      </View>

      <AppButton
        title={saving ? "Saving..." : "Save Voucher"}
        onPress={handleSubmit}
        disabled={saving}
      />

      <SelectModal
        visible={voucherTypeModal}
        title="Select Voucher Type"
        options={VOUCHER_TYPES.map((t) => ({ label: t, value: t }))}
        selectedValue={voucherType}
        onClose={() => setVoucherTypeModal(false)}
        onSelect={(value) => {
          setVoucherType(value as VoucherType);
          setVoucherTypeModal(false);
        }}
      />

      <SelectModal
        visible={ledgerPickerIndex !== null}
        title="Select Ledger"
        options={ledgers.map((l) => ({
          label: `${l.ledger_name} (${l.ledger_type})`,
          value: l.ledger_id!,
        }))}
        selectedValue={
          ledgerPickerIndex !== null
            ? lines[ledgerPickerIndex].ledger_id ?? undefined
            : undefined
        }
        onClose={() => setLedgerPickerIndex(null)}
        onSelect={(value) => {
          if (ledgerPickerIndex === null) return;
          const led = ledgers.find((l) => l.ledger_id === value);
          updateLine(ledgerPickerIndex, {
            ledger_id: value,
            ledger_name: led?.ledger_name,
          });
          setLedgerPickerIndex(null);
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  header: { fontSize: 22, fontWeight: "700" },
  label: { fontSize: 14, fontWeight: "600" },
  section: { fontSize: 18, fontWeight: "700", marginTop: 8 },
  lineCard: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    gap: 8,
  },
  lineTitle: { fontSize: 16, fontWeight: "700" },
  totalBox: {
    padding: 12,
    backgroundColor: "#f3f3f3",
    borderRadius: 10,
    gap: 4,
  },
});