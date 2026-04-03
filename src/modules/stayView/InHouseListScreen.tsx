import React, { useEffect, useState } from "react";
import { View, FlatList, RefreshControl, Text } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useThemeStore } from "../../store/themeStore";
import { useBookingStore } from "../booking/store";
import Card from "../../shared/components/Card";
import Loader from "../../shared/components/Loader";
import AppButton from "../../shared/components/AppButton";
import { formatDateTime } from "../../shared/utils/date";
import { bookingApi } from "../../api/bookingApi";
import { useNavigation } from "@react-navigation/native";

const InHouseListScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const colors = theme.colors;
  const navigation = useNavigation<any>();

  const { setCurrentManual } = useBookingStore();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadInHouse = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().slice(0, 10);
      const data = await bookingApi.stayovers({ date: today });
      setItems(data);
    } catch (e) {
      console.log("load in-house error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInHouse();
  }, []);

  const openInStayView = (booking: any) => {
    setCurrentManual(booking, {
      folio_id: booking.folio_id ?? 0,
      folio_no: booking.folio_no ?? `FOL-${booking.booking_id}`,
    });

    const parentNav = navigation.getParent?.();
    if (parentNav) {
      parentNav.navigate("StayView");
    } else {
      navigation.navigate("StayView");
    }
  };

  if (loading && items.length === 0) {
    return <Loader />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
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
          In-house stays
        </Text>

        <AppButton title="Refresh" size="small" onPress={loadInHouse} />
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.booking_id)}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadInHouse} />
        }
        contentContainerStyle={{
          paddingHorizontal: 12,
          paddingBottom: 16,
          paddingTop: 4,
        }}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 10 }} onPress={() => openInStayView(item)}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 4,
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
                  Room #{item.room_id}
                </Text>
              </View>

              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 12,
                }}
              >
                #{item.booking_id}
              </Text>
            </View>

            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 11,
              }}
            >
              Guest ID: {item.guest_id}
            </Text>

            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 11,
                marginTop: 2,
              }}
            >
              Check-in:{" "}
              {formatDateTime(
                item.actual_check_in_datetime || item.check_in_datetime
              )}
            </Text>

            <View style={{ marginTop: 8, alignItems: "flex-end" }}>
              <AppButton
                title="Open in Stay View"
                size="small"
                onPress={() => openInStayView(item)}
              />
            </View>
          </Card>
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={{ padding: 20, alignItems: "center" }}>
              <Text style={{ color: colors.textSecondary }}>
                No in-house stays found.
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default InHouseListScreen;