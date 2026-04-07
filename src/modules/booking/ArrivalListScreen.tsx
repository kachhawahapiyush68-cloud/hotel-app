import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  FlatList,
  RefreshControl,
  Alert,
  Text,
} from "react-native";
import { StackActions, useNavigation } from "@react-navigation/native";
import { useThemeStore } from "../../store/themeStore";
import Loader from "../../shared/components/Loader";
import { toIsoDate } from "../../shared/utils/date";
import { bookingApi, Booking } from "../../api/bookingApi";
import { useBookingStore } from "./store";
import ArrivalCard from "./components/ArrivalCard";

const ArrivalListScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const navigation = useNavigation<any>();
  const { setCurrentFromCheckIn } = useBookingStore();

  const [state, setState] = useState<{
    loadingLocal: boolean;
    arrivalsLocal: Booking[];
    checkingInId: number | null;
  }>({
    loadingLocal: false,
    arrivalsLocal: [],
    checkingInId: null,
  });

  const loadArrivals = useCallback(async () => {
    try {
      setState((s) => ({ ...s, loadingLocal: true }));

      const todayIso = toIsoDate(new Date());
      const arrivals = await bookingApi.arrivals({ date: todayIso });

      setState((s) => ({
        ...s,
        loadingLocal: false,
        arrivalsLocal: Array.isArray(arrivals) ? arrivals : [],
      }));
    } catch (e: any) {
      setState((s) => ({ ...s, loadingLocal: false }));
      const msg =
        e?.response?.data?.message || e?.message || "Failed to load arrivals";
      Alert.alert("Error", msg);
    }
  }, []);

  useEffect(() => {
    loadArrivals();
  }, [loadArrivals]);

  const handleRefresh = () => {
    loadArrivals();
  };

  const handleCheckIn = async (booking: Booking, roomId: number) => {
    if (state.checkingInId === booking.booking_id) return;

    try {
      setState((s) => ({ ...s, checkingInId: booking.booking_id }));

      const resp = await bookingApi.checkIn(booking.booking_id, roomId);

      const updatedBooking: Booking = {
        ...booking,
        room_id: roomId,
        status: "CheckedIn",
        folio_id: resp.folio_id,
        folio_no: resp.folio_no,
      };

      setCurrentFromCheckIn(updatedBooking, resp);

      setState((s) => ({
        ...s,
        checkingInId: null,
        arrivalsLocal: s.arrivalsLocal.map((item) =>
          item.booking_id === booking.booking_id ? updatedBooking : item
        ),
      }));

      navigation.dispatch(StackActions.replace("StayView"));
    } catch (e: any) {
      setState((s) => ({ ...s, checkingInId: null }));
      console.log("CheckIn error", e?.response?.data || e);
      const msg =
        e?.response?.data?.message || e?.message || "Failed to check in";
      Alert.alert("Error", msg);
    }
  };

  if (state.loadingLocal && state.arrivalsLocal.length === 0) {
    return <Loader />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <FlatList
        data={state.arrivalsLocal}
        keyExtractor={(item) => String(item.booking_id)}
        refreshControl={
          <RefreshControl
            refreshing={state.loadingLocal}
            onRefresh={handleRefresh}
          />
        }
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <ArrivalCard
            booking={item}
            onCheckIn={handleCheckIn}
            disabled={
              item.status === "CheckedIn" ||
              state.checkingInId === item.booking_id
            }
            loading={state.checkingInId === item.booking_id}
          />
        )}
        ListEmptyComponent={
          !state.loadingLocal ? (
            <View
              style={{
                padding: 20,
                alignItems: "center",
              }}
            >
              <Text style={{ color: theme.colors.textSecondary }}>
                No arrivals for today.
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default ArrivalListScreen;