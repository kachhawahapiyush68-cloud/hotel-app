// src/navigation/MainTabs.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import DashboardScreen from '../modules/dashboard/DashboardScreen';
import MastersScreen from '../modules/masters/MastersScreen';
import KotListScreen from '../modules/kot/KotListScreen';
import BillListScreen from '../modules/bill/BillListScreen';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { normalizeRole } from '../shared/utils/role';

export type MainTabParamList = {
  Dashboard: undefined;
  Masters: undefined;
  KOT: undefined;
  Bills: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs: React.FC = () => {
  const { theme } = useThemeStore();
  const user = useAuthStore(s => s.user);
  const role = normalizeRole(user?.role);

  const showMasters = role === 'ADMIN' || role === 'SUPER_ADMIN';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBarBg,
          borderTopColor: theme.colors.border,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarIcon: ({ color, size }) => {
          let icon: string = 'home';

          if (route.name === 'Dashboard') icon = 'home';
          else if (route.name === 'Masters') icon = 'albums-outline';
          else if (route.name === 'KOT') icon = 'restaurant-outline';
          else if (route.name === 'Bills') icon = 'receipt-outline';

          return <Ionicons name={icon as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />

      {showMasters && (
        <Tab.Screen name="Masters" component={MastersScreen} />
      )}

      <Tab.Screen name="KOT" component={KotListScreen} />
      <Tab.Screen name="Bills" component={BillListScreen} />
    </Tab.Navigator>
  );
};

export default MainTabs;
