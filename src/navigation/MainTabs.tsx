// src/navigation/MainTabs.tsx
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import { View, Text } from "react-native";

import DashboardScreen from "../modules/dashboard/DashboardScreen";
import MastersScreen from "../modules/masters/MastersScreen";
import KotListScreen from "../modules/kot/KotListScreen";
import BillListScreen from "../modules/bill/BillListScreen";
import BookingListScreen from "../modules/booking/BookingListScreen";
import { useThemeStore } from "../store/themeStore";
import { useAuthStore } from "../store/authStore";
import { normalizeRole } from "../shared/utils/role";

export type MainTabParamList = {
  Dashboard: undefined;
  Masters: undefined;
  Bookings: undefined;
  KOT: undefined;
  Bills: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs: React.FC = () => {
  const { theme } = useThemeStore();
  const user = useAuthStore((s) => s.user);
  const role = normalizeRole(user?.role);

  const showMasters = role === "ADMIN" || role === "SUPER_ADMIN";

  const colors = theme.colors;

  const renderHeaderTitle = (title: string) => () => (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Ionicons
        name="bed-outline"
        size={20}
        color={colors.primary}
        style={{ marginRight: 6 }}
      />
      <Text
        style={{
          color: colors.text,
          fontSize: 18,
          fontWeight: "600",
        }}
      >
        {title}
      </Text>
    </View>
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.surface,
          borderBottomWidth: 0,
          elevation: 2,
          shadowOpacity: 0.15,
        },
        headerTitleAlign: "left",
        headerTintColor: colors.text,
        headerTitle: renderHeaderTitle(
          route.name === "Dashboard"
            ? "Dashboard"
            : route.name === "Masters"
            ? "Masters"
            : route.name === "Bookings"
            ? "Bookings"
            : route.name === "KOT"
            ? "Kitchen Orders"
            : "Bills"
        ),
        tabBarStyle: {
          backgroundColor: colors.tabBarBg,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarIcon: ({ color, size }) => {
          let icon: string = "home";

          if (route.name === "Dashboard") icon = "home";
          else if (route.name === "Masters") icon = "albums-outline";
          else if (route.name === "Bookings") icon = "bed-outline";
          else if (route.name === "KOT") icon = "restaurant-outline";
          else if (route.name === "Bills") icon = "receipt-outline";

          return <Ionicons name={icon as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />

      {showMasters && (
        <Tab.Screen name="Masters" component={MastersScreen} />
      )}

      <Tab.Screen name="Bookings" component={BookingListScreen} />
      <Tab.Screen name="KOT" component={KotListScreen} />
      <Tab.Screen name="Bills" component={BillListScreen} />
    </Tab.Navigator>
  );
};

export default MainTabs;
