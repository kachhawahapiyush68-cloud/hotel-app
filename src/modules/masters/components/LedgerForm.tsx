// ============================================================
// src/modules/masters/components/LedgerForm.tsx
// ============================================================
//
// Modal form for creating or editing a ledger.
// Used by LedgerListScreen.
//
// Create: POST /api/ledgers → { ledger_name, ledger_type, opening_balance, dr_cr_flag, is_active }
// Edit:   PUT  /api/ledgers/:id → same fields
//
// Rules:
//   - System ledgers: name + type are read-only (only is_active can change)
//   - dr_cr_flag defaults based on ledger_type:
//       CASH/BANK/RECEIVABLE/EXPENSE → Dr
//       LIABILITY/REVENUE            → Cr
// ============================================================

import React, { useCallback, useEffect, useState } from "react";
import {
  Modal,
  View,
  ScrollView,
  StyleSheet,
  Text,
  Switch,
  Alert,
} from "react-native";
import { Ledger, LedgerType, DrCrFlag, CreateLedgerPayload, UpdateLedgerPayload } from "../../../api/types";
import { createLedger, updateLedger } from "../api";
import AppButton from "../../../shared/components/AppButton";
import AppInput  from "../../../shared/components/AppInput";
import SelectModal, { SelectItem } from "../../../shared/components/SelectModal";
import { useThemeStore } from "../../../store/themeStore";

// ── Options ───────────────────────────────────────────────────

const TYPE_OPTIONS: SelectItem[] = [
  { label: "Cash",        value: "CASH"       },
  { label: "Bank",        value: "BANK"       },
  { label: "Receivable",  value: "RECEIVABLE" },
  { label: "Liability",   value: "LIABILITY"  },
  { label: "Revenue",     value: "REVENUE"    },
  { label: "Expense",     value: "EXPENSE"    },
];

const DRCR_OPTIONS: SelectItem[] = [
  { label: "Debit (Dr) — Asset / Expense",    value: "Dr" },
  { label: "Credit (Cr) — Income / Liability",value: "Cr" },
];

// Default dr_cr_flag based on type
function defaultDrCr(type: LedgerType): DrCrFlag {
  return type === "LIABILITY" || type === "REVENUE" ? "Cr" : "Dr";
}

const TYPE_LABEL: Record<LedgerType, string> = {
  CASH:       "Cash",
  BANK:       "Bank",
  RECEIVABLE: "Receivable",
  LIABILITY:  "Liability",
  REVENUE:    "Revenue",
  EXPENSE:    "Expense",
};

// ── Props ─────────────────────────────────────────────────────

interface Props {
  visible: boolean;
  ledger:  Ledger | null;   // null → create mode
  onSave:  () => void;
  onClose: () => void;
}

const LedgerForm: React.FC<Props> = ({ visible, ledger, onSave, onClose }) => {
  const { theme } = useThemeStore();
  const colors    = theme.colors;
  const isEdit    = !!ledger;
  const isSystem  = !!ledger?.is_system_ledger;

  // ── Form state ────────────────────────────────────────────
  const [name,       setName]       = useState("");
  const [type,       setType]       = useState<LedgerType>("CASH");
  const [drCr,       setDrCr]       = useState<DrCrFlag>("Dr");
  const [opening,    setOpening]    = useState("0");
  const [isActive,   setIsActive]   = useState(true);
  const [saving,     setSaving]     = useState(false);

  // Modals for pickers
  const [typeModal,  setTypeModal]  = useState(false);
  const [drCrModal,  setDrCrModal]  = useState(false);

  // ── Populate form when editing ────────────────────────────
  useEffect(() => {
    if (visible) {
      if (ledger) {
        setName(ledger.ledger_name);
        setType(ledger.ledger_type);
        setDrCr(ledger.dr_cr_flag);
        setOpening(String(ledger.opening_balance ?? 0));
        setIsActive(ledger.is_active === 1);
      } else {
        setName("");
        setType("CASH");
        setDrCr("Dr");
        setOpening("0");
        setIsActive(true);
      }
    }
  }, [visible, ledger]);

  // Auto-set dr_cr when type changes (only in create mode)
  const onTypeSelect = useCallback((item: SelectItem) => {
    const t = item.value as LedgerType;
    setType(t);
    setDrCr(defaultDrCr(t));
    setTypeModal(false);
  }, []);

  // ── Save ──────────────────────────────────────────────────
  const onSavePress = async () => {
    if (!name.trim()) {
      Alert.alert("Validation", "Ledger name is required.");
      return;
    }

    const openingNum = parseFloat(opening) || 0;
    if (isNaN(openingNum)) {
      Alert.alert("Validation", "Opening balance must be a number.");
      return;
    }

    try {
      setSaving(true);

      if (isEdit && ledger) {
        const payload: UpdateLedgerPayload = {
          ledger_name:     name.trim(),
          ledger_type:     isSystem ? ledger.ledger_type : type,
          opening_balance: openingNum,
          dr_cr_flag:      isSystem ? ledger.dr_cr_flag : drCr,
          is_active:       isActive ? 1 : 0,
        };
        await updateLedger(ledger.ledger_id, payload);
      } else {
        const payload: CreateLedgerPayload = {
          ledger_name:     name.trim(),
          ledger_type:     type,
          opening_balance: openingNum,
          dr_cr_flag:      drCr,
          is_active:       isActive ? 1 : 0,
        };
        await createLedger(payload);
      }

      onSave();
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || e?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            {isEdit ? "Edit Ledger" : "Add Ledger"}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {isSystem ? "System ledger — type is fixed" : ""}
          </Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Ledger Name */}
          <AppInput
            label="Ledger Name *"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Cash In Hand"
            editable={!isSystem}
          />

          {/* Ledger Type */}
          <AppInput
            label="Ledger Type *"
            value={TYPE_LABEL[type] ?? type}
            editable={false}
            onPress={isSystem ? undefined : () => setTypeModal(true)}
          />

          {/* Dr / Cr Flag */}
          <AppInput
            label="Nature (Dr/Cr)"
            value={drCr === "Dr" ? "Debit (Dr) — Asset / Expense" : "Credit (Cr) — Income / Liability"}
            editable={false}
            onPress={isSystem ? undefined : () => setDrCrModal(true)}
          />

          {/* Opening Balance */}
          <AppInput
            label="Opening Balance"
            value={opening}
            onChangeText={setOpening}
            keyboardType="decimal-pad"
            placeholder="0.00"
          />

          {/* Is Active toggle */}
          <View style={[styles.toggleRow, { borderColor: colors.border }]}>
            <Text style={[styles.toggleLabel, { color: colors.text }]}>Active</Text>
            <Switch
              value={isActive}
              onValueChange={setIsActive}
              trackColor={{ true: colors.primary, false: colors.border }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* System ledger notice */}
          {isSystem && (
            <View style={[styles.notice, { backgroundColor: `${colors.primary}12`, borderColor: `${colors.primary}40` }]}>
              <Text style={[styles.noticeText, { color: colors.primary }]}>
                System ledgers are auto-used for bill payments and refunds. Name and type cannot be changed.
              </Text>
            </View>
          )}

          {/* Buttons */}
          <AppButton
            title={saving ? "Saving..." : isEdit ? "Update Ledger" : "Create Ledger"}
            onPress={onSavePress}
            disabled={saving}
            style={{ marginTop: 16 }}
          />
          <AppButton
            title="Cancel"
            variant="outline"
            onPress={onClose}
            style={{ marginTop: 10 }}
          />
        </ScrollView>
      </View>

      {/* Type picker */}
      <SelectModal
        visible={typeModal}
        title="Select Ledger Type"
        data={TYPE_OPTIONS}
        onSelect={onTypeSelect}
        onClose={() => setTypeModal(false)}
      />

      {/* Dr/Cr picker */}
      <SelectModal
        visible={drCrModal}
        title="Select Nature (Dr / Cr)"
        data={DRCR_OPTIONS}
        onSelect={(item) => {
          setDrCr(item.value as DrCrFlag);
          setDrCrModal(false);
        }}
        onClose={() => setDrCrModal(false)}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 13,
    marginTop: 3,
  },
  scroll: {
    flex: 1,
    padding: 16,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  notice: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  noticeText: {
    fontSize: 13,
    lineHeight: 20,
  },
});

export default LedgerForm;
