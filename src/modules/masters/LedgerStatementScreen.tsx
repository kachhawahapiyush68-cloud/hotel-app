// ============================================================
// src/modules/masters/LedgerStatementScreen.tsx
// ============================================================
//
// Shows the ledger book (statement) for a single ledger:
//   - Ledger info card (name, type, dr_cr_flag, opening balance)
//   - Date range filter (From / To) — wired to backend API
//   - Running balance table: Date | Voucher No | Type | Narration | Dr | Cr | Balance
//   - Closing balance card
//
// API: GET /api/ledgers/:id/book?fromDate=YYYY-MM-DD&toDate=YYYY-MM-DD
// Response shape:
//   { ledger: Ledger, opening_balance, period_dr, period_cr,
//     closing_balance, entries: LedgerBookEntry[] }
//
// FIXED BUGS:
//   - URL: was /ledgers/:id/summary → correct: /ledgers/:id/book
//   - Query params: was from/to → correct: fromDate/toDate
//   - data.ledger_name / data.total_debit / data.closing_flag don't exist
//     → correct: data.ledger.ledger_name, data.closing_balance, data.entries[]
//   - From/To filter was NOT wired to API — now properly passed as fromDate/toDate
//   - No theme — fully themed now
//   - No entries table — added running balance rows
// ============================================================

import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LedgerSummaryResponse, LedgerBookEntry } from "../../api/types";
import { fetchLedgerSummary } from "./api";
import Loader       from "../../shared/components/Loader";
import SectionTitle from "../../shared/components/SectionTitle";
import AppButton    from "../../shared/components/AppButton";
import { formatNumber }  from "../../shared/utils/number";
import { useThemeStore } from "../../store/themeStore";

// ── Helpers ───────────────────────────────────────────────────

function todayIST(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
}

function thirtyDaysAgo(): string {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(d);
}

function shortDate(dateStr: string): string {
  if (!dateStr) return "—";
  return dateStr.slice(0, 10);
}

// Ledger type color
const TYPE_COLOR: Record<string, string> = {
  CASH:       "#1E9E5A",
  BANK:       "#2563EB",
  RECEIVABLE: "#D98E04",
  LIABILITY:  "#7C3AED",
  REVENUE:    "#0891B2",
  EXPENSE:    "#D64545",
};

// ── Props ─────────────────────────────────────────────────────

type Props = {
  route:      { params?: { ledgerId?: number } };
  navigation: any;
};

// ─────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────

