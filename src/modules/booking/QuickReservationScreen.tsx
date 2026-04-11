import React, { useEffect, useState, useCallback } from "react";
import { Alert, ScrollView, View, Text, TouchableOpacity } from "react-native";
import { useThemeStore } from "../../store/themeStore";
import Loader from "../../shared/components/Loader";
import BookingForm from "./components/BookingForm";
import RefundAdvanceModal from "./components/RefundAdvanceModal";
import BookingDetailsHeader from "./components/BookingDetailsHeader";
import { useBookingStore } from "./store";
import { useRoute, useNavigation } from "@react-navigation/native";
import {
  bookingApi,
  BookingCreateInput,
  Booking,
  CancelBookingInput,
} from "../../api/bookingApi";

const QuickReservationScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const bookingId: number | undefined = route.params?.bookingId;

  const { create, update, cancel, error } = useBookingStore();

  const [initial, setInitial] = useState<Partial<Booking>>({});
  const [loading, setLoading] = useState<boolean>(!!bookingId);
  const [submitting, setSubmitting] = useState(false);
  const [refundVisible, setRefundVisible] = useState(false);

  const load = useCallback(async () => {
    if (!bookingId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const b = await bookingApi.get(bookingId);

      console.log("Booking status from API:", b.status);

      setInitial({
        booking_id: b.booking_id,
        company_id: b.company_id,
        reservation_no: b.reservation_no,
        guest_id: b.guest_id,
        room_id: b.room_id,
        check_in_datetime: b.check_in_datetime,
        check_out_datetime: b.check_out_datetime,
        nights: b.nights,
        num_adult: b.num_adult,
        num_child: b.num_child,
        status: b.status,
        advance_amount: b.advance_amount,
        advance_payment_type: b.advance_payment_type,
        advance_ref_no: b.advance_ref_no,
        advance_status: b.advance_status,
        advance_received_at: b.advance_received_at,
        refunded_amount: b.refunded_amount,
        refund_payment_type: b.refund_payment_type,
        refund_ref_no: b.refund_ref_no,
        refund_reason: b.refund_reason,
        refunded_at: b.refunded_at,
        advance_posted_to_folio: b.advance_posted_to_folio,
        folio_id: b.folio_id,
        folio_no: b.folio_no,
        first_name: b.first_name,
        last_name: b.last_name,
        room_no: b.room_no,
      });
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.response?.data?.message || e?.message || "Failed to load booking"
      );
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [bookingId, navigation]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (values: BookingCreateInput) => {
    try {
      setSubmitting(true);

      if (bookingId) {
        const updated = await update(bookingId, values);

        if (!updated) {
          Alert.alert("Error", error || "Failed to update booking");
          return;
        }

        Alert.alert("Success", "Booking updated successfully");
        navigation.goBack();
      } else {
        const created = await create({
          ...values,
          status: values.status || "Confirmed",
        });

        if (!created) {
          Alert.alert("Error", error || "Failed to create booking");
          return;
        }

        Alert.alert("Success", "Booking created successfully");
        navigation.goBack();
      }
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.response?.data?.message || e?.message || "Failed to save booking"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!bookingId) return;

    const hasAdvance = Number(initial.advance_amount || 0) > 0;

    Alert.alert(
      "Cancel Booking",
      hasAdvance
        ? "This booking has an advance. To cancel and handle the advance, use the Refund/Cancel options."
        : "Are you sure you want to cancel this booking?",
      [
        { text: "No", style: "cancel" },
        !hasAdvance
          ? {
              text: "Yes, Cancel",
              style: "destructive",
              onPress: async () => {
                try {
                  setSubmitting(true);

                  const payload: CancelBookingInput = {
                    refund_mode: "NONE",
                    cancellation_reason: "Cancelled from mobile",
                  };

                  const updated = await cancel(bookingId, payload);

                  if (!updated) {
                    Alert.alert("Error", error || "Failed to cancel booking");
                    return;
                  }

                  setInitial((prev) => ({
                    ...prev,
                    ...updated,
                  }));

                  Alert.alert("Success", "Booking cancelled successfully");
                  navigation.goBack();
                } catch (e: any) {
                  Alert.alert(
                    "Error",
                    e?.response?.data?.message ||
                      e?.message ||
                      "Failed to cancel booking"
                  );
                } finally {
                  setSubmitting(false);
                }
              },
            }
          : {
              text: "Open Refund/Cancel",
              onPress: () => setRefundVisible(true),
            },
      ]
    );
  };

  // values is the same shape as old RefundAdvanceInput,
  // we infer FULL vs PARTIAL from amount.
  const handleRefundSubmit = async (values: {
    refunded_amount?: number;
    refund_payment_type: string;
    refund_ref_no?: string;
    refund_reason?: string;
  }) => {
    if (!bookingId) return;

    try {
      setSubmitting(true);

      const maxAmount = Number(initial.advance_amount || 0);
      const requested = Number(values.refunded_amount || 0);

      let refund_mode: CancelBookingInput["refund_mode"] = "NONE";

      if (maxAmount <= 0) {
        refund_mode = "NONE";
      } else if (requested >= maxAmount) {
        refund_mode = "FULL";
      } else if (requested > 0 && requested < maxAmount) {
        refund_mode = "PARTIAL";
      } else {
        refund_mode = "FORFEIT";
      }

      const payload: CancelBookingInput = {
        refund_mode,
        refunded_amount: requested || undefined,
        refund_payment_type: values.refund_payment_type,
        refund_ref_no: values.refund_ref_no,
        refund_reason: values.refund_reason,
        cancellation_reason: "Cancelled from mobile",
      };

      const updated = await cancel(bookingId, payload);

      if (!updated) {
        Alert.alert("Error", error || "Failed to cancel/refund");
        return;
      }

      setInitial((prev) => ({
        ...prev,
        ...updated,
      }));

      setRefundVisible(false);
      Alert.alert(
        "Success",
        refund_mode === "FORFEIT"
          ? "Booking cancelled and advance forfeited"
          : "Booking cancelled and advance handled"
      );
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.response?.data?.message ||
          e?.message ||
          "Failed to cancel/refund booking"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  const isEdit = !!bookingId;

  return (
    <>
      <View
        style={{
          paddingTop: 12,
          paddingBottom: 8,
          paddingHorizontal: 16,
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ paddingVertical: 4, paddingRight: 12 }}
        >
          <Text
            style={{
              color: theme.colors.primary,
              fontSize: 14,
              fontWeight: "600",
            }}
          >
            Back
          </Text>
        </TouchableOpacity>

        <Text
          style={{
            flex: 1,
            textAlign: "center",
            color: theme.colors.text,
            fontSize: 16,
            fontWeight: "600",
          }}
          numberOfLines={1}
        >
          {isEdit ? "Booking Details" : "New Booking"}
        </Text>

        <View style={{ width: 56 }} />
      </View>

      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {bookingId && initial.booking_id ? (
          <BookingDetailsHeader
            booking={initial as Booking}
            onCancelPress={handleCancelBooking}
            onRefundPress={() => setRefundVisible(true)}
            cancelDisabled={submitting}
            refundDisabled={submitting}
          />
        ) : null}

        <BookingForm
          initial={{
            company_id: initial.company_id,
            reservation_no: initial.reservation_no,
            guest_id: initial.guest_id,
            room_id: initial.room_id,
            check_in_datetime: initial.check_in_datetime,
            check_out_datetime: initial.check_out_datetime,
            nights: initial.nights,
            num_adult: initial.num_adult,
            num_child: initial.num_child,
            status: initial.status,
            advance_amount: initial.advance_amount,
            advance_payment_type: initial.advance_payment_type,
            advance_ref_no: initial.advance_ref_no,
          }}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      </ScrollView>

      <RefundAdvanceModal
        visible={refundVisible}
        maxAmount={Number(initial.advance_amount || 0)}
        defaultPaymentType={initial.advance_payment_type || ""}
        defaultRefNo={initial.advance_ref_no || ""}
        loading={submitting}
        onClose={() => {
          if (!submitting) setRefundVisible(false);
        }}
        onSubmit={handleRefundSubmit}
      />
    </>
  );
};

export default QuickReservationScreen;