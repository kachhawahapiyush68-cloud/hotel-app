import React, { useEffect } from "react";
import { View, FlatList, RefreshControl, Alert } from "react-native";
import { useBookingStore } from "./store";
import { useThemeStore } from "../../store/themeStore";
import Loader from "../../shared/components/Loader";
import { toIsoDate } from "../../shared/utils/date";
import { bookingApi, Booking } from "../../api/bookingApi";
import ArrivalCard from "./components/ArrivalCard";

const ArrivalListScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const {
    arrivals,
    loading,
    fetchTodayArrivals,
    setCurrentFromCheckIn,
  } = useBookingStore();

  useEffect(() => {
    const todayIso = toIsoDate(new Date());
    fetchTodayArrivals(todayIso);
  }, [fetchTodayArrivals]);

  const handleRefresh = () => {
    const todayIso = toIsoDate(new Date());
    fetchTodayArrivals(todayIso);
  };

  const handleCheckIn = async (booking: Booking, roomId: number) => {
    try {
      const resp = await bookingApi.checkIn(booking.booking_id, roomId);
      setCurrentFromCheckIn(booking, resp);
      Alert.alert("Checked in", `Folio: ${resp.folio_no}`);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to check in");
    }
  };

  if (loading && arrivals.length === 0) {
    return <Loader />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <FlatList
        data={arrivals}
        keyExtractor={(item) => String(item.booking_id)}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <ArrivalCard booking={item} onCheckIn={handleCheckIn} />
        )}
      />
    </View>
  );
};

export default ArrivalListScreen;
