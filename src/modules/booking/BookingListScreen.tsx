import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  RefreshControl,
  Text,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useBookingStore } from "./store";
import { useThemeStore } from "../../store/themeStore";
import Card from "../../shared/components/Card";
import Loader from "../../shared/components/Loader";
import AppButton from "../../shared/components/AppButton";
import { formatDateTime } from "../../shared/utils/date";
import { roomApi } from "../../api/roomApi";

type RoomLookup = Record<number, string>;

const BookingListScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const navigation = useNavigation<any>();
  const { items, loading, fetch } = useBookingStore();
  const [rooms, setRooms] = useState<RoomLookup>({});

  useEffect(() => {
    fetch();
  }, [fetch]);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const data = await roomApi.list();
        const map: RoomLookup = {};
        data.forEach((r: any) => {
          map[r.room_id] = r.room_no || `Room #${r.room_id}`;
        });
        setRooms(map);
      } catch (e) {
        console.log("Room lookup load error", e);
      }
    };
    loadRooms();
  }, []);

  if (loading && items.length === 0) {
    return <Loader />;
  }

  const colors = theme.colors;
  const { width } = Dimensions.get("window");
  const isSmall = width < 380;
  const numColumns = isSmall ? 1 : 2;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CheckedIn":
        return colors.primary;
      case "Confirmed":
        return "#22c55e";
      case "Provisional":
        return "#eab308";
      case "Cancelled":
        return colors.danger || "#ef4444";
      default:
        return colors.textSecondary;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Top bar */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 4,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: colors.text,
            fontSize: 18,
            fontWeight: "600",
          }}
        >
          Bookings
        </Text>

        <View style={{ flexDirection: "row" }}>
          <AppButton
            title="Arrivals"
            size="small"
            onPress={() => navigation.navigate("ArrivalList")}
            style={{ marginRight: 8 }}
          />
          <AppButton
            title="+ Booking"
            size="small"
            onPress={() => navigation.navigate("QuickReservation")}
          />
        </View>
      </View>

      <FlatList
        data={items}
        key={numColumns}
        numColumns={numColumns}
        keyExtractor={(item) => String(item.booking_id)}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetch} />
        }
        contentContainerStyle={{
          paddingHorizontal: 12,
          paddingBottom: 16,
          paddingTop: 4,
        }}
        columnWrapperStyle={
          numColumns > 1 ? { justifyContent: "flex-start" } : undefined
        }
        renderItem={({ item, index }) => {
          const roomLabel =
            rooms[item.room_id] || `Room #${item.room_id}`;
          const statusColor = getStatusColor(item.status);

          const isLeft = numColumns === 1 || index % 2 === 0;

          return (
            <Card
              style={{
                marginBottom: 12,
                width:
                  numColumns === 1
                    ? "100%"
                    : (width - 12 * 2 - 8) / 2,
                marginRight: numColumns === 2 && isLeft ? 8 : 0,
                borderRadius: 16,
                overflow: "hidden",
              }}
              onPress={() =>
                navigation.navigate("QuickReservation", {
                  bookingId: item.booking_id,
                })
              }
            >
              {/* Colored top strip */}
              <View
                style={{
                  height: 4,
                  backgroundColor: statusColor,
                  opacity: 0.9,
                }}
              />

              <View
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                }}
              >
                {/* Row: room + status */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons
                      name="bed-outline"
                      size={18}
                      color={colors.primary}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={{
                        color: colors.text,
                        fontSize: 16,
                        fontWeight: "700",
                      }}
                    >
                      {roomLabel}
                    </Text>
                  </View>

                  <View
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 999,
                      backgroundColor: statusColor + "22",
                    }}
                  >
                    <Text
                      style={{
                        color: statusColor,
                        fontSize: 11,
                        fontWeight: "600",
                      }}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>

                {/* Dates */}
                <View style={{ marginTop: 4, marginBottom: 6 }}>
                  <View
                    style={{ flexDirection: "row", alignItems: "center" }}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={14}
                      color={colors.textSecondary}
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={{
                        color: colors.textSecondary,
                        fontSize: 11,
                      }}
                    >
                      In: {formatDateTime(item.check_in_datetime)}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 2,
                    }}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={14}
                      color={colors.textSecondary}
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={{
                        color: colors.textSecondary,
                        fontSize: 11,
                      }}
                    >
                      Out: {formatDateTime(item.check_out_datetime)}
                    </Text>
                  </View>
                </View>

                {/* Guest / meta */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 4,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons
                      name="person-outline"
                      size={14}
                      color={colors.textSecondary}
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={{
                        color: colors.textSecondary,
                        fontSize: 11,
                      }}
                    >
                      Guest ID: {item.guest_id}
                    </Text>
                  </View>

                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 10,
                    }}
                  >
                    #{item.booking_id}
                  </Text>
                </View>
              </View>
            </Card>
          );
        }}
      />
    </View>
  );
};

export default BookingListScreen;
