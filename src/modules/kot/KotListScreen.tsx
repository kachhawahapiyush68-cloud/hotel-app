import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  useNavigation,
  useIsFocused,
  useRoute,
  RouteProp,
} from "@react-navigation/native";
import { Kot, KotStatus } from "../../api/types";
import {
  fetchKotList,
  fetchBillableTableKotList,
  fetchBillableRoomKotList,
  markKotBilled,
} from "./api";
import Loader from "../../shared/components/Loader";
import SectionTitle from "../../shared/components/SectionTitle";
import AppButton from "../../shared/components/AppButton";
import Pill from "../../shared/components/Pill";
import { formatDateTime } from "../../shared/utils/date";
import { useThemeStore } from "../../store/themeStore";
import { RootStackParamList } from "../../navigation/RootNavigator";

type StatusFilter = "All" | KotStatus;
type OpenTypeFilter = "TABLE" | "ROOM";
type RouteProps = RouteProp<RootStackParamList, "KOTList">;

const STATUS_FILTERS: StatusFilter[] = ["All", "Open", "Billed", "Cancelled"];

const OPEN_TYPE_FILTERS: { label: string; value: OpenTypeFilter }[] = [
  { label: "Open Table KOTs", value: "TABLE" },
  { label: "Open Room KOTs", value: "ROOM" },
];

const getStatusColor = (status: string | undefined, theme: any) => {
  switch (status) {
    case "Billed":
      return "#1E9E5A";
    case "Cancelled":
      return "#D64545";
    case "Open":
    default:
      return theme.colors.primary;
  }
};

const getApiErrorMessage = (e: any, fallback: string) =>
  e?.response?.data?.message || e?.response?.data?.error || e?.message || fallback;

const KotListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProps>();
  const isFocused = useIsFocused();
  const { theme } = useThemeStore();
  const colors = theme.colors;

  const [data, setData] = useState<Kot[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [actionKotId, setActionKotId] = useState<number | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Open");
  const [openTypeFilter, setOpenTypeFilter] = useState<OpenTypeFilter>("TABLE");

  useEffect(() => {
    if (route.params?.status) {
      setStatusFilter(route.params.status as StatusFilter);
    }
  }, [route.params?.status]);

  const isOpenMode = statusFilter === "Open";

  const load = useCallback(async () => {
    try {
      setLoading(true);

      let res: Kot[] = [];

      if (statusFilter === "Open") {
        if (openTypeFilter === "TABLE") {
          res = await fetchBillableTableKotList();
        } else {
          res = await fetchBillableRoomKotList();
        }
      } else {
        const statusParam = statusFilter === "All" ? undefined : statusFilter;
        res = await fetchKotList(statusParam);
      }

      setData(Array.isArray(res) ? res : []);
    } catch (e: any) {
      setData([]);
      Alert.alert("Error", getApiErrorMessage(e, "Failed to load KOT list"));
    } finally {
      setLoading(false);
    }
  }, [statusFilter, openTypeFilter]);

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

  useEffect(() => {
    if (isFocused && route.params?.refreshOnFocus) {
      load();
      navigation.setParams?.({ refreshOnFocus: false });
    }
  }, [isFocused, route.params?.refreshOnFocus, load, navigation]);

  const openKot = (item: Kot) => {
    if (!item.kot_id) return;
    navigation.push("KotEntry", {
      kotId: item.kot_id,
      refreshOnFocus: false,
    });
  };

  const handleMarkBilled = async (item: Kot) => {
    if (!item.kot_id) return;

    Alert.alert(
      "Mark Room KOT Billed",
      `Post this room-service KOT to folio and mark as billed?\n\n${
        item.kot_no || `KOT #${item.kot_id}`
      }`,
      [
        { text: "No" },
        {
          text: "Yes",
          onPress: async () => {
            try {
              setActionKotId(item.kot_id!);
              await markKotBilled(item.kot_id!);
              Alert.alert("Success", "Room KOT posted and marked billed.");
              await load();
            } catch (e: any) {
              Alert.alert(
                "Error",
                getApiErrorMessage(e, "Failed to mark room KOT billed")
              );
            } finally {
              setActionKotId(null);
            }
          },
        },
      ]
    );
  };

  const headerSubtitle = useMemo(() => {
    if (statusFilter === "Open") {
      return openTypeFilter === "TABLE"
        ? `${data.length} open table order${data.length === 1 ? "" : "s"}`
        : `${data.length} open room order${data.length === 1 ? "" : "s"}`;
    }

    return `${data.length} order${data.length === 1 ? "" : "s"}`;
  }, [data.length, statusFilter, openTypeFilter]);

  const renderItem = ({ item }: { item: Kot }) => {
    const statusColor = getStatusColor(item.status, theme);
    const guestName =
      item.first_name || item.last_name
        ? `${item.first_name || ""} ${item.last_name || ""}`.trim()
        : "";

    const isRoomItem = item.service_type === "ROOM";
    const isMarkBilling = actionKotId === item.kot_id;
    const isItemOpen = item.status === "Open";

    return (
      <TouchableOpacity
        activeOpacity={0.88}
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowColor: colors.text,
          },
        ]}
        onPress={() => openKot(item)}
      >
        <View style={styles.topRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.kotNo, { color: colors.text }]}>
              {item.kot_no || `KOT #${item.kot_id}`}
            </Text>

            <Text style={[styles.kotDate, { color: colors.textSecondary }]}>
              {item.kot_datetime ? formatDateTime(item.kot_datetime) : "No datetime"}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${statusColor}18` },
            ]}
          >
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.status || "Open"}
            </Text>
          </View>
        </View>

        <View style={styles.metaWrap}>
          {item.service_type ? (
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              Type: {item.service_type}
            </Text>
          ) : null}

          {item.room_no ? (
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              Room: {item.room_no}
            </Text>
          ) : null}

          {item.table_no ? (
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              Table: {item.table_no}
            </Text>
          ) : null}

          {item.reservation_no ? (
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              Booking: {item.reservation_no}
            </Text>
          ) : item.booking_id ? (
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              Booking ID: {item.booking_id}
            </Text>
          ) : null}

          {item.folio_no ? (
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              Folio: {item.folio_no}
            </Text>
          ) : item.folio_id ? (
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              Folio ID: {item.folio_id}
            </Text>
          ) : null}
        </View>

        {guestName ? (
          <Text style={[styles.guestText, { color: colors.text }]}>
            Guest: {guestName}
          </Text>
        ) : null}

        {isRoomItem ? (
          <Text style={[styles.noteText, { color: colors.textSecondary }]}>
            Room-service KOT goes to folio/posting flow.
          </Text>
        ) : null}

        <View style={styles.actionRow}>
          <AppButton
            title="Open"
            variant="outline"
            size="small"
            onPress={() => openKot(item)}
            style={styles.actionBtn}
          />

          {isOpenMode &&
          openTypeFilter === "ROOM" &&
          isRoomItem &&
          isItemOpen ? (
            <AppButton
              title="Mark Billed"
              size="small"
              loading={isMarkBilling}
              onPress={() => handleMarkBilled(item)}
              style={styles.actionBtn}
            />
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing && data.length === 0) {
    return <Loader />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SectionTitle
        title="Kitchen Orders"
        subtitle={headerSubtitle}
        rightContent={
          <AppButton
            title="New KOT"
            size="small"
            onPress={() => navigation.push("KotEntry", {})}
          />
        }
      />

      <View style={styles.filterRow}>
        {STATUS_FILTERS.map((status) => (
          <Pill
            key={status}
            label={status}
            active={statusFilter === status}
            onPress={() => setStatusFilter(status)}
          />
        ))}
      </View>

      {isOpenMode ? (
        <View style={styles.subFilterRow}>
          {OPEN_TYPE_FILTERS.map((tab) => (
            <Pill
              key={tab.value}
              label={tab.label}
              active={openTypeFilter === tab.value}
              onPress={() => setOpenTypeFilter(tab.value)}
            />
          ))}
        </View>
      ) : null}

      <FlatList
        data={data}
        keyExtractor={(item) => String(item.kot_id)}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{
          paddingBottom: 24,
          flexGrow: data.length === 0 ? 1 : undefined,
        }}
        ListEmptyComponent={
          !loading ? (
            <View
              style={[
                styles.emptyWrap,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No KOTs found
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                {statusFilter === "Open" && openTypeFilter === "ROOM"
                  ? "No open room-service KOTs are pending posting."
                  : statusFilter === "Open" && openTypeFilter === "TABLE"
                  ? "No open table KOTs are waiting for billing."
                  : "Create a new kitchen order or change the filter."}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
    gap: 8,
  },
  subFilterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
    gap: 8,
  },
  card: {
    marginBottom: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  kotNo: {
    fontSize: 16,
    fontWeight: "700",
  },
  kotDate: {
    fontSize: 12,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  metaWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 4,
  },
  metaText: {
    fontSize: 13,
    marginRight: 12,
    marginBottom: 4,
  },
  guestText: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "600",
  },
  noteText: {
    marginTop: 6,
    fontSize: 12,
  },
  actionRow: {
    flexDirection: "row",
    marginTop: 12,
    gap: 8,
  },
  actionBtn: {
    flex: 1,
  },
  emptyWrap: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
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

export default KotListScreen;