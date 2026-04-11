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

  const [loadingLocal, setLoadingLocal] = useState(false);
  const [arrivalsLocal, setArrivalsLocal] = useState<Booking[]>([]);
  const [checkingInId, setCheckingInId] = useState<number | null>(null);

  const loadArrivals = useCallback(async () => {
    try {
      setLoadingLocal(true);
      const todayIso = toIsoDate(new Date());
      const arrivals = await bookingApi.arrivals({ date: todayIso });
      setArrivalsLocal(Array.isArray(arrivals) ? arrivals : []);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message || e?.message || "Failed to load arrivals";
      Alert.alert("Error", msg);
    } finally {
      setLoadingLocal(false);
    }
  }, []);

  useEffect(() => {
    loadArrivals();
  }, [loadArrivals]);

  const handleRefresh = () => {
    loadArrivals();
  };

  const handleCheckIn = async (booking: Booking, roomId: number) => {
    if (checkingInId === booking.booking_id) return;

    try {
      setCheckingInId(booking.booking_id);

      const resp = await bookingApi.checkIn(booking.booking_id, roomId);

      const updatedBooking: Booking = {
        ...booking,
        room_id: roomId,
        status: "CheckedIn",
        folio_id: resp.folio_id,
        folio_no: resp.folio_no,
      };

      setCurrentFromCheckIn(updatedBooking, resp);

      setArrivalsLocal((prev) =>
        prev.map((item) =>
          item.booking_id === booking.booking_id ? updatedBooking : item
        )
      );

      navigation.dispatch(StackActions.replace("StayView"));
    } catch (e: any) {
      console.log("CheckIn error", e?.response?.data || e);
      const msg =
        e?.response?.data?.message || e?.message || "Failed to check in";
      Alert.alert("Error", msg);
    } finally {
      setCheckingInId(null);
    }
  };

  if (loadingLocal && arrivalsLocal.length === 0) {
    return <Loader />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <FlatList
        data={arrivalsLocal}
        keyExtractor={(item) => String(item.booking_id)}
        refreshControl={
          <RefreshControl
            refreshing={loadingLocal}
            onRefresh={handleRefresh}
          />
        }
        contentContainerStyle={{
          padding: 12,
          flexGrow: arrivalsLocal.length === 0 ? 1 : 0,
        }}
        renderItem={({ item }) => (
          <ArrivalCard
            booking={item}
            onCheckIn={handleCheckIn}
            disabled={
              item.status === "CheckedIn" || checkingInId === item.booking_id
            }
            loading={checkingInId === item.booking_id}
          />
        )}
        ListEmptyComponent={
          !loadingLocal ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                paddingHorizontal: 24,
              }}
            >
              <Text
                style={{ color: theme.colors.textSecondary, fontSize: 15 }}
              >
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