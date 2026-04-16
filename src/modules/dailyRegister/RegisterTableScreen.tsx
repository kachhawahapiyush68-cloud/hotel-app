// ============================================================
// src/modules/dailyRegister/RegisterTableScreen.tsx
//
// Tab 1 — Horizontal scroll table of room collection register.
// Receives data, date, refreshing, onRefresh from parent.
// ============================================================

import React, { useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
} from "react-native";

import { DailyRegisterResponse, fmt, fmtAlways, displayDate } from "./api";
import { RegisterRow, COL, TABLE_WIDTH } from "./components/RegisterRow";
import { useThemeStore } from "../../store/themeStore";

// ── Props ─────────────────────────────────────────────────────
interface Props {
  data:       DailyRegisterResponse;
  date:       string;
  refreshing: boolean;
  onRefresh:  () => void;
}

// ── Column header definition ───────────────────────────────────
const HEADERS: { label: string; width: number; align?: "center" | "right" }[] = [
  { label: "RS NO",     width: COL.sr,     align: "center" },
  { label: "ROOM NO",   width: COL.room,   align: "center" },
  { label: "NAME",      width: COL.name                    },
  { label: "MOBILE NO", width: COL.mobile                  },
  { label: "PAX",       width: COL.pax,    align: "center" },
  { label: "AMT",       width: COL.amt,    align: "right"  },
  { label: "EXTRA",     width: COL.extra,  align: "right"  },
  { label: "TC",        width: COL.tc,     align: "right"  },
  { label: "BANK",      width: COL.bank,   align: "right"  },
  { label: "CASH",      width: COL.cash,   align: "right"  },
  { label: "DUE",       width: COL.due,    align: "right"  },
  { label: "REFUND",    width: COL.refund, align: "right"  },
];

// ── Screen ────────────────────────────────────────────────────
export const RegisterTableScreen: React.FC<Props> = ({
  data,
  date,
  refreshing,
  onRefresh,
}) => {
  const { theme } = useThemeStore();
  const colors    = theme.colors;

  const rows     = data?.rows     ?? [];
  const totals   = data?.totals;
  const isEmpty  = rows.length === 0;

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Table card */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>

        {/* Card title row */}
        <View style={[styles.cardTitle, { borderBottomColor: colors.border }]}>
          <Text style={[styles.cardTitleText, { color: colors.text }]}>
            Register
          </Text>
          <Text style={[styles.cardTitleDate, { color: colors.primary }]}>
            {displayDate(date)}
          </Text>
          {rows.length > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={styles.badgeText}>{rows.length}</Text>
            </View>
          )}
        </View>

        {/* Horizontal scroll for table */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ width: TABLE_WIDTH }}>

            {/* Column headers */}
            <View style={[styles.headerRow, { backgroundColor: colors.primary + "14", borderBottomColor: colors.border }]}>
              {HEADERS.map((h) => (
                <Text
                  key={h.label}
                  style={[
                    styles.headerCell,
                    { width: h.width, color: colors.textSecondary },
                    h.align === "center" && { textAlign: "center" },
                    h.align === "right"  && { textAlign: "right"  },
                    h.label === "REFUND" && { paddingRight: 8 },
                  ]}
                  numberOfLines={1}
                >
                  {h.label}
                </Text>
              ))}
            </View>

            {/* Empty state */}
            {isEmpty ? (
              <View style={[styles.emptyRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No records for {displayDate(date)}
                </Text>
              </View>
            ) : (
              <>
                {/* Data rows */}
                {rows.map((row, idx) => (
                  <RegisterRow
                    key={row.booking_id}
                    row={row}
                    isLast={idx === rows.length - 1}
                  />
                ))}

                {/* Totals footer */}
                {totals && (
                  <View style={[styles.totalRow, { backgroundColor: colors.primary + "10", borderTopColor: colors.border }]}>
                    {/* Span first 5 columns with "TOTAL" label */}
                    <Text
                      style={[
                        styles.totalLabel,
                        { color: colors.primary, width: COL.sr + COL.room + COL.name + COL.mobile + COL.pax },
                      ]}
                    >
                      TOTAL
                    </Text>

                    {/* AMT */}
                    <Text style={[styles.totalCell, styles.totalRight, { width: COL.amt, color: colors.text }]}>
                      {fmtAlways(totals.room_charge)}
                    </Text>

                    {/* EXTRA */}
                    <Text style={[styles.totalCell, styles.totalRight, { width: COL.extra, color: colors.text }]}>
                      {fmtAlways(totals.extra_charge)}
                    </Text>

                    {/* TC */}
                    <Text style={[styles.totalCell, styles.totalRight, { width: COL.tc, color: colors.danger }]}>
                      {fmtAlways(totals.tc_discount)}
                    </Text>

                    {/* BANK */}
                    <Text style={[styles.totalCell, styles.totalRight, { width: COL.bank, color: colors.text }]}>
                      {fmtAlways(totals.bank_received)}
                    </Text>

                    {/* CASH */}
                    <Text style={[styles.totalCell, styles.totalRight, { width: COL.cash, color: colors.text }]}>
                      {fmtAlways(totals.cash_received)}
                    </Text>

                    {/* DUE */}
                    <Text style={[styles.totalCell, styles.totalRight, { width: COL.due, color: colors.danger }]}>
                      {fmtAlways(totals.due)}
                    </Text>

                    {/* REFUND */}
                    <Text style={[styles.totalCell, styles.totalRight, { width: COL.refund, color: "#1E9E5A", paddingRight: 8 }]}>
                      {fmtAlways(totals.refund)}
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        </ScrollView>
      </View>

      {/* Bottom padding */}
      <View style={{ height: 24 }} />
    </ScrollView>
  );
};

// ── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  contentContainer: {
    paddingTop:    12,
    paddingBottom: 16,
  },
  card: {
    borderRadius:     12,
    borderWidth:      1,
    marginHorizontal: 12,
    overflow:         "hidden",
  },
  cardTitle: {
    flexDirection:    "row",
    alignItems:       "center",
    paddingHorizontal: 16,
    paddingVertical:  12,
    borderBottomWidth: 1,
    gap:              8,
  },
  cardTitleText: {
    fontSize:   15,
    fontWeight: "700",
    flex:       1,
    letterSpacing: 0.2,
  },
  cardTitleDate: {
    fontSize:   13,
    fontWeight: "600",
  },
  badge: {
    borderRadius:     999,
    paddingHorizontal: 6,
    paddingVertical:  1,
    minWidth:         20,
    alignItems:       "center",
  },
  badgeText: {
    fontSize:   10,
    fontWeight: "700",
    color:      "#fff",
  },
  headerRow: {
    flexDirection:    "row",
    alignItems:       "center",
    borderBottomWidth: 1,
  },
  headerCell: {
    fontSize:         10,
    fontWeight:       "700",
    textTransform:    "uppercase",
    letterSpacing:    0.4,
    paddingVertical:  8,
    paddingHorizontal: 4,
  },
  emptyRow: {
    paddingVertical:  40,
    alignItems:       "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  emptyText: {
    fontSize: 13,
  },
  totalRow: {
    flexDirection:    "row",
    alignItems:       "center",
    borderTopWidth:   1,
    minHeight:        40,
  },
  totalLabel: {
    fontSize:   11,
    fontWeight: "800",
    letterSpacing: 0.5,
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  totalCell: {
    fontSize:   12,
    fontWeight: "700",
    paddingVertical:  8,
    paddingHorizontal: 4,
  },
  totalRight: {
    textAlign: "right",
  },
});
