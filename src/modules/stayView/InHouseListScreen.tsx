import React, { useEffect, useState, useCallback } from "react";
import { View, FlatList, RefreshControl, Text, Alert } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useThemeStore } from "../../store/themeStore";
import { useBookingStore } from "../booking/store";
import Card from "../../shared/components/Card";
import Loader from "../../shared/components/Loader";
import AppButton from "../../shared/components/AppButton";
import { formatDateTime } from "../../shared/utils/date";
import {
  bookingApi,
  Booking,
  getBookingGuestName,
  getBookingMetaLine,
  getBookingRoomLabel,
} from "../../api/bookingApi";
import { useNavigation, useIsFocused } from "@react-navigation/native";

const InHouseListScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const colors = theme.colors;
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();

  const { setCurrentManual } = useBookingStore();
  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  const loadInHouse = useCallback(async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().slice(0, 10);
      const data = await bookingApi.stayovers({ date: today });
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.log("load in-house error", e);
      Alert.alert(
        "Error",
        e?.response?.data?.message || e?.message || "Could not load in-house stays."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      loadInHouse();
    }
  }, [isFocused, loadInHouse]);

  const openInStayView = (booking: Booking) => {
    const derivedFolioId =
      Number(booking?.folio_id || 0) > 0 ? Number(booking.folio_id) : 0;

    const derivedFolioNo =
      booking?.folio_no ||
      (derivedFolioId ? `FOL-${derivedFolioId}` : `FOL-${booking?.booking_id || "NA"}`);

    if (!booking?.booking_id) {
      Alert.alert("Error", "Booking not found.");
      return;
    }

    setCurrentManual(booking, {
      folio_id: derivedFolioId,
      folio_no: derivedFolioNo,
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

        <View style={{ flexDirection: "row" }}>
          <AppButton
            title="Pending Billing"
            size="small"
            onPress={() => navigation.navigate("PendingBillingList")}
            style={{ marginRight: 8 }}
          />
          <AppButton title="Refresh" size="small" onPress={loadInHouse} />
        </View>
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
          flexGrow: items.length === 0 ? 1 : 0,
        }}
        renderItem={({ item }) => {
          const guestName = getBookingGuestName(item);
          const roomLabel = getBookingRoomLabel(item);
          const metaLine = getBookingMetaLine(item);
          const folioNo =
            item.folio_no || (item.folio_id ? `FOL-${item.folio_id}` : "-");

          return (
            <Card style={{ marginBottom: 10 }} onPress={() => openInStayView(item)}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                  <Ionicons
                    name="bed-outline"
                    size={18}
                    color={colors.primary}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    numberOfLines={1}
                    style={{
                      color: colors.text,
                      fontSize: 16,
                      fontWeight: "700",
                      flex: 1,
                    }}
                  >
                    {guestName}
                  </Text>
                </View>

                <Text
                  style={{
                    color: colors.primary,
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  {item.status}
                </Text>
              </View>

              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                {roomLabel}
              </Text>

              {!!metaLine && (
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 11,
                    marginTop: 2,
                  }}
                >
                  {metaLine}
                </Text>
              )}

              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 11,
                  marginTop: 4,
                }}
              >
                Check-in:{" "}
                {formatDateTime(
                  item.actual_check_in_datetime || item.check_in_datetime
                )}
              </Text>

              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 11,
                  marginTop: 2,
                }}
              >
                Folio: {folioNo}
              </Text>

              <View style={{ marginTop: 8, alignItems: "flex-end" }}>
                <AppButton
                  title="Open in Stay View"
                  size="small"
                  onPress={() => openInStayView(item)}
                />
              </View>
            </Card>
          );
        }}
        ListEmptyComponent={
          !loading ? (
            <View
              style={{
                flex: 1,
                padding: 20,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
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