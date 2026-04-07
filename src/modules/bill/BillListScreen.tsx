// src/modules/bill/BillListScreen.tsx
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import {
  useNavigation,
  useIsFocused,
  useRoute,
  RouteProp,
} from "@react-navigation/native";
import { Bill, toUiBillPaymentStatus } from "./types";
import { fetchBillList } from "./api";
import Loader from "../../shared/components/Loader";
import SectionTitle from "../../shared/components/SectionTitle";
import Pill from "../../shared/components/Pill";
import AppButton from "../../shared/components/AppButton";
import { formatDateTime } from "../../shared/utils/date";
import { formatNumber } from "../../shared/utils/number";
import { useThemeStore } from "../../store/themeStore";
import { RootStackParamList } from "../../navigation/RootNavigator";

type BillTypeFilter = "All" | "Restaurant" | "Room";
type RouteProps = RouteProp<RootStackParamList, "BillList">;

const getPaymentColor = (status: string | undefined) => {
  switch (status) {
    case "Paid":
      return "#1E9E5A";
    case "PartiallyPaid":
      return "#D98E04";
    case "Unpaid":
    default:
      return "#D64545";
  }
};

const BillListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProps>();
  const isFocused = useIsFocused();
  const { theme } = useThemeStore();

  const [data, setData] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<BillTypeFilter>("All");
  const [paymentFilter, setPaymentFilter] = useState<
    "All" | "Unpaid" | "PartiallyPaid" | "Paid"
  >("All");

  // Initialize from deep link params (dashboard)
  useEffect(() => {
    if (route.params?.bill_type) {
      setFilter(route.params.bill_type as BillTypeFilter);
    }
    if (route.params?.payment_status) {
      setPaymentFilter(route.params.payment_status as any);
    }
  }, [route.params?.bill_type, route.params?.payment_status]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const billType = filter === "All" ? undefined : filter;
      const res = await fetchBillList(billType);
      let rows = res;

      if (paymentFilter !== "All") {
        rows = rows.filter(
          (b) => toUiBillPaymentStatus(b.payment_status) === paymentFilter
        );
      }

      setData(rows);
    } finally {
      setLoading(false);
    }
  }, [filter, paymentFilter]);

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  useEffect(() => {
    if (isFocused) {
      load();
    }
  }, [isFocused, load]);

  const renderItem = ({ item }: { item: Bill }) => {
    const paymentStatus = toUiBillPaymentStatus(item.payment_status);
    const paymentColor = getPaymentColor(paymentStatus);
    const guestName =
      item.first_name || item.last_name
        ? `${item.first_name || ""} ${item.last_name || ""}`.trim()
        : "";

    return (
      <TouchableOpacity
        activeOpacity={0.88}
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
        onPress={() =>
          navigation.navigate("BillDetail", { billId: item.bill_id })
        }
      >
        <View style={styles.topRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.billNo, { color: theme.colors.text }]}>
              {item.bill_no}
            </Text>
            <Text
              style={[
                styles.dateText,
                { color: theme.colors.textSecondary },
              ]}
            >
              {item.bill_datetime
                ? formatDateTime(item.bill_datetime)
                : "No date"}
            </Text>
          </View>

          <View
            style={[
              styles.badge,
              { backgroundColor: `${paymentColor}18` },
            ]}
          >
            <Text style={[styles.badgeText, { color: paymentColor }]}>
              {paymentStatus}
            </Text>
          </View>
        </View>

        <Text
          style={[styles.metaText, { color: theme.colors.textSecondary }]}
        >
          Type: {item.bill_type}
        </Text>

        {item.room_no ? (
          <Text
            style={[styles.metaText, { color: theme.colors.textSecondary }]}
          >
            Room: {item.room_no}
          </Text>
        ) : null}

        {item.folio_no ? (
          <Text
            style={[styles.metaText, { color: theme.colors.textSecondary }]}
          >
            Folio: {item.folio_no}
          </Text>
        ) : null}

        {guestName ? (
          <Text
            style={[styles.metaText, { color: theme.colors.textSecondary }]}
          >
            Guest: {guestName}
          </Text>
        ) : null}

        <Text style={[styles.totalText, { color: theme.colors.primary }]}>
          ₹ {formatNumber(item.net_amount || 0, 2)}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing && data.length === 0) {
    return <Loader />;
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <SectionTitle
        title="Bills"
        subtitle={`${data.length} bill${data.length === 1 ? "" : "s"}`}
        rightContent={
          <AppButton
            title="From KOT"
            size="small"
            onPress={() => navigation.navigate("BillFromKot")}
          />
        }
      />

      {/* Type filter */}
      <View style={styles.filterRow}>
        {(["All", "Restaurant", "Room"] as BillTypeFilter[]).map(
          (item) => (
            <Pill
              key={item}
              label={item}
              active={filter === item}
              onPress={() => setFilter(item)}
            />
          )
        )}
      </View>

      {/* Payment filter */}
      <View style={styles.filterRow}>
        {(["All", "Unpaid", "PartiallyPaid", "Paid"] as const).map(
          (status) => (
            <Pill
              key={status}
              label={status}
              active={paymentFilter === status}
              onPress={() => setPaymentFilter(status)}
            />
          )
        )}
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => String(item.bill_id)}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          !loading ? (
            <View
              style={[
                styles.emptyCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text
                style={[styles.emptyTitle, { color: theme.colors.text }]}
              >
                No bills found
              </Text>
              <Text
                style={[
                  styles.emptySubtitle,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Generate bill from KOT or room stay
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={{
          paddingBottom: 24,
          flexGrow: data.length === 0 ? 1 : undefined,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  billNo: {
    fontSize: 16,
    fontWeight: "700",
  },
  dateText: {
    marginTop: 4,
    fontSize: 12,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  metaText: {
    fontSize: 13,
    marginBottom: 4,
  },
  totalText: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "700",
  },
  emptyCard: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: "center",
  },
});

export default BillListScreen;