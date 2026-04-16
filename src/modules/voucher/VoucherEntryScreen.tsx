// ============================================================
// src/modules/voucher/VoucherEntryScreen.tsx
// ============================================================

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  Voucher,
  Ledger,
  VoucherType,
  CreateVoucherPayload,
} from "../../api/types";
import {
  fetchVoucherById,
  fetchNextVoucherNo,
  fetchLedgerList,
  createVoucher,
  updateVoucher,
  deleteVoucher,
} from "./api";
import Loader from "../../shared/components/Loader";
import SectionTitle from "../../shared/components/SectionTitle";
import AppButton from "../../shared/components/AppButton";
import AppInput from "../../shared/components/AppInput";
import SelectModal, { SelectItem } from "../../shared/components/SelectModal";
import { formatNumber } from "../../shared/utils/number";
import { useThemeStore } from "../../store/themeStore";
import { RootStackParamList } from "../../navigation/RootNavigator";

type RouteProps = RouteProp<RootStackParamList, "VoucherEntry">;

const VOUCHER_TYPE_OPTIONS: SelectItem[] = [
  { label: "Receipt — Money IN", value: "Receipt" },
  { label: "Payment — Money OUT", value: "Payment" },
  { label: "Journal — Adjustment", value: "Journal" },
];

const TYPE_COLOR: Record<VoucherType, string> = {
  Receipt: "#1E9E5A",
  Payment: "#D64545",
  Journal: "#2563EB",
};

interface DetailRow {
  id: string;
  ledger_id: number | null;
  ledger_name: string;
  dr_amount: string;
  cr_amount: string;
}

function emptyRow(): DetailRow {
  return {
    id: String(Date.now() + Math.random()),
    ledger_id: null,
    ledger_name: "",
    dr_amount: "",
    cr_amount: "",
  };
}

