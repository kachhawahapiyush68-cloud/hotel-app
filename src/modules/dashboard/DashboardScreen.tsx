// src/modules/dashboard/DashboardScreen.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useThemeStore } from "../../store/themeStore";
import { useAuthStore } from "../../store/authStore";
import { formatCurrency } from "../../shared/utils/number";
import { InfoCard } from "./components/InfoCard";
import { StatCard } from "./components/StatCard";
import { SummaryRow } from "./components/SummaryRow";
import AppButton from "../../shared/components/AppButton";
import { bookingApi, Booking } from "../../api/bookingApi";
import { kotApi } from "../../api/kotApi";
import { billApi } from "../../api/billApi";
import { roomApi, Room } from "../../api/roomApi";

type DashboardSummary = {
  arrivals: number;
  departures: number;
  inHouse: number;
  todayRevenue: number;
  totalRooms: number;
  availableRooms: number;
  soldRooms: number;
  occupancy: number;
  openKots: number;
  openRestaurantBills: number;
};

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme, mode, toggleTheme } = useThemeStore();
  const { user, logout } = useAuthStore();

  const [todayArrivals, setTodayArrivals] = useState<Booking[]>([]);
  const [todayDepartures, setTodayDepartures] = useState<Booking[]>([]);
  const [summary, setSummary] = useState<DashboardSummary>({
    arrivals: 0,
    departures: 0,
    inHouse: 0,
    todayRevenue: 0,
    totalRooms: 0,
    availableRooms: 0,
    soldRooms: 0,
    occupancy: 0,
    openKots: 0,
    openRestaurantBills: 0,
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const colors = theme.colors;
  const now = new Date();

  const getGuestName = (b: Booking) =>
    `${b.first_name || ""} ${b.last_name || ""}`.trim() || "Guest";

  const getTodayDate = () => new Date().toISOString().slice(0, 10);

  const getBillAmount = (bill: any): number => {
    const possibleFields = [
      bill?.grand_total,
      bill?.total_amount,
      bill?.net_amount,
      bill?.bill_amount,
      bill?.amount,
      bill?.total,
    ];

    const found = possibleFields.find(
      (v) => v !== undefined && v !== null && !Number.isNaN(Number(v))
    );

    return found !== undefined ? Number(found) : 0;
  };

  const loadDashboard = useCallback(async () => {
    const today = getTodayDate();

    try {
      setLoading(true);

      const [
        arrivalsRes,
        departuresRes,
        reservationsRes,
        roomsRes,
        openKotsRes,
        restaurantBillsRes,
      ] = await Promise.all([
        bookingApi.arrivals({ date: today }),
        bookingApi.departures({ date: today }),
        bookingApi.list(),
        roomApi.list(),
        kotApi.getKots({ status: "Open" }),
        billApi.getBills({
          bill_type: "Restaurant",
          payment_status: "Unpaid",
        } as any),
      ]);

      const arrivals = Array.isArray(arrivalsRes) ? arrivalsRes : [];
      const departures = Array.isArray(departuresRes) ? departuresRes : [];
      const bookings = Array.isArray(reservationsRes) ? reservationsRes : [];
      const rooms = Array.isArray(roomsRes) ? roomsRes : [];
      const openKots = Array.isArray(openKotsRes) ? openKotsRes : [];
      const restaurantBills = Array.isArray(restaurantBillsRes)
        ? restaurantBillsRes
        : [];

      const activeRooms: Room[] = rooms.filter(
        (r) => Number(r.is_deleted || 0) === 0 && Number(r.is_active || 0) === 1
      );

      const totalRooms = activeRooms.length;

      const occupiedRooms = activeRooms.filter(
        (r) => r.status === "Occupied"
      ).length;

      const availableRooms = activeRooms.filter(
        (r) => r.status === "Available"
      ).length;

      const fallbackSoldRooms = bookings.filter(
        (b) => b.status === "CheckedIn"
      ).length;

      const soldRooms = occupiedRooms || fallbackSoldRooms;

      const finalAvailableRooms =
        totalRooms > 0 ? Math.max(totalRooms - soldRooms, 0) : availableRooms;

      const occupancy =
        totalRooms > 0 ? (soldRooms / totalRooms) * 100 : 0;

      const inHouse = bookings.filter((b) => b.status === "CheckedIn").length;

      const todayRevenue = restaurantBills.reduce(
        (sum, bill) => sum + getBillAmount(bill),
        0
      );

      setTodayArrivals(arrivals);
      setTodayDepartures(departures);

      setSummary({
        arrivals: arrivals.length,
        departures: departures.length,
        inHouse,
        todayRevenue,
        totalRooms,
        availableRooms: finalAvailableRooms,
        soldRooms,
        occupancy,
        openKots: openKots.length,
        openRestaurantBills: restaurantBills.length,
      });
    } catch (error) {
      setTodayArrivals([]);
      setTodayDepartures([]);
      setSummary((prev) => ({
        ...prev,
        arrivals: 0,
        departures: 0,
        inHouse: 0,
        todayRevenue: 0,
        totalRooms: 0,
        availableRooms: 0,
        soldRooms: 0,
        occupancy: 0,
        openKots: 0,
        openRestaurantBills: 0,
      }));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  const todayRevenueText = useMemo(
    () => formatCurrency(summary.todayRevenue),
    [summary.todayRevenue]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.timeText, { color: colors.textSecondary }]}>
            {now.toTimeString().slice(0, 5)}
          </Text>
          <Text style={[styles.userName, { color: colors.text }]}>
            {user?.fullname || user?.username}
          </Text>
          <Text
            style={[styles.propertySubtitle, { color: colors.textSecondary }]}
          >
            Front desk overview
          </Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={toggleTheme}
            activeOpacity={0.8}
            style={[
              styles.themeToggle,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
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

          <TouchableOpacity
            onPress={logout}
            activeOpacity={0.85}
            style={[
              styles.logoutButton,
              {
                borderColor: colors.border,
                backgroundColor: colors.surface,
              },
            ]}
          >
            <Text
              style={[
                styles.logoutIcon,
                { color: colors.danger || "#f87171" },
              ]}
            >
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
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Property Overview
          </Text>
          <Text
            style={[styles.sectionSubtitle, { color: colors.textSecondary }]}
          >
            Today’s arrivals, departures, and in-house status
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
              subtitle="Currently checked-in"
              color={colors.primary}
            />
            <InfoCard
              title="Today Revenue"
              valueText={todayRevenueText}
              subtitle="Restaurant unpaid total"
              pillText="Live"
              pillColor={colors.primarySoft}
              color={colors.primary}
            />
          </View>
        </View>

        <View style={styles.section}>
          <SummaryRow
            left={
              <>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Inventory
                </Text>
                <Text
                  style={[
                    styles.sectionSubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  Rooms available vs sold today
                </Text>
              </>
            }
            right={
              <Text
                style={[
                  styles.sectionSubtitleSmall,
                  { color: colors.textSecondary },
                ]}
              >
                Total rooms: {summary.totalRooms}
              </Text>
            }
          />

          <View
            style={[
              styles.inventoryCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
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

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            FO & KOT Operations
          </Text>
          <Text
            style={[styles.sectionSubtitle, { color: colors.textSecondary }]}
          >
            Restaurant and billing tasks needing attention
          </Text>

          <View style={styles.todayRow}>
            <TouchableOpacity
              activeOpacity={0.9}
              style={{ flex: 1 }}
              onPress={() =>
                navigation.navigate("KOTList", {
                  status: "Open",
                })
              }
            >
              <InfoCard
                title="Open KOTs"
                value={summary.openKots}
                subtitle="Pending to bill"
                color={colors.primary}
                pillText={summary.openKots > 0 ? "Open List" : undefined}
                pillColor={colors.primarySoft}
              />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              style={{ flex: 1 }}
              onPress={() =>
                navigation.navigate("BillList", {
                  bill_type: "Restaurant",
                  payment_status: "Unpaid",
                })
              }
            >
              <InfoCard
                title="Open Restaurant Bills"
                value={summary.openRestaurantBills}
                subtitle="Unpaid restaurant bills"
                color={colors.primary}
                pillText={
                  summary.openRestaurantBills > 0 ? "Review Bills" : undefined
                }
                pillColor={colors.primarySoft}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Today’s Check-ins
          </Text>
          <Text
            style={[styles.sectionSubtitle, { color: colors.textSecondary }]}
          >
            Expected arrivals for today
          </Text>

          <View
            style={[
              styles.listCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            {todayArrivals.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No arrivals scheduled today.
              </Text>
            ) : (
              todayArrivals.slice(0, 5).map((item) => (
                <TouchableOpacity
                  key={String(item.booking_id)}
                  style={styles.listItem}
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.navigate("QuickReservation", {
                      bookingId: item.booking_id,
                    })
                  }
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.listTitle, { color: colors.text }]}>
                      {getGuestName(item)}
                    </Text>
                    <Text
                      style={[
                        styles.listSubtitle,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Room: {item.room_no || item.room_id} • Res:{" "}
                      {item.reservation_no || "-"}
                    </Text>
                  </View>
                  <Text
                    style={[styles.listBadge, { color: colors.primary }]}
                  >
                    Open
                  </Text>
                </TouchableOpacity>
              ))
            )}

            {todayArrivals.length > 0 ? (
              <AppButton
                title="View All Arrivals"
                size="small"
                onPress={() => navigation.navigate("ArrivalList")}
              />
            ) : null}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Today’s Check-outs
          </Text>
          <Text
            style={[styles.sectionSubtitle, { color: colors.textSecondary }]}
          >
            Departures and pending departures for today
          </Text>

          <View
            style={[
              styles.listCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            {todayDepartures.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No departures scheduled today.
              </Text>
            ) : (
              todayDepartures.slice(0, 5).map((item) => (
                <TouchableOpacity
                  key={String(item.booking_id)}
                  style={styles.listItem}
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.navigate("QuickReservation", {
                      bookingId: item.booking_id,
                    })
                  }
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.listTitle, { color: colors.text }]}>
                      {getGuestName(item)}
                    </Text>
                    <Text
                      style={[
                        styles.listSubtitle,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Room: {item.room_no || item.room_id} • Res:{" "}
                      {item.reservation_no || "-"}
                    </Text>
                  </View>
                  <Text
                    style={[styles.listBadge, { color: colors.primary }]}
                  >
                    Check-out
                  </Text>
                </TouchableOpacity>
              ))
            )}

            {todayDepartures.length > 0 ? (
              <AppButton
                title="View Departures"
                size="small"
                onPress={() => navigation.navigate("BookingList")}
              />
            ) : null}
          </View>
        </View>
      </ScrollView>

      {loading && !refreshing && (
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
    marginBottom: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
  },
  propertySubtitle: {
    fontSize: 12,
    marginTop: 2,
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
  sectionSubtitleSmall: {
    fontSize: 12,
  },
  todayRow: {
    flexDirection: "row",
    marginBottom: 10,
    gap: 10,
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
    gap: 10,
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
  listCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#9993",
  },
  listTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  listSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  listBadge: {
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 10,
  },
  emptyText: {
    fontSize: 13,
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