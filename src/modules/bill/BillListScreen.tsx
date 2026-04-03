// src/modules/bill/BillListScreen.tsx
import React, { useEffect } from "react";
import {
  View,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useThemeStore } from "../../store/themeStore";
import Loader from "../../shared/components/Loader";
import Card from "../../shared/components/Card";
import { useBillStore } from "./store";
import { useNavigation } from "@react-navigation/native";
import { formatDateTime } from "../../shared/utils/date";

const BillListScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const navigation = useNavigation<any>();
  const { items, loading, fetch, remove } = useBillStore();
  const colors = theme.colors;

  useEffect(() => {
    fetch();
  }, [fetch]);

  const handleRefresh = () => {
    fetch();
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      "Delete bill",
      "Are you sure you want to delete this bill?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const ok = await remove(id);
            if (!ok) {
              Alert.alert("Error", "Failed to delete bill");
            }
          },
        },
      ]
    );
  };

  const formatMoney = (v: any) => {
    const n = Number(v || 0);
    if (Number.isNaN(n)) return "0.00";
    return n.toFixed(2);
  };

  const getStatusColors = (status: string) => {
    if (status === "Paid") {
      return {
        bg: colors.successSoft || "#DCFCE7",
        text: colors.success || "#16A34A",
      };
    }

    if (status === "PartiallyPaid") {
      return {
        bg: colors.infoSoft || "#DBEAFE",
        text: colors.info || "#2563EB",
      };
    }

    return {
      bg: colors.warningSoft || "#FEF3C7",
      text: colors.warning || "#D97706",
    };
  };

  if (loading && items.length === 0) {
    return <Loader />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.bill_id)}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
        contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
        renderItem={({ item }) => {
          const statusColors = getStatusColors(String(item.payment_status));

          return (
            <Card
              style={{ marginBottom: 10 }}
              onPress={() =>
                navigation.navigate("BillDetail", { billId: item.bill_id })
              }
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 16,
                    fontWeight: "700",
                  }}
                >
                  Bill #{item.bill_no}
                </Text>

                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 999,
                    backgroundColor: statusColors.bg,
                  }}
                >
                  <Text
                    style={{
                      color: statusColors.text,
                      fontSize: 11,
                      fontWeight: "700",
                    }}
                  >
                    {item.payment_status}
                  </Text>
                </View>
              </View>

              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 12,
                  marginTop: 4,
                }}
              >
                {formatDateTime(item.bill_datetime)}
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: 8,
                }}
              >
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                  Type: {item.bill_type}
                </Text>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 15,
                    fontWeight: "700",
                  }}
                >
                  ₹ {formatMoney(item.net_amount)}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: 8,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                  Booking: {item.booking_id ?? "-"} | Room: {item.room_id ?? "-"}
                </Text>

                <TouchableOpacity onPress={() => handleDelete(item.bill_id)}>
                  <Text
                    style={{
                      color: colors.danger || "#EF4444",
                      fontSize: 12,
                      fontWeight: "700",
                    }}
                  >
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          );
        }}
        ListEmptyComponent={
          !loading ? (
            <View style={{ padding: 20, alignItems: "center" }}>
              <Text style={{ color: colors.textSecondary }}>
                No bills found.
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default BillListScreen;