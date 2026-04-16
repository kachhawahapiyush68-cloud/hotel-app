// ============================================================
// src/modules/bill/BillListScreen.tsx
// ============================================================

import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import {
  useNavigation,
  useIsFocused,
  useRoute,
  RouteProp,
} from "@react-navigation/native";
import {
  Bill,
  normalizePaymentStatus,
  getPaymentStatusLabel,
  getPaymentStatusColor,
} from "./types";
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
type PaymentFilter = "All" | "Unpaid" | "Partial" | "Paid" | "Refund";
type RouteProps = RouteProp<RootStackParamList, "BillList">;

const BILL_TYPE_FILTERS: BillTypeFilter[] = ["All", "Restaurant", "Room"];
const PAYMENT_FILTERS: PaymentFilter[] = [
  "All",
  "Unpaid",
  "Partial",
  "Paid",
  "Refund",
];

const PILL_LABEL: Record<PaymentFilter, string> = {
  All: "All",
  Unpaid: "Unpaid",
  Partial: "Partial",
  Paid: "Paid",
  Refund: "Refund",
};

const BillListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProps>();
  const isFocused = useIsFocused();
  const { theme } = useThemeStore();
  const colors = theme.colors;

  const [data, setData] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [typeFilter, setTypeFilter] = useState<BillTypeFilter>("All");
  const [payFilter, setPayFilter] = useState<PaymentFilter>("All");

  useEffect(() => {
    if (route.params?.bill_type) {
      setTypeFilter(route.params.bill_type as BillTypeFilter);
    }

    if (route.params?.payment_status) {
      const ps = normalizePaymentStatus(route.params.payment_status as string);
      if (PAYMENT_FILTERS.includes(ps as PaymentFilter)) {
        setPayFilter(ps as PaymentFilter);
      }
    }
  }, [route.params?.bill_type, route.params?.payment_status]);

  const load = useCallback(async () => {
    try {
      setLoading(true);

      const billType = typeFilter === "All" ? undefined : typeFilter;
      const res = await fetchBillList(billType);

      let rows = Array.isArray(res) ? res : [];
      if (payFilter !== "All") {
        rows = rows.filter(
          (b) => normalizePaymentStatus(b.payment_status) === payFilter
        );
      }

      setData(rows);
    } catch (e: any) {
      setData([]);
      Alert.alert(
        "Error",
        e?.response?.data?.message || e?.message || "Failed to load bills"
      );
    } finally {
      setLoading(false);
    }
  }, [typeFilter, payFilter]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  useEffect(() => {
    if (isFocused) load();
  }, [isFocused, load]);

  const renderItem = ({ item }: { item: Bill }) => {
    const status = normalizePaymentStatus(item.payment_status);
    const statusLabel = getPaymentStatusLabel(status);
    const statusColor = getPaymentStatusColor(status);

    const guestName = [item.first_name, item.last_name]
      .filter(Boolean)
      .join(" ")
      .trim();

    return (
      <TouchableOpacity
        activeOpacity={0.88}
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
        onPress={() => navigation.navigate("BillDetail", { billId: item.bill_id })}
      >
        <View style={styles.topRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.billNo, { color: colors.text }]}>
              {item.bill_no}
            </Text>
            <Text style={[styles.dateText, { color: colors.textSecondary }]}>
              {item.bill_datetime ? formatDateTime(item.bill_datetime) : "No date"}
            </Text>
          </View>

          <View style={[styles.badge, { backgroundColor: `${statusColor}18` }]}>
            <Text style={[styles.badgeText, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>
        </View>

        <Text style={[styles.metaText, { color: colors.textSecondary }]}>
          Type: {item.bill_type}
        </Text>

        {item.room_no ? (
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            Room: {item.room_no}
          </Text>
        ) : null}

        {item.folio_no ? (
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            Folio: {item.folio_no}
          </Text>
        ) : null}

        {guestName ? (
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            Guest: {guestName}
          </Text>
        ) : null}

        <Text style={[styles.netAmount, { color: colors.primary }]}>
          ₹ {formatNumber(item.net_amount || 0, 2)}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing && data.length === 0) return <Loader />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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

      <View style={styles.filterRow}>
        {BILL_TYPE_FILTERS.map((f) => (
          <Pill
            key={f}
            label={f}
            active={typeFilter === f}
            onPress={() => setTypeFilter(f)}
          />
        ))}
      </View>

      <View style={styles.filterRow}>
        {PAYMENT_FILTERS.map((f) => (
          <Pill
            key={f}
            label={PILL_LABEL[f]}
            active={payFilter === f}
            onPress={() => setPayFilter(f)}
          />
        ))}
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
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No bills found
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
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
    marginBottom: 10,
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
  billNo: { fontSize: 16, fontWeight: "700" },
  dateText: { marginTop: 3, fontSize: 12 },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: { fontSize: 12, fontWeight: "700" },
  metaText: { fontSize: 13, marginBottom: 3 },
  netAmount: { marginTop: 8, fontSize: 17, fontWeight: "700" },
  emptyCard: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", marginBottom: 6 },
  emptySubtitle: { fontSize: 13, textAlign: "center" },
});

export default BillListScreen;