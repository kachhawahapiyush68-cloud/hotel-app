// ============================================================
// src/modules/dailyRegister/components/RegisterRow.tsx
//
// A single row in the daily register horizontal table.
// Row background:
//   CheckedOut  → green tint  (#1E9E5A18)
//   due > 0     → danger tint (colors.danger + "18")
//   default     → colors.surface
// ============================================================

import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";

import { DailyRegisterRow } from "../api";
import { fmt } from "../api";
import { useThemeStore } from "../../../store/themeStore";

// ── Column widths (must match header) ────────────────────────
export const COL = {
  sr:     36,
  room:   52,
  name:   110,
  mobile: 100,
  pax:    32,
  amt:    60,
  extra:  60,
  tc:     60,
  bank:   60,
  cash:   60,
  due:    60,
  refund: 64,
} as const;

export const TABLE_WIDTH = Object.values(COL).reduce((a, b) => a + b, 0); // 694

// ── Props ─────────────────────────────────────────────────────
interface Props {
  row: DailyRegisterRow;
  isLast: boolean;
}

// ── Component ─────────────────────────────────────────────────
export const RegisterRow: React.FC<Props> = memo(({ row, isLast }) => {
  const { theme } = useThemeStore();
  const colors    = theme.colors;

  // Row background
  let rowBg = colors.surface;
  if (row.booking_status === "CheckedOut") {
    rowBg = "#1E9E5A18";
  } else if (row.due > 0) {
    rowBg = colors.danger + "18";
  }

  const borderColor = colors.border;
  const textColor   = colors.text;
  const dimColor    = colors.textSecondary;

  return (
    <View
      style={[
        styles.row,
        { backgroundColor: rowBg, borderBottomColor: borderColor },
        isLast && styles.rowLast,
      ]}
    >
      {/* SR NO */}
      <Text
        style={[styles.cell, styles.cellCenter, { width: COL.sr, color: dimColor }]}
        numberOfLines={1}
      >
        {row.sr_no}
      </Text>

      {/* ROOM NO */}
      <Text
        style={[styles.cell, styles.cellCenter, { width: COL.room, color: textColor, fontWeight: "700" }]}
        numberOfLines={1}
      >
        {row.room_no}
      </Text>

      {/* NAME */}
      <Text
        style={[styles.cell, { width: COL.name, color: textColor }]}
        numberOfLines={1}
      >
        {row.guest_name}
      </Text>

      {/* MOBILE NO */}
      <Text
        style={[styles.cell, { width: COL.mobile, color: dimColor }]}
        numberOfLines={1}
      >
        {row.mobile ?? ""}
      </Text>

      {/* PAX */}
      <Text
        style={[styles.cell, styles.cellCenter, { width: COL.pax, color: dimColor }]}
        numberOfLines={1}
      >
        {row.pax > 0 ? row.pax : ""}
      </Text>

      {/* AMT (room_charge) */}
      <Text
        style={[styles.cell, styles.cellRight, { width: COL.amt, color: textColor }]}
        numberOfLines={1}
      >
        {fmt(row.room_charge)}
      </Text>

      {/* EXTRA (extra_charge) */}
      <Text
        style={[styles.cell, styles.cellRight, { width: COL.extra, color: textColor }]}
        numberOfLines={1}
      >
        {fmt(row.extra_charge)}
      </Text>

      {/* TC (tc_discount) */}
      <Text
        style={[styles.cell, styles.cellRight, { width: COL.tc, color: colors.danger }]}
        numberOfLines={1}
      >
        {fmt(row.tc_discount)}
      </Text>

      {/* BANK */}
      <Text
        style={[styles.cell, styles.cellRight, { width: COL.bank, color: textColor }]}
        numberOfLines={1}
      >
        {fmt(row.bank_received)}
      </Text>

      {/* CASH */}
      <Text
        style={[styles.cell, styles.cellRight, { width: COL.cash, color: textColor }]}
        numberOfLines={1}
      >
        {fmt(row.cash_received)}
      </Text>

      {/* DUE */}
      <Text
        style={[
          styles.cell,
          styles.cellRight,
          { width: COL.due, color: row.due > 0 ? colors.danger : textColor, fontWeight: row.due > 0 ? "700" : "400" },
        ]}
        numberOfLines={1}
      >
        {fmt(row.due)}
      </Text>

      {/* REFUND */}
      <Text
        style={[
          styles.cell,
          styles.cellRight,
          styles.cellLast,
          { width: COL.refund, color: row.refund > 0 ? "#1E9E5A" : textColor, fontWeight: row.refund > 0 ? "700" : "400" },
        ]}
        numberOfLines={1}
      >
        {fmt(row.refund)}
      </Text>
    </View>
  );
});

// ── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  row: {
    flexDirection:    "row",
    alignItems:       "center",
    borderBottomWidth: 1,
    minHeight:        40,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  cell: {
    fontSize:         12,
    paddingVertical:  8,
    paddingHorizontal: 4,
  },
  cellCenter: {
    textAlign: "center",
  },
  cellRight: {
    textAlign: "right",
  },
  cellLast: {
    paddingRight: 8,
  },
});
