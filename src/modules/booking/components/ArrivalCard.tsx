import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import Card from "../../../shared/components/Card";
import { useThemeStore } from "../../../store/themeStore";
import { Booking } from "../../../api/bookingApi";
import { formatDate } from "../../../shared/utils/date";
import { RoomPicker } from "./RoomPicker";

type Props = {
  booking: Booking;
  onCheckIn: (booking: Booking, roomId: number) => void;
};

const ArrivalCard: React.FC<Props> = ({ booking, onCheckIn }) => {
  const { theme } = useThemeStore();
  const [selectedRoomId, setSelectedRoomId] = useState<number | undefined>(
    booking.room_id || undefined
  );

  const handleCheckInPress = () => {
    const roomToUse = selectedRoomId || booking.room_id;

    if (!roomToUse || roomToUse === 0) {
      Alert.alert(
        "No room selected",
        "Please assign a room to this booking (use the picker above) before check‑in."
      );
      return;
    }

    onCheckIn(booking, roomToUse);
  };

  return (
    <Card
      style={{ marginBottom: 10 }}
      header={`Arrival • ${formatDate(booking.check_in_datetime)}`}
      subtitle={`Guest ID: ${booking.guest_id}`}
    >
      <View style={{ marginTop: 4 }}>
        <Text
          style={{ color: theme.colors.textSecondary, fontSize: 12 }}
        >
          Current room id: {booking.room_id || "-"}
        </Text>
      </View>

      <View style={{ marginTop: 8 }}>
        <RoomPicker
          value={selectedRoomId}
          onChange={(id) => setSelectedRoomId(id)}
        />
      </View>

      <View style={{ marginTop: 10, flexDirection: "row" }}>
        <TouchableOpacity
          style={{
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 999,
            backgroundColor: theme.colors.primary,
          }}
          onPress={handleCheckInPress}
        >
          <Text
            style={{
              color: theme.colors.onPrimary || "#fff",
              fontSize: 13,
              fontWeight: "600",
            }}
          >
            Check In
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
};

export default ArrivalCard;
