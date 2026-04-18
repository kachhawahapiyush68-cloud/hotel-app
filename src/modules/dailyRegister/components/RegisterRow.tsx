import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";

import { DailyRegisterRow } from "../api";
import { fmt } from "../api";
import { useThemeStore } from "../../../store/themeStore";

export const COL = {
  sr: 36,
  room: 52,
  name: 130,
  mobile: 100,
  pax: 32,
  amt: 60,
  extra: 60,
  tc: 60,
  bank: 60,
  cash: 60,
  due: 60,
  refund: 64,
} as const;

export const TABLE_WIDTH = Object.values(COL).reduce((a, b) => a + b, 0);

interface Props {
  row: DailyRegisterRow;
  isLast: boolean;
}

export const RegisterRow: React.FC<Props> = memo(({ row, isLast }) => {
  const { theme } = useThemeStore();
  const colors = theme.colors;

  let rowBg = colors.surface;
  if (row.booking_status === "CheckedOut") {
    rowBg = "#1E9E5A18";
  } else if (row.due > 0) {
    rowBg = colors.danger + "18";
  }

  const borderColor = colors.border;
  const textColor = colors.text;
  const dimColor = colors.textSecondary;

  return (
    <View
      style={[
        styles.row,
        { backgroundColor: rowBg, borderBottomColor: borderColor },
        isLast && styles.rowLast,
      ]}
    >
      <Text style={[styles.cell, styles.cellCenter, { width: COL.sr, color: dimColor }]} numberOfLines={1}>
        {row.sr_no}
      </Text>

      <Text
        style={[styles.cell, styles.cellCenter, { width: COL.room, color: textColor, fontWeight: "700" }]}
        numberOfLines={1}
      >
        {row.room_no}
      </Text>

      <View style={[styles.nameWrap, { width: COL.name }]}>
        <Text style={[styles.cell, { color: textColor, paddingBottom: row.bill_paid ? 2 : 8 }]} numberOfLines={1}>
          {row.guest_name}
        </Text>
        {row.bill_paid ? (
          <View style={[styles.statusPill, { backgroundColor: "#1E9E5A18", borderColor: "#1E9E5A55" }]}>
            <Text style={[styles.statusPillText, { color: "#1E9E5A" }]}>PAID</Text>
          </View>
        ) : row.folio_status ? (
          <Text style={[styles.subStatus, { color: dimColor }]} numberOfLines={1}>
            {row.folio_status}
          </Text>
        ) : null}
      </View>

      <Text style={[styles.cell, { width: COL.mobile, color: dimColor }]} numberOfLines={1}>
        {row.mobile ?? ""}
      </Text>

      <Text style={[styles.cell, styles.cellCenter, { width: COL.pax, color: dimColor }]} numberOfLines={1}>
        {row.pax > 0 ? row.pax : ""}
      </Text>

      <Text style={[styles.cell, styles.cellRight, { width: COL.amt, color: textColor }]} numberOfLines={1}>
        {fmt(row.room_charge)}
      </Text>

      <Text style={[styles.cell, styles.cellRight, { width: COL.extra, color: textColor }]} numberOfLines={1}>
        {fmt(row.extra_charge)}
      </Text>

      <Text style={[styles.cell, styles.cellRight, { width: COL.tc, color: colors.danger }]} numberOfLines={1}>
        {fmt(row.tc_discount)}
      </Text>

      <Text style={[styles.cell, styles.cellRight, { width: COL.bank, color: textColor }]} numberOfLines={1}>
        {fmt(row.bank_received)}
      </Text>

      <Text style={[styles.cell, styles.cellRight, { width: COL.cash, color: textColor }]} numberOfLines={1}>
        {fmt(row.cash_received)}
      </Text>

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

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    minHeight: 44,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  cell: {
    fontSize: 12,
    paddingVertical: 8,
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
  nameWrap: {
    justifyContent: "center",
    paddingVertical: 4,
  },
  statusPill: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginLeft: 4,
    marginBottom: 4,
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  subStatus: {
    fontSize: 10,
    marginLeft: 4,
    marginBottom: 4,
  },
});