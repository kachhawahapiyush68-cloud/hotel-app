import React, { useCallback, useEffect, useMemo, useState } from "react";
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

function getApiErrorMessage(e: any, fallback: string) {
  return (
    e?.response?.data?.message ||
    e?.response?.data?.error ||
    e?.message ||
    fallback
  );
}

function normalizeBillTypeFilter(value?: string | null): BillTypeFilter {
  const v = String(value || "").trim().toUpperCase();

  if (v === "RESTAURANT") return "Restaurant";
  if (v === "ROOM") return "Room";
  return "All";
}

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
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const nextType = normalizeBillTypeFilter(route.params?.bill_type);
    setTypeFilter(nextType);

    if (route.params?.payment_status) {
      const ps = normalizePaymentStatus(String(route.params.payment_status));
      if (PAYMENT_FILTERS.includes(ps as PaymentFilter)) {
        setPayFilter(ps as PaymentFilter);
      } else {
        setPayFilter("All");
      }
    }
  }, [route.params?.bill_type, route.params?.payment_status]);

  const load = useCallback(
    async (isPullRefresh = false) => {
      try {
        if (isPullRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setLoadError("");

        const billType = typeFilter === "All" ? undefined : typeFilter;
        const res = await fetchBillList(billType);

        let rows = Array.isArray(res) ? res : [];

        if (payFilter !== "All") {
          rows = rows.filter(
            (b) => normalizePaymentStatus(b.payment_status) === payFilter
          );
        }

        rows = rows.sort((a, b) => {
          const aDate = new Date(a.bill_datetime || a.created_at || 0).getTime();
          const bDate = new Date(b.bill_datetime || b.created_at || 0).getTime();
          return bDate - aDate;
        });

        setData(rows);
      } catch (e: any) {
        setData([]);
        setLoadError(getApiErrorMessage(e, "Failed to load bills"));

        if (!isPullRefresh) {
          Alert.alert("Error", getApiErrorMessage(e, "Failed to load bills"));
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [typeFilter, payFilter]
  );

  const onRefresh = useCallback(async () => {
    await load(true);
  }, [load]);

  useEffect(() => {
    if (isFocused) {
      load(false);
    }
  }, [isFocused, load]);

  const subtitle = useMemo(() => {
    const base = `${data.length} bill${data.length === 1 ? "" : "s"}`;
    if (typeFilter === "All" && payFilter === "All") return base;
    return `${base} • ${typeFilter} • ${PILL_LABEL[payFilter]}`;
  }, [data.length, typeFilter, payFilter]);

  const renderItem = ({ item }: { item: Bill }) => {
    const status = normalizePaymentStatus(item.payment_status);
    const statusLabel = getPaymentStatusLabel(status);
    const statusColor = getPaymentStatusColor(status);

    const guestName = [item.first_name, item.last_name]
      .filter(Boolean)
      .join(" ")
      .trim();

    const billId = Number(item.bill_id || 0);

    return (
      <TouchableOpacity
        activeOpacity={0.88}
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
        onPress={() => {
          if (!billId) {
            Alert.alert("Invalid bill", "Bill id is missing.");
            return;
          }
          navigation.navigate("BillDetail", { billId });
        }}
      >
        <View style={styles.topRow}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={[styles.billNo, { color: colors.text }]}>
              {item.bill_no || `Bill #${billId}`}
            </Text>
            <Text style={[styles.dateText, { color: colors.textSecondary }]}>
              {item.bill_datetime
                ? formatDateTime(item.bill_datetime)
                : item.created_at
                ? formatDateTime(item.created_at)
                : "No date"}
            </Text>
          </View>

          <View style={[styles.badge, { backgroundColor: `${statusColor}18` }]}>
            <Text style={[styles.badgeText, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>
        </View>

        <Text style={[styles.metaText, { color: colors.textSecondary }]}>
          Type: {item.bill_type || "—"}
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

        {item.reservation_no ? (
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            Booking: {item.reservation_no}
          </Text>
        ) : null}

        {guestName ? (
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            Guest: {guestName}
          </Text>
        ) : null}

        <Text style={[styles.netAmount, { color: colors.primary }]}>
          ₹ {formatNumber(Number(item.net_amount || 0), 2)}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing && data.length === 0) {
    return <Loader />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SectionTitle
        title="Bills"
        subtitle={subtitle}
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
        keyExtractor={(item, index) => String(item.bill_id ?? `bill-${index}`)}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
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
              <Text
                style={[styles.emptySubtitle, { color: colors.textSecondary }]}
              >
                {loadError || "Try changing the filters or create a bill from KOT."}
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={
          data.length === 0
            ? { flexGrow: 1, justifyContent: "center", padding: 16 }
            : { paddingHorizontal: 16, paddingBottom: 24 }
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
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
    marginBottom: 6,
  },
  billNo: {
    fontSize: 15,
    fontWeight: "700",
  },
  dateText: {
    fontSize: 12,
    marginTop: 2,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  metaText: {
    fontSize: 13,
    marginTop: 2,
  },
  netAmount: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "700",
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", marginBottom: 6 },
  emptySubtitle: { fontSize: 13, textAlign: "center" },
});

export default BillListScreen;