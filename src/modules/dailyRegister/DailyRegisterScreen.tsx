// ============================================================
// src/modules/dailyRegister/DailyRegisterScreen.tsx
//
// Main container screen — shared date picker + 3 tab sub-screens:
//   Tab 1: Register  (room collection table)
//   Tab 2: Summary   (daily summary block)
//   Tab 3: Expenses  (expense table)
// ============================================================

import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import {
  dailyRegisterApi,
  DailyRegisterResponse,
  EMPTY_RESPONSE,
  todayIST,
  displayDate,
  normalizeResponse,
} from "./api";
import { RegisterTableScreen } from "./RegisterTableScreen";
import { SummaryScreen }       from "./SummaryScreen";
import { ExpensesScreen }      from "./ExpensesScreen";
import { useThemeStore }       from "../../store/themeStore";

// ── Tab definition ───────────────────────────────────────────

type TabKey = "register" | "summary" | "expenses";

const TABS: { key: TabKey; label: string }[] = [
  { key: "register", label: "Register" },
  { key: "summary",  label: "Summary"  },
  { key: "expenses", label: "Expenses" },
];

// ── Screen ───────────────────────────────────────────────────

export const DailyRegisterScreen: React.FC = () => {
  const { theme }  = useThemeStore();
  const colors     = theme.colors;

  const [date,        setDate]       = useState<string>(todayIST());
  const [showPicker,  setShowPicker] = useState(false);
  const [data,        setData]       = useState<DailyRegisterResponse>(EMPTY_RESPONSE);
  const [loading,     setLoading]    = useState(false);
  const [refreshing,  setRefreshing] = useState(false);
  const [activeTab,   setActiveTab]  = useState<TabKey>("register");

  // ── Fetch ─────────────────────────────────────────────────
  const fetchData = useCallback(
    async (targetDate: string, isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else           setLoading(true);

      try {
        const res = await dailyRegisterApi.get(targetDate);
        setData(normalizeResponse(res));
      } catch (err: any) {
        Alert.alert(
          "Error",
          err?.response?.data?.message ?? err?.message ?? "Failed to load daily register"
        );
        setData(EMPTY_RESPONSE);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useFocusEffect(
    useCallback(() => {
      fetchData(date);
    }, [date, fetchData])
  );

  // ── Date picker ────────────────────────────────────────────
  const onDateChange = (event: DateTimePickerEvent, selected?: Date) => {
    setShowPicker(Platform.OS === "ios");
    if (event.type === "dismissed" || !selected) return;
    const d = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year:  "numeric",
      month: "2-digit",
      day:   "2-digit",
    }).format(selected);
    setDate(d);
  };

  const onRefresh = useCallback(() => {
    fetchData(date, true);
  }, [date, fetchData]);

  // ── Render ─────────────────────────────────────────────────
  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>

      {/* ── Top bar ─────────────────────────────────────────── */}
      <View style={[styles.topBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Daily Register</Text>
        <TouchableOpacity
          style={[styles.dateBtn, { backgroundColor: colors.primary + "18", borderColor: colors.primary }]}
          onPress={() => setShowPicker(true)}
          activeOpacity={0.75}
        >
          <Text style={[styles.dateBtnText, { color: colors.primary }]}>
            {displayDate(date)}
          </Text>
          <Text style={[styles.dateBtnIcon, { color: colors.primary }]}>▾</Text>
        </TouchableOpacity>
      </View>

      {/* ── Date picker modal ───────────────────────────────── */}
      {showPicker && (
        <DateTimePicker
          value={new Date(date + "T00:00:00")}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onDateChange}
          maximumDate={new Date()}
        />
      )}

      {/* ── Tab bar ─────────────────────────────────────────── */}
      <View style={[styles.tabBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabItem,
                active && [styles.tabItemActive, { borderBottomColor: colors.primary }],
              ]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.tabLabel,
                  { color: active ? colors.primary : colors.textSecondary },
                  active && styles.tabLabelActive,
                ]}
              >
                {tab.label}
              </Text>

              {/* Badge: show count on Register tab */}
              {tab.key === "register" && data.rows.length > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.badgeText}>{data.rows.length}</Text>
                </View>
              )}
              {tab.key === "expenses" && data.expenses.length > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.badgeText}>{data.expenses.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Loading overlay ─────────────────────────────────── */}
      {loading ? (
        <View style={[styles.center, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading...
          </Text>
        </View>
      ) : (
        /* ── Active tab screen ──────────────────────────────── */
        <>
          {activeTab === "register" && (
            <RegisterTableScreen
              data={data}
              date={date}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          )}
          {activeTab === "summary" && (
            <SummaryScreen
              data={data}
              date={date}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          )}
          {activeTab === "expenses" && (
            <ExpensesScreen
              data={data}
              date={date}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          )}
        </>
      )}
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen:   { flex: 1 },
  topBar: {
    flexDirection:    "row",
    alignItems:       "center",
    justifyContent:   "space-between",
    paddingHorizontal: 16,
    paddingVertical:  12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize:   17,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  dateBtn: {
    flexDirection:    "row",
    alignItems:       "center",
    borderWidth:      1,
    borderRadius:     8,
    paddingHorizontal: 12,
    paddingVertical:  6,
  },
  dateBtnText: {
    fontSize:   14,
    fontWeight: "700",
    marginRight: 4,
  },
  dateBtnIcon: {
    fontSize: 12,
  },
  tabBar: {
    flexDirection:    "row",
    borderBottomWidth: 1,
  },
  tabItem: {
    flex:             1,
    flexDirection:    "row",
    alignItems:       "center",
    justifyContent:   "center",
    paddingVertical:  12,
    gap:              6,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabItemActive: {
    borderBottomWidth: 2,
  },
  tabLabel: {
    fontSize:   14,
    fontWeight: "600",
  },
  tabLabelActive: {
    fontWeight: "700",
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
  center: {
    flex:           1,
    alignItems:     "center",
    justifyContent: "center",
    gap:            10,
  },
  loadingText: {
    fontSize: 13,
  },
});
