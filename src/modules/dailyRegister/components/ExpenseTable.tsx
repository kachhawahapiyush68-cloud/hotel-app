// ============================================================
// src/modules/dailyRegister/components/ExpenseTable.tsx
//
// Expense table card — list of expense rows + total footer.
// ============================================================

import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";

import { DailyExpenseRow } from "../api";
import { fmt, fmtAlways } from "../api";
import { useThemeStore } from "../../../store/themeStore";

// ── Props ─────────────────────────────────────────────────────
interface Props {
  expenses: DailyExpenseRow[];
  date: string;  // display date string e.g. "13-Apr-26"
}

// ── Component ─────────────────────────────────────────────────
export const ExpenseTable: React.FC<Props> = memo(({ expenses, date }) => {
  const { theme } = useThemeStore();
  const colors    = theme.colors;

  const total = expenses.reduce((sum, e) => sum + Number(e.amount ?? 0), 0);

  const isEmpty = !expenses || expenses.length === 0;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Expenses</Text>
        <Text style={[styles.headerDate,  { color: colors.primary }]}>{date}</Text>
      </View>

      {/* Column headers */}
      <View style={[styles.colHeader, { backgroundColor: colors.primary + "14", borderBottomColor: colors.border }]}>
        <Text style={[styles.colHeaderText, { color: colors.textSecondary, flex: 1 }]}>
          Description
        </Text>
        <Text style={[styles.colHeaderText, styles.colRight, { color: colors.textSecondary, width: 90 }]}>
          Amount
        </Text>
      </View>

      {/* Empty state */}
      {isEmpty ? (
        <View style={styles.emptyWrap}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No expenses recorded
          </Text>
        </View>
      ) : (
        <>
          {expenses.map((row, idx) => {
            const isLast = idx === expenses.length - 1;
            return (
              <View
                key={`${row.description}-${idx}`}
                style={[
                  styles.row,
                  { borderBottomColor: colors.border },
                  isLast && styles.rowLast,
                ]}
              >
                <Text
                  style={[styles.rowDesc, { color: colors.text, flex: 1 }]}
                  numberOfLines={2}
                >
                  {row.description}
                </Text>
                <Text style={[styles.rowAmt, { color: colors.danger, width: 90 }]}>
                  ₹ {fmt(row.amount) || fmtAlways(row.amount)}
                </Text>
              </View>
            );
          })}

          {/* Total footer */}
          <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.primary + "0D" }]}>
            <Text style={[styles.footerLabel, { color: colors.text }]}>Total</Text>
            <Text style={[styles.footerAmt,   { color: colors.danger, width: 90 }]}>
              ₹ {fmtAlways(total)}
            </Text>
          </View>
        </>
      )}
    </View>
  );
});

// ── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    borderRadius:  12,
    borderWidth:   1,
    overflow:      "hidden",
    marginHorizontal: 16,
  },
  header: {
    flexDirection:    "row",
    alignItems:       "center",
    justifyContent:   "space-between",
    paddingHorizontal: 16,
    paddingVertical:  14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize:   15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  headerDate: {
    fontSize:   13,
    fontWeight: "600",
  },
  colHeader: {
    flexDirection:    "row",
    alignItems:       "center",
    paddingHorizontal: 16,
    paddingVertical:  8,
    borderBottomWidth: 1,
  },
  colHeaderText: {
    fontSize:   11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  colRight: {
    textAlign: "right",
  },
  row: {
    flexDirection:    "row",
    alignItems:       "center",
    paddingHorizontal: 16,
    paddingVertical:  11,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowDesc: {
    fontSize: 13,
  },
  rowAmt: {
    fontSize:  13,
    fontWeight: "600",
    textAlign: "right",
  },
  footer: {
    flexDirection:    "row",
    alignItems:       "center",
    justifyContent:   "space-between",
    paddingHorizontal: 16,
    paddingVertical:  12,
    borderTopWidth:   1,
  },
  footerLabel: {
    fontSize:   14,
    fontWeight: "700",
    flex:       1,
  },
  footerAmt: {
    fontSize:   14,
    fontWeight: "700",
    textAlign:  "right",
  },
  emptyWrap: {
    paddingVertical:  32,
    alignItems:       "center",
  },
  emptyText: {
    fontSize: 13,
  },
});
