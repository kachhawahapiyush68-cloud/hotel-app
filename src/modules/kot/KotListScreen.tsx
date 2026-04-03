import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { Kot, KotStatus } from "../../api/types";
import { fetchKotList } from "./api";
import Loader from "../../shared/components/Loader";
import SectionTitle from "../../shared/components/SectionTitle";
import AppButton from "../../shared/components/AppButton";
import Pill from "../../shared/components/Pill";
import { formatDateTime } from "../../shared/utils/date";
import { useThemeStore } from "../../store/themeStore";

type StatusFilter = "All" | KotStatus;

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

const KotListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { theme } = useThemeStore();

  const [data, setData] = useState<Kot[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Open");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const statusParam = statusFilter === "All" ? undefined : statusFilter;
      const res = await fetchKotList(statusParam);
      setData(res);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

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

  const renderItem = ({ item }: { item: Kot }) => {
    const statusColor = getStatusColor(item.status, theme);
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
            shadowColor: theme.colors.text,
          },
        ]}
        onPress={() => navigation.navigate("KotEntry", { kotId: item.kot_id })}
      >
        <View style={styles.topRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.kotNo, { color: theme.colors.text }]}>
              {item.kot_no || `KOT #${item.kot_id}`}
            </Text>
            <Text style={[styles.kotDate, { color: theme.colors.textSecondary }]}>
              {item.kot_datetime
                ? formatDateTime(item.kot_datetime)
                : "No datetime"}
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
          {item.room_no ? (
            <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
              Room: {item.room_no}
            </Text>
          ) : null}

          {item.table_no ? (
            <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
              Table: {item.table_no}
            </Text>
          ) : null}

          {item.reservation_no ? (
            <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
              Booking: {item.reservation_no}
            </Text>
          ) : item.booking_id ? (
            <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
              Booking ID: {item.booking_id}
            </Text>
          ) : null}

          {item.folio_no ? (
            <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
              Folio: {item.folio_no}
            </Text>
          ) : item.folio_id ? (
            <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
              Folio ID: {item.folio_id}
            </Text>
          ) : null}
        </View>

        {guestName ? (
          <Text style={[styles.guestText, { color: theme.colors.text }]}>
            Guest: {guestName}
          </Text>
        ) : null}
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing && data.length === 0) {
    return <Loader />;
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <SectionTitle
        title="Kitchen Orders"
        subtitle={`${data.length} order${data.length === 1 ? "" : "s"}`}
        rightContent={
          <AppButton
            title="New KOT"
            size="small"
            onPress={() => navigation.navigate("KotEntry")}
          />
        }
      />

      <View style={styles.filterRow}>
        {(["All", "Open", "Billed", "Cancelled"] as StatusFilter[]).map(
          (status) => (
            <Pill
              key={status}
              label={status}
              active={statusFilter === status}
              onPress={() => setStatusFilter(status)}
            />
          )
        )}
      </View>

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
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                No KOTs found
              </Text>
              <Text
                style={[
                  styles.emptySubtitle,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Create a new kitchen order or change the filter
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