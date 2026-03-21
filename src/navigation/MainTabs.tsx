// src/navigation/MainTabs.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import DashboardScreen from '../modules/dashboard/DashboardScreen';
import MastersScreen from '../modules/masters/MastersScreen';
import KotListScreen from '../modules/kot/KotListScreen';
import BillListScreen from '../modules/bill/BillListScreen';

export type MainTabParamList = {
  Dashboard: undefined;
  Masters: undefined;
  KOT: undefined;
  Bills: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let icon: keyof typeof Ionicons.glyphMap = 'home';
          if (route.name === 'Dashboard') icon = 'home';
          else if (route.name === 'Masters') icon = 'albums-outline';
          else if (route.name === 'KOT') icon = 'restaurant-outline';
          else if (route.name === 'Bills') icon = 'receipt-outline';
          return <Ionicons name={icon} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Masters" component={MastersScreen} />
      <Tab.Screen name="KOT" component={KotListScreen} />
      <Tab.Screen name="Bills" component={BillListScreen} />
    </Tab.Navigator>
  );
}
