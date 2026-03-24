// src/modules/dashboard/DashboardScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useThemeStore } from "../../store/themeStore";
import { useAuthStore } from "../../store/authStore";
import { formatCurrency } from "../../shared/utils/number";
import { useBookingStore } from "../booking/store";
import { isSameDate } from "../../shared/utils/date";
import { InfoCard } from "./components/InfoCard";
import { StatCard } from "./components/StatCard";

type DashboardSummary = {
  arrivals: number;
  departures: number;
  inHouse: number;
  todayRevenue: number;
  availableRooms: number;
  soldRooms: number;
  occupancy: number;
};

const DashboardScreen: React.FC = () => {
  const { theme, mode, toggleTheme } = useThemeStore();
  const { user, logout } = useAuthStore();
  const { items: bookings, fetch: fetchBookings, loading: loadingBookings } =
    useBookingStore();

  const [summary, setSummary] = useState<DashboardSummary>({
    arrivals: 0,
    departures: 0,
    inHouse: 0,
    todayRevenue: 0,
    availableRooms: 0,
    soldRooms: 0,
    occupancy: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  const computeFromBookings = () => {
    const today = new Date();

    const arrivals = bookings.filter((b) =>
      isSameDate(new Date(b.check_in_datetime), today)
    ).length;

    const departures = bookings.filter((b) =>
      isSameDate(new Date(b.check_out_datetime), today)
    ).length;

    const inHouse = bookings.filter(
      (b) => b.status === "CheckedIn" || b.status === "Confirmed"
    ).length;

    const totalRooms = 40;
    const soldRooms = inHouse;
    const availableRooms = Math.max(totalRooms - soldRooms, 0);
    const occupancy =
      totalRooms > 0 ? (soldRooms / totalRooms) * 100 : 0;

    setSummary({
      arrivals,
      departures,
      inHouse,
      todayRevenue: 0,
      availableRooms,
      soldRooms,
      occupancy,
    });
  };

  useEffect(() => {
    (async () => {
      await fetchBookings();
      computeFromBookings();
    })();
  }, []);

  useEffect(() => {
    computeFromBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBookings();
    computeFromBookings();
    setRefreshing(false);
  };

  const colors = theme.colors;
  const loading = loadingBookings;
  const now = new Date();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.timeText, { color: colors.textSecondary }]}>
            {now.toTimeString().slice(0, 5)}
          </Text>
          <Text style={[styles.userName, { color: colors.text }]}>
            {user?.fullname || user?.username}
          </Text>
        </View>

        <View style={styles.headerRight}>
          {/* Theme toggle pill */}
          <TouchableOpacity
            onPress={toggleTheme}
            activeOpacity={0.8}
            style={[
              styles.themeToggle,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View
              style={[
                styles.themeToggleThumb,
                {
                  backgroundColor: colors.primary,
                  alignSelf: mode === "dark" ? "flex-start" : "flex-end",
                },
              ]}
            />
            <Text
              style={[
                styles.themeToggleText,
                { color: colors.textSecondary },
              ]}
            >
              {mode === "dark" ? "Dark" : "Light"}
            </Text>
          </TouchableOpacity>

          {/* Cool logout button */}
          <TouchableOpacity
            onPress={logout}
            activeOpacity={0.85}
            style={[
              styles.logoutButton,
              { borderColor: colors.border, backgroundColor: colors.surface },
            ]}
          >
            <Text style={[styles.logoutIcon, { color: colors.danger || "#f87171" }]}>
              ⎋
            </Text>
            <Text
              style={[
                styles.logoutText,
                { color: colors.textSecondary },
              ]}
            >
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Property Overview */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Property Overview
          </Text>
          <Text
            style={[styles.sectionSubtitle, { color: colors.textSecondary }]}
          >
            Live status of your hotel today
          </Text>

          <View style={styles.todayRow}>
            <InfoCard
              title="Arrivals"
              value={summary.arrivals}
              subtitle="Guests expected today"
              color={colors.primary}
            />
            <InfoCard
              title="Departures"
              value={summary.departures}
              subtitle="Guests checking out"
              color={colors.primary}
            />
          </View>

          <View style={styles.todayRow}>
            <InfoCard
              title="In-House"
              value={summary.inHouse}
              subtitle="Current occupied rooms"
              color={colors.primary}
            />
            <InfoCard
              title="Today Revenue"
              valueText={formatCurrency(summary.todayRevenue)}
              subtitle="Live"
              pillText="Live"
              pillColor={colors.primarySoft}
              color={colors.primary}
            />
          </View>
        </View>

        {/* Inventory */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Inventory
          </Text>

          <View
            style={[
              styles.inventoryCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.inventoryRow}>
              <StatCard
                label="Available Rooms"
                value={summary.availableRooms}
              />
              <StatCard label="Sold Rooms" value={summary.soldRooms} />
            </View>

            <View style={styles.occupancyRow}>
              <View style={styles.occupancyBarBackground}>
                <View
                  style={[
                    styles.occupancyBarFill,
                    {
                      backgroundColor: colors.primary,
                      width: `${Math.min(
                        Math.max(summary.occupancy, 0),
                        100
                      )}%`,
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.occupancyText,
                  { color: colors.textSecondary },
                ]}
              >
                Occupancy: {summary.occupancy.toFixed(0)}%
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {loading && (
        <View style={styles.loaderOverlay}>
          <Text style={{ color: colors.textSecondary }}>Loading...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    fontSize: 14,
    marginBottom: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
  },
  themeToggle: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
  },
  themeToggleThumb: {
    width: 16,
    height: 16,
    borderRadius: 999,
    marginRight: 6,
  },
  themeToggleText: {
    fontSize: 12,
    fontWeight: "500",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  logoutIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: "500",
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 13,
    marginBottom: 12,
  },
  todayRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  inventoryCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginTop: 8,
  },
  inventoryRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  occupancyRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  occupancyBarBackground: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#1F2933",
    overflow: "hidden",
    marginRight: 8,
  },
  occupancyBarFill: {
    height: "100%",
    borderRadius: 999,
  },
  occupancyText: {
    fontSize: 12,
  },
  loaderOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default DashboardScreen;
