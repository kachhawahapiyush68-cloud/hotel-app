// src/modules/booking/ArrivalListScreen.tsx
import React, { useEffect } from "react";
import { View, FlatList, Text, RefreshControl } from "react-native";
import { useBookingStore } from "./store";
import { useThemeStore } from "../../store/themeStore";
import Card from "../../shared/components/Card";
import Loader from "../../shared/components/Loader";
import { formatDate, isSameDate } from "../../shared/utils/date";

const ArrivalListScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const { items, loading, fetch } = useBookingStore();

  useEffect(() => {
    fetch();
  }, [fetch]);

  const today = new Date();
  const arrivals = items.filter((b) =>
    isSameDate(new Date(b.check_in_datetime), today)
  );

  if (loading && items.length === 0) {
    return <Loader />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <FlatList
        data={arrivals}
        keyExtractor={(item) => String(item.booking_id)}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetch} />
        }
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <Card
            style={{ marginBottom: 10 }}
            header={`Room ${item.room_id}`}
            subtitle={`Arriving ${formatDate(item.check_in_datetime)}`}
          >
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
              Guest ID: {item.guest_id}
            </Text>
          </Card>
        )}
      />
    </View>
  );
};

export default ArrivalListScreen;
