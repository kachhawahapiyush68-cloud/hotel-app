import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import Card from "../../../shared/components/Card";
import { useThemeStore } from "../../../store/themeStore";
import {
  Booking,
  getBookingGuestName,
  getBookingRoomLabel,
} from "../../../api/bookingApi";
import { formatDate } from "../../../shared/utils/date";
import { RoomPicker } from "./RoomPicker";

type Props = {
  booking: Booking;
  onCheckIn: (booking: Booking, roomId: number) => void;
  disabled?: boolean;
  loading?: boolean;
};

const ArrivalCard: React.FC<Props> = ({
  booking,
  onCheckIn,
  disabled = false,
  loading = false,
}) => {
  const { theme } = useThemeStore();
  const colors = theme.colors;

  const [selectedRoomId, setSelectedRoomId] = useState<number | undefined>(
    booking.room_id || undefined
  );

  const isCheckedIn = booking.status === "CheckedIn";
  const isDisabled = disabled || loading || isCheckedIn;

  const guestName = useMemo(() => getBookingGuestName(booking), [booking]);
  const roomLabel = useMemo(() => getBookingRoomLabel(booking), [booking]);

  const handleCheckInPress = () => {
    const roomToUse = selectedRoomId || booking.room_id;

    if (!roomToUse || roomToUse === 0) {
      Alert.alert(
        "No room selected",
        "Please assign a room to this booking before check-in."
      );
      return;
    }

    if (isDisabled) return;

    onCheckIn(booking, roomToUse);
  };

  return (
    <Card
      style={{ marginBottom: 10 }}
      header={`Arrival • ${formatDate(booking.check_in_datetime)}`}
      subtitle={guestName}
    >
      <View style={{ marginTop: 4 }}>
        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
          Room: {roomLabel}
        </Text>

        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 12,
            marginTop: 4,
          }}
        >
          Status: {booking.status || "-"}
        </Text>

        {!!booking.reservation_no && (
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 12,
              marginTop: 4,
            }}
          >
            Reservation: {booking.reservation_no}
          </Text>
        )}

        {!!booking.folio_no && (
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 12,
              marginTop: 4,
            }}
          >
            Folio: {booking.folio_no}
          </Text>
        )}
      </View>

      {!isCheckedIn ? (
        <View style={{ marginTop: 8 }}>
          <RoomPicker
            value={selectedRoomId}
            onChange={(id) => setSelectedRoomId(id)}
          />
        </View>
      ) : null}

      <View style={{ marginTop: 10, flexDirection: "row" }}>
        <TouchableOpacity
          disabled={isDisabled}
          style={{
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 999,
            backgroundColor: isDisabled ? colors.border : colors.primary,
            minWidth: 110,
            alignItems: "center",
            justifyContent: "center",
            opacity: isDisabled ? 0.8 : 1,
          }}
          onPress={handleCheckInPress}
        >
          {loading ? (
            <ActivityIndicator color={colors.onPrimary || "#fff"} />
          ) : (
            <Text
              style={{
                color: isCheckedIn
                  ? colors.textSecondary
                  : colors.onPrimary || "#fff",
                fontSize: 13,
                fontWeight: "600",
              }}
            >
              {isCheckedIn ? "Checked In" : "Check In"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </Card>
  );
};

export default ArrivalCard;