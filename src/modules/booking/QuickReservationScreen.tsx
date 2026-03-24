import React, { useEffect, useState } from "react";
import { View, Alert } from "react-native";
import { useThemeStore } from "../../store/themeStore";
import Loader from "../../shared/components/Loader";
import BookingForm from "./components/BookingForm";
import { useBookingStore } from "./store";
import { useRoute, useNavigation } from "@react-navigation/native";
import { bookingApi } from "../../api/bookingApi";

const QuickReservationScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const bookingId: number | undefined = route.params?.bookingId;
  const { create, update } = useBookingStore();

  const [initial, setInitial] = useState<any>({});
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
          guest_id: b.guest_id,
          room_id: b.room_id,
          check_in_datetime: b.check_in_datetime,
          check_out_datetime: b.check_out_datetime,
          nights: b.nights,
          num_adult: b.num_adult,
          num_child: b.num_child,
          status: b.status,
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [bookingId]);

  const handleSubmit = async (values: any) => {
    try {
      setSubmitting(true);
      if (bookingId) {
        await update(bookingId, values);
      } else {
        await create({
          ...values,
          status: "Confirmed",
        });
      }
      setSubmitting(false);
      Alert.alert("Success", "Booking saved");
      navigation.goBack();
    } catch (e: any) {
      setSubmitting(false);
      Alert.alert("Error", e?.message || "Failed to save booking");
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
