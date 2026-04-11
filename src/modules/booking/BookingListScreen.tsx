import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  FlatList,
  RefreshControl,
  Text,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useBookingStore } from "./store";
import { useThemeStore } from "../../store/themeStore";
import Loader from "../../shared/components/Loader";
import AppButton from "../../shared/components/AppButton";
import { toIsoDate } from "../../shared/utils/date";
import DateRangeFilter from "./components/DateRangeFilter";
import BookingListCard from "./components/BookingListCard";

const BookingListScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const navigation = useNavigation<any>();
  const { items, loading, fetchReservationsInRange } = useBookingStore();

  const todayIso = useMemo(() => toIsoDate(new Date()), []);
  const [startDate, setStartDate] = useState<string>(todayIso);
  const [endDate, setEndDate] = useState<string>(todayIso);

  useEffect(() => {
    fetchReservationsInRange(startDate, endDate);
  }, [fetchReservationsInRange, startDate, endDate]);

  const colors = theme.colors;
  const { width } = Dimensions.get("window");
  const isSmall = width < 380;
  const numColumns = isSmall ? 1 : 2;

  const handleRangeChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  if (loading && items.length === 0) {
    return <Loader />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 4,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: colors.text,
            fontSize: 18,
            fontWeight: "600",
          }}
        >
          Bookings
        </Text>

        <View style={{ flexDirection: "row" }}>
          <AppButton
            title="Arrivals"
            size="small"
            onPress={() => navigation.navigate("ArrivalList")}
            style={{ marginRight: 8 }}
          />
          <AppButton
            title="+ Booking"
            size="small"
            onPress={() => navigation.navigate("QuickReservation")}
          />
        </View>
      </View>

      <View style={{ paddingHorizontal: 12, paddingBottom: 4 }}>
        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onChange={handleRangeChange}
        />
      </View>

      <FlatList
        data={items}
        key={numColumns}
        numColumns={numColumns}
        keyExtractor={(item) => String(item.booking_id)}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => fetchReservationsInRange(startDate, endDate)}
          />
        }
        contentContainerStyle={{
          paddingHorizontal: 12,
          paddingBottom: 16,
          paddingTop: 4,
          flexGrow: items.length === 0 ? 1 : 0,
        }}
        columnWrapperStyle={
          numColumns > 1 ? { justifyContent: "flex-start" } : undefined
        }
        ListEmptyComponent={
          !loading ? (
            <View
              style={{
                flex: 1,
                minHeight: 280,
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 24,
              }}
            >
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 15,
                  textAlign: "center",
                }}
              >
                No bookings found for the selected date range.
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item, index }) => (
          <BookingListCard
            booking={item}
            index={index}
            isTwoColumn={numColumns === 2}
            onPress={() =>
              navigation.navigate("QuickReservation", {
                bookingId: item.booking_id,
              })
            }
          />
        )}
      />
    </View>
  );
};

export default BookingListScreen;