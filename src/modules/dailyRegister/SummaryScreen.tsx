// ============================================================
// src/modules/dailyRegister/SummaryScreen.tsx
//
// Tab 2 — Full screen showing daily summary block.
// Pull-to-refresh supported.
// ============================================================

import React from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  RefreshControl,
  Text,
} from "react-native";

import { DailyRegisterResponse, displayDate, fmtAlways } from "./api";
import { SummaryBlock } from "./components/SummaryBlock";
import { useThemeStore } from "../../store/themeStore";

// ── Props ─────────────────────────────────────────────────────
interface Props {
  data: DailyRegisterResponse;
  date: string;
  refreshing: boolean;
  onRefresh: () => void;
}

// ── Screen ────────────────────────────────────────────────────
export const SummaryScreen: React.FC<Props> = ({
  data,
  date,
  refreshing,
  onRefresh,
}) => {
  const { theme } = useThemeStore();
  const colors = theme.colors;

  const summary = data?.summary;
  const hasBankOpening =
    typeof summary?.bank_op_bal === "number" && !Number.isNaN(summary.bank_op_bal);

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      {/* Top mini stats */}
      <View style={styles.statsRow}>
        <View
          style={[
            styles.statCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Cash Opening
          </Text>
          <Text style={[styles.statValue, { color: colors.text }]}>
            ₹ {fmtAlways(summary?.op_bal)}
          </Text>
        </View>

        <View
          style={[
            styles.statCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Expenses
          </Text>
          <Text style={[styles.statValue, { color: colors.danger }]}>
            ₹ {fmtAlways(summary?.exp)}
          </Text>
        </View>
      </View>

      {hasBankOpening && (
        <View style={styles.statsRowSingle}>
          <View
            style={[
              styles.statCardWide,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Bank Opening
            </Text>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              ₹ {fmtAlways(summary?.bank_op_bal)}
            </Text>
          </View>
        </View>
      )}

      {/* Main summary block */}
      <SummaryBlock
        summary={summary}
        date={displayDate(date)}
      />

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
    paddingTop: 16,
    paddingBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  statsRowSingle: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  statCardWide: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
  },
});