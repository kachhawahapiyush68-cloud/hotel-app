// src/modules/stayView/StayViewScreen.tsx
import React, { useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useBookingStore } from "../booking/store";
import { useThemeStore } from "../../store/themeStore";
import AppButton from "../../shared/components/AppButton";
import { formatDateTime } from "../../shared/utils/date";
import { bookingApi } from "../../api/bookingApi";
import { useNavigation } from "@react-navigation/native";

const StayViewScreen: React.FC = () => {
  const { currentBooking, currentFolio, clearCurrent } = useBookingStore();
  const { theme } = useThemeStore();
  const navigation = useNavigation<any>();
  const colors = theme.colors;

  const [loading, setLoading] = useState(false);

  if (!currentBooking || !currentFolio) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
          paddingHorizontal: 24,
        }}
      >
        <Ionicons
          name="alert-circle-outline"
          size={40}
          color={colors.textSecondary}
          style={{ marginBottom: 8 }}
        />
        <Text
          style={{
            color: colors.textSecondary,
            textAlign: "center",
            fontSize: 14,
          }}
        >
          No in-house stay selected. Open an in-house room from the Stay tab.
        </Text>
      </View>
    );
  }

  const handleCheckOut = async () => {
    try {
      setLoading(true);
      await bookingApi.checkOut(currentBooking.booking_id);
      Alert.alert("Checked out", "Guest has been checked out.");
      clearCurrent();
      navigation.goBack();
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.response?.data?.message || e?.message || "Could not check out."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBilling = () => {
    navigation.navigate("BillFromKot", {
      kotIds: [],
      bookingId: currentBooking.booking_id,
      guestId: currentBooking.guest_id,
      folioId: currentFolio.folio_id,
      roomId: currentBooking.room_id,
    });
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 16 }}
    >
      <Text
        style={{
          color: colors.text,
          fontSize: 20,
          fontWeight: "700",
          marginBottom: 8,
        }}
      >
        Stay details
      </Text>

      <View style={{ marginBottom: 12 }}>
        <Text style={{ color: colors.textSecondary, marginBottom: 4 }}>
          Booking ID: {currentBooking.booking_id}
        </Text>
        <Text style={{ color: colors.textSecondary, marginBottom: 4 }}>
          Room ID: {currentBooking.room_id}
        </Text>
        <Text style={{ color: colors.textSecondary, marginBottom: 4 }}>
          Guest ID: {currentBooking.guest_id}
        </Text>
      </View>

      <View style={{ marginBottom: 12 }}>
        <Text style={{ color: colors.textSecondary }}>
          Folio: {currentFolio.folio_no} (ID: {currentFolio.folio_id})
        </Text>
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: colors.textSecondary, marginBottom: 4 }}>
          Status: {currentBooking.status}
        </Text>
        <Text style={{ color: colors.textSecondary, marginBottom: 4 }}>
          Check-in:{" "}
          {formatDateTime(
            currentBooking.actual_check_in_datetime ||
              currentBooking.check_in_datetime
          )}
        </Text>
        <Text style={{ color: colors.textSecondary }}>
          Planned Check-out: {formatDateTime(currentBooking.check_out_datetime)}
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 8,
        }}
      >
        <View style={{ flex: 1, marginRight: 8 }}>
          <AppButton
            title="Check-out"
            onPress={handleCheckOut}
            disabled={loading || currentBooking.status !== "CheckedIn"}
          />
        </View>

        <View style={{ flex: 1 }}>
          <AppButton
            title="Billing"
            onPress={handleBilling}
            disabled={loading}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default StayViewScreen;