function todayIST(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

const VoucherEntryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProps>();
  const { theme } = useThemeStore();
  const colors = theme.colors;

  const voucherId = route.params?.voucherId;
  const isEdit = !!voucherId;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [voucherNo, setVoucherNo] = useState("");
  const [voucherType, setVoucherType] = useState<VoucherType>("Receipt");
  const [voucherDate, setVoucherDate] = useState(todayIST());
  const [narration, setNarration] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [details, setDetails] = useState<DetailRow[]>([emptyRow(), emptyRow()]);

  const [voucher, setVoucher] = useState<Voucher | null>(null);

  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [ledgerItems, setLedgerItems] = useState<SelectItem[]>([]);

  const [typeModal, setTypeModal] = useState(false);
  const [showDatePick, setShowDate] = useState(false);
  const [ledgerPickRow, setLedgerPickRow] = useState<string | null>(null);

  const isAutoVoucher =
    (voucher?.reference_no ?? "").startsWith("BILL:") ||
    (voucher?.reference_no ?? "").startsWith("REFUND:");

  const loadLedgers = useCallback(async () => {
    try {
      const res = await fetchLedgerList();
      setLedgers(res);
      setLedgerItems(
        res.map((l) => ({
          label: `${l.ledger_name} (${l.ledger_type})`,
          value: l.ledger_id,
        }))
      );
    } catch {
      Alert.alert("Error", "Failed to load ledgers");
    }
  }, []);

  const loadVoucher = useCallback(async () => {
    if (!voucherId) return;
    try {
      setLoading(true);
      const res = await fetchVoucherById(voucherId);
      const v = res.voucher;
      const dts = res.details ?? [];

      setVoucher(v);
      setVoucherNo(v.voucher_no);
      setVoucherType(v.voucher_type as VoucherType);
      setVoucherDate(v.voucher_date.slice(0, 10));
      setNarration(v.narration ?? "");
      setReferenceNo(v.reference_no ?? "");

      if (dts.length > 0) {
        setDetails(
          dts.map((d) => ({
            id: String(d.voucher_detail_id ?? Math.random()),
            ledger_id: d.ledger_id,
            ledger_name: d.ledger_name ?? `Ledger #${d.ledger_id}`,
            dr_amount: d.dr_amount ? String(d.dr_amount) : "",
            cr_amount: d.cr_amount ? String(d.cr_amount) : "",
          }))
        );
      }
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.response?.data?.message || e?.message || "Failed to load voucher"
      );
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [voucherId, navigation]);

  const fetchNextNo = useCallback(async (type: VoucherType, date: string) => {
    try {
      const res = await fetchNextVoucherNo({ voucher_type: type, voucher_date: date });
      setVoucherNo(res.voucher_no);
    } catch {
      setVoucherNo("");
    }
  }, []);

  useEffect(() => {
    loadLedgers();
    if (isEdit) {
      loadVoucher();
    } else {
      fetchNextNo(voucherType, voucherDate);
    }
  }, []);

  useEffect(() => {
    if (!isEdit) {
      fetchNextNo(voucherType, voucherDate);
    }
  }, [voucherType, voucherDate, isEdit, fetchNextNo]);

  const addRow = () => setDetails((prev) => [...prev, emptyRow()]);

  const removeRow = (id: string) => {
    if (details.length <= 2) {
      Alert.alert("Info", "A voucher must have at least 2 detail rows.");
      return;
    }
    setDetails((prev) => prev.filter((r) => r.id !== id));
  };

  const updateRow = (
    id: string,
    field: keyof Omit<DetailRow, "id">,
    value: string | number | null
  ) => {
    setDetails((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const onSelectLedger = (item: SelectItem) => {
    if (!ledgerPickRow) return;
    const ledger = ledgers.find((l) => l.ledger_id === item.value);
    updateRow(ledgerPickRow, "ledger_id", Number(item.value));
    updateRow(ledgerPickRow, "ledger_name", ledger?.ledger_name ?? String(item.value));
    setLedgerPickRow(null);
  };

  const parsedRows = useMemo(
    () =>
      details.map((r) => ({
        ...r,
        dr: parseFloat(r.dr_amount) || 0,
        cr: parseFloat(r.cr_amount) || 0,
      })),
    [details]
  );

  const totalDr = parsedRows.reduce((s, r) => s + r.dr, 0);
  const totalCr = parsedRows.reduce((s, r) => s + r.cr, 0);
  const isBalanced = Math.abs(totalDr - totalCr) < 0.01;

  const validate = (): boolean => {
    if (!voucherDate) {
      Alert.alert("Validation", "Voucher date is required.");
      return false;
    }

    if (details.length < 2) {
      Alert.alert("Validation", "At least 2 detail rows are required.");
      return false;
    }

    let hasDebit = false;
    let hasCredit = false;

    for (let i = 0; i < parsedRows.length; i++) {
      const row = parsedRows[i];

      if (!row.ledger_id) {
        Alert.alert("Validation", `Row ${i + 1}: Please select a ledger.`);
        return false;
      }

      if (row.dr < 0 || row.cr < 0) {
        Alert.alert("Validation", `Row ${i + 1}: Amounts cannot be negative.`);
        return false;
      }

      if (row.dr > 0 && row.cr > 0) {
        Alert.alert("Validation", `Row ${i + 1}: Enter either Dr or Cr, not both.`);
        return false;
      }

      if (row.dr === 0 && row.cr === 0) {
        Alert.alert("Validation", `Row ${i + 1}: Enter Dr or Cr amount.`);
        return false;
      }

      if (row.dr > 0) hasDebit = true;
      if (row.cr > 0) hasCredit = true;
    }

    if (!hasDebit || !hasCredit) {
      Alert.alert("Validation", "Voucher must contain both debit and credit entries.");
      return false;
    }

    if (!isBalanced) {
      Alert.alert(
        "Unbalanced Voucher",
        `Dr total (₹${formatNumber(totalDr, 2)}) ≠ Cr total (₹${formatNumber(totalCr, 2)}).`
      );
      return false;
    }

    return true;
  };

  const onSave = async () => {
    if (!validate()) return;

    const mappedDetails = parsedRows.map((r) => ({
      ledger_id: r.ledger_id!,
      dr_amount: r.dr,
      cr_amount: r.cr,
    }));

    try {
      setSaving(true);

      if (isEdit && voucherId) {
        await updateVoucher(voucherId, {
          voucher_date: voucherDate,
          narration: narration.trim() || undefined,
          reference_no: referenceNo.trim() || undefined,
          details: mappedDetails,
        });

        Alert.alert("Success", "Voucher updated", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } else {
        const payload: CreateVoucherPayload = {
          voucher_type: voucherType,
          voucher_date: voucherDate,
          narration: narration.trim() || undefined,
          reference_no: referenceNo.trim() || undefined,
          details: mappedDetails,
        };

        const res = await createVoucher(payload);

        Alert.alert("Success", `Voucher created: ${res.voucher.voucher_no}`, [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      }
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.response?.data?.message || e?.message || "Failed to save"
      );
    } finally {
      setSaving(false);
    }
  };

  const onDelete = () => {
    if (!voucherId) return;

    if (isAutoVoucher) {
      Alert.alert("Not allowed", "Auto-generated bill/refund vouchers cannot be deleted here.");
      return;
    }

    Alert.alert("Delete Voucher", `Delete ${voucherNo}?`, [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteVoucher(voucherId);
            Alert.alert("Deleted", "Voucher deleted", [
              { text: "OK", onPress: () => navigation.goBack() },
            ]);
          } catch (e: any) {
            Alert.alert(
              "Error",
              e?.response?.data?.message || e?.message || "Cannot delete"
            );
          }
        },
      },
    ]);
  };

  if (loading) return <Loader />;

  const typeColor = TYPE_COLOR[voucherType] ?? "#6B7280";

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <SectionTitle
          title={isEdit ? "Voucher Detail" : "New Voucher"}
          subtitle={voucherNo || "—"}
        />

        {isAutoVoucher && (
          <View
            style={[
              styles.notice,
              { backgroundColor: "#D98E0412", borderColor: "#D98E0440" },
            ]}
          >
            <Text style={[styles.noticeText, { color: "#D98E04" }]}>
              This voucher was auto-generated by a bill/refund flow and cannot be edited here.
            </Text>
          </View>
        )}

        <AppInput
          label="Voucher Type"
          value={voucherType}
          editable={false}
          onPress={isEdit ? undefined : () => setTypeModal(true)}
        />

        <AppInput
          label="Date"
          value={voucherDate}
          editable={false}
          onPress={isAutoVoucher ? undefined : () => setShowDate(true)}
        />

        {showDatePick && (
          <DateTimePicker
            value={new Date(voucherDate)}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_, d) => {
              setShowDate(false);
              if (d) {
                setVoucherDate(
                  new Intl.DateTimeFormat("en-CA", {
                    timeZone: "Asia/Kolkata",
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  }).format(d)
                );
              }
            }}
          />
        )}

        <AppInput
          label="Narration"
          value={narration}
          onChangeText={setNarration}
          placeholder="Enter narration"
          editable={!isAutoVoucher}
          multiline
        />

        <AppInput
          label="Reference No"
          value={referenceNo}
          onChangeText={setReferenceNo}
          placeholder="e.g. BILL:45 or manual ref"
          editable={!isAutoVoucher}
        />

        <View style={[styles.sectionHeader, { borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Voucher Details
          </Text>
          <Text
            style={[
              styles.balanceText,
              { color: isBalanced ? "#1E9E5A" : "#D64545" },
            ]}
          >
            Dr ₹{formatNumber(totalDr, 2)} / Cr ₹{formatNumber(totalCr, 2)}
            {isBalanced ? " ✓" : " ✗"}
          </Text>
        </View>

        {details.map((row, idx) => (
          <View
            key={row.id}
            style={[
              styles.detailCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.detailHeader}>
              <Text style={[styles.rowNo, { color: colors.textSecondary }]}>
                Row {idx + 1}
              </Text>
              {!isAutoVoucher && (
                <TouchableOpacity onPress={() => removeRow(row.id)}>
                  <Text style={styles.removeBtn}>✕ Remove</Text>
                </TouchableOpacity>
              )}
            </View>

            <AppInput
              label="Ledger *"
              value={row.ledger_name || "Tap to select"}
              editable={false}
              onPress={isAutoVoucher ? undefined : () => setLedgerPickRow(row.id)}
            />

            <View style={styles.amountRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <AppInput
                  label="Debit (Dr)"
                  value={row.dr_amount}
                  onChangeText={(v) => updateRow(row.id, "dr_amount", v)}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  editable={!isAutoVoucher}
                />
              </View>

              <View style={{ flex: 1 }}>
                <AppInput
                  label="Credit (Cr)"
                  value={row.cr_amount}
                  onChangeText={(v) => updateRow(row.id, "cr_amount", v)}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  editable={!isAutoVoucher}
                />
              </View>
            </View>
          </View>
        ))}

        {!isAutoVoucher && (
          <TouchableOpacity
            style={[
              styles.addRowBtn,
              { borderColor: typeColor, backgroundColor: `${typeColor}10` },
            ]}
            onPress={addRow}
          >
            <Text style={[styles.addRowText, { color: typeColor }]}>+ Add Row</Text>
          </TouchableOpacity>
        )}

        {!isAutoVoucher && (
          <>
            <AppButton
              title={saving ? "Saving..." : isEdit ? "Update Voucher" : "Save Voucher"}
              onPress={onSave}
              disabled={saving}
              style={{ marginTop: 16 }}
            />

            {isEdit && (
              <AppButton
                title="Delete Voucher"
                variant="outline"
                onPress={onDelete}
                style={{ marginTop: 10 }}
              />
            )}
          </>
        )}

        <AppButton
          title="Back"
          variant="outline"
          onPress={() => navigation.goBack()}
          style={{ marginTop: 10 }}
        />
      </ScrollView>

      <SelectModal
        visible={typeModal}
        title="Select Voucher Type"
        data={VOUCHER_TYPE_OPTIONS}
        onSelect={(item) => {
          setVoucherType(item.value as VoucherType);
          setTypeModal(false);
        }}
        onClose={() => setTypeModal(false)}
      />

      <SelectModal
        visible={!!ledgerPickRow}
        title="Select Ledger"
        data={ledgerItems}
        onSelect={onSelectLedger}
        onClose={() => setLedgerPickRow(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  scroll: { flex: 1, padding: 16 },
  notice: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  noticeText: { fontSize: 13, lineHeight: 20 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    paddingTop: 14,
    marginTop: 4,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700" },
  balanceText: { fontSize: 13, fontWeight: "600" },
  detailCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  detailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  rowNo: { fontSize: 13, fontWeight: "600" },
  removeBtn: { fontSize: 13, color: "#D64545", fontWeight: "600" },
  amountRow: { flexDirection: "row" },
  addRowBtn: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  addRowText: { fontSize: 14, fontWeight: "700" },
});

export default VoucherEntryScreen;