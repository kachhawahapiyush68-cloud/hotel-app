import React, { useEffect, useState } from "react";
import { View, Alert } from "react-native";
import { useThemeStore } from "../../store/themeStore";
import Loader from "../../shared/components/Loader";
import BookingForm from "./components/BookingForm";
import { useBookingStore } from "./store";
import { useRoute, useNavigation } from "@react-navigation/native";
import { bookingApi, BookingCreateInput } from "../../api/bookingApi";

const QuickReservationScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const bookingId: number | undefined = route.params?.bookingId;
  const { create, update } = useBookingStore();

  const [initial, setInitial] = useState<Partial<BookingCreateInput>>({});
  const [loading, setLoading] = useState<boolean>(!!bookingId);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!bookingId) {
        setLoading(false);
        return;
      }

      try {
        const b = await bookingApi.get(bookingId);
        setInitial({
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
    };

    load();
  }, [bookingId, navigation]);

  const handleSubmit = async (values: BookingCreateInput) => {
    try {
      setSubmitting(true);

      if (bookingId) {
        await update(bookingId, values);
        Alert.alert("Success", "Booking updated successfully");
      } else {
        await create({
          ...values,
          status: "Confirmed",
        });
        Alert.alert("Success", "Booking created successfully");
      }

      navigation.goBack();
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.response?.data?.message || e?.message || "Failed to save booking"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <BookingForm
        initial={initial}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </View>
  );
};

export default QuickReservationScreen;