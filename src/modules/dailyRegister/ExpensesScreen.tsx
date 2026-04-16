// ============================================================
// src/modules/dailyRegister/ExpensesScreen.tsx
//
// Tab 3 — Full screen showing expense table.
// Pull-to-refresh supported.
// ============================================================

import React from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  RefreshControl,
} from "react-native";

import { DailyRegisterResponse, displayDate } from "./api";
import { ExpenseTable } from "./components/ExpenseTable";
import { useThemeStore } from "../../store/themeStore";

// ── Props ─────────────────────────────────────────────────────
interface Props {
  data:       DailyRegisterResponse;
  date:       string;
  refreshing: boolean;
  onRefresh:  () => void;
}

// ── Screen ────────────────────────────────────────────────────
export const ExpensesScreen: React.FC<Props> = ({
  data,
  date,
  refreshing,
  onRefresh,
}) => {
  const { theme } = useThemeStore();
  const colors    = theme.colors;

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
      <ExpenseTable
        expenses={data.expenses}
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
    paddingTop:    16,
    paddingBottom: 16,
  },
});