export default function LedgerStatementScreen({ route, navigation }: Props) {
  const ledgerId   = Number(route?.params?.ledgerId);
  const { theme }  = useThemeStore();
  const colors     = theme.colors;

  const [loading,   setLoading]   = useState(true);
  const [searching, setSearching] = useState(false);
  const [data,      setData]      = useState<LedgerSummaryResponse | null>(null);

  // Date range — default: last 30 days
  // These are sent to backend as fromDate / toDate (NOT from / to)
  const [fromDate,  setFromDate]  = useState(thirtyDaysAgo());
  const [toDate,    setToDate]    = useState(todayIST());
  const [showFrom,  setShowFrom]  = useState(false);
  const [showTo,    setShowTo]    = useState(false);

  // ── Load ─────────────────────────────────────────────────
  // fetchLedgerSummary → GET /api/ledgers/:id/book?fromDate=&toDate=
  const load = useCallback(
    async (fromDateArg?: string, toDateArg?: string) => {
      const res = await fetchLedgerSummary(ledgerId, {
        fromDate: fromDateArg ?? fromDate,
        toDate:   toDateArg   ?? toDate,
      });
      setData(res);
    },
    [ledgerId, fromDate, toDate]
  );

  useEffect(() => {
    (async () => {
      try {
        if (!ledgerId || ledgerId <= 0) {
          Alert.alert("Error", "Invalid ledger ID");
          navigation.goBack?.();
          return;
        }
        await load();
      } catch (e: any) {
        Alert.alert("Error", e?.response?.data?.message || e?.message || "Failed to load ledger");
        navigation.goBack?.();
      } finally {
        setLoading(false);
      }
    })();
  }, [ledgerId]);

  // ── Filter / reload ───────────────────────────────────────
  const handleFilter = async () => {
    try {
      setSearching(true);
      await load(fromDate, toDate);
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || e?.message || "Failed to reload");
    } finally {
      setSearching(false);
    }
  };

  // ── Computed totals from entries ──────────────────────────
  const entries: LedgerBookEntry[] = data?.entries ?? [];
  const totalDr = entries.reduce((s, e) => s + Number(e.dr_amount || 0), 0);
  const totalCr = entries.reduce((s, e) => s + Number(e.cr_amount || 0), 0);

  const ledger        = data?.ledger;
  const typeColor     = TYPE_COLOR[ledger?.ledger_type ?? ""] ?? "#6B7280";
  const closingBal    = Number(data?.closing_balance ?? 0);
  const isCredit      = ledger?.dr_cr_flag === "Cr";

  // ── Render ────────────────────────────────────────────────
  if (loading) return <Loader />;
  if (!data || !ledger) return null;

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <SectionTitle title="Ledger Statement" subtitle={ledger.ledger_name} />

        {/* ── Ledger Info Card ──────────────────────────────── */}
        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: colors.surface,
              borderColor:     colors.border,
              borderLeftColor: typeColor,
              borderLeftWidth: 4,
            },
          ]}
        >
          <Text style={[styles.ledgerName, { color: colors.text }]}>
            {ledger.ledger_name}
          </Text>

          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: `${typeColor}18` }]}>
              <Text style={[styles.badgeText, { color: typeColor }]}>
                {ledger.ledger_type}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: `${typeColor}10` }]}>
              <Text style={[styles.badgeText, { color: typeColor }]}>
                {ledger.dr_cr_flag === "Dr" ? "Debit Normal" : "Credit Normal"}
              </Text>
            </View>
          </View>

          <View style={styles.balRow}>
            <Text style={[styles.balLabel, { color: colors.textSecondary }]}>
              Opening Balance
            </Text>
            <Text style={[styles.balValue, { color: colors.text }]}>
              {ledger.dr_cr_flag} ₹ {formatNumber(Number(ledger.opening_balance || 0), 2)}
            </Text>
          </View>

          <View style={styles.balRow}>
            <Text style={[styles.balLabel, { color: colors.textSecondary }]}>
              Period Dr / Cr
            </Text>
            <Text style={[styles.balValue, { color: colors.textSecondary }]}>
              Dr ₹{formatNumber(Number(data.period_dr ?? 0), 2)} / Cr ₹{formatNumber(Number(data.period_cr ?? 0), 2)}
            </Text>
          </View>

          <View style={styles.balRow}>
            <Text style={[styles.balLabel, { color: colors.textSecondary }]}>
              Closing Balance
            </Text>
            <Text
              style={[
                styles.balValue,
                { color: closingBal >= 0 ? colors.primary : "#D64545", fontWeight: "700" },
              ]}
            >
              {isCredit ? "Cr" : "Dr"} ₹ {formatNumber(Math.abs(closingBal), 2)}
            </Text>
          </View>
        </View>

        {/* ── Date Filter ───────────────────────────────────── */}
        <View style={[styles.filterCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.filterTitle, { color: colors.text }]}>Date Range</Text>

          <View style={styles.dateRow}>
            <TouchableOpacity
              style={[styles.datePill, { borderColor: colors.border, backgroundColor: colors.background }]}
              onPress={() => setShowFrom(true)}
            >
              <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>From</Text>
              <Text style={[styles.dateValue, { color: colors.text }]}>{fromDate}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.datePill, { borderColor: colors.border, backgroundColor: colors.background }]}
              onPress={() => setShowTo(true)}
            >
              <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>To</Text>
              <Text style={[styles.dateValue, { color: colors.text }]}>{toDate}</Text>
            </TouchableOpacity>
          </View>

          <AppButton
            title={searching ? "Loading..." : "Apply Filter"}
            onPress={handleFilter}
            disabled={searching}
            style={{ marginTop: 8 }}
          />
        </View>

        {showFrom && (
          <DateTimePicker
            value={new Date(fromDate)}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_, d) => {
              setShowFrom(false);
              if (d) {
                setFromDate(
                  new Intl.DateTimeFormat("en-CA", {
                    timeZone: "Asia/Kolkata",
                    year: "numeric", month: "2-digit", day: "2-digit",
                  }).format(d)
                );
              }
            }}
          />
        )}
        {showTo && (
          <DateTimePicker
            value={new Date(toDate)}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_, d) => {
              setShowTo(false);
              if (d) {
                setToDate(
                  new Intl.DateTimeFormat("en-CA", {
                    timeZone: "Asia/Kolkata",
                    year: "numeric", month: "2-digit", day: "2-digit",
                  }).format(d)
                );
              }
            }}
          />
        )}

        {/* ── Entries Table ─────────────────────────────────── */}
        {entries.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No entries found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              No vouchers in this date range for this ledger
            </Text>
          </View>
        ) : (
          <>
            {/* Table header */}
            <View style={[styles.tableHeader, { backgroundColor: `${typeColor}18`, borderColor: typeColor }]}>
              <Text style={[styles.colDate,    styles.colHead, { color: typeColor }]}>Date</Text>
              <Text style={[styles.colVoucher, styles.colHead, { color: typeColor }]}>Voucher</Text>
              <Text style={[styles.colDr,      styles.colHead, { color: typeColor }]}>Dr</Text>
              <Text style={[styles.colCr,      styles.colHead, { color: typeColor }]}>Cr</Text>
              <Text style={[styles.colBal,     styles.colHead, { color: typeColor }]}>Balance</Text>
            </View>

            {/* Table rows */}
            {entries.map((entry, idx) => (
              <View
                key={idx}
                style={[
                  styles.tableRow,
                  {
                    backgroundColor: idx % 2 === 0 ? colors.surface : colors.background,
                    borderColor:     colors.border,
                  },
                ]}
              >
                <Text style={[styles.colDate, styles.cellText, { color: colors.textSecondary }]}>
                  {shortDate(entry.voucher_date)}
                </Text>
                <View style={styles.colVoucher}>
                  <Text style={[styles.cellText, { color: colors.text, fontWeight: "600" }]} numberOfLines={1}>
                    {entry.voucher_no}
                  </Text>
                  <Text style={[styles.cellSub, { color: colors.textSecondary }]} numberOfLines={1}>
                    {entry.voucher_type}
                  </Text>
                  {entry.narration ? (
                    <Text style={[styles.cellSub, { color: colors.textSecondary }]} numberOfLines={1}>
                      {entry.narration}
                    </Text>
                  ) : null}
                </View>
                <Text style={[styles.colDr, styles.cellText, { color: "#D64545" }]}>
                  {entry.dr_amount > 0 ? formatNumber(entry.dr_amount, 2) : "—"}
                </Text>
                <Text style={[styles.colCr, styles.cellText, { color: "#1E9E5A" }]}>
                  {entry.cr_amount > 0 ? formatNumber(entry.cr_amount, 2) : "—"}
                </Text>
                <Text
                  style={[
                    styles.colBal,
                    styles.cellText,
                    {
                      color: Number(entry.balance) >= 0 ? colors.primary : "#D64545",
                      fontWeight: "700",
                    },
                  ]}
                >
                  {formatNumber(Math.abs(Number(entry.balance)), 2)}
                  {"\n"}
                  <Text style={{ fontSize: 10, fontWeight: "400" }}>
                    {Number(entry.balance) >= 0 ? (isCredit ? "Cr" : "Dr") : (isCredit ? "Dr" : "Cr")}
                  </Text>
                </Text>
              </View>
            ))}

            {/* Totals row */}
            <View style={[styles.totalsRow, { backgroundColor: `${typeColor}10`, borderColor: typeColor }]}>
              <Text style={[styles.colDate,    styles.totalsText, { color: colors.text }]}>Total</Text>
              <Text style={[styles.colVoucher, styles.totalsText, { color: colors.text }]}>
                {entries.length} entries
              </Text>
              <Text style={[styles.colDr,  styles.totalsText, { color: "#D64545" }]}>
                {formatNumber(totalDr, 2)}
              </Text>
              <Text style={[styles.colCr,  styles.totalsText, { color: "#1E9E5A" }]}>
                {formatNumber(totalCr, 2)}
              </Text>
              <Text style={[styles.colBal, styles.totalsText, { color: colors.primary }]}>
                {formatNumber(Math.abs(closingBal), 2)}
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  scroll:  { flex: 1, padding: 16 },

  infoCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  ledgerName: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  badgeRow:   { flexDirection: "row", gap: 8, marginBottom: 10 },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { fontSize: 12, fontWeight: "700" },
  balRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },
  balLabel: { fontSize: 14 },
  balValue: { fontSize: 14, fontWeight: "600" },

  filterCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  filterTitle: { fontSize: 15, fontWeight: "700", marginBottom: 10 },
  dateRow: {
    flexDirection: "row",
    gap: 10,
  },
  datePill: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dateLabel: { fontSize: 11, marginBottom: 2 },
  dateValue: { fontSize: 13, fontWeight: "600" },

  // Table
  tableHeader: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginBottom: 2,
    alignItems: "center",
  },
  tableRow: {
    flexDirection: "row",
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 8,
    paddingVertical: 8,
    alignItems: "center",
    marginBottom: 1,
  },
  totalsRow: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginTop: 4,
    alignItems: "center",
  },

  colHead:  { fontSize: 11, fontWeight: "700" },
  cellText: { fontSize: 12 },
  cellSub:  { fontSize: 10, marginTop: 2 },
  totalsText: { fontSize: 12, fontWeight: "700" },

  // Column widths
  colDate:    { width: 60 },
  colVoucher: { flex: 1, paddingHorizontal: 4 },
  colDr:      { width: 60, textAlign: "right" },
  colCr:      { width: 60, textAlign: "right" },
  colBal:     { width: 64, textAlign: "right" },

  emptyCard: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    alignItems: "center",
  },
  emptyTitle:    { fontSize: 16, fontWeight: "700", marginBottom: 6 },
  emptySubtitle: { fontSize: 13, textAlign: "center" },
});
