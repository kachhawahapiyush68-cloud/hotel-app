import React, { useCallback, useEffect, useState } from "react";
import { View, FlatList, RefreshControl, Text, Alert } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { useThemeStore } from "../../store/themeStore";
import { useBookingStore } from "../booking/store";
import Card from "../../shared/components/Card";
import Loader from "../../shared/components/Loader";
import AppButton from "../../shared/components/AppButton";
import { formatDateTime } from "../../shared/utils/date";
import { bookingApi, Booking } from "../../api/bookingApi";

const PendingBillingListScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const colors = theme.colors;
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { setCurrentManual } = useBookingStore();

  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCheckedOutPending = useCallback(async () => {
    try {
      setLoading(true);

      const today = new Date().toISOString().slice(0, 10);
      const checkedOut = await bookingApi.departures({ date: today });

      const rows = Array.isArray(checkedOut) ? checkedOut : [];
      const pending: Booking[] = [];

      for (const booking of rows) {
        try {
          const billing = await bookingApi.billing(booking.booking_id);
          const bills = Array.isArray(billing?.bills) ? billing.bills : [];
          if (bills.length === 0) {
            pending.push(booking);
          }
        } catch (e) {
          pending.push(booking);
        }
      }

      setItems(pending);
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.response?.data?.message ||
          e?.message ||
          "Could not load pending billing stays."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      loadCheckedOutPending();
    }
  }, [isFocused, loadCheckedOutPending]);

  const openStayView = (booking: Booking) => {
    const derivedFolioId =
      Number(booking?.folio_id || 0) > 0 ? Number(booking.folio_id) : 0;

    const derivedFolioNo =
      booking?.folio_no ||
      (derivedFolioId
        ? `FOL-${derivedFolioId}`
        : `FOL-${booking?.booking_id || "NA"}`);

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
          Pending billing
        </Text>

        <AppButton title="Refresh" size="small" onPress={loadCheckedOutPending} />
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.booking_id)}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadCheckedOutPending}
          />
        }
        contentContainerStyle={{
          paddingHorizontal: 12,
          paddingBottom: 16,
          paddingTop: 4,
        }}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 10 }} onPress={() => openStayView(item)}>
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
                  name="receipt-outline"
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

            <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
              Guest ID: {item.guest_id}
            </Text>

            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 11,
                marginTop: 2,
              }}
            >
              Checkout:{" "}
              {formatDateTime(
                item.actual_check_out_datetime || item.check_out_datetime
              )}
            </Text>

            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 11,
                marginTop: 2,
              }}
            >
              Status: {item.status}
            </Text>

            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 11,
                marginTop: 2,
              }}
            >
              Folio ID: {item.folio_id || 0}
            </Text>

            <View style={{ marginTop: 8, alignItems: "flex-end" }}>
              <AppButton
                title="Open for Billing"
                size="small"
                onPress={() => openStayView(item)}
              />
            </View>
          </Card>
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={{ padding: 20, alignItems: "center" }}>
              <Text style={{ color: colors.textSecondary }}>
                No checked-out stays pending billing.
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default PendingBillingListScreen;