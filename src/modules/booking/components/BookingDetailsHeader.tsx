import React, { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  Booking,
  getBookingGuestName,
  getBookingMetaLine,
  getBookingRoomLabel,
} from "../../../api/bookingApi";
import { useThemeStore } from "../../../store/themeStore";
import { formatDateTime } from "../../../shared/utils/date";

type Props = {
  booking: Booking;
  onCancelPress?: () => void;
  onRefundPress?: () => void;
  cancelDisabled?: boolean;
  refundDisabled?: boolean;
};

const BookingDetailsHeader: React.FC<Props> = ({
  booking,
  onCancelPress,
  onRefundPress,
  cancelDisabled = false,
  refundDisabled = false,
}) => {
  const { theme } = useThemeStore();
  const colors = theme.colors;

  const guestName = useMemo(() => getBookingGuestName(booking), [booking]);
  const metaLine = useMemo(() => getBookingMetaLine(booking), [booking]);
  const roomLabel = useMemo(() => getBookingRoomLabel(booking), [booking]);

  const statusColors = useMemo(() => {
    switch (booking.status) {
      case "CheckedIn":
        return { bg: "#DCFCE7", text: "#15803D" };
      case "Confirmed":
        return { bg: "#E0F2FE", text: "#0369A1" };
      case "Provisional":
        return { bg: "#FEF3C7", text: "#B45309" };
      case "CheckedOut":
        return { bg: "#E5E7EB", text: "#4B5563" };
      case "Cancelled":
        return { bg: "#FEE2E2", text: "#B91C1C" };
      default:
        return { bg: colors.border, text: colors.textSecondary };
    }
  }, [booking.status, colors]);

  const statusNorm = String(booking.status || "").trim().toLowerCase();

  const canCancel =
    statusNorm === "provisional" || statusNorm === "confirmed";

  const canRefund =
    Number(booking.advance_amount || 0) > 0 &&
    Number(booking.advance_posted_to_folio || 0) !== 1 &&
    booking.status !== "CheckedIn" &&
    booking.status !== "CheckedOut";

  return (
    <View
      style={{
        padding: 16,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text
            style={{
              color: colors.text,
              fontSize: 18,
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
                fontSize: 12,
                marginTop: 2,
              }}
              numberOfLines={2}
            >
              {metaLine}
            </Text>
          )}
        </View>

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
              fontSize: 12,
              fontWeight: "700",
            }}
          >
            {booking.status}
          </Text>
        </View>
      </View>

      <View style={{ marginTop: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons
            name="bed-outline"
            size={14}
            color={colors.textSecondary}
            style={{ marginRight: 4 }}
          />
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 12,
            }}
          >
            {roomLabel}
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 4,
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
              fontSize: 12,
            }}
          >
            {formatDateTime(booking.check_in_datetime)} →{" "}
            {formatDateTime(booking.check_out_datetime)}
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 4,
            flexWrap: "wrap",
          }}
        >
          {booking.reservation_no && (
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 12,
                marginRight: 12,
              }}
            >
              Reservation: {booking.reservation_no}
            </Text>
          )}
          {booking.folio_no && (
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 12,
              }}
            >
              Folio: {booking.folio_no}
            </Text>
          )}
        </View>

        {!!booking.advance_amount && Number(booking.advance_amount) > 0 && (
          <View style={{ marginTop: 6 }}>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 12,
              }}
            >
              Remaining Advance: {Number(booking.advance_amount || 0)}
            </Text>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 12,
                marginTop: 2,
              }}
            >
              Refunded: {Number(booking.refunded_amount || 0)}
            </Text>
            {!!booking.advance_status && (
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 12,
                  marginTop: 2,
                }}
              >
                Advance Status: {booking.advance_status}
              </Text>
            )}
            {!!booking.advance_ref_no && (
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 12,
                  marginTop: 2,
                }}
              >
                Advance Ref: {booking.advance_ref_no}
              </Text>
            )}
          </View>
        )}
      </View>

      {(canCancel || canRefund) && (
        <View
          style={{
            flexDirection: "row",
            marginTop: 14,
          }}
        >
          {canRefund ? (
            <TouchableOpacity
              disabled={refundDisabled}
              onPress={onRefundPress}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: refundDisabled ? colors.border : colors.primary,
                marginRight: 10,
                opacity: refundDisabled ? 0.7 : 1,
              }}
            >
              <Text
                style={{
                  color: colors.onPrimary || "#fff",
                  fontSize: 12,
                  fontWeight: "700",
                }}
              >
                Refund / Cancel
              </Text>
            </TouchableOpacity>
          ) : null}

          {canCancel ? (
            <TouchableOpacity
              disabled={cancelDisabled}
              onPress={onCancelPress}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: cancelDisabled ? colors.border : colors.error,
                opacity: cancelDisabled ? 0.7 : 1,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: "700",
                }}
              >
                Cancel Booking
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}
    </View>
  );
};

export default BookingDetailsHeader;