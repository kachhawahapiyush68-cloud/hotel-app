import React, { useEffect } from "react";
import {
  View,
  FlatList,
  RefreshControl,
  Alert,
  Text,
} from "react-native";
import { useThemeStore } from "../../store/themeStore";
import Loader from "../../shared/components/Loader";
import { toIsoDate } from "../../shared/utils/date";
import { bookingApi, Booking } from "../../api/bookingApi";
import { useBookingStore } from "./store";
import ArrivalCard from "./components/ArrivalCard";
import { useAuthStore } from "../../store/authStore";
import { normalizeRole } from "../../shared/utils/role";

const ArrivalListScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const auth = useAuthStore();
  const user = auth.user;
  const roleUpper = normalizeRole(user?.role);

  const { setCurrentFromCheckIn } = useBookingStore();

  const [state, setState] = React.useState<{
    loadingLocal: boolean;
    arrivalsLocal: Booking[];
  }>({
    loadingLocal: false,
    arrivalsLocal: [],
  });

  const loadArrivals = async () => {
    try {
      setState((s) => ({ ...s, loadingLocal: true }));

      const companyIdParam =
        roleUpper === "SUPER_ADMIN"
          ? auth.selectedCompanyId
          : user?.companyid;

      const all = await bookingApi.list(companyIdParam);
      const todayIso = toIsoDate(new Date()); // "YYYY-MM-DD"

      const filtered = all.filter((b) => {
        const d = b.check_in_datetime.slice(0, 10);
        return d === todayIso;
      });

      setState({ loadingLocal: false, arrivalsLocal: filtered });
    } catch (e: any) {
      setState((s) => ({ ...s, loadingLocal: false }));
      Alert.alert("Error", e?.message || "Failed to load arrivals");
    }
  };

  useEffect(() => {
    loadArrivals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    loadArrivals();
  };

  const handleCheckIn = async (booking: Booking, roomId: number) => {
    try {
      const resp = await bookingApi.checkIn(booking.booking_id, roomId);
      setCurrentFromCheckIn(booking, resp);
      Alert.alert("Checked in", `Folio: ${resp.folio_no}`);
      loadArrivals();
    } catch (e: any) {
      console.log("CheckIn error", e?.response?.data || e);
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Failed to check in";
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
          <ArrivalCard booking={item} onCheckIn={handleCheckIn} />
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
