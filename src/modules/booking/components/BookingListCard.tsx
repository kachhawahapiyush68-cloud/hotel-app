import React, { useMemo } from "react";
import { View, Text, Dimensions } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Card from "../../../shared/components/Card";
import { useThemeStore } from "../../../store/themeStore";
import {
  Booking,
  getBookingGuestName,
  getBookingMetaLine,
  getBookingRoomLabel,
} from "../../../api/bookingApi";
import { formatDateTime } from "../../../shared/utils/date";

type Props = {
  booking: Booking;
  onPress: () => void;
  isTwoColumn?: boolean;
  index?: number;
};

const BookingListCard: React.FC<Props> = ({
  booking,
  onPress,
  isTwoColumn = false,
  index = 0,
}) => {
  const { theme } = useThemeStore();
  const colors = theme.colors;
  const { width } = Dimensions.get("window");
  const isLeft = !isTwoColumn || index % 2 === 0;

  const guestName = useMemo(() => getBookingGuestName(booking), [booking]);
  const metaLine = useMemo(() => getBookingMetaLine(booking), [booking]);
  const roomLabel = useMemo(() => getBookingRoomLabel(booking), [booking]);

  const statusColor = useMemo(() => {
    switch (booking.status) {
      case "CheckedIn":
        return colors.primary;
      case "Confirmed":
        return "#22c55e";
      case "Provisional":
        return "#eab308";
      case "Cancelled":
        return colors.danger || "#ef4444";
      case "CheckedOut":
        return "#64748b";
      default:
        return colors.textSecondary;
    }
  }, [booking.status, colors]);

  const cardWidth = isTwoColumn ? (width - 12 * 2 - 8) / 2 : width - 12 * 2;

  return (
    <Card
      style={{
        marginBottom: 12,
        width: cardWidth,
        marginRight: isTwoColumn && isLeft ? 8 : 0,
        borderRadius: 16,
        overflow: "hidden",
      }}
      onPress={onPress}
    >
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
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 6,
          }}
        >
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text
              style={{
                color: colors.text,
                fontSize: 15,
                fontWeight: "700",
              }}
              numberOfLines={1}
            >
              {guestName}
            </Text>
            {!!metaLine && (
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 11,
                  marginTop: 2,
                }}
                numberOfLines={1}
              >
                {metaLine}
              </Text>
            )}
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
              {booking.status}
            </Text>
          </View>
        </View>

        <View style={{ marginTop: 4 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 2,
            }}
          >
            <Ionicons
              name="bed-outline"
              size={14}
              color={colors.textSecondary}
              style={{ marginRight: 4 }}
            />
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 11,
              }}
              numberOfLines={1}
            >
              {roomLabel}
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
              numberOfLines={1}
            >
              In: {formatDateTime(booking.check_in_datetime)}
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
              numberOfLines={1}
            >
              Out: {formatDateTime(booking.check_out_datetime)}
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 6,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            {!!booking.reservation_no && (
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 11,
                  fontWeight: "500",
                }}
                numberOfLines={1}
              >
                Reservation: {booking.reservation_no}
              </Text>
            )}
          </View>

          {!!booking.folio_no && (
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 10,
                marginLeft: 8,
              }}
              numberOfLines={1}
            >
              {booking.folio_no}
            </Text>
          )}
        </View>
      </View>
    </Card>
  );
};

export default BookingListCard;