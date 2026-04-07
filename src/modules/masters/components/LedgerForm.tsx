import React, { useMemo, useState } from "react";
import { Alert, StyleSheet, Switch, Text, View } from "react-native";
import AppInput from "../../../shared/components/AppInput";
import AppButton from "../../../shared/components/AppButton";
import SelectModal from "../../../shared/components/SelectModal";
import {
  CreateLedgerPayload,
  Ledger,
} from "../../../api/types";

type Props = {
  initialValues?: Ledger;
  loading?: boolean;
  onSubmit: (payload: CreateLedgerPayload) => Promise<void>;
};

const LEDGER_TYPES = [
  "ASSET",
  "LIABILITY",
  "INCOME",
  "EXPENSE",
  "BANK",
  "CASH",
  "PARTY",
];

export default function LedgerForm({
  initialValues,
  loading,
  onSubmit,
}: Props) {
  const [ledgerName, setLedgerName] = useState(
    initialValues?.ledger_name ?? ""
  );
  const [ledgerType, setLedgerType] = useState(
    initialValues?.ledger_type ?? "CASH"
  );
  const [openingBalance, setOpeningBalance] = useState(
    String(initialValues?.opening_balance ?? 0)
  );
  const [drCrFlag, setDrCrFlag] = useState<"Dr" | "Cr">(
    initialValues?.dr_cr_flag ?? "Dr"
  );
  const [isActive, setIsActive] = useState(
    (initialValues?.is_active ?? 1) === 1
  );
  const [typeModalOpen, setTypeModalOpen] = useState(false);

  const canSubmit = useMemo(
    () => ledgerName.trim().length > 0,
    [ledgerName]
  );

  const handleSubmit = async () => {
    if (!ledgerName.trim()) {
      Alert.alert("Validation", "Ledger name is required");
      return;
    }

    const ob = Number(openingBalance || 0);
    if (Number.isNaN(ob) || ob < 0) {
      Alert.alert(
        "Validation",
        "Opening balance must be a number ≥ 0"
      );
      return;
    }

    await onSubmit({
      ledger_name: ledgerName.trim(),
      ledger_type: ledgerType,
      opening_balance: ob,
      dr_cr_flag: drCrFlag,
      is_system_ledger: initialValues?.is_system_ledger ?? 0,
      is_active: isActive ? 1 : 0,
    });
  };

  return (
    <View style={styles.container}>
      <AppInput
        label="Ledger Name"
        value={ledgerName}
        onChangeText={setLedgerName}
      />

      <Text style={styles.label}>Ledger Type</Text>
      <AppButton
        title={ledgerType}
        onPress={() => setTypeModalOpen(true)}
        variant="secondary"
      />

      <AppInput
        label="Opening Balance"
        keyboardType="numeric"
        value={openingBalance}
        onChangeText={setOpeningBalance}
      />

      <Text style={styles.label}>Dr / Cr</Text>
      <View style={styles.row}>
        <AppButton
          title="Dr"
          variant={drCrFlag === "Dr" ? "primary" : "secondary"}
          onPress={() => setDrCrFlag("Dr")}
        />
        <AppButton
          title="Cr"
          variant={drCrFlag === "Cr" ? "primary" : "secondary"}
          onPress={() => setDrCrFlag("Cr")}
        />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.label}>Active</Text>
        <Switch value={isActive} onValueChange={setIsActive} />
      </View>

      <AppButton
        title={loading ? "Saving..." : "Save Ledger"}
        onPress={handleSubmit}
        disabled={!canSubmit || !!loading}
      />

      <SelectModal
        visible={typeModalOpen}
        title="Select Ledger Type"
        options={LEDGER_TYPES.map((t) => ({ label: t, value: t }))}
        selectedValue={ledgerType}
        onClose={() => setTypeModalOpen(false)}
        onSelect={(value) => {
          setLedgerType(String(value));
          setTypeModalOpen(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});