import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";

import { DailyRegisterSummary } from "../api";
import { fmtAlways } from "../api";
import { useThemeStore } from "../../../store/themeStore";

interface Props {
  summary: DailyRegisterSummary;
  date: string;
}

interface SummaryRowDef {
  label: string;
  key: keyof DailyRegisterSummary;
  accent?: "primary" | "danger" | "success";
  divider?: boolean;
}

export const SummaryBlock: React.FC<Props> = memo(({ summary, date }) => {
  const { theme } = useThemeStore();
  const colors = theme.colors;

  const rows: SummaryRowDef[] = [
    { label: "Opening Balance", key: "op_bal" },
    ...(summary.bank_op_bal !== undefined ? [{ label: "Bank Opening", key: "bank_op_bal" as keyof DailyRegisterSummary }] : []),
    { label: "Today Collection", key: "t_coll", accent: "success" },
    { label: "Other Income", key: "other" },
    { label: "Net Amount", key: "net_amt", accent: "primary", divider: true },
    { label: "Expenses", key: "exp", accent: "danger" },
    { label: "Bank Deposit", key: "bank" },
    { label: "Due", key: "due", accent: "danger" },
    { label: "Refund", key: "refund", accent: "success" },
    { label: "Cash Balance", key: "cash_bal", accent: "primary", divider: true },
  ];

  const accentColor = (accent?: "primary" | "danger" | "success") => {
    switch (accent) {
      case "primary":
        return colors.primary;
      case "danger":
        return colors.danger;
      case "success":
        return "#1E9E5A";
      default:
        return colors.text;
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Daily Summary</Text>
        <Text style={[styles.headerDate, { color: colors.primary }]}>{date}</Text>
      </View>

      {rows.map((row, idx) => {
        const val = fmtAlways(summary[row.key] as number);
        const color = accentColor(row.accent);
        const isAccent = !!row.accent;

        return (
          <View key={String(row.key)}>
            {row.divider && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
            <View
              style={[
                styles.summaryRow,
                { borderBottomColor: colors.border },
                idx === rows.length - 1 && styles.summaryRowLast,
              ]}
            >
              <Text
                style={[
                  styles.rowLabel,
                  { color: isAccent ? color : colors.textSecondary },
                  isAccent && styles.rowLabelBold,
                ]}
              >
                {row.label}
              </Text>
              <Text
                style={[
                  styles.rowValue,
                  { color },
                  isAccent && styles.rowValueBold,
                ]}
              >
                ₹ {val}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    marginHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  headerDate: {
    fontSize: 13,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    marginVertical: 2,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  summaryRowLast: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    fontSize: 13,
    flex: 1,
  },
  rowLabelBold: {
    fontWeight: "700",
    fontSize: 14,
  },
  rowValue: {
    fontSize: 13,
    fontWeight: "500",
    minWidth: 80,
    textAlign: "right",
  },
  rowValueBold: {
    fontWeight: "700",
    fontSize: 15,
  },
});