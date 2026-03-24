import React from "react";
import { View, Text, ScrollView } from "react-native";
import { useBookingStore } from "../booking/store";
import { useThemeStore } from "../../store/themeStore";

const StayViewScreen: React.FC = () => {
  const { currentBooking, currentFolio } = useBookingStore();
  const { theme } = useThemeStore();

  if (!currentBooking || !currentFolio) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <Text style={{ color: theme.colors.textSecondary }}>
          No in‑house stay selected. Check in a reservation first.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ padding: 16 }}
    >
      <Text
        style={{
          color: theme.colors.text,
          fontSize: 20,
          fontWeight: "700",
          marginBottom: 8,
        }}
      >
        Stay details
      </Text>

      <Text style={{ color: theme.colors.textSecondary, marginBottom: 4 }}>
        Booking ID: {currentBooking.booking_id}
      </Text>
      <Text style={{ color: theme.colors.textSecondary, marginBottom: 4 }}>
        Room ID: {currentBooking.room_id}
      </Text>
      <Text style={{ color: theme.colors.textSecondary, marginBottom: 4 }}>
        Guest ID: {currentBooking.guest_id}
      </Text>

      <Text style={{ color: theme.colors.textSecondary, marginTop: 12 }}>
        Folio: {currentFolio.folio_no} (ID: {currentFolio.folio_id})
      </Text>

      <Text style={{ color: theme.colors.textSecondary, marginTop: 12 }}>
        Status: {currentBooking.status}
      </Text>
      <Text style={{ color: theme.colors.textSecondary, marginTop: 4 }}>
        Check‑in: {currentBooking.check_in_datetime}
      </Text>
      <Text style={{ color: theme.colors.textSecondary, marginTop: 4 }}>
        Check‑out: {currentBooking.check_out_datetime}
      </Text>
    </ScrollView>
  );
};

export default StayViewScreen;
