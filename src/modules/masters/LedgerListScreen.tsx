// ============================================================
// src/modules/masters/LedgerListScreen.tsx
// ============================================================
//
// Shows all ledgers with:
//   - Type filter pills (All / CASH / BANK / RECEIVABLE / LIABILITY / REVENUE / EXPENSE)
//   - Add new ledger (cannot add system ledgers)
//   - Tap ledger → edit (name, type, opening_balance, dr_cr_flag, is_active)
//   - Long-press ledger → delete (blocked if is_system_ledger = 1)
//   - Pull-to-refresh
//
// System ledgers (Cash In Hand, Bank Collection, Guest Receivables, etc.)
// are shown with a "System" badge and cannot be deleted.
// ============================================================

import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { Ledger, LedgerType } from "../../api/types";
import {
  fetchLedgerList,
  deleteLedger,
} from "./api";
import Loader from "../../shared/components/Loader";
import SectionTitle from "../../shared/components/SectionTitle";
import AppButton from "../../shared/components/AppButton";
import Pill from "../../shared/components/Pill";
import LedgerForm from "./components/LedgerForm";
import { useThemeStore } from "../../store/themeStore";

// ── Type filter options ───────────────────────────────────────

type TypeFilter = "All" | LedgerType;

const TYPE_FILTERS: TypeFilter[] = [
  "All",
  "CASH",
  "BANK",
  "RECEIVABLE",
  "LIABILITY",
  "REVENUE",
  "EXPENSE",
];

const TYPE_LABEL: Record<TypeFilter, string> = {
  All:        "All",
  CASH:       "Cash",
  BANK:       "Bank",
  RECEIVABLE: "Receivable",
  LIABILITY:  "Liability",
  REVENUE:    "Revenue",
  EXPENSE:    "Expense",
};

// ── Type colors ───────────────────────────────────────────────

const TYPE_COLOR: Record<LedgerType, string> = {
  CASH:       "#1E9E5A",   // green
  BANK:       "#2563EB",   // blue
  RECEIVABLE: "#D98E04",   // amber
  LIABILITY:  "#7C3AED",   // purple
  REVENUE:    "#0891B2",   // cyan
  EXPENSE:    "#D64545",   // red
};

const LedgerListScreen: React.FC = () => {
  const isFocused  = useIsFocused();
  const { theme }  = useThemeStore();
  const colors     = theme.colors;

  const [data,        setData]        = useState<Ledger[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [refreshing,  setRefreshing]  = useState(false);
  const [typeFilter,  setTypeFilter]  = useState<TypeFilter>("All");

  // Form modal state
  const [formVisible, setFormVisible] = useState(false);
  const [editLedger,  setEditLedger]  = useState<Ledger | null>(null);

  // ── Load ─────────────────────────────────────────────────
  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchLedgerList();
      setData(res);
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || e?.message || "Failed to load ledgers");
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  useEffect(() => {
    if (isFocused) load();
  }, [isFocused, load]);

  // ── Filtered list ─────────────────────────────────────────
  const filtered =
    typeFilter === "All"
      ? data
      : data.filter((l) => l.ledger_type === typeFilter);

  // ── Delete ────────────────────────────────────────────────
  const onDelete = (ledger: Ledger) => {
    if (ledger.is_system_ledger) {
      Alert.alert("Not allowed", "System ledgers cannot be deleted.");
      return;
    }

    Alert.alert(
      "Delete Ledger",
      `Delete "${ledger.ledger_name}"? This will fail if the ledger has voucher entries.`,
      [
        { text: "Cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteLedger(ledger.ledger_id);
              setData((prev) => prev.filter((l) => l.ledger_id !== ledger.ledger_id));
            } catch (e: any) {
              Alert.alert("Error", e?.response?.data?.message || e?.message || "Cannot delete");
            }
          },
        },
      ]
    );
  };

  // ── Open form ─────────────────────────────────────────────
  const openAdd = () => {
    setEditLedger(null);
    setFormVisible(true);
  };

  const openEdit = (ledger: Ledger) => {
    setEditLedger(ledger);
    setFormVisible(true);
  };

  const onFormSave = () => {
    setFormVisible(false);
    setEditLedger(null);
    load();
  };

  // ── Render item ───────────────────────────────────────────
  const renderItem = ({ item }: { item: Ledger }) => {
    const typeColor = TYPE_COLOR[item.ledger_type] ?? "#6B7280";
    const typeLabel = TYPE_LABEL[item.ledger_type as TypeFilter] ?? item.ledger_type;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor:     colors.border,
            borderLeftColor: typeColor,
            borderLeftWidth: 4,
            opacity:         item.is_active ? 1 : 0.55,
          },
        ]}
        onPress={() => openEdit(item)}
        onLongPress={() => onDelete(item)}
      >
        {/* Top row */}
        <View style={styles.topRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.ledgerName, { color: colors.text }]}>
              {item.ledger_name}
            </Text>
          </View>

          <View style={styles.badgesRow}>
            {!!item.is_system_ledger && (
              <View style={[styles.badge, { backgroundColor: "#2563EB18" }]}>
                <Text style={[styles.badgeText, { color: "#2563EB" }]}>System</Text>
              </View>
            )}
            {!item.is_active && (
              <View style={[styles.badge, { backgroundColor: "#D6454518" }]}>
                <Text style={[styles.badgeText, { color: "#D64545" }]}>Inactive</Text>
              </View>
            )}
            <View style={[styles.badge, { backgroundColor: `${typeColor}18` }]}>
              <Text style={[styles.badgeText, { color: typeColor }]}>{typeLabel}</Text>
            </View>
          </View>
        </View>

        {/* Dr/Cr flag + opening balance */}
        <View style={styles.metaRow}>
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            Nature: {item.dr_cr_flag === "Dr" ? "Debit (Asset/Expense)" : "Credit (Income/Liability)"}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            Opening Balance:
          </Text>
          <Text style={[styles.metaAmount, { color: colors.text }]}>
            ₹ {Number(item.opening_balance || 0).toFixed(2)}
          </Text>
        </View>

        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          Tap to edit · Long press to delete
        </Text>
      </TouchableOpacity>
    );
  };

  // ── Screen ────────────────────────────────────────────────
  if (loading && !refreshing && data.length === 0) return <Loader />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SectionTitle
        title="Ledger Accounts"
        subtitle={`${filtered.length} ledger${filtered.length === 1 ? "" : "s"}`}
        rightContent={
          <AppButton title="+ Add" size="small" onPress={openAdd} />
        }
      />

      {/* Type filter pills */}
      <View style={styles.filterRow}>
        {TYPE_FILTERS.map((f) => (
          <Pill
            key={f}
            label={TYPE_LABEL[f]}
            active={typeFilter === f}
            onPress={() => setTypeFilter(f)}
          />
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.ledger_id)}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No ledgers found</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Seed system ledgers first or tap "+ Add"
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={{
          paddingBottom: 24,
          flexGrow: filtered.length === 0 ? 1 : undefined,
        }}
      />

      {/* Add / Edit form modal */}
      <LedgerForm
        visible={formVisible}
        ledger={editLedger}
        onSave={onFormSave}
        onClose={() => {
          setFormVisible(false);
          setEditLedger(null);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container:  { flex: 1, padding: 16 },
  filterRow:  { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  ledgerName: { fontSize: 15, fontWeight: "700" },
  badgesRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 11, fontWeight: "700" },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  metaText:   { fontSize: 13 },
  metaAmount: { fontSize: 13, fontWeight: "600" },
  hint:       { fontSize: 11, marginTop: 6 },
  emptyCard: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  emptyTitle:    { fontSize: 16, fontWeight: "700", marginBottom: 6 },
  emptySubtitle: { fontSize: 13, textAlign: "center" },
});

export default LedgerListScreen;